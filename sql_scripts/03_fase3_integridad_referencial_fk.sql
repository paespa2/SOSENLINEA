-- ============================================================================
-- SCRIPT DE INTEGRIDAD REFERENCIAL - FASE 3: LLAVES FORÁNEAS E ÍNDICES
-- Base de Datos: Programaacces (Azure SQL Server)
-- ============================================================================

BEGIN TRANSACTION;

BEGIN TRY
    PRINT '>> 1. Creando Claves Primarias e Índices si no existen...';

    -- Índices para mejorar la búsqueda por NIT
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblContratistas_IdContratista')
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX IX_tblContratistas_IdContratista 
        ON [dbo].[tblContratistas](IdContratista);
        PRINT '   [OK] Índice IX_tblContratistas_IdContratista creado.';
    END

    -- Índice por fecha y estado en tblReportes
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblReportes_datFecha_IdEstado')
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblReportes_datFecha_IdEstado 
        ON [dbo].[tblReportes](datFecha, IdEstado);
        PRINT '   [OK] Índice IX_tblReportes_datFecha_IdEstado creado.';
    END

    -- Índice en tblCotizacion por IdRegistro
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblCotizacion_IdRegistro')
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblCotizacion_IdRegistro 
        ON [dbo].[tblCotizacion](IdRegistro);
        PRINT '   [OK] Índice IX_tblCotizacion_IdRegistro creado.';
    END

    PRINT '>> 2. Aplicando Claves Foráneas (Foreign Keys)...';

    -- FK: tblCotizacion -> tblReportes
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Cotizacion_Reporte')
    BEGIN
        ALTER TABLE [dbo].[tblCotizacion]
        ADD CONSTRAINT FK_Cotizacion_Reporte
        FOREIGN KEY (IdRegistro) REFERENCES [dbo].[tblReportes](IdRegistro)
        ON DELETE CASCADE;
        PRINT '   [OK] FK_Cotizacion_Reporte creada.';
    END

    -- FK: tblDesCotizacion -> tblCotizacion
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_DesCotizacion_Cotizacion')
    BEGIN
        ALTER TABLE [dbo].[tblDesCotizacion]
        ADD CONSTRAINT FK_DesCotizacion_Cotizacion
        FOREIGN KEY (IdCotizacion) REFERENCES [dbo].[tblCotizacion](IdCotizacion)
        ON DELETE CASCADE;
        PRINT '   [OK] FK_DesCotizacion_Cotizacion creada.';
    END

    COMMIT TRANSACTION;
    PRINT '>> FASE 3 COMPLETADA CON ÉXITO: Integridad referencial asegurada.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '>> ERROR EN FASE 3: Falló la creación de Foreign Keys o Índices.';
    THROW;
END CATCH;
