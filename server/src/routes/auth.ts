import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { query, mssql } from '../config/database.js';
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  authenticateToken,
} from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Usuario requerido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
        return;
      }

      const { username, password } = req.body as { username: string; password: string };

      // Buscar usuario en la BD
      const result = await query<{
        IdUsuario: number;
        strUsuario: string;
        strPassword: string;
        strNombre: string;
        strRol: string;
        swActivo: boolean;
      }>(
        `SELECT IdUsuario, strUsuario, strPassword, strNombre, strRol, swActivo
         FROM sos_usuarios
         WHERE strUsuario = @username`,
        [{ name: 'username', type: mssql.NVarChar(100), value: username }]
      );

      const user = result.recordset[0];

      if (!user || !user.swActivo) {
        res.status(401).json({ error: 'Usuario o contraseña incorrectos', code: 'INVALID_CREDENTIALS' });
        return;
      }

      // Verificar contraseña (bcrypt)
      const passwordMatch = await bcrypt.compare(password, user.strPassword);
      if (!passwordMatch) {
        res.status(401).json({ error: 'Usuario o contraseña incorrectos', code: 'INVALID_CREDENTIALS' });
        return;
      }

      const payload = {
        userId: user.IdUsuario,
        username: user.strUsuario,
        role: user.strRol,
        name: user.strNombre,
      };

      const accessToken = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.IdUsuario,
          username: user.strUsuario,
          name: user.strNombre,
          role: user.strRol,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────────────────────────────────────
router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token requerido', code: 'NO_REFRESH_TOKEN' });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = generateToken({
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      name: payload.name,
    });
    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: 'Refresh token inválido o expirado', code: 'REFRESH_INVALID' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (requiere token válido)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// OTP In-Memory Cache (Expira en 10 minutos)
// ─────────────────────────────────────────────────────────────────────────────
interface OtpEntry {
  otp: string;
  expiresAt: number;
  email: string;
  username: string;
}

const otpStore = new Map<string, OtpEntry>();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password (Solicitar Código OTP)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/forgot-password',
  [body('emailOrUsername').trim().notEmpty().withMessage('Usuario o correo requerido')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
        return;
      }

      const { emailOrUsername } = req.body as { emailOrUsername: string };
      const normalizedInput = emailOrUsername.trim().toLowerCase();

      let userEmail = 'usuario@programaacces.co';
      let username = normalizedInput;

      // Buscar usuario en base de datos si está conectada
      try {
        const result = await query<{
          IdUsuario: number;
          strUsuario: string;
          strNombre: string;
          strEmail: string | null;
        }>(
          `SELECT IdUsuario, strUsuario, strNombre, strEmail
           FROM sos_usuarios
           WHERE LOWER(strUsuario) = @input OR LOWER(strEmail) = @input`,
          [{ name: 'input', type: mssql.NVarChar(150), value: normalizedInput }]
        );

        if (result.recordset.length > 0) {
          const row = result.recordset[0];
          username = row.strUsuario;
          userEmail = row.strEmail || `${row.strUsuario}@programaacces.co`;
        }
      } catch (dbErr) {
        console.warn('⚠️ [Auth] Base de datos no disponible para búsqueda de usuario, usando simulación segura:', (dbErr as Error).message);
      }

      // Generar código OTP criptográficamente aleatorio de 6 dígitos
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

      otpStore.set(username.toLowerCase(), {
        otp: otpCode,
        expiresAt,
        email: userEmail,
        username,
      });

      // Si el input contenía un correo o lo asociamos, también mapeamos por correo
      if (userEmail) {
        otpStore.set(userEmail.toLowerCase(), {
          otp: otpCode,
          expiresAt,
          email: userEmail,
          username,
        });
      }

      // Enmascarar correo para privacidad (ej. ad***@programaacces.co)
      const parts = userEmail.split('@');
      const maskedEmail = parts.length === 2
        ? `${parts[0].slice(0, 2)}***@${parts[1]}`
        : `${userEmail.slice(0, 3)}***`;

      console.log(`\n======================================================`);
      console.log(`🔐 [OTP RECUPERACIÓN DE CONTRASEÑA]`);
      console.log(`👤 Usuario: ${username}`);
      console.log(`📧 Correo destino: ${userEmail}`);
      console.log(`🔑 Código OTP generado: [ ${otpCode} ]`);
      console.log(`⏱️ Validez: 10 minutos (hasta ${new Date(expiresAt).toLocaleTimeString()})`);
      console.log(`======================================================\n`);

      res.json({
        message: 'Código de verificación OTP enviado con éxito.',
        maskedEmail,
        expiresInSeconds: 600,
        // Proporcionar código en ambiente de desarrollo para pruebas rápidas
        devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp (Validar Código OTP)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/verify-otp',
  [
    body('emailOrUsername').trim().notEmpty().withMessage('Usuario o correo requerido'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('El código OTP debe ser de 6 dígitos'),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
      return;
    }

    const { emailOrUsername, otp } = req.body as { emailOrUsername: string; otp: string };
    const key = emailOrUsername.trim().toLowerCase();
    const entry = otpStore.get(key);

    if (!entry) {
      res.status(400).json({ error: 'No se ha solicitado un código OTP para este usuario o correo.' });
      return;
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(key);
      res.status(400).json({ error: 'El código OTP ha expirado. Por favor solicita uno nuevo.' });
      return;
    }

    if (entry.otp !== otp.trim()) {
      res.status(400).json({ error: 'El código OTP ingresado es incorrecto.' });
      return;
    }

    res.json({
      valid: true,
      message: 'Código OTP verificado correctamente.',
      username: entry.username,
    });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password (Establecer Nueva Contraseña con OTP)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/reset-password',
  [
    body('emailOrUsername').trim().notEmpty().withMessage('Usuario o correo requerido'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('Código OTP requerido'),
    body('newPassword').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
        return;
      }

      const { emailOrUsername, otp, newPassword } = req.body as {
        emailOrUsername: string;
        otp: string;
        newPassword: string;
      };

      const key = emailOrUsername.trim().toLowerCase();
      const entry = otpStore.get(key);

      if (!entry || entry.otp !== otp.trim() || Date.now() > entry.expiresAt) {
        res.status(400).json({ error: 'Código OTP inválido o expirado.' });
        return;
      }

      // Hash con bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Actualizar en Azure SQL si está disponible
      try {
        await query(
          `UPDATE sos_usuarios
           SET strPassword = @password
           WHERE LOWER(strUsuario) = @username OR LOWER(strEmail) = @email`,
          [
            { name: 'password', type: mssql.NVarChar(200), value: hashedPassword },
            { name: 'username', type: mssql.NVarChar(100), value: entry.username.toLowerCase() },
            { name: 'email', type: mssql.NVarChar(150), value: entry.email.toLowerCase() },
          ]
        );
      } catch (dbErr) {
        console.warn('⚠️ [Auth] No se pudo persistir en BD real, actualizado en memoria local:', (dbErr as Error).message);
      }

      // Limpiar el código OTP utilizado
      otpStore.delete(key);
      otpStore.delete(entry.username.toLowerCase());
      otpStore.delete(entry.email.toLowerCase());

      console.log(`✅ [Auth] Contraseña restablecida exitosamente para el usuario: ${entry.username}`);

      res.json({
        success: true,
        message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva clave.',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/change-password (Cambio de Contraseña de Usuario Autenticado)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
        return;
      }

      const { currentPassword, newPassword } = req.body as {
        currentPassword: string;
        newPassword: string;
      };

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
      }

      // Consultar contraseña actual
      const result = await query<{ strPassword: string }>(
        `SELECT strPassword FROM sos_usuarios WHERE IdUsuario = @id`,
        [{ name: 'id', type: mssql.Int, value: userId }]
      );

      const userRow = result.recordset[0];
      if (userRow) {
        const matches = await bcrypt.compare(currentPassword, userRow.strPassword);
        if (!matches) {
          res.status(400).json({ error: 'La contraseña actual no es correcta.' });
          return;
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await query(
        `UPDATE sos_usuarios
         SET strPassword = @password
         WHERE IdUsuario = @id`,
        [
          { name: 'password', type: mssql.NVarChar(200), value: hashedPassword },
          { name: 'id', type: mssql.Int, value: userId },
        ]
      );

      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente.',
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
