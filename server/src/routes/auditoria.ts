import { Router, Request, Response, NextFunction } from 'express';
import { query, mssql, firstRow, allRows } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// Solo admin puede ver los logs de auditoría
router.use(requireRole('admin'));

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/audit  — Lista logs con paginación y filtros
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page   = parseInt(req.query.page   as string || '1');
    const limit  = parseInt(req.query.limit  as string || '100');
    const offset = (page - 1) * limit;
    const module = req.query.module as string | undefined;
    const userId = req.query.userId as string | undefined;
    const action = req.query.action as string | undefined;
    const desde  = req.query.desde  as string | undefined;
    const hasta  = req.query.hasta  as string | undefined;

    let where = 'WHERE 1=1';
    const params: Parameters<typeof query>[1] = [];

    if (module) { where += ' AND module = @module'; params.push({ name: 'module', type: mssql.NVarChar(100), value: module }); }
    if (userId) { where += ' AND userId = @userId'; params.push({ name: 'userId', type: mssql.Int, value: parseInt(userId) }); }
    if (action) { where += ' AND action = @action'; params.push({ name: 'action', type: mssql.NVarChar(50), value: action }); }
    if (desde)  { where += ' AND createdAt >= @desde'; params.push({ name: 'desde', type: mssql.DateTime, value: desde }); }
    if (hasta)  { where += ' AND createdAt <= @hasta'; params.push({ name: 'hasta', type: mssql.DateTime, value: hasta }); }

    params.push({ name: 'limit',  type: mssql.Int, value: limit });
    params.push({ name: 'offset', type: mssql.Int, value: offset });

    const [AUDIT_TABLE] = [process.env.AUDIT_TABLE || 'sos_audit_logs'];

    const result = await query(
      `SELECT
        id, userId, userName, userRole, action, module,
        entityId, entityName, details, ipAddress,
        CONVERT(varchar, createdAt, 120) AS timestamp
       FROM ${AUDIT_TABLE}
       ${where}
       ORDER BY createdAt DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM ${AUDIT_TABLE} ${where}`,
      params.filter(p => !['limit', 'offset'].includes(p.name))
    );

    res.json({
      data: allRows(result),
      total: firstRow(countResult)?.total ?? 0,
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
