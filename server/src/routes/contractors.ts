import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { query, mssql, firstRow, allRows } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { writeAuditLog } from '../middleware/audit.js';
import { appCache } from '../utils/cache.js';

const router = Router();

// Todos los endpoints requieren autenticación
router.use(authenticateToken);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/contractors  — Lista todos los contratistas (Con Caché en Memoria)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appCache.getOrSet('contractors:all', async () => {
      const result = await query(`
        SELECT
          IdContratista             AS id,
          strNombre                 AS nombre,
          ISNULL(strTipo, 'Contratista') AS tipo,
          IdContratista             AS nit,
          strEspecialidad           AS especialidad,
          strTel                    AS telefono,
          strDireccion              AS direccion,
          strBanco                  AS banco,
          strTipoCta                AS tipoCuenta,
          strNumeroCta              AS numeroCuenta,
          strNombreCta              AS nombreCuenta,
          strContacto               AS contacto,
          CASE WHEN swActivo = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
          ISNULL(swActivo, 1)       AS activo
        FROM tblContratistas WITH (NOLOCK)
        ORDER BY strNombre
      `);
      return result.recordset;
    }, 300); // 5 min TTL

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/contractors/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT
        IdContratista             AS id,
        strNombre                 AS nombre,
        ISNULL(strTipo, 'Contratista') AS tipo,
        IdContratista             AS nit,
        strEspecialidad           AS especialidad,
        strTel                    AS telefono,
        strDireccion              AS direccion,
        strBanco                  AS banco,
        strTipoCta                AS tipoCuenta,
        strNumeroCta              AS numeroCuenta,
        strNombreCta              AS nombreCuenta,
        strContacto               AS contacto,
        CASE WHEN swActivo = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
        ISNULL(swActivo, 1)       AS activo
       FROM tblContratistas WITH (NOLOCK) WHERE IdContratista = @id`,
      [{ name: 'id', type: mssql.NVarChar(50), value: req.params.id }]
    );
    if (!result.recordset[0]) {
      res.status(404).json({ error: 'Contratista no encontrado' });
      return;
    }
    res.json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/contractors  — Crear nuevo contratista
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/',
  requireRole('admin', 'maestros'),
  [
    body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
    body('nit').trim().notEmpty().withMessage('NIT requerido'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
        return;
      }

      const d = req.body;
      const idContratista = (d.nit || d.id || '').trim();

      await query(
        `INSERT INTO tblContratistas
          (IdContratista, strNombre, strTipo, strEspecialidad, strTel,
           strDireccion, strBanco, strTipoCta, strNumeroCta, strNombreCta,
           strContacto, swActivo)
         VALUES
          (@id, @nombre, @tipo, @especialidad, @telefono,
           @direccion, @banco, @tipoCuenta, @numeroCuenta, @nombreCuenta,
           @contacto, @activo)`,
        [
          { name: 'id',           type: mssql.NVarChar(50),  value: idContratista },
          { name: 'nombre',       type: mssql.NVarChar(255), value: d.nombre },
          { name: 'tipo',         type: mssql.NVarChar(50),  value: d.tipo || 'Persona Natural' },
          { name: 'especialidad', type: mssql.NVarChar(50),  value: d.especialidad || '' },
          { name: 'telefono',     type: mssql.NVarChar(50),  value: d.telefono || '' },
          { name: 'direccion',    type: mssql.NVarChar(255), value: d.direccion || '' },
          { name: 'banco',        type: mssql.NVarChar(50),  value: d.banco || '' },
          { name: 'tipoCuenta',   type: mssql.NVarChar(50),  value: d.tipoCuenta || '' },
          { name: 'numeroCuenta', type: mssql.NVarChar(50),  value: d.numeroCuenta || '' },
          { name: 'nombreCuenta', type: mssql.NVarChar(255), value: d.nombreCuenta || d.nombre },
          { name: 'contacto',     type: mssql.NVarChar(255), value: d.contacto || '' },
          { name: 'activo',       type: mssql.Bit,           value: d.activo !== false ? 1 : 0 },
        ]
      );

      await writeAuditLog(req, {
        action: 'CREAR',
        module: 'Maestros - Contratistas',
        entityId: idContratista,
        entityName: d.nombre,
        details: `Registrado Contratista NIT ${idContratista}`,
      });

      appCache.delByPrefix('contractors');

      res.status(201).json({ id: idContratista, message: 'Contratista creado exitosamente' });
    } catch (err) {
      next(err);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/contractors/:id  — Actualizar contratista
// ─────────────────────────────────────────────────────────────────────────────
router.put(
  '/:id',
  requireRole('admin', 'maestros'),
  param('id').trim().notEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const d = req.body;

      await query(
        `UPDATE tblContratistas SET
          strNombre = @nombre,
          strTipo = @tipo,
          strEspecialidad = @especialidad,
          strTel = @telefono,
          strDireccion = @direccion,
          strBanco = @banco,
          strTipoCta = @tipoCuenta,
          strNumeroCta = @numeroCuenta,
          strNombreCta = @nombreCuenta,
          strContacto = @contacto,
          swActivo = @activo
         WHERE IdContratista = @id`,
        [
          { name: 'id',           type: mssql.NVarChar(50),  value: id },
          { name: 'nombre',       type: mssql.NVarChar(255), value: d.nombre },
          { name: 'tipo',         type: mssql.NVarChar(50),  value: d.tipo },
          { name: 'especialidad', type: mssql.NVarChar(50),  value: d.especialidad || '' },
          { name: 'telefono',     type: mssql.NVarChar(50),  value: d.telefono || '' },
          { name: 'direccion',    type: mssql.NVarChar(255), value: d.direccion || '' },
          { name: 'banco',        type: mssql.NVarChar(50),  value: d.banco || '' },
          { name: 'tipoCuenta',   type: mssql.NVarChar(50),  value: d.tipoCuenta || '' },
          { name: 'numeroCuenta', type: mssql.NVarChar(50),  value: d.numeroCuenta || '' },
          { name: 'nombreCuenta', type: mssql.NVarChar(255), value: d.nombreCuenta || d.nombre },
          { name: 'contacto',     type: mssql.NVarChar(255), value: d.contacto || '' },
          { name: 'activo',       type: mssql.Bit,           value: d.activo !== false ? 1 : 0 },
        ]
      );

      await writeAuditLog(req, {
        action: 'ACTUALIZAR',
        module: 'Maestros - Contratistas',
        entityId: id,
        entityName: d.nombre,
        details: 'Modificación de datos de contratista',
      });

      appCache.delByPrefix('contractors');

      res.json({ message: 'Contratista actualizado exitosamente' });
    } catch (err) {
      next(err);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/contractors/:id  — Eliminar contratista (solo admin)
// ─────────────────────────────────────────────────────────────────────────────
router.delete(
  '/:id',
  requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      const found = await query(
        'SELECT strNombre FROM tblContratistas WITH (NOLOCK) WHERE IdContratista = @id',
        [{ name: 'id', type: mssql.NVarChar(50), value: id }]
      );
      const nombre = firstRow(found)?.strNombre || id;

      await query(
        'DELETE FROM tblContratistas WHERE IdContratista = @id',
        [{ name: 'id', type: mssql.NVarChar(50), value: id }]
      );

      await writeAuditLog(req, {
        action: 'ELIMINAR',
        module: 'Maestros - Contratistas',
        entityId: id,
        entityName: nombre,
        details: 'Registro de contratista eliminado',
      });

      appCache.delByPrefix('contractors');

      res.json({ message: 'Contratista eliminado exitosamente' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
