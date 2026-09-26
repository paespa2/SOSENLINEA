import mssql from 'mssql';
import dotenv from 'dotenv';
import { queryCache } from '../utils/cache.js';

dotenv.config();

// ── Configuración Optimizada del Pool Azure SQL ──────────────────────────────
const sqlConfig: mssql.config = {
  server: process.env.DB_SERVER || 'Programaacces.database.windows.net',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_DATABASE || 'Programaacces',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT !== 'false',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true',
    connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '30000', 10),
    // ⚡ Optimización 1: Aumentar packet size a 32KB (TDS) para acelerar transferencia WAN
    packetSize: 32768,
    enableArithAbort: true,
    // ⚡ Optimización 2: Configuración de fechas UTC y recolección rápida
    useUTC: true,
    rowCollectionOnRequestCompletion: true,
  },
  pool: {
    // ⚡ Optimización 4: Mantener conexiones pre-calentadas para evitar latencia de 3-way handshake + TLS
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    min: parseInt(process.env.DB_POOL_MIN || '4', 10),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '180000', 10), // 3 min
    acquireTimeoutMillis: 30000,
  },
};

// Singleton del pool con reconexión automática
let pool: mssql.ConnectionPool | null = null;
let isConnecting = false;

/**
 * Obtiene (o inicializa) el pool de conexiones a Azure SQL.
 * Reutiliza las conexiones activas y gestiona reconexiones automáticas si se cae.
 */
export async function getPool(): Promise<mssql.ConnectionPool> {
  if (pool && pool.connected) return pool;

  if (isConnecting) {
    // Esperar a que la conexión en curso finalice
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (pool && pool.connected) return pool;
  }

  isConnecting = true;
  try {
    const newPool = new mssql.ConnectionPool(sqlConfig);
    
    // Auto-reconexión en caso de error de red
    newPool.on('error', (err) => {
      console.warn('⚠️ [Azure SQL Pool] Advertencia de conexión:', err.message);
      if (!newPool.connected) {
        pool = null;
      }
    });

    pool = await newPool.connect();
    console.log(`⚡ [Azure SQL] Pool conectado exitosamente (${sqlConfig.server}). Conexiones calientes listas.`);
    return pool;
  } catch (err) {
    pool = null;
    console.error('❌ [Azure SQL] Error al conectar con Azure SQL:', (err as Error).message);
    throw err;
  } finally {
    isConnecting = false;
  }
}

/**
 * Pre-calienta el pool al iniciar el servidor Express.
 */
export async function warmPool(): Promise<void> {
  try {
    await getPool();
  } catch (err) {
    console.warn('⚠️ [Azure SQL] Arranque en modo resiliente. Se reintentará en la primera consulta.');
  }
}

export interface QueryParam {
  name: string;
  type: mssql.ISqlType | (() => mssql.ISqlType);
  value: unknown;
}

/**
 * Ejecuta una consulta SQL parametrizada con medición de tiempo y telemetría.
 */
export async function query<T = unknown>(
  sql: string,
  params: QueryParam[] = []
): Promise<mssql.IResult<T>> {
  const startTime = Date.now();
  const db = await getPool();
  const request = db.request();

  for (const param of params) {
    request.input(param.name, param.type, param.value);
  }

  const result = await request.query<T>(sql);
  const duration = Date.now() - startTime;

  // Alerta de consultas lentas en Azure SQL (> 500ms) para profiling
  if (duration > 500 && process.env.NODE_ENV !== 'production') {
    const snippet = sql.trim().replace(/\s+/g, ' ').slice(0, 65);
    console.warn(`⏱️ [Azure SQL Slow Query] ${duration}ms -> ${snippet}...`);
  }

  return result;
}

/**
 * Ejecuta una consulta utilizando la caché en memoria para eliminar roundtrips WAN.
 * Ideal para catálogos (clientes, sectores, materiales, métricas generales).
 */
export async function queryCached<T = unknown>(
  cacheKey: string,
  sql: string,
  params: QueryParam[] = [],
  ttlSeconds: number = 60
): Promise<mssql.IResult<T>> {
  const cached = queryCache.get<mssql.IResult<T>>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const result = await query<T>(sql, params);
  queryCache.set(cacheKey, result, ttlSeconds);
  return result;
}

// Helpers de conveniencia
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function firstRow(result: mssql.IResult<unknown>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result.recordset as any[])[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function allRows(result: mssql.IResult<unknown>): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.recordset as any[];
}

/**
 * Cierra el pool (usado en shutdown).
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('🔌 [Azure SQL] Pool cerrado limpiamente.');
  }
}

export { mssql, queryCache };
export default { getPool, warmPool, query, queryCached, closePool };
