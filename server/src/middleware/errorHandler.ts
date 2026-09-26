import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
  code?: string;
}

/**
 * Middleware centralizado de manejo de errores Express.
 * Debe ser el ÚLTIMO middleware registrado en index.ts.
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`❌ [${req.method} ${req.path}] ${status} — ${err.message}`);

  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_ERROR',
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * Middleware 404 — rutas no encontradas.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.path}`,
    code: 'NOT_FOUND',
  });
}

/**
 * Helper para crear errores con status HTTP.
 */
export function createError(message: string, status: number, code?: string): AppError {
  const err = new Error(message) as AppError;
  err.status = status;
  err.code = code;
  return err;
}
