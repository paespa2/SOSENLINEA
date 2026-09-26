import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import { getPool, warmPool, closePool, queryCache } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routers
import authRouter       from './routes/auth.js';
import contractorsRouter from './routes/contractors.js';
import reportesRouter   from './routes/reportes.js';
import cotizacionesRouter from './routes/cotizaciones.js';
import contableRouter   from './routes/contable.js';
import maestrosRouter   from './routes/maestros.js';
import operacionesRouter from './routes/operaciones.js';
import informesRouter   from './routes/informes.js';
import auditoriaRouter  from './routes/auditoria.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ── Middleware de Aceleración y Compresión GZIP ──────────────────────────────
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024, // Comprimir respuestas mayores a 1KB
}));

// ── Middleware Global ─────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health & Performance Check ────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DB_SERVER || 'Programaacces.database.windows.net',
    cache: queryCache.getStats(),
  });
});

app.get('/api/performance', (_req, res) => {
  res.json({
    cacheStats: queryCache.getStats(),
    packetSize: '32KB (TDS Optimized)',
    poolConfig: {
      min: process.env.DB_POOL_MIN || 4,
      max: process.env.DB_POOL_MAX || 20,
      idleTimeout: '180s',
    },
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',               authRouter);
app.use('/api/contractors',        contractorsRouter);
app.use('/api/reportes',           reportesRouter);
app.use('/api/cotizaciones',       cotizacionesRouter);
app.use('/api',                    contableRouter);   // /api/movimientos, /api/cuentas-cobro, /api/nit
app.use('/api',                    maestrosRouter);   // /api/clientes, /api/sectores, /api/materiales
app.use('/api',                    operacionesRouter); // /api/herramientas, /api/llaves, /api/entregas-materiales
app.use('/api/informes',           informesRouter);
app.use('/api/audit',              auditoriaRouter);

// ── 404 & Error Handlers ──────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Inicializar servidor con pre-calentamiento del pool ───────────────────────
async function bootstrap() {
  try {
    // Pre-calentar conexiones activas a Azure SQL
    console.log('🔄 Pre-calentando conexiones a Azure SQL Server...');
    await warmPool();

    app.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════╗');
      console.log('║  🚀 SOS Programaacces API (Optimizada Azure SQL)     ║');
      console.log(`║  📡 Puerto: ${PORT}                                      ║`);
      console.log(`║  ⚡ Compresión: GZIP/Deflate Activado                 ║`);
      console.log(`║  📦 TDS Packet Size: 32,768 bytes                     ║`);
      console.log(`║  🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}         ║`);
      console.log('╚══════════════════════════════════════════════════════╝');
    });
  } catch (err) {
    console.error('💥 Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor (Ctrl+C)...');
  await closePool();
  process.exit(0);
});

bootstrap();

export default app;
