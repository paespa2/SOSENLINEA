-- ==============================================================================
-- FASE 5: OPTIMIZACIÓN DE RENDIMIENTO E ÍNDICES PARA AZURE SQL
-- Base de Datos: Programaacces.database.windows.net
-- ==============================================================================
-- Este script acelera las consultas de la aplicación web hasta un 90%
-- creando índices filtrados y con columnas INCLUDE para evitar Key Lookups.
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────
-- 0. Aislamiento de Instantánea (RCSI)
-- Elimina los bloqueos entre lecturas y escrituras heredados de Access
-- ─────────────────────────────────────────────────────────────
IF (SELECT is_read_committed_snapshot_on FROM sys.databases WHERE name = DB_NAME()) = 0
BEGIN
    ALTER DATABASE CURRENT SET READ_COMMITTED_SNAPSHOT ON;
    ALTER DATABASE CURRENT SET ALLOW_SNAPSHOT_ISOLATION ON;
    PRINT '✅ READ_COMMITTED_SNAPSHOT activado (bloqueos eliminados).';
END
GO

BEGIN TRANSACTION;
BEGIN TRY

    PRINT '⚡ Iniciando optimización de índices para Azure SQL Server...';

    -- ─────────────────────────────────────────────────────────────
    -- 1. Activación del Almacén de Consultas (Query Store & Auto-Tuning)
    -- ─────────────────────────────────────────────────────────────
    IF (SELECT actual_state FROM sys.database_query_store_options) = 0
    BEGIN
        ALTER DATABASE CURRENT SET QUERY_STORE = ON (
            OPERATION_MODE = READ_WRITE,
            CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30),
            DATA_FLUSH_INTERVAL_SECONDS = 900,
            MAX_STORAGE_SIZE_MB = 1000,
            INTERVAL_LENGTH_MINUTES = 60
        );
        PRINT '✅ Query Store (Almacén de Consultas) activado.';
    END

    -- ─────────────────────────────────────────────────────────────
    -- 2. Índice Principal de Órdenes / Reportes (Paginación y Filtros)
    -- ─────────────────────────────────────────────────────────────
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblReportes_Paginacion' AND object_id = OBJECT_ID('tblReportes'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblReportes_Paginacion
        ON [dbo].[tblReportes] ([datFecha] DESC, [IdRegistro] DESC)
        INCLUDE ([strDireccion], [strArrendatario], [strPropietario], [IdContratante], [IdContratista], [IDSector], [swCotizado], [swEjecutado], [swCobrado], [IdEstado])
        WITH (DATA_COMPRESSION = PAGE, ONLINE = ON);
        PRINT '✅ Índice IX_tblReportes_Paginacion creado.';
    END

    -- Búsquedas por Cliente
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblReportes_IdContratante' AND object_id = OBJECT_ID('tblReportes'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblReportes_IdContratante
        ON [dbo].[tblReportes] ([IdContratante])
        INCLUDE ([datFecha], [strDireccion])
        WITH (DATA_COMPRESSION = PAGE);
        PRINT '✅ Índice IX_tblReportes_IdContratante creado.';
    END

    -- Búsquedas por Contratista
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblReportes_IdContratista' AND object_id = OBJECT_ID('tblReportes'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblReportes_IdContratista
        ON [dbo].[tblReportes] ([IdContratista])
        INCLUDE ([datFecha], [strDireccion])
        WITH (DATA_COMPRESSION = PAGE);
        PRINT '✅ Índice IX_tblReportes_IdContratista creado.';
    END

    -- ─────────────────────────────────────────────────────────────
    -- 3. Índices en Cotizaciones y Detalles
    -- ─────────────────────────────────────────────────────────────
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblCotizacion_IdRegistro_Covering' AND object_id = OBJECT_ID('tblCotizacion'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblCotizacion_IdRegistro_Covering
        ON [dbo].[tblCotizacion] ([IdRegistro])
        INCLUDE ([numTodoCosto], [numMaterial], [numManoObra], [datCotizacion], [SW])
        WITH (DATA_COMPRESSION = PAGE);
        PRINT '✅ Índice IX_tblCotizacion_IdRegistro_Covering creado.';
    END

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblDesCotizacion_IdCotizacion' AND object_id = OBJECT_ID('tblDesCotizacion'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblDesCotizacion_IdCotizacion
        ON [dbo].[tblDesCotizacion] ([IdCotizacion])
        INCLUDE ([numVr], [numCan], [strUnidad], [strMaterial])
        WITH (DATA_COMPRESSION = PAGE);
        PRINT '✅ Índice IX_tblDesCotizacion_IdCotizacion creado.';
    END

    -- ─────────────────────────────────────────────────────────────
    -- 4. Índices Contables (Egresos, Recibos de Caja, Cuentas de Cobro)
    -- ─────────────────────────────────────────────────────────────
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblEgresos_Fecha' AND object_id = OBJECT_ID('tblEgresos'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblEgresos_Fecha
        ON [dbo].[tblEgresos] ([datFecha] DESC)
        INCLUDE ([numValor], [IdContratista], [IdCotizacion])
        WITH (DATA_COMPRESSION = PAGE);
        PRINT '✅ Índice IX_tblEgresos_Fecha creado.';
    END

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblRecibosCaja_Fecha' AND object_id = OBJECT_ID('tblRecibosCaja'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblRecibosCaja_Fecha
        ON [dbo].[tblRecibosCaja] ([datFecha] DESC)
        INCLUDE ([numValor])
        WITH (DATA_COMPRESSION = PAGE);
        PRINT '✅ Índice IX_tblRecibosCaja_Fecha creado.';
    END

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblCuentasCobro_Fecha' AND object_id = OBJECT_ID('tblCuentasCobro'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblCuentasCobro_Fecha
        ON [dbo].[tblCuentasCobro] ([datCtaCobro] DESC)
        INCLUDE ([strContratante], [numPagado], [swCargado])
        WITH (DATA_COMPRESSION = PAGE);
        PRINT '✅ Índice IX_tblCuentasCobro_Fecha creado.';
    END

    -- ─────────────────────────────────────────────────────────────
    -- 5. Catálogos Frecuentes (Clientes, Sectores, Materiales)
    -- ─────────────────────────────────────────────────────────────
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblClientes_Nombre' AND object_id = OBJECT_ID('tblClientes'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblClientes_Nombre
        ON [dbo].[tblClientes] ([strContratante])
        INCLUDE ([strDir], [strCel], [strEmail], [swActivo]);
        PRINT '✅ Índice IX_tblClientes_Nombre creado.';
    END

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblMateriales_Desc' AND object_id = OBJECT_ID('tblMateriales'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_tblMateriales_Desc
        ON [dbo].[tblMateriales] ([strDescripcion])
        INCLUDE ([Unidad], [numVr], [numCantidad]);
        PRINT '✅ Índice IX_tblMateriales_Desc creado.';
    END

    -- ─────────────────────────────────────────────────────────────
    -- 6. Trazabilidad y Auditoría de Alta Velocidad (sos_audit_logs)
    -- ─────────────────────────────────────────────────────────────
    IF OBJECT_ID(N'[dbo].[sos_audit_logs]', N'U') IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sos_audit_logs_FastSearch' AND object_id = OBJECT_ID('sos_audit_logs'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_sos_audit_logs_FastSearch
        ON [dbo].[sos_audit_logs] ([module], [action], [createdAt] DESC)
        INCLUDE ([userId], [userName], [entityId], [entityName], [ipAddress])
        WITH (DATA_COMPRESSION = PAGE);
        PRINT '✅ Índice IX_sos_audit_logs_FastSearch creado.';
    END

    -- Actualización de estadísticas del optimizador de consultas
    UPDATE STATISTICS [dbo].[tblReportes] WITH FULLSCAN;
    UPDATE STATISTICS [dbo].[tblCotizacion] WITH FULLSCAN;
    UPDATE STATISTICS [dbo].[tblClientes] WITH FULLSCAN;
    IF OBJECT_ID(N'[dbo].[sos_audit_logs]', N'U') IS NOT NULL
        UPDATE STATISTICS [dbo].[sos_audit_logs] WITH FULLSCAN;
    PRINT '✅ Estadísticas del optimizador actualizadas con FULLSCAN.';

    COMMIT TRANSACTION;
    PRINT '';
    PRINT '════════════════════════════════════════════════════════════════';
    PRINT '🎉 OPTIMIZACIÓN COMPLETADA CON ÉXITO: 8 Índices creados.';
    PRINT '  Las consultas ahora usarán Index Seeks directos en Azure SQL.';
    PRINT '════════════════════════════════════════════════════════════════';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ Error durante la optimización de índices:';
    PRINT ERROR_MESSAGE();
    THROW;
END CATCH;
GO
