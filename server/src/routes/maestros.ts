import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryCached, queryCache, mssql, firstRow } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { writeAuditLog } from '../middleware/audit.js';

const router = Router();
router.use(authenticateToken);

// ════════════════════════════════════════════════════════════════
//  CLIENTES (tblClientes)
// ════════════════════════════════════════════════════════════════
router.get('/clientes', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await queryCached('maestros:clientes', `
      SELECT
        CAST(IdContratante AS VARCHAR) AS id,
        strContratante AS nombre,
        'Empresa'      AS tipo,
        strContacto    AS contacto,
        strDir         AS direccion,
        strCel         AS telefono,
        strEmail       AS email,
        'Medellín'     AS ciudad,
        ISNULL(swActivo, 'Activo') AS estado
      FROM tblClientes WITH (NOLOCK)
      ORDER BY strContratante
    `, [], 60); // 60s TTL
    res.json(result.recordset);
  } catch (err) { next(err); }
});

router.post('/clientes', requireRole('admin', 'maestros'),
  [body('nombre').notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { res.status(400).json({ error: 'Datos inválidos', details: errors.array() }); return; }

      const d = req.body;
      const r = await query(
        `INSERT INTO tblClientes (strContratante, strContacto, strDir, strCel, strEmail, swActivo)
         OUTPUT INSERTED.IdContratante AS id
         VALUES (@nombre, @contacto, @dir, @tel, @email, @estado)`,
        [
          { name: 'nombre',   type: mssql.NVarChar(50),  value: d.nombre },
          { name: 'contacto', type: mssql.NVarChar(50),  value: d.contacto || '' },
          { name: 'dir',      type: mssql.NVarChar(50),  value: d.direccion || '' },
          { name: 'tel',      type: mssql.NVarChar(255), value: d.telefono || '' },
          { name: 'email',    type: mssql.NVarChar(255), value: d.email || '' },
          { name: 'estado',   type: mssql.NVarChar(255), value: d.estado || 'Activo' },
        ]
      );
      queryCache.del('maestros:clientes');
      const newId = firstRow(r)?.id;
      await writeAuditLog(req, { action: 'CREAR', module: 'Maestros - Clientes', entityId: String(newId), entityName: d.nombre, details: `Cliente registrado` });
      res.status(201).json({ id: String(newId), message: 'Cliente creado' });
    } catch (err) { next(err); }
  }
);

router.put('/clientes/:id', requireRole('admin', 'maestros'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseFloat(req.params.id);
      const d = req.body;
      await query(
        `UPDATE tblClientes SET
          strContratante=@nombre,
          strContacto=@contacto,
          strDir=@dir,
          strCel=@tel,
          strEmail=@email,
          swActivo=@estado
         WHERE IdContratante = @id`,
        [
          { name: 'id',       type: mssql.Float,         value: id },
          { name: 'nombre',   type: mssql.NVarChar(50),  value: d.nombre },
          { name: 'contacto', type: mssql.NVarChar(50),  value: d.contacto || '' },
          { name: 'dir',      type: mssql.NVarChar(50),  value: d.direccion || '' },
          { name: 'tel',      type: mssql.NVarChar(255), value: d.telefono || '' },
          { name: 'email',    type: mssql.NVarChar(255), value: d.email || '' },
          { name: 'estado',   type: mssql.NVarChar(255), value: d.estado || 'Activo' },
        ]
      );
      queryCache.del('maestros:clientes');
      await writeAuditLog(req, { action: 'ACTUALIZAR', module: 'Maestros - Clientes', entityId: String(id), entityName: d.nombre, details: 'Modificación de datos' });
      res.json({ message: 'Cliente actualizado' });
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════════════════════════════
//  SECTORES (tblSectores)
// ════════════════════════════════════════════════════════════════
router.get('/sectores', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await queryCached('maestros:sectores', `
      SELECT
        CAST(IDSector AS VARCHAR) AS id,
        strSector                 AS nombre,
        ISNULL(strRuta, 'Centro') AS zona,
        ISNULL(strRuta, '')       AS ruta,
        CAST(ISNULL(IDSectorRef, 0) AS VARCHAR) AS referencia
      FROM tblSectores WITH (NOLOCK)
      ORDER BY strSector
    `, [], 120); // 120s TTL
    res.json(result.recordset);
  } catch (err) { next(err); }
});

router.post('/sectores', requireRole('admin', 'maestros'),
  [body('nombre').notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const d = req.body;
      const r = await query(
        `INSERT INTO tblSectores (strSector, strRuta, IDSectorRef)
         OUTPUT INSERTED.IDSector AS id
         VALUES (@nombre, @ruta, @ref)`,
        [
          { name: 'nombre', type: mssql.NVarChar(255), value: d.nombre },
          { name: 'ruta',   type: mssql.NVarChar(50),  value: d.ruta || d.zona || '' },
          { name: 'ref',    type: mssql.Int,           value: parseInt(d.referencia) || 0 },
        ]
      );
      queryCache.del('maestros:sectores');
      const newId = firstRow(r)?.id;
      await writeAuditLog(req, { action: 'CREAR', module: 'Maestros - Sectores', entityId: String(newId), entityName: d.nombre, details: `Zona/Ruta: ${d.ruta || d.zona}` });
      res.status(201).json({ id: String(newId), message: 'Sector creado' });
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════════════════════════════
//  MATERIALES (tblMateriales)
// ════════════════════════════════════════════════════════════════
router.get('/materiales', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await queryCached('maestros:materiales', `
      SELECT
        CAST(m.IdElemento AS VARCHAR) AS id,
        m.strDescripcion              AS nombre,
        ISNULL(m.Unidad, 'UND')       AS unidad,
        CAST(ISNULL(m.Presentacion, 1) AS VARCHAR) AS referencia,
        ISNULL(m.numVr, 0)            AS precioUnitario,
        'Activo'                      AS estado,
        ISNULL(m.numCantidad, 0)      AS stockActual,
        5                             AS stockMinimo
      FROM tblMateriales m WITH (NOLOCK)
      ORDER BY m.strDescripcion
    `, [], 60); // 60s TTL
    res.json(result.recordset);
  } catch (err) { next(err); }
});

router.post('/materiales', requireRole('admin', 'maestros'),
  [body('nombre').notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const d = req.body;
      const r = await query(
        `INSERT INTO tblMateriales (strDescripcion, Unidad, Presentacion, numVr, numCantidad, swActualizado)
         OUTPUT INSERTED.IdElemento AS id
         VALUES (@nombre, @unidad, @pres, @precio, @can, 1)`,
        [
          { name: 'nombre',   type: mssql.NVarChar(255), value: d.nombre },
          { name: 'unidad',   type: mssql.NVarChar(50),  value: d.unidad || 'UND' },
          { name: 'pres',     type: mssql.Int,           value: parseInt(d.referencia) || 1 },
          { name: 'precio',   type: mssql.Float,         value: d.precioUnitario || 0 },
          { name: 'can',      type: mssql.Int,           value: d.stockActual || 0 },
        ]
      );
      queryCache.del('maestros:materiales');
      const newId = firstRow(r)?.id;
      await writeAuditLog(req, { action: 'CREAR', module: 'Maestros - Materiales', entityId: String(newId), entityName: d.nombre, details: `Stock inicial: ${d.stockActual || 0}` });
      res.status(201).json({ id: String(newId), message: 'Material creado' });
    } catch (err) { next(err); }
  }
);

router.patch('/materiales/:id/stock', requireRole('admin', 'maestros', 'campo'),
  [body('stock').isInt({ min: 0 })],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const { stock } = req.body as { stock: number };

      await query(
        `UPDATE tblMateriales SET numCantidad = @stock, swActualizado = 1 WHERE IdElemento = @id`,
        [
          { name: 'id',    type: mssql.Int, value: id },
          { name: 'stock', type: mssql.Int, value: stock },
        ]
      );
      queryCache.del('maestros:materiales');

      await writeAuditLog(req, {
        action: 'ACTUALIZAR', module: 'Inventario Materiales',
        entityId: String(id), entityName: `Material #${id}`,
        details: `Stock ajustado a ${stock}`,
      });

      res.json({ message: 'Stock actualizado' });
    } catch (err) { next(err); }
  }
);

export default router;
