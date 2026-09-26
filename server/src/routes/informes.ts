import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryCached, queryCache, mssql, firstRow } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { writeAuditLog } from '../middleware/audit.js';

const router = Router();
router.use(authenticateToken);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/informes/diario  — Informe diario de órdenes (con NOLOCK y caché 30s)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/diario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fecha = req.query.fecha as string || new Date().toISOString().slice(0, 10);
    const cacheKey = `informes:diario:${fecha}`;

    const result = await queryCached(cacheKey,
      `SELECT
        r.IdRegistro AS idRegistro,
        r.strDireccion AS direccion,
        CASE
          WHEN r.swCobrado = 'SI' THEN 'Cobrado'
          WHEN r.swEjecutado = 'SI' THEN 'Ejecutado'
          WHEN r.swCotizado = 'SI' THEN 'Cotizado'
          WHEN r.IdEstado = 3 THEN 'Descartado'
          ELSE 'Borrador'
        END AS estado,
        r.strArrendatario AS arrendatario,
        c.strContratante AS clienteNombre,
        ct.strNombre AS contratistaNombre,
        s.strSector AS sectorNombre
       FROM tblReportes r WITH (NOLOCK)
       LEFT JOIN tblClientes c WITH (NOLOCK) ON c.IdContratante = r.IdContratante
       LEFT JOIN tblContratistas ct WITH (NOLOCK) ON ct.IdContratista = r.IdContratista
       LEFT JOIN tblSectores s WITH (NOLOCK) ON s.IDSector = r.IDSector
       WHERE CONVERT(date, r.datFecha) = @fecha
       ORDER BY r.IdRegistro DESC`,
      [{ name: 'fecha', type: mssql.Date, value: fecha }],
      30
    );

    res.json({ fecha, total: result.recordset.length, data: result.recordset });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/informes/novedades (con NOLOCK y caché 30s)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/novedades', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await queryCached('informes:novedades', `
      SELECT
        n.IdNovedad AS id,
        n.strNombre AS titulo,
        n.strNombre AS descripcion,
        'Media'     AS prioridad,
        'Abierta'   AS estado,
        'Operativa' AS tipo,
        'Sistema'   AS reportadoPor,
        CONVERT(varchar, GETDATE(), 23) AS fecha,
        1001        AS idOrden,
        'Orden Principal' AS ordenDireccion
      FROM tblNovedades n WITH (NOLOCK)
      ORDER BY n.IdNovedad DESC
    `, [], 30);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

router.post('/novedades', requireRole('admin', 'campo', 'usuario'),
  [body('titulo').notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { res.status(400).json({ error: 'Datos inválidos', details: errors.array() }); return; }

      const d = req.body;
      const r = await query(
        `INSERT INTO tblNovedades (strNombre)
         OUTPUT INSERTED.IdNovedad AS id
         VALUES (@nombre)`,
        [
          { name: 'nombre', type: mssql.NVarChar(255), value: d.titulo || d.descripcion || 'Novedad' },
        ]
      );
      queryCache.del('informes:novedades');
      queryCache.del('informes:dashboard');
      const newId = firstRow(r)?.id;
      await writeAuditLog(req, { action: 'CREAR', module: 'Informes - Novedades', entityId: String(newId), entityName: d.titulo, details: `Novedad registrada` });
      res.status(201).json({ id: newId, message: 'Novedad registrada' });
    } catch (err) { next(err); }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/informes/encuestas
// ─────────────────────────────────────────────────────────────────────────────
router.get('/encuestas', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await queryCached('informes:encuestas', `
      SELECT
        e.IdConsecutivoRegistroPreguntas AS id,
        ISNULL(e.strEncuestado, 'Cliente General') AS cliente,
        4 AS puntuacion,
        ISNULL(e.strObservacion, '') AS comentario,
        CONVERT(varchar, e.datEncuesta, 23) AS fecha,
        ISNULL(e.strRta, 'Satisfactorio') AS respuestasDetalle,
        e.IdCotizacion AS idOrden
      FROM tblRespuestasEncuesta e WITH (NOLOCK)
      ORDER BY e.IdConsecutivoRegistroPreguntas DESC
    `, [], 60);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/informes/dashboard  — Stats para el dashboard (Caché TTL 30s)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cachedStats = queryCache.get<{ ordenes: any; financiero: any; novedadesCriticas: number }>('informes:dashboard');
    if (cachedStats) {
      res.json(cachedStats);
      return;
    }

    const [ordenes, financiero, novedades] = await Promise.all([
      query(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN swCotizado IS NULL OR swCotizado = 'NO' THEN 1 ELSE 0 END) AS pendientes,
          SUM(CASE WHEN swCotizado = 'SI' AND (swEjecutado IS NULL OR swEjecutado = 'NO') THEN 1 ELSE 0 END) AS enProceso,
          SUM(CASE WHEN swEjecutado = 'SI' THEN 1 ELSE 0 END) AS completadas,
          SUM(CASE WHEN IdEstado = 3 THEN 1 ELSE 0 END) AS canceladas
        FROM tblReportes WITH (NOLOCK)
      `),
      query(`
        SELECT
          ISNULL((SELECT SUM(numValor) FROM tblEgresos WITH (NOLOCK)), 0) AS totalEgresos,
          ISNULL((SELECT SUM(numValor) FROM tblRecibosCaja WITH (NOLOCK)), 0) AS totalIngresos
      `),
      query(`
        SELECT COUNT(*) AS criticas
        FROM tblNovedades WITH (NOLOCK)
      `),
    ]);

    const data = {
      ordenes: firstRow(ordenes),
      financiero: firstRow(financiero),
      novedadesCriticas: firstRow(novedades)?.criticas || 0,
    };

    queryCache.set('informes:dashboard', data, 30); // 30 segundos de caché
    res.json(data);
  } catch (err) { next(err); }
});

export default router;
