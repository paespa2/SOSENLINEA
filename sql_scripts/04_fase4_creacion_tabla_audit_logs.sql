-- ============================================================================
-- SCRIPT DE AUDITORÍA - FASE 4: TABLA DE AUDITORÍA Y TRAZABILIDAD
-- Base de Datos: Programaacces (Azure SQL Server)
-- ============================================================================

BEGIN TRANSACTION;

BEGIN TRY
    PRINT '>> Creando tabla [dbo].[audit_logs]...';

    IF OBJECT_ID(N'[dbo].[audit_logs]', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[audit_logs] (
            [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
            [userId] VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
            [userName] NVARCHAR(100) NOT NULL,
            [userRole] VARCHAR(50) NOT NULL,
            [action] VARCHAR(30) NOT NULL, -- 'CREAR', 'ACTUALIZAR', 'ELIMINAR', 'CAMBIO_ESTADO', 'CONCILIAR'
            [tableName] VARCHAR(100) NOT NULL,
            [entityId] VARCHAR(50) NOT NULL,
            [entityTitle] NVARCHAR(255) NULL,
            [details] NVARCHAR(MAX) NULL,
            [ipAddress] VARCHAR(50) NULL,
            [timestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME()
        );

        CREATE NONCLUSTERED INDEX IX_audit_logs_timestamp ON [dbo].[audit_logs]([timestamp] DESC);
        CREATE NONCLUSTERED INDEX IX_audit_logs_tableName_entityId ON [dbo].[audit_logs]([tableName], [entityId]);

        PRINT '   [OK] Tabla [dbo].[audit_logs] creada con índices optimizados.';
    END
    ELSE
    BEGIN
        PRINT '   [INFO] La tabla [dbo].[audit_logs] ya existe.';
    END

    COMMIT TRANSACTION;
    PRINT '>> FASE 4 COMPLETADA CON ÉXITO: Sistema de auditoría listo.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '>> ERROR EN FASE 4: Se revirtieron los cambios.';
    THROW;
END CATCH;
