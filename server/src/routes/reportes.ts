import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query as queryValidator, validationResult } from 'express-validator';
import { query, mssql, firstRow, allRows } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { writeAuditLog } from '../middleware/audit.js';
import { appCache } from '../utils/cache.js';

const router = Router();
router.use(authenticateToken);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reportes  — Lista paginada con filtros
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = parseInt(req.query.page  as string || '1');
    const limit = parseInt(req.query.limit as string || '50');
    const offset = (page - 1) * limit;

    const estado    = req.query.estado    as string | undefined;
    const clienteId = req.query.clienteId as string | undefined;
    const desde     = req.query.desde     as string | undefined;
    const hasta     = req.query.hasta     as string | undefined;
    const search    = req.query.search    as string | undefined;

    let where = 'WHERE 1=1';
    const params: Parameters<typeof query>[1] = [];

    // Push del filtro de estado directamente a SQL para aprovechar índices y paginar con exactitud
    if (estado) {
      if (estado === 'Cobrado') {
        where += " AND r.swCobrado = 'SI'";
      } else if (estado === 'Ejecutado') {
        where += " AND r.swEjecutado = 'SI' AND ISNULL(r.swCobrado, 'NO') <> 'SI'";
      } else if (estado === 'Cotizado') {
        where += " AND r.swCotizado = 'SI' AND ISNULL(r.swEjecutado, 'NO') <> 'SI' AND ISNULL(r.swCobrado, 'NO') <> 'SI'";
      } else if (estado === 'Descartado') {
        where += " AND r.IdEstado = 3";
      } else if (estado === 'Borrador') {
        where += " AND ISNULL(r.swCotizado, 'NO') <> 'SI' AND ISNULL(r.swEjecutado, 'NO') <> 'SI' AND ISNULL(r.swCobrado, 'NO') <> 'SI' AND ISNULL(r.IdEstado, 0) <> 3";
      }
    }

    if (clienteId) {
      where += ' AND r.IdContratante = @cliId';
      params.push({ name: 'cliId', type: mssql.Float, value: parseFloat(clienteId) });
    }
    if (desde) {
      where += ' AND r.datFecha >= @desde';
      params.push({ name: 'desde', type: mssql.Date, value: desde });
    }
    if (hasta) {
      where += ' AND r.datFecha <= @hasta';
      params.push({ name: 'hasta', type: mssql.Date, value: hasta });
    }
    if (search) {
      where += ' AND (r.strDireccion LIKE @s OR c.strContratante LIKE @s OR r.strArrendatario LIKE @s)';
      params.push({ name: 's', type: mssql.NVarChar(200), value: `%${search}%` });
    }

    params.push({ name: 'limit',  type: mssql.Int, value: limit });
    params.push({ name: 'offset', type: mssql.Int, value: offset });

    const sql = `
      SELECT
        r.IdRegistro                          AS idRegistro,
        r.strDireccion                        AS direccion,
        r.strArrendatario                     AS arrendatario,
        r.strPropietario                      AS propietario,
        r.strReporte                          AS reporte,
        r.strNotaFinal                        AS notaFinal,
        CASE
          WHEN r.swCobrado = 'SI' THEN 'Cobrado'
          WHEN r.swEjecutado = 'SI' THEN 'Ejecutado'
          WHEN r.swCotizado = 'SI' THEN 'Cotizado'
          WHEN r.IdEstado = 3 THEN 'Descartado'
          ELSE 'Borrador'
        END                                   AS estado,
        CONVERT(varchar, r.datFecha, 23)      AS fecha,
        CONVERT(varchar, r.datTerminado, 23)  AS fechaTerminado,
        CONVERT(varchar, r.datAprobada, 23)   AS fechaAprobada,
        r.IdContratante                       AS idContratante,
        c.strContratante                      AS clienteNombre,
        r.IdContratista                       AS idContratista,
        ct.strNombre                          AS contratistaNombre,
        r.IDSector                            AS idSector,
        s.strSector                           AS sectorNombre,
        r.strRuta                             AS sector,
        ISNULL(cot.numTodoCosto, 0)           AS totalCotizacion,
        CASE
          WHEN r.swEjecutado = 'SI' THEN 1.0
          WHEN r.swCotizado = 'SI' THEN 0.5
          ELSE 0.1
        END                                   AS tasaAvance
      FROM tblReportes r WITH (NOLOCK)
      LEFT JOIN tblClientes     c   WITH (NOLOCK) ON c.IdContratante = r.IdContratante
      LEFT JOIN tblContratistas ct  WITH (NOLOCK) ON ct.IdContratista = r.IdContratista
      LEFT JOIN tblSectores     s   WITH (NOLOCK) ON s.IDSector = r.IDSector
      LEFT JOIN tblCotizacion   cot WITH (NOLOCK) ON cot.IdRegistro = r.IdRegistro
      ${where}
      ORDER BY r.datFecha DESC, r.IdRegistro DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    // Contar total
    const countSql = `
      SELECT COUNT(*) AS total
      FROM tblReportes r WITH (NOLOCK)
      LEFT JOIN tblClientes c WITH (NOLOCK) ON c.IdContratante = r.IdContratante
      ${where.replace(/ OFFSET.*/s, '')}
    `;
    const countParams = params.filter(p => !['limit','offset'].includes(p.name));

    const [dataResult, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, countParams),
    ]);

    const data = allRows(dataResult);
    const countData = firstRow(countResult);
    const total = countData?.total ?? data.length;

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reportes/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT
        r.IdRegistro                          AS idRegistro,
        r.strDireccion                        AS direccion,
        r.strArrendatario                     AS arrendatario,
        r.strPropietario                      AS propietario,
        r.strContactos                        AS contacto,
        r.strTelContacto                      AS telContacto,
        r.strCelContacto                      AS celContacto,
        r.strReporte                          AS reporte,
        r.strNotaFinal                        AS notaFinal,
        CASE
          WHEN r.swCobrado = 'SI' THEN 'Cobrado'
          WHEN r.swEjecutado = 'SI' THEN 'Ejecutado'
          WHEN r.swCotizado = 'SI' THEN 'Cotizado'
          WHEN r.IdEstado = 3 THEN 'Descartado'
          ELSE 'Borrador'
        END                                   AS estado,
        CONVERT(varchar, r.datFecha, 23)      AS fecha,
        CONVERT(varchar, r.datTerminado, 23)  AS fechaTerminado,
        CONVERT(varchar, r.datAprobada, 23)   AS fechaAprobada,
        r.IdContratante                       AS idContratante,
        c.strContratante                      AS clienteNombre,
        r.IdContratista                       AS idContratista,
        ct.strNombre                          AS contratistaNombre,
        r.IDSector                            AS idSector,
        s.strSector                           AS sectorNombre,
        r.strRuta                             AS sector,
        ISNULL(cot.numTodoCosto, 0)           AS totalCotizacion
       FROM tblReportes r WITH (NOLOCK)
       LEFT JOIN tblClientes     c   WITH (NOLOCK) ON c.IdContratante = r.IdContratante
       LEFT JOIN tblContratistas ct  WITH (NOLOCK) ON ct.IdContratista = r.IdContratista
       LEFT JOIN tblSectores     s   WITH (NOLOCK) ON s.IDSector = r.IDSector
       LEFT JOIN tblCotizacion   cot WITH (NOLOCK) ON cot.IdRegistro = r.IdRegistro
       WHERE r.IdRegistro = @id`,
      [{ name: 'id', type: mssql.Int, value: parseInt(req.params.id) }]
    );
    if (!firstRow(result)) { res.status(404).json({ error: 'Orden no encontrada' }); return; }
    res.json(firstRow(result));
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reportes  — Crear orden de trabajo
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/',
  requireRole('admin', 'campo', 'usuario'),
  [
    body('direccion').trim().notEmpty().withMessage('La dirección del inmueble es obligatoria'),
    body('reporte').trim().notEmpty().withMessage('La descripción detallada del reporte es obligatoria'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { res.status(400).json({ error: 'Datos inválidos', details: errors.array() }); return; }

      const d = req.body;

      // Coherencia de estado vs contratista y presupuesto
      if (['Cotizado', 'Ejecutado', 'Cobrado'].includes(d.estado)) {
        if (!d.idContratista || d.idContratista === 'Sin Asignar') {
          res.status(400).json({ error: `Para órdenes en estado '${d.estado}', es obligatorio asignar un Contratista.` });
          return;
        }
        if (!d.totalCotizacion || d.totalCotizacion <= 0) {
          res.status(400).json({ error: `Para órdenes en estado '${d.estado}', el Presupuesto / Cotización debe ser mayor a $0.` });
          return;
        }
      }

      const result = await query(
        `INSERT INTO tblReportes
          (strDireccion, strArrendatario, strPropietario, strReporte,
           strNotaFinal, datFecha, datTerminado, IdContratante, IdContratista, IDSector,
           swCotizado, swEjecutado, swCobrado, IdEstado)
         OUTPUT INSERTED.IdRegistro AS id
         VALUES
          (@dir, @arr, @prop, @rep, @nota, GETDATE(),
           CASE WHEN @swEjec = 'SI' OR @swCob = 'SI' THEN GETDATE() ELSE NULL END,
           @cliId, @contId, @secId,
           @swCot, @swEjec, @swCob, @estado)`,
        [
          { name: 'dir',    type: mssql.NVarChar(255), value: d.direccion },
          { name: 'arr',    type: mssql.NVarChar(255), value: d.arrendatario || '' },
          { name: 'prop',   type: mssql.NVarChar(255), value: d.propietario || '' },
          { name: 'rep',    type: mssql.NVarChar(mssql.MAX), value: d.reporte || '' },
          { name: 'nota',   type: mssql.NVarChar(mssql.MAX), value: d.notaFinal || '' },
          { name: 'cliId',  type: mssql.Float,         value: d.idContratante ? parseFloat(d.idContratante) : 1 },
          { name: 'contId', type: mssql.NVarChar(50),  value: d.idContratista || null },
          { name: 'secId',  type: mssql.Int,           value: d.idSector || 1 },
          { name: 'swCot',  type: mssql.NVarChar(50),  value: d.estado === 'Cotizado' ? 'SI' : 'NO' },
          { name: 'swEjec', type: mssql.NVarChar(50),  value: d.estado === 'Ejecutado' ? 'SI' : 'NO' },
          { name: 'swCob',  type: mssql.NVarChar(50),  value: d.estado === 'Cobrado' ? 'SI' : 'NO' },
          { name: 'estado', type: mssql.Int,           value: d.estado === 'Descartado' ? 3 : 1 },
        ]
      );

      const newId = firstRow(result)?.id;

      // Sincronización automática de Cotizaciones (tblCotizacion) con la orden
      if (d.totalCotizacion && d.totalCotizacion > 0) {
        await query(
          `IF NOT EXISTS (SELECT 1 FROM tblCotizacion WHERE IdRegistro = @regId)
           BEGIN
             INSERT INTO tblCotizacion (IdRegistro, datCotizacion, memDescripcion, numTodoCosto, IdContratista, SW)
             VALUES (@regId, CONVERT(varchar, GETDATE(), 23), @rep, @total, @contId, @sw)
           END`,
          [
            { name: 'regId',  type: mssql.Int,                 value: newId },
            { name: 'rep',    type: mssql.NVarChar(mssql.MAX), value: d.reporte || '' },
            { name: 'total',  type: mssql.Float,               value: d.totalCotizacion },
            { name: 'contId', type: mssql.NVarChar(50),        value: d.idContratista || null },
            { name: 'sw',     type: mssql.NVarChar(50),        value: d.estado || 'Cotizado' },
          ]
        );
      }

      await writeAuditLog(req, {
        action: 'CREAR', module: 'Órdenes de Trabajo',
        entityId: String(newId), entityName: d.direccion,
        details: `Nueva orden estado: ${d.estado || 'Borrador'} (Sincronizada con Cotizaciones)`,
      });

      appCache.delByPrefix('informes');

      res.status(201).json({ id: newId, message: 'Orden de trabajo creada' });
    } catch (err) { next(err); }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/reportes/:id  — Actualizar orden
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', requireRole('admin', 'campo', 'maestros'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const d = req.body;

      // Coherencia de estado vs contratista y presupuesto
      if (['Cotizado', 'Ejecutado', 'Cobrado'].includes(d.estado)) {
        if (!d.idContratista || d.idContratista === 'Sin Asignar') {
          res.status(400).json({ error: `Para órdenes en estado '${d.estado}', es obligatorio asignar un Contratista.` });
          return;
        }
        if (!d.totalCotizacion || d.totalCotizacion <= 0) {
          res.status(400).json({ error: `Para órdenes en estado '${d.estado}', el Presupuesto / Cotización debe ser mayor a $0.` });
          return;
        }
      }

      await query(
        `UPDATE tblReportes SET
          strDireccion = @dir,
          strArrendatario = @arr,
          strPropietario = @prop,
          strReporte = @rep,
          strNotaFinal = @nota,
          IdContratista = @contId,
          IDSector = @secId,
          swCotizado = @swCot,
          swEjecutado = @swEjec,
          swCobrado = @swCob,
          datTerminado = CASE WHEN @swEjec = 'SI' OR @swCob = 'SI' THEN ISNULL(datTerminado, GETDATE()) ELSE NULL END,
          IdEstado = @estado
         WHERE IdRegistro = @id`,
        [
          { name: 'id',     type: mssql.Int,           value: id },
          { name: 'dir',    type: mssql.NVarChar(255), value: d.direccion },
          { name: 'arr',    type: mssql.NVarChar(255), value: d.arrendatario || '' },
          { name: 'prop',   type: mssql.NVarChar(255), value: d.propietario || '' },
          { name: 'rep',    type: mssql.NVarChar(mssql.MAX), value: d.reporte || '' },
          { name: 'nota',   type: mssql.NVarChar(mssql.MAX), value: d.notaFinal || '' },
          { name: 'contId', type: mssql.NVarChar(50),  value: d.idContratista || null },
          { name: 'secId',  type: mssql.Int,           value: d.idSector || 1 },
          { name: 'swCot',  type: mssql.NVarChar(50),  value: d.estado === 'Cotizado' ? 'SI' : 'NO' },
          { name: 'swEjec', type: mssql.NVarChar(50),  value: d.estado === 'Ejecutado' ? 'SI' : 'NO' },
          { name: 'swCob',  type: mssql.NVarChar(50),  value: d.estado === 'Cobrado' ? 'SI' : 'NO' },
          { name: 'estado', type: mssql.Int,           value: d.estado === 'Descartado' ? 3 : 1 },
        ]
      );

      // Sincronizar actualización con tblCotizacion si viene monto presupuestado
      if (d.totalCotizacion !== undefined) {
        await query(
          `IF EXISTS (SELECT 1 FROM tblCotizacion WHERE IdRegistro = @regId)
           BEGIN
             UPDATE tblCotizacion
             SET numTodoCosto = @total, SW = @sw, IdContratista = @contId, memDescripcion = @rep
             WHERE IdRegistro = @regId
           END
           ELSE IF (@total > 0)
           BEGIN
             INSERT INTO tblCotizacion (IdRegistro, datCotizacion, memDescripcion, numTodoCosto, IdContratista, SW)
             VALUES (@regId, CONVERT(varchar, GETDATE(), 23), @rep, @total, @contId, @sw)
           END`,
          [
            { name: 'regId',  type: mssql.Int,                 value: id },
            { name: 'rep',    type: mssql.NVarChar(mssql.MAX), value: d.reporte || '' },
            { name: 'total',  type: mssql.Float,               value: d.totalCotizacion || 0 },
            { name: 'contId', type: mssql.NVarChar(50),        value: d.idContratista || null },
            { name: 'sw',     type: mssql.NVarChar(50),        value: d.estado || 'Cotizado' },
          ]
        );
      }

      await writeAuditLog(req, {
        action: 'ACTUALIZAR', module: 'Órdenes de Trabajo',
        entityId: String(id), entityName: d.direccion,
        details: `Estado actualizado a ${d.estado} (Sincronizado con Cotizaciones)`,
      });

      appCache.delByPrefix('informes');

      res.json({ message: 'Orden actualizada y sincronizada' });
    } catch (err) { next(err); }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/reportes/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const found = await query('SELECT strDireccion FROM tblReportes WHERE IdRegistro = @id',
        [{ name: 'id', type: mssql.Int, value: id }]);
      const nombre = firstRow(found)?.strDireccion || String(id);

      // Eliminar cotizaciones vinculadas y la orden
      await query(
        `DELETE FROM tblDesCotizacion WHERE IdCotizacion IN (SELECT IdCotizacion FROM tblCotizacion WHERE IdRegistro = @id);
         DELETE FROM tblCotizacion WHERE IdRegistro = @id;
         DELETE FROM tblReportes WHERE IdRegistro = @id;`,
        [{ name: 'id', type: mssql.Int, value: id }]
      );

      await writeAuditLog(req, {
        action: 'ELIMINAR', module: 'Órdenes de Trabajo',
        entityId: String(id), entityName: nombre,
        details: 'Orden y cotización sincronizada eliminadas del sistema',
      });

      appCache.delByPrefix('informes');

      res.json({ message: 'Orden eliminada' });
    } catch (err) { next(err); }
  }
);

export default router;
