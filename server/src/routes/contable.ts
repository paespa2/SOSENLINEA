import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { query, mssql, firstRow, allRows } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { writeAuditLog } from '../middleware/audit.js';
import { appCache } from '../utils/cache.js';

const router = Router();
router.use(authenticateToken);

// ════════════════════════════════════════════════════════════════
//  MOVIMIENTOS (tblEgresos + tblRecibosCaja)
// ════════════════════════════════════════════════════════════════

router.get('/movimientos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tipo   = req.query.tipo   as string | undefined;
    const desde  = req.query.desde  as string | undefined;
    const hasta  = req.query.hasta  as string | undefined;
    const page   = parseInt(req.query.page  as string || '1');
    const limit  = parseInt(req.query.limit as string || '50');
    const offset = (page - 1) * limit;

    const params: Parameters<typeof query>[1] = [];

    // Unión de egresos e ingresos (recibos de caja) optimizada con WITH (NOLOCK)
    let baseEgresos = `
      SELECT
        CAST(e.IdEgreso AS VARCHAR)        AS id,
        'Egreso'                           AS tipo,
        ISNULL(e.strConcepto, 'Egreso')    AS concepto,
        ISNULL(e.numValor, 0)              AS monto,
        'Aprobado'                         AS estado,
        CONVERT(varchar, e.datFecha, 23)   AS fecha,
        ISNULL(ct.strNombre, e.IdContratista) AS responsable,
        ''                                 AS observaciones,
        CONVERT(varchar, e.datFecha, 23)   AS createdAt
      FROM tblEgresos e WITH (NOLOCK)
      LEFT JOIN tblContratistas ct WITH (NOLOCK) ON ct.IdContratista = e.IdContratista
      WHERE 1=1
    `;

    let baseIngresos = `
      SELECT
        CAST(rc.IdRecibos AS VARCHAR)       AS id,
        'Ingreso'                           AS tipo,
        ISNULL(rc.strConcepto, 'Recibo')    AS concepto,
        ISNULL(rc.numValor, 0)              AS monto,
        'Conciliado'                        AS estado,
        CONVERT(varchar, rc.datFecha, 23)   AS fecha,
        ISNULL(ct.strNombre, rc.IdContratista) AS responsable,
        ''                                  AS observaciones,
        CONVERT(varchar, rc.datFecha, 23)   AS createdAt
      FROM tblRecibosCaja rc WITH (NOLOCK)
      LEFT JOIN tblContratistas ct WITH (NOLOCK) ON ct.IdContratista = rc.IdContratista
      WHERE 1=1
    `;

    if (desde) {
      baseEgresos  += ' AND e.datFecha >= @desde';
      baseIngresos += ' AND rc.datFecha >= @desde';
      params.push({ name: 'desde', type: mssql.Date, value: desde });
    }
    if (hasta) {
      baseEgresos  += ' AND e.datFecha <= @hasta';
      baseIngresos += ' AND rc.datFecha <= @hasta';
      params.push({ name: 'hasta', type: mssql.Date, value: hasta });
    }

    let unionSql = '';
    if (!tipo || tipo === 'Egreso')  unionSql += baseEgresos;
    if (!tipo) unionSql += ' UNION ALL ';
    if (!tipo || tipo === 'Ingreso') unionSql += baseIngresos;

    params.push({ name: 'limit',  type: mssql.Int, value: limit });
    params.push({ name: 'offset', type: mssql.Int, value: offset });

    const sql = `
      SELECT * FROM (${unionSql}) AS m
      ORDER BY fecha DESC, id DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const countSql = `SELECT COUNT(*) AS total FROM (${unionSql}) AS m`;
    const countParams = params.filter(p => !['limit', 'offset'].includes(p.name));

    const [result, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, countParams),
    ]);

    const total = firstRow(countResult)?.total ?? result.recordset.length;

    res.json({
      data: result.recordset,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
});

router.post('/movimientos', requireRole('admin', 'contable'),
  [body('tipo').isIn(['Egreso','Ingreso']), body('monto').isNumeric(), body('concepto').notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { res.status(400).json({ error: 'Datos inválidos', details: errors.array() }); return; }

      const d = req.body;
      let newId: number;

      if (d.tipo === 'Egreso') {
        const r = await query(
          `INSERT INTO tblEgresos (strConcepto, numValor, datFecha, IdContratista)
           OUTPUT INSERTED.IdEgreso AS id
           VALUES (@concepto, @monto, GETDATE(), @contId)`,
          [
            { name: 'concepto', type: mssql.NVarChar(mssql.MAX), value: d.concepto },
            { name: 'monto',    type: mssql.Float,               value: d.monto },
            { name: 'contId',   type: mssql.NVarChar(50),        value: d.responsable || null },
          ]
        );
        newId = firstRow(r)?.id;
      } else {
        const r = await query(
          `INSERT INTO tblRecibosCaja (strConcepto, numValor, datFecha, IdContratista)
           OUTPUT INSERTED.IdRecibos AS id
           VALUES (@concepto, @monto, GETDATE(), @contId)`,
          [
            { name: 'concepto', type: mssql.NVarChar(mssql.MAX), value: d.concepto },
            { name: 'monto',    type: mssql.Float,               value: d.monto },
            { name: 'contId',   type: mssql.NVarChar(50),        value: d.responsable || null },
          ]
        );
        newId = firstRow(r)?.id;
      }

      await writeAuditLog(req, {
        action: 'CREAR', module: `Contabilidad - ${d.tipo}s`,
        entityId: String(newId), entityName: d.concepto,
        details: `Monto: $${d.monto} - Estado: Aprobado`,
      });

      appCache.delByPrefix('informes');

      res.status(201).json({ id: newId, message: `${d.tipo} creado` });
    } catch (err) { next(err); }
  }
);

router.delete('/movimientos/:tipo/:id', requireRole('admin', 'contable'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tipo, id } = req.params;
      const table = tipo === 'Egreso' ? 'tblEgresos' : 'tblRecibosCaja';
      const col   = tipo === 'Egreso' ? 'IdEgreso' : 'IdRecibos';

      const found = await query(`SELECT strConcepto FROM ${table} WITH (NOLOCK) WHERE ${col} = @id`,
        [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);
      const nombre = firstRow(found)?.strConcepto || id;

      await query(`DELETE FROM ${table} WHERE ${col} = @id`,
        [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);

      await writeAuditLog(req, {
        action: 'ELIMINAR', module: `Contabilidad - ${tipo}s`,
        entityId: id, entityName: nombre,
        details: 'Registro eliminado',
      });

      appCache.delByPrefix('informes');

      res.json({ message: `${tipo} eliminado` });
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════════════════════════════
//  CUENTAS DE COBRO (tblCuentasCobro)
// ════════════════════════════════════════════════════════════════

router.get('/cuentas-cobro', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(`
      SELECT
        CAST(cc.IdCtaCobro AS VARCHAR)        AS id,
        'CC-' + CAST(cc.IdCtaCobro AS VARCHAR) AS numero,
        CASE
          WHEN cc.swCargado = 'SI' THEN 'Pagada'
          ELSE 'Pendiente'
        END                                   AS estado,
        CONVERT(varchar, cc.datCtaCobro, 23)  AS fecha,
        ISNULL(cc.numPagado, 0)               AS valorNeto,
        0                                     AS retencion,
        ISNULL(cc.numPagado, 0)               AS valorTotal,
        cc.strContratante                     AS clienteNombre,
        ISNULL(cc.memDescripcion, '')         AS concepto,
        ISNULL(cc.memRecomendaciones, '')     AS observaciones
      FROM tblCuentasCobro cc WITH (NOLOCK)
      ORDER BY cc.IdCtaCobro DESC
    `);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

router.post('/cuentas-cobro', requireRole('admin', 'contable'),
  [body('numero').notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { res.status(400).json({ error: 'Datos inválidos', details: errors.array() }); return; }

      const d = req.body;
      const r = await query(
        `INSERT INTO tblCuentasCobro
          (strContratante, datCtaCobro, numPagado, memDescripcion, memRecomendaciones, swCargado)
         OUTPUT INSERTED.IdCtaCobro AS id
         VALUES (@cliente, GETDATE(), @pagado, @desc, @recom, @cargado)`,
        [
          { name: 'cliente', type: mssql.NVarChar(50),        value: d.clienteNombre || '' },
          { name: 'pagado',  type: mssql.Float,               value: d.numValorTotal || d.numValorNeto || 0 },
          { name: 'desc',    type: mssql.NVarChar(mssql.MAX), value: d.concepto || '' },
          { name: 'recom',   type: mssql.NVarChar(mssql.MAX), value: d.observaciones || '' },
          { name: 'cargado', type: mssql.NVarChar(50),        value: d.estado === 'Pagada' ? 'SI' : 'NO' },
        ]
      );
      const newId = firstRow(r)?.id;
      await writeAuditLog(req, {
        action: 'CREAR', module: 'Cuentas de Cobro',
        entityId: String(newId), entityName: d.numero,
        details: `Valor: $${d.numValorTotal || d.numValorNeto}`,
      });

      appCache.delByPrefix('informes');

      res.status(201).json({ id: String(newId), message: 'Cuenta de cobro creada' });
    } catch (err) { next(err); }
  }
);

router.patch('/cuentas-cobro/:id/estado', requireRole('admin', 'contable'),
  [body('estado').isIn(['Pendiente','Pagada','Anulada'])],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const { estado } = req.body as { estado: string };

      await query(
        `UPDATE tblCuentasCobro SET swCargado = @cargado WHERE IdCtaCobro = @id`,
        [
          { name: 'id',      type: mssql.Int,          value: id },
          { name: 'cargado', type: mssql.NVarChar(50), value: estado === 'Pagada' ? 'SI' : 'NO' },
        ]
      );

      await writeAuditLog(req, {
        action: 'CAMBIO_ESTADO', module: 'Cuentas de Cobro',
        entityId: String(id), entityName: `CC-${id}`,
        details: `Estado actualizado a ${estado}`,
      });

      appCache.delByPrefix('informes');

      res.json({ message: 'Estado actualizado' });
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════════════════════════════
//  NIT VALIDATOR (Con Caché en Memoria para lookups instantáneos)
// ════════════════════════════════════════════════════════════════
router.get('/nit/:nit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nit = req.params.nit.trim();
    const cacheKey = `nit:${nit}`;
    const cached = appCache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const result = await query(
      `SELECT IdContratista AS nit, strNombre AS nombre
       FROM tblContratistas WITH (NOLOCK) WHERE IdContratista = @nit
       UNION
       SELECT NIT AS nit, Nombre AS nombre
       FROM NITS WITH (NOLOCK) WHERE NIT = @nit`,
      [{ name: 'nit', type: mssql.NVarChar(50), value: nit }]
    );
    if (!result.recordset[0]) {
      res.status(404).json({ error: 'NIT no encontrado en el sistema' });
      return;
    }
    appCache.set(cacheKey, result.recordset[0], 600); // 10 min TTL
    res.json(result.recordset[0]);
  } catch (err) { next(err); }
});

export default router;
