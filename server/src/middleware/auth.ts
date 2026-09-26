import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}

// Extendemos el tipo Request de Express para incluir `user`
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/**
 * Middleware: verifica el token JWT en el header Authorization.
 * Si es válido, adjunta el payload en `req.user`.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ error: 'Token de acceso requerido', code: 'NO_TOKEN' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    if ((err as Error).name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    } else {
      res.status(403).json({ error: 'Token inválido', code: 'TOKEN_INVALID' });
    }
  }
}

/**
 * Middleware: restringe acceso a roles específicos.
 * Uso: router.get('/...', authenticateToken, requireRole('admin', 'maestros'), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado', code: 'NO_AUTH' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Acceso denegado: rol insuficiente',
        code: 'FORBIDDEN',
        requiredRoles: roles,
        currentRole: req.user.role,
      });
      return;
    }
    next();
  };
}

/**
 * Genera un JWT de acceso con expiración configurable.
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Genera un JWT de refresh de larga duración.
 */
export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET + '_refresh', {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifica un refresh token.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET + '_refresh') as JwtPayload;
}
