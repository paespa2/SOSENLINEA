import { Request, Response, NextFunction } from 'express';
import { query, mssql } from '../config/database.js';

const AUDIT_TABLE = process.env.AUDIT_TABLE || 'sos_audit_logs';

export interface AuditContext {
  action: string;
  module: string;
  entityId: string;
  entityName: string;
  details: string;
}

/**
 * Escribe una entrada de auditoría en la tabla sos_audit_logs de Azure SQL.
 * Se llama manualmente desde los controllers después de operaciones CUD.
 */
export async function writeAuditLog(
  req: Request,
  ctx: AuditContext
): Promise<void> {
  if (!req.user) return;

  try {
    const sql = `
      INSERT INTO ${AUDIT_TABLE}
        (userId, userName, userRole, action, module, entityId, entityName, details, ipAddress, createdAt)
      VALUES
        (@userId, @userName, @userRole, @action, @module, @entityId, @entityName, @details, @ip, GETDATE())
    `;

    // Detectar IP real incluso detrás de proxies reversos, Cloudflare o Azure App Service
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : (Array.isArray(forwarded) ? forwarded[0].trim() : req.socket.remoteAddress || req.ip || 'unknown');

    await query(sql, [
      { name: 'userId',     type: mssql.Int,         value: req.user.userId },
      { name: 'userName',   type: mssql.NVarChar(100), value: req.user.name },
      { name: 'userRole',   type: mssql.NVarChar(50),  value: req.user.role },
      { name: 'action',     type: mssql.NVarChar(50),  value: ctx.action },
      { name: 'module',     type: mssql.NVarChar(100), value: ctx.module },
      { name: 'entityId',   type: mssql.NVarChar(50),  value: ctx.entityId },
      { name: 'entityName', type: mssql.NVarChar(200), value: ctx.entityName },
      { name: 'details',    type: mssql.NVarChar(mssql.MAX), value: ctx.details },
      { name: 'ip',         type: mssql.NVarChar(50),  value: clientIp },
    ]);
  } catch (err) {
    // La auditoría nunca debe romper la operación principal
    console.error('⚠️  Error al escribir audit log:', err);
  }
}

/**
 * Middleware de logging de peticiones HTTP (Morgan-style simple).
 * Solo registra en consola; la auditoría de negocio va en writeAuditLog.
 */
export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const user = req.user ? `[${req.user.role}] ${req.user.username}` : 'anonymous';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${user}`);
  next();
}
