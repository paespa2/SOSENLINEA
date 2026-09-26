import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { query, mssql, firstRow, allRows } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { writeAuditLog } from '../middleware/audit.js';
import { appCache } from '../utils/cache.js';

const router = Router();
router.use(authenticateToken);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cotizaciones
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const page   = parseInt(req.query.page  as string || '1');
    const limit  = parseInt(req.query.limit as string || '50');
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: Parameters<typeof query>[1] = [];

    if (search) {
      where += ' AND (cot.memDescripcion LIKE @s OR c.strContratante LIKE @s OR r.strDireccion LIKE @s)';
      params.push({ name: 's', type: mssql.NVarChar(200), value: `%${search}%` });
    }

    params.push({ name: 'limit',  type: mssql.Int, value: limit });
    params.push({ name: 'offset', type: mssql.Int, value: offset });

    const result = await query(
      `SELECT
        cot.IdCotizacion                    AS idCotizacion,
        CONVERT(varchar, cot.IdCotizacion)  AS numeroCotizacion,
        ISNULL(cot.SW, 'Cotizado')          AS estado,
        cot.datCotizacion                   AS fecha,
        cot.memDescripcion                  AS descripcion,
        ISNULL(cot.numTodoCosto, 0)         AS totalTodoCosto,
        ISNULL(cot.numTodoCosto, 0)         AS numTodoCosto,
        ISNULL(cot.numManoObra, 0)          AS numCostoManoObra,
        ISNULL(cot.numMaterial, 0)          AS numCostoMateriales,
        ISNULL(cot.numUtilidadNeta, 0)      AS numGanancia,
        cot.IdRegistro                      AS idRegistro,
        r.strDireccion                      AS direccion,
        cot.IdContratista                   AS idContratista,
        ct.strNombre                        AS contratistaNombre,
        c.strContratante                    AS clienteNombre,
        cot.strOtros                        AS observaciones
       FROM tblCotizacion cot WITH (NOLOCK)
       LEFT JOIN tblReportes      r  WITH (NOLOCK) ON r.IdRegistro    = cot.IdRegistro
       LEFT JOIN tblClientes      c  WITH (NOLOCK) ON c.IdContratante = r.IdContratante
       LEFT JOIN tblContratistas  ct WITH (NOLOCK) ON ct.IdContratista = cot.IdContratista
       ${where}
       ORDER BY cot.IdCotizacion DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      params
    );

    res.json({
      data: result.recordset,
      page,
      limit,
    });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cotizaciones/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', param('id').isInt(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const [cotResult, itemsResult] = await Promise.all([
      query(
        `SELECT
          cot.IdCotizacion                    AS idCotizacion,
          CONVERT(varchar, cot.IdCotizacion)  AS numeroCotizacion,
          ISNULL(cot.SW, 'Cotizado')          AS estado,
          cot.datCotizacion                   AS fecha,
          cot.memDescripcion                  AS descripcion,
          ISNULL(cot.numTodoCosto, 0)         AS totalTodoCosto,
          ISNULL(cot.numTodoCosto, 0)         AS numTodoCosto,
          ISNULL(cot.numManoObra, 0)          AS numCostoManoObra,
          ISNULL(cot.numMaterial, 0)          AS numCostoMateriales,
          ISNULL(cot.numUtilidadNeta, 0)      AS numGanancia,
          cot.IdRegistro                      AS idRegistro,
          r.strDireccion                      AS direccion,
          cot.IdContratista                   AS idContratista,
          ct.strNombre                        AS contratistaNombre,
          c.strContratante                    AS clienteNombre,
          cot.strOtros                        AS observaciones
         FROM tblCotizacion cot WITH (NOLOCK)
         LEFT JOIN tblReportes r WITH (NOLOCK) ON r.IdRegistro = cot.IdRegistro
         LEFT JOIN tblClientes c WITH (NOLOCK) ON c.IdContratante = r.IdContratante
         LEFT JOIN tblContratistas ct WITH (NOLOCK) ON ct.IdContratista = cot.IdContratista
         WHERE cot.IdCotizacion = @id`,
        [{ name: 'id', type: mssql.Int, value: id }]
      ),
      query(
        `SELECT
          IdRegistro AS id,
          strDescripcion AS descripcion,
          ISNULL(numVr, 0) AS valorUnitario,
          ISNULL(numCan, 1) AS cantidad,
          ISNULL(numVr, 0) * ISNULL(numCan, 1) AS valorTotal,
          ISNULL(strUnidad, 'UN') AS unidad
         FROM tblDesCotizacion WITH (NOLOCK) WHERE IdCotizacion = @id`,
        [{ name: 'id', type: mssql.Int, value: id }]
      ),
    ]);

    const cotRow = firstRow(cotResult);
    if (!cotRow) { res.status(404).json({ error: 'Cotización no encontrada' }); return; }

    res.json({
      ...cotRow,
      items: allRows(itemsResult),
    });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/cotizaciones
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', requireRole('admin', 'maestros'),
  [body('idRegistro').isInt()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { res.status(400).json({ error: 'Datos inválidos', details: errors.array() }); return; }

      const d = req.body;
      const result = await query(
        `INSERT INTO tblCotizacion
          (IdRegistro, datCotizacion, memDescripcion, numTodoCosto, numManoObra,
           numMaterial, numUtilidadNeta, IdContratista, strOtros, SW)
         OUTPUT INSERTED.IdCotizacion AS id
         VALUES
          (@idRegistro, CONVERT(varchar, GETDATE(), 23), @desc, @total, @manoObra,
           @materiales, @ganancia, @idContratista, @obs, @sw)`,
        [
          { name: 'idRegistro',   type: mssql.Int,           value: d.idRegistro },
          { name: 'desc',         type: mssql.NVarChar(mssql.MAX), value: d.descripcion || '' },
          { name: 'total',        type: mssql.Float,         value: d.numTodoCosto || d.totalTodoCosto || 0 },
          { name: 'manoObra',     type: mssql.Float,         value: d.numCostoManoObra || 0 },
          { name: 'materiales',   type: mssql.Float,         value: d.numCostoMateriales || 0 },
          { name: 'ganancia',     type: mssql.Int,           value: d.numGanancia || 0 },
          { name: 'idContratista',type: mssql.NVarChar(50),  value: d.idContratista || null },
          { name: 'obs',          type: mssql.NVarChar(mssql.MAX), value: d.observaciones || '' },
          { name: 'sw',           type: mssql.NVarChar(50),  value: d.estado || 'Cotizado' },
        ]
      );

      const newId = firstRow(result)?.id;

      // Si vienen items de detalle
      if (Array.isArray(d.items) && d.items.length > 0) {
        for (const it of d.items) {
          await query(
            `INSERT INTO tblDesCotizacion (IdRegistro, IdCotizacion, strDescripcion, numVr, numCan, strUnidad)
             VALUES (@regId, @cotId, @desc, @vr, @can, @und)`,
            [
              { name: 'regId', type: mssql.Int, value: d.idRegistro },
              { name: 'cotId', type: mssql.Int, value: newId },
              { name: 'desc',  type: mssql.NVarChar(255), value: it.descripcion || '' },
              { name: 'vr',    type: mssql.Float, value: it.valorUnitario || 0 },
              { name: 'can',   type: mssql.Real, value: it.cantidad || 1 },
              { name: 'und',   type: mssql.NVarChar(50), value: it.unidad || 'UN' },
            ]
          );
        }
      }

      await writeAuditLog(req, {
        action: 'CREAR', module: 'Cotizaciones & Presupuestos',
        entityId: String(newId), entityName: `Cotización #${newId}`,
        details: `Monto total: $${d.numTodoCosto || d.totalTodoCosto || 0}`,
      });

      appCache.delByPrefix('informes');

      res.status(201).json({ id: newId, message: 'Cotización creada' });
    } catch (err) { next(err); }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/cotizaciones/:id
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', requireRole('admin', 'maestros'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const d = req.body;

      await query(
        `UPDATE tblCotizacion SET
          SW = @estado,
          memDescripcion = @desc,
          numTodoCosto = @total,
          numManoObra = @manoObra,
          numMaterial = @materiales,
          numUtilidadNeta = @ganancia,
          IdContratista = @contId,
          strOtros = @obs
         WHERE IdCotizacion = @id`,
        [
          { name: 'id',       type: mssql.Int,           value: id },
          { name: 'estado',   type: mssql.NVarChar(50),  value: d.estado || 'Cotizado' },
          { name: 'desc',     type: mssql.NVarChar(mssql.MAX), value: d.descripcion || '' },
          { name: 'total',    type: mssql.Float,         value: d.numTodoCosto || d.totalTodoCosto || 0 },
          { name: 'manoObra', type: mssql.Float,         value: d.numCostoManoObra || 0 },
          { name: 'materiales',type: mssql.Float,        value: d.numCostoMateriales || 0 },
          { name: 'ganancia', type: mssql.Int,           value: d.numGanancia || 0 },
          { name: 'contId',   type: mssql.NVarChar(50),  value: d.idContratista || null },
          { name: 'obs',      type: mssql.NVarChar(mssql.MAX), value: d.observaciones || '' },
        ]
      );

      await writeAuditLog(req, {
        action: 'ACTUALIZAR', module: 'Cotizaciones',
        entityId: String(id), entityName: `Cotización #${id}`,
        details: `Estado: ${d.estado}`,
      });

      appCache.delByPrefix('informes');

      res.json({ message: 'Cotización actualizada' });
    } catch (err) { next(err); }
  }
);

export default router;
