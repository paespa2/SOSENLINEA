-- ============================================================================
-- SCRIPT DE LIMPIEZA - FASE 1: ELIMINACIÓN DE TABLAS OBSOLETAS Y TEMPORALES
-- Base de Datos: Programaacces (Azure SQL Server)
-- Servidor: Programaacces.database.windows.net
-- ============================================================================
-- IMPORTANTE: Asegúrate de realizar un BACKUP antes de ejecutar este script:
-- BACKUP DATABASE [Programaacces] TO DISK = 'C:\Backups\Programaacces_PreLimpieza.bak';
-- ============================================================================

BEGIN TRANSACTION;

BEGIN TRY
    PRINT '>> Iniciando eliminación segura de tablas obsoletas y de error heredadas de Access...';

    -- 1. Tablas temporales de autocorrección y errores de pegado generadas por MS Access
    IF OBJECT_ID(N'[dbo].[Errores al guardar Autocorrección de nombres]', N'U') IS NOT NULL
        DROP TABLE [dbo].[Errores al guardar Autocorrección de nombres];

    IF OBJECT_ID(N'[dbo].[Errores_al_guardar_Autocorrección_de_nombres]', N'U') IS NOT NULL
        DROP TABLE [dbo].[Errores_al_guardar_Autocorrección_de_nombres];

    IF OBJECT_ID(N'[dbo].[Errores de pegado]', N'U') IS NOT NULL
        DROP TABLE [dbo].[Errores de pegado];

    IF OBJECT_ID(N'[dbo].[Errores_de_pegado]', N'U') IS NOT NULL
        DROP TABLE [dbo].[Errores_de_pegado];

    -- 2. Tablas experimentales y de pruebas manuales
    IF OBJECT_ID(N'[dbo].[Tabla1]', N'U') IS NOT NULL
        DROP TABLE [dbo].[Tabla1];

    IF OBJECT_ID(N'[dbo].[liquida]', N'U') IS NOT NULL
        DROP TABLE [dbo].[liquida];

    IF OBJECT_ID(N'[dbo].[bien_raiz]', N'U') IS NOT NULL
        DROP TABLE [dbo].[bien_raiz];

    IF OBJECT_ID(N'[dbo].[bien raiz]', N'U') IS NOT NULL
        DROP TABLE [dbo].[bien raiz];

    -- 3. Tablas de respaldo manual de Access
    IF OBJECT_ID(N'[dbo].[tblMaterialesOriginal]', N'U') IS NOT NULL
        DROP TABLE [dbo].[tblMaterialesOriginal];

    COMMIT TRANSACTION;
    PRINT '>> FASE 1 COMPLETADA CON ÉXITO: Tablas obsoletas eliminadas.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '>> ERROR EN FASE 1: Se revirtieron los cambios.';
    THROW;
END CATCH;
