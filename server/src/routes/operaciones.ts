import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { query, mssql, firstRow, allRows } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { writeAuditLog } from '../middleware/audit.js';

const router = Router();
router.use(authenticateToken);

// ════════════════════════════════════════════════════════════════
//  HERRAMIENTAS (tblHerramientas)
// ════════════════════════════════════════════════════════════════
router.get('/herramientas', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(`
      SELECT
        CAST(h.IdHerramienta AS VARCHAR) AS id,
        h.strHerramienta                 AS nombre,
        CAST(ISNULL(h.IdGrupoHta, 1) AS VARCHAR) AS grupo,
        ISNULL(h.strMarca, 'Genérica')   AS marca,
        'HTA-' + CAST(h.IdHerramienta AS VARCHAR) AS serial,
        ISNULL(h.strEstado, 'En Almacén') AS estado,
        'Almacén Central'                AS responsableActual,
        ''                               AS fechaAsignacion,
        ''                               AS fechaAdquisicion,
        0                                AS valor,
        ISNULL(h.strObservacion, '')     AS observaciones,
        ISNULL(h.numCantidad, 1)         AS cantidad
      FROM tblHerramientas h WITH (NOLOCK)
      ORDER BY h.strHerramienta
    `);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

router.post('/herramientas', requireRole('admin', 'maestros'),
  [body('nombre').notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { res.status(400).json({ error: 'Datos inválidos', details: errors.array() }); return; }

      const d = req.body;
      const r = await query(
        `INSERT INTO tblHerramientas
          (strHerramienta, strMarca, strEstado, strObservacion, numCantidad, swVerificado)
         OUTPUT INSERTED.IdHerramienta AS id
         VALUES (@nombre, @marca, @estado, @obs, @can, 1)`,
        [
          { name: 'nombre', type: mssql.NVarChar(255), value: d.nombre },
          { name: 'marca',  type: mssql.NVarChar(255), value: d.marca || 'Genérica' },
          { name: 'estado', type: mssql.NVarChar(255), value: d.estado || 'En Almacén' },
          { name: 'obs',    type: mssql.NVarChar(255), value: d.observaciones || '' },
          { name: 'can',    type: mssql.Int,           value: d.cantidad || 1 },
        ]
      );
      const newId = firstRow(r)?.id;
      await writeAuditLog(req, { action: 'CREAR', module: 'Maestros - Herramientas', entityId: String(newId), entityName: d.nombre, details: `Herramienta creada` });
      res.status(201).json({ id: String(newId), message: 'Herramienta registrada' });
    } catch (err) { next(err); }
  }
);

router.patch('/herramientas/:id/estado', requireRole('admin', 'campo', 'maestros'),
  [body('estado').notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const { estado } = req.body as { estado: string };

      await query(
        `UPDATE tblHerramientas SET strEstado = @estado WHERE IdHerramienta = @id`,
        [
          { name: 'id',     type: mssql.Int,           value: id },
          { name: 'estado', type: mssql.NVarChar(255), value: estado },
        ]
      );

      await writeAuditLog(req, {
        action: 'ACTUALIZAR', module: 'Operaciones - Herramientas',
        entityId: String(id), entityName: `Herramienta #${id}`,
        details: `Estado: → ${estado}`,
      });

      res.json({ message: 'Estado de herramienta actualizado' });
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════════════════════════════
//  LLAVES (tblLlaves)
// ════════════════════════════════════════════════════════════════
router.get('/llaves', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(`
      SELECT
        CAST(l.Idllaves AS VARCHAR)           AS id,
        ISNULL(r.strDireccion, 'Inmueble #' + CAST(l.IdRegistro AS VARCHAR)) AS inmueble,
        'LL-' + CAST(l.Idllaves AS VARCHAR)   AS numeroLlave,
        CASE
          WHEN l.IdContratista IS NOT NULL AND l.IdContratista <> '' THEN 'Prestada'
          ELSE 'Disponible'
        END                                   AS estado,
        ISNULL(ct.strNombre, l.IdContratista) AS custodioActual,
        l.datReporte                          AS fechaPrestamo,
        ISNULL(l.strNovedad, '')              AS observaciones
      FROM tblLlaves l WITH (NOLOCK)
      LEFT JOIN tblReportes r    WITH (NOLOCK) ON r.IdRegistro = l.IdRegistro
      LEFT JOIN tblContratistas ct WITH (NOLOCK) ON ct.IdContratista = l.IdContratista
      ORDER BY l.Idllaves DESC
    `);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

router.post('/llaves', requireRole('admin', 'campo'),
  [body('inmueble').notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const d = req.body;
      const r = await query(
        `INSERT INTO tblLlaves (IdRegistro, IdContratista, datReporte, strNovedad)
         OUTPUT INSERTED.Idllaves AS id
         VALUES (@regId, @contId, CONVERT(varchar, GETDATE(), 23), @obs)`,
        [
          { name: 'regId',  type: mssql.Int,           value: d.idRegistro ? parseInt(d.idRegistro) : 1001 },
          { name: 'contId', type: mssql.NVarChar(50),  value: d.idContratista || null },
          { name: 'obs',    type: mssql.NVarChar(50),  value: d.observaciones || d.inmueble || '' },
        ]
      );
      const newId = firstRow(r)?.id;
      await writeAuditLog(req, { action: 'CREAR', module: 'Operaciones - Llaves', entityId: String(newId), entityName: d.inmueble, details: `Llave registrada` });
      res.status(201).json({ id: String(newId), message: 'Llave registrada' });
    } catch (err) { next(err); }
  }
);

router.patch('/llaves/:id/prestamo', requireRole('admin', 'campo'),
  [body('estado').isIn(['Disponible', 'Prestada', 'Extraviada'])],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const { estado, custodio } = req.body as { estado: string; custodio?: string };

      await query(
        `UPDATE tblLlaves SET
          IdContratista = @contId,
          datReporte = CONVERT(varchar, GETDATE(), 23),
          strNovedad = @nov
         WHERE Idllaves = @id`,
        [
          { name: 'id',     type: mssql.Int,          value: id },
          { name: 'contId', type: mssql.NVarChar(50), value: estado === 'Prestada' ? (custodio || 'Técnico Asignado') : null },
          { name: 'nov',    type: mssql.NVarChar(50), value: estado },
        ]
      );

      await writeAuditLog(req, {
        action: 'CAMBIO_ESTADO', module: 'Operaciones - Llaves',
        entityId: String(id), entityName: `Llave #${id}`,
        details: `Estado: → ${estado}`,
      });

      res.json({ message: 'Préstamo de llave actualizado' });
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════════════════════════════
//  ENTREGAS DE MATERIALES (tblEntregaMateriales)
// ════════════════════════════════════════════════════════════════
router.get('/entregas-materiales', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(`
      SELECT
        CAST(e.IdOrden AS VARCHAR)            AS id,
        CAST(e.IdRegistro AS VARCHAR)         AS idMaterial,
        ISNULL(e.strDescripcion, 'Material')  AS materialNombre,
        1                                     AS cantidad,
        'UND'                                 AS unidad,
        e.IdContratista                       AS idContratista,
        ISNULL(ct.strNombre, e.IdContratista) AS receptorNombre,
        CONVERT(varchar, e.datFecha, 23)      AS fechaEntrega,
        e.IdRegistro                          AS idOrden,
        ISNULL(r.strDireccion, 'Orden #' + CAST(e.IdRegistro AS VARCHAR)) AS ordenDireccion,
        'Costo: $' + CAST(ISNULL(e.numMateriales, 0) AS VARCHAR) AS observaciones
      FROM tblEntregaMateriales e WITH (NOLOCK)
      LEFT JOIN tblContratistas ct WITH (NOLOCK) ON ct.IdContratista = e.IdContratista
      LEFT JOIN tblReportes     r  WITH (NOLOCK) ON r.IdRegistro = e.IdRegistro
      ORDER BY e.IdOrden DESC
    `);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

router.post('/entregas-materiales', requireRole('admin', 'campo', 'maestros'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const d = req.body;
      const r = await query(
        `INSERT INTO tblEntregaMateriales
          (IdRegistro, IdContratista, datFecha, strDescripcion, numMateriales)
         OUTPUT INSERTED.IdOrden AS id
         VALUES (@ordId, @contId, GETDATE(), @desc, @valor)`,
        [
          { name: 'ordId',  type: mssql.Int,           value: d.idOrden ? parseInt(d.idOrden) : 1001 },
          { name: 'contId', type: mssql.NVarChar(50),  value: d.idContratista || null },
          { name: 'desc',   type: mssql.NVarChar(255), value: d.materialNombre || d.descripcion || '' },
          { name: 'valor',  type: mssql.Float,         value: d.cantidad ? (d.cantidad * 10000) : 0 },
        ]
      );
      const newId = firstRow(r)?.id;
      await writeAuditLog(req, {
        action: 'CREAR', module: 'Operaciones - Materiales',
        entityId: String(newId), entityName: `Entrega #${newId}`,
        details: `Entrega de materiales registrada`,
      });
      res.status(201).json({ id: String(newId), message: 'Entrega registrada' });
    } catch (err) { next(err); }
  }
);

export default router;
