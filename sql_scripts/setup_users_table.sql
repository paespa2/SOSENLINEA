-- ============================================================
-- SOS Programaacces - Script de Setup Inicial
-- Ejecutar UNA SOLA VEZ contra Azure SQL (Programaacces)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Tabla de Usuarios del Sistema Web
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'sos_usuarios')
BEGIN
  CREATE TABLE sos_usuarios (
    IdUsuario     INT           IDENTITY(1,1) PRIMARY KEY,
    strUsuario    NVARCHAR(100) NOT NULL UNIQUE,
    strPassword   NVARCHAR(200) NOT NULL,  -- bcrypt hash
    strNombre     NVARCHAR(200) NOT NULL,
    strEmail      NVARCHAR(150),
    strRol        NVARCHAR(50)  NOT NULL DEFAULT 'usuario',
    -- Roles: admin | maestros | contable | campo | usuario
    swActivo      BIT           NOT NULL DEFAULT 1,
    datCreacion   DATETIME2     DEFAULT GETDATE(),
    datUltimoLogin DATETIME2
  );
  PRINT '✅ Tabla sos_usuarios creada';
END
ELSE
  PRINT '⏩ sos_usuarios ya existe';
GO

-- ─────────────────────────────────────────────────────────────
-- 2. Tabla de Auditoría del Sistema Web
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'sos_audit_logs')
BEGIN
  CREATE TABLE sos_audit_logs (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    userId      INT,
    userName    NVARCHAR(100),
    userRole    NVARCHAR(50),
    action      NVARCHAR(50)  NOT NULL,  -- CREAR|ACTUALIZAR|ELIMINAR|CAMBIO_ESTADO
    module      NVARCHAR(100),
    entityId    NVARCHAR(50),
    entityName  NVARCHAR(200),
    details     NVARCHAR(MAX),
    ipAddress   NVARCHAR(50),
    createdAt   DATETIME2     DEFAULT GETDATE()
  );

  CREATE INDEX idx_audit_createdAt ON sos_audit_logs(createdAt DESC);
  CREATE INDEX idx_audit_userId    ON sos_audit_logs(userId);
  CREATE INDEX idx_audit_module    ON sos_audit_logs(module);

  PRINT '✅ Tabla sos_audit_logs creada';
END
ELSE
  PRINT '⏩ sos_audit_logs ya existe';
GO

-- ─────────────────────────────────────────────────────────────
-- 3. Tabla de Novedades (si no existe)
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'tblNovedades')
BEGIN
  CREATE TABLE tblNovedades (
    IdNovedad       INT           IDENTITY(1,1) PRIMARY KEY,
    strTitulo       NVARCHAR(300) NOT NULL,
    strDescripcion  NVARCHAR(MAX),
    strPrioridad    NVARCHAR(30)  DEFAULT 'Media',  -- Crítica|Alta|Media|Baja
    strEstado       NVARCHAR(30)  DEFAULT 'Abierta', -- Abierta|En Revisión|Resuelta|Cerrada
    strTipo         NVARCHAR(50),
    strReportadoPor NVARCHAR(150),
    datFecha        DATETIME2     DEFAULT GETDATE(),
    IdRegistro      INT           NULL  -- FK opcional a tblReportes
  );
  PRINT '✅ Tabla tblNovedades creada';
END
ELSE
  PRINT '⏩ tblNovedades ya existe';
GO

-- ─────────────────────────────────────────────────────────────
-- 4. Usuario Admin por Defecto
-- IMPORTANTE: Cambiar la contraseña inmediatamente en producción
-- Hash bcrypt de "Admin@SOS2026!" (cost=12)
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sos_usuarios WHERE strUsuario = 'admin')
BEGIN
  INSERT INTO sos_usuarios (strUsuario, strPassword, strNombre, strEmail, strRol)
  VALUES (
    'admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2n.G3SyaO6',
    'Administrador SOS',
    'admin@programaacces.co',
    'admin'
  );
  PRINT '✅ Usuario admin creado (contraseña inicial: Admin@SOS2026!)';
  PRINT '⚠️  CAMBIAR CONTRASEÑA INMEDIATAMENTE EN PRODUCCIÓN';
END
ELSE
  PRINT '⏩ Usuario admin ya existe';
GO

-- ─────────────────────────────────────────────────────────────
-- 5. Usuarios de Prueba por Rol
-- ─────────────────────────────────────────────────────────────
-- Hash bcrypt de "Prueba@123" (cost=12)
DECLARE @hashPrueba NVARCHAR(200) = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

IF NOT EXISTS (SELECT 1 FROM sos_usuarios WHERE strUsuario = 'maestros')
  INSERT INTO sos_usuarios (strUsuario, strPassword, strNombre, strRol)
  VALUES ('maestros', @hashPrueba, 'Usuario Maestros', 'maestros');

IF NOT EXISTS (SELECT 1 FROM sos_usuarios WHERE strUsuario = 'contable')
  INSERT INTO sos_usuarios (strUsuario, strPassword, strNombre, strRol)
  VALUES ('contable', @hashPrueba, 'Usuario Contable', 'contable');

IF NOT EXISTS (SELECT 1 FROM sos_usuarios WHERE strUsuario = 'campo')
  INSERT INTO sos_usuarios (strUsuario, strPassword, strNombre, strRol)
  VALUES ('campo', @hashPrueba, 'Usuario Campo', 'campo');

IF NOT EXISTS (SELECT 1 FROM sos_usuarios WHERE strUsuario = 'usuario')
  INSERT INTO sos_usuarios (strUsuario, strPassword, strNombre, strRol)
  VALUES ('usuario', @hashPrueba, 'Usuario Básico', 'usuario');

PRINT '✅ Usuarios de prueba creados (contraseña: Prueba@123)';
GO

-- ─────────────────────────────────────────────────────────────
-- 6. Verificación Final
-- ─────────────────────────────────────────────────────────────
SELECT 'sos_usuarios' AS tabla, COUNT(*) AS registros FROM sos_usuarios
UNION ALL
SELECT 'sos_audit_logs', COUNT(*) FROM sos_audit_logs;
GO

PRINT '';
PRINT '════════════════════════════════════════════════════';
PRINT '  Setup completado. El servidor puede iniciarse.';
PRINT '  Roles disponibles: admin, maestros, contable, campo, usuario';
PRINT '════════════════════════════════════════════════════';
