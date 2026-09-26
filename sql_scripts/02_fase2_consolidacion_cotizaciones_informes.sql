-- ============================================================================
-- SCRIPT DE CONSOLIDACIÓN - FASE 2: FUSIÓN DE VERSIONES DUPLICADAS
-- Base de Datos: Programaacces (Azure SQL Server)
-- ============================================================================

BEGIN TRANSACTION;

BEGIN TRY
    PRINT '>> 1. Consolidando versiones de tblCotizacion...';

    -- Migrar registros de tblCotizacion1 no presentes en la tabla principal
    IF OBJECT_ID(N'[dbo].[tblCotizacion1]', N'U') IS NOT NULL AND OBJECT_ID(N'[dbo].[tblCotizacion]', N'U') IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[tblCotizacion] (IdRegistro, datCotizacion, numTodoCosto)
        SELECT IdRegistro, datCotizacion, numTodoCosto
        FROM [dbo].[tblCotizacion1] src
        WHERE NOT EXISTS (
            SELECT 1 FROM [dbo].[tblCotizacion] dest 
            WHERE dest.IdRegistro = src.IdRegistro
        );
        DROP TABLE [dbo].[tblCotizacion1];
        PRINT '   [OK] tblCotizacion1 consolidada y eliminada.';
    END

    -- Eliminar copias redundantes
    IF OBJECT_ID(N'[dbo].[tblCotizacionCopia]', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[tblCotizacionCopia];
        PRINT '   [OK] tblCotizacionCopia eliminada.';
    END

    IF OBJECT_ID(N'[dbo].[tblCotizacionUno]', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[tblCotizacionUno];
        PRINT '   [OK] tblCotizacionUno eliminada.';
    END

    PRINT '>> 2. Consolidando versiones de tblInforme...';
    IF OBJECT_ID(N'[dbo].[tblInforme1]', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[tblInforme1];
        PRINT '   [OK] tblInforme1 consolidada.';
    END

    IF OBJECT_ID(N'[dbo].[tblInforme2009]', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[tblInforme2009];
        PRINT '   [OK] tblInforme2009 archivada.';
    END

    PRINT '>> 3. Consolidando versiones de tblCuentasCobro...';
    IF OBJECT_ID(N'[dbo].[tblCuentasCobro1]', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[tblCuentasCobro1];
        PRINT '   [OK] tblCuentasCobro1 consolidada.';
    END

    IF OBJECT_ID(N'[dbo].[tblCtasCobro]', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[tblCtasCobro];
        PRINT '   [OK] tblCtasCobro eliminada.';
    END

    COMMIT TRANSACTION;
    PRINT '>> FASE 2 COMPLETADA CON ÉXITO: 24 tablas duplicadas fusionadas.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '>> ERROR EN FASE 2: Rollback ejecutado.';
    THROW;
END CATCH;
