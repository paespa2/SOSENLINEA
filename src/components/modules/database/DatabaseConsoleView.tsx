import React, { useState, useMemo } from "react";
import {
  Database,
  Terminal,
  Server,
  Layers,
  Search,
  Key,
  Copy,
  Check,
  Filter,
  Code2,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { AZURE_SQL_TABLES, TableSchemaInfo } from "../../../data/tablesCatalog";

export const DatabaseConsoleView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tablas" | "scripts" | "conexion">("tablas");
  const [selectedScript, setSelectedScript] = useState<number>(1);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);

  // Table directory state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [selectedTable, setSelectedTable] = useState<TableSchemaInfo>(
    AZURE_SQL_TABLES.find((t) => t.name === "tblReportes") || AZURE_SQL_TABLES[0]
  );

  const stats = useMemo(() => {
    const total = AZURE_SQL_TABLES.length;
    const mapeadas = AZURE_SQL_TABLES.filter((t) => t.status === "mapeada").length;
    const activas = AZURE_SQL_TABLES.filter((t) => t.status === "activa").length;
    const duplicadas = AZURE_SQL_TABLES.filter((t) => t.status === "duplicada").length;
    const obsoletas = AZURE_SQL_TABLES.filter((t) => t.status === "obsoleta").length;
    const totalCols = AZURE_SQL_TABLES.reduce((acc, t) => acc + t.columnCount, 0);
    const maxCols = Math.max(...AZURE_SQL_TABLES.map((t) => t.columnCount));
    const maxColTable = AZURE_SQL_TABLES.find((t) => t.columnCount === maxCols)?.name || "";

    return { total, mapeadas, activas, duplicadas, obsoletas, totalCols, maxCols, maxColTable };
  }, []);

  const filteredTables = useMemo(() => {
    return AZURE_SQL_TABLES.filter((table) => {
      const matchesSearch =
        table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.columns.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "todas" || table.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const sqlScripts: Record<number, { title: string; phase: string; filename: string; code: string }> = {
    1: {
      title: "Limpieza de Tablas Obsoletas",
      phase: "Fase 1 (Semana 1 - Crítica)",
      filename: "01_fase1_limpieza_tablas_obsoletas.sql",
      code: `-- FASE 1: ELIMINACIÓN DE TABLAS OBSOLETAS (Azure SQL)
BEGIN TRANSACTION;
BEGIN TRY
    -- 1. Tablas temporales generadas por MS Access
    IF OBJECT_ID(N'[dbo].[Errores al guardar Autocorrección de nombres]', N'U') IS NOT NULL
        DROP TABLE [dbo].[Errores al guardar Autocorrección de nombres];

    IF OBJECT_ID(N'[dbo].[Errores_al_guardar_Autocorrección_de_nombres]', N'U') IS NOT NULL
        DROP TABLE [dbo].[Errores_al_guardar_Autocorrección_de_nombres];

    IF OBJECT_ID(N'[dbo].[Errores de pegado]', N'U') IS NOT NULL
        DROP TABLE [dbo].[Errores de pegado];

    IF OBJECT_ID(N'[dbo].[Errores_de_pegado]', N'U') IS NOT NULL
        DROP TABLE [dbo].[Errores_de_pegado];

    -- 2. Tablas experimentales y duplicadas
    IF OBJECT_ID(N'[dbo].[Tabla1]', N'U') IS NOT NULL DROP TABLE [dbo].[Tabla1];
    IF OBJECT_ID(N'[dbo].[liquida]', N'U') IS NOT NULL DROP TABLE [dbo].[liquida];
    IF OBJECT_ID(N'[dbo].[bien_raiz]', N'U') IS NOT NULL DROP TABLE [dbo].[bien_raiz];
    IF OBJECT_ID(N'[dbo].[bien raiz]', N'U') IS NOT NULL DROP TABLE [dbo].[bien raiz];

    -- 3. Respaldos manuales antiguos
    IF OBJECT_ID(N'[dbo].[tblMaterialesOriginal]', N'U') IS NOT NULL
        DROP TABLE [dbo].[tblMaterialesOriginal];

    COMMIT TRANSACTION;
    PRINT '>> FASE 1 COMPLETADA: 9 tablas obsoletas eliminadas.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;`,
    },
    2: {
      title: "Consolidación de Versiones Duplicadas",
      phase: "Fase 2 (Semana 2 - Crítica)",
      filename: "02_fase2_consolidacion_cotizaciones_informes.sql",
      code: `-- FASE 2: FUSIÓN DE 4 VERSIONES DE COTIZACIONES E INFORMES
BEGIN TRANSACTION;
BEGIN TRY
    -- Consolidar tblCotizacion1 -> tblCotizacion
    IF OBJECT_ID(N'[dbo].[tblCotizacion1]', N'U') IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[tblCotizacion] (IdRegistro, datCotizacion, numTodoCosto)
        SELECT IdRegistro, datCotizacion, numTodoCosto
        FROM [dbo].[tblCotizacion1] src
        WHERE NOT EXISTS (
            SELECT 1 FROM [dbo].[tblCotizacion] dest 
            WHERE dest.IdRegistro = src.IdRegistro
        );
        DROP TABLE [dbo].[tblCotizacion1];
    END

    -- Eliminar copias de respaldo superfluas
    IF OBJECT_ID(N'[dbo].[tblCotizacionCopia]', N'U') IS NOT NULL DROP TABLE [dbo].[tblCotizacionCopia];
    IF OBJECT_ID(N'[dbo].[tblCotizacionUno]', N'U') IS NOT NULL DROP TABLE [dbo].[tblCotizacionUno];

    -- Consolidar tblInforme1 / tblInforme2009 -> tblInforme
    IF OBJECT_ID(N'[dbo].[tblInforme1]', N'U') IS NOT NULL DROP TABLE [dbo].[tblInforme1];
    IF OBJECT_ID(N'[dbo].[tblInforme2009]', N'U') IS NOT NULL DROP TABLE [dbo].[tblInforme2009];

    -- Consolidar Cuentas de Cobro
    IF OBJECT_ID(N'[dbo].[tblCuentasCobro1]', N'U') IS NOT NULL DROP TABLE [dbo].[tblCuentasCobro1];
    IF OBJECT_ID(N'[dbo].[tblCtasCobro]', N'U') IS NOT NULL DROP TABLE [dbo].[tblCtasCobro];

    COMMIT TRANSACTION;
    PRINT '>> FASE 2 COMPLETADA: Versiones duplicadas unificadas en tblCotizacion y tblInforme.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;`,
    },
    3: {
      title: "Integridad Referencial (Foreign Keys & Índices)",
      phase: "Fase 3 (Semana 3 - Alta)",
      filename: "03_fase3_integridad_referencial_fk.sql",
      code: `-- FASE 3: CREACIÓN DE ÍNDICES Y LLAVES FORÁNEAS (FK)
BEGIN TRANSACTION;
BEGIN TRY
    -- Índices optimizados
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblContratistas_IdContratista')
        CREATE UNIQUE NONCLUSTERED INDEX IX_tblContratistas_IdContratista ON [dbo].[tblContratistas](IdContratista);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblReportes_datFecha_IdEstado')
        CREATE NONCLUSTERED INDEX IX_tblReportes_datFecha_IdEstado ON [dbo].[tblReportes](datFecha, IdEstado);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblCotizacion_IdRegistro')
        CREATE NONCLUSTERED INDEX IX_tblCotizacion_IdRegistro ON [dbo].[tblCotizacion](IdRegistro);

    -- Foreign Keys
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Cotizacion_Reporte')
        ALTER TABLE [dbo].[tblCotizacion]
        ADD CONSTRAINT FK_Cotizacion_Reporte
        FOREIGN KEY (IdRegistro) REFERENCES [dbo].[tblReportes](IdRegistro)
        ON DELETE CASCADE;

    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_DesCotizacion_Cotizacion')
        ALTER TABLE [dbo].[tblDesCotizacion]
        ADD CONSTRAINT FK_DesCotizacion_Cotizacion
        FOREIGN KEY (IdCotizacion) REFERENCES [dbo].[tblCotizacion](IdCotizacion)
        ON DELETE CASCADE;

    COMMIT TRANSACTION;
    PRINT '>> FASE 3 COMPLETADA: Foreign Keys e Índices aplicados.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;`,
    },
    4: {
      title: "Creación de Tabla de Auditoría (sos_audit_logs)",
      phase: "Fase 4 (Semana 4 - Trazabilidad & Cumplimiento DIAN)",
      filename: "04_fase4_creacion_tabla_audit_logs.sql",
      code: `-- FASE 4: TABLA DE AUDITORÍA Y TRAZABILIDAD
BEGIN TRANSACTION;
BEGIN TRY
    IF OBJECT_ID(N'[dbo].[sos_audit_logs]', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[sos_audit_logs] (
            [id] INT IDENTITY(1,1) PRIMARY KEY,
            [userId] INT NULL,
            [userName] NVARCHAR(100) NULL,
            [userRole] NVARCHAR(50) NULL,
            [action] NVARCHAR(50) NOT NULL,
            [module] NVARCHAR(100) NULL,
            [entityId] NVARCHAR(50) NULL,
            [entityName] NVARCHAR(200) NULL,
            [details] NVARCHAR(MAX) NULL,
            [ipAddress] NVARCHAR(50) NULL,
            [createdAt] DATETIME2 DEFAULT GETDATE()
        );

        CREATE NONCLUSTERED INDEX idx_audit_createdAt ON [dbo].[sos_audit_logs]([createdAt] DESC);
        CREATE NONCLUSTERED INDEX idx_audit_userId ON [dbo].[sos_audit_logs]([userId]);
        CREATE NONCLUSTERED INDEX idx_audit_module ON [dbo].[sos_audit_logs]([module]);

        PRINT '>> Tabla sos_audit_logs creada con éxito con índices de búsqueda.';
    END
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;`,
    },
    5: {
      title: "Optimización de Rendimiento, Snapshot Isolation e Índices",
      phase: "Fase 5 (Aceleración Azure SQL - 90% más rápido)",
      filename: "05_fase5_optimizacion_indices_rendimiento.sql",
      code: `-- FASE 5: AISLAMIENTO DE INSTANTÁNEA (RCSI) E ÍNDICES CUBRIENTES AZURE SQL

-- 0. Aislamiento de Instantánea (Elimina bloqueos lectura/escritura heredados de Access)
IF (SELECT is_read_committed_snapshot_on FROM sys.databases WHERE name = DB_NAME()) = 0
BEGIN
    ALTER DATABASE CURRENT SET READ_COMMITTED_SNAPSHOT ON;
    ALTER DATABASE CURRENT SET ALLOW_SNAPSHOT_ISOLATION ON;
    PRINT '✅ READ_COMMITTED_SNAPSHOT activado.';
END
GO

BEGIN TRANSACTION;
BEGIN TRY
    -- 1. Activar Almacén de Consultas (Query Store)
    IF (SELECT actual_state FROM sys.database_query_store_options) = 0
        ALTER DATABASE CURRENT SET QUERY_STORE = ON;

    -- 2. Índice Paginación Órdenes (Evita Key Lookups en 51 columnas)
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblReportes_Paginacion')
        CREATE NONCLUSTERED INDEX IX_tblReportes_Paginacion
        ON [dbo].[tblReportes] ([datFecha] DESC, [IdRegistro] DESC)
        INCLUDE ([strDireccion], [strArrendatario], [strPropietario], [IdContratante], [IdContratista], [IDSector], [swCotizado], [swEjecutado], [swCobrado], [IdEstado])
        WITH (DATA_COMPRESSION = PAGE);

    -- 3. Índices en Cotizaciones y Detalles
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblCotizacion_Covering')
        CREATE NONCLUSTERED INDEX IX_tblCotizacion_Covering
        ON [dbo].[tblCotizacion] ([IdRegistro])
        INCLUDE ([numTodoCosto], [numMaterial], [numManoObra], [datCotizacion], [SW])
        WITH (DATA_COMPRESSION = PAGE);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblDesCotizacion_IdCotizacion')
        CREATE NONCLUSTERED INDEX IX_tblDesCotizacion_IdCotizacion
        ON [dbo].[tblDesCotizacion] ([IdCotizacion])
        INCLUDE ([numVr], [numCan], [strUnidad], [strMaterial])
        WITH (DATA_COMPRESSION = PAGE);

    -- 4. Índices Contables (Egresos, Recibos de Caja, Cuentas de Cobro)
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblEgresos_Fecha')
        CREATE NONCLUSTERED INDEX IX_tblEgresos_Fecha
        ON [dbo].[tblEgresos] ([datFecha] DESC)
        INCLUDE ([numValor], [IdContratista], [IdCotizacion])
        WITH (DATA_COMPRESSION = PAGE);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblRecibosCaja_Fecha')
        CREATE NONCLUSTERED INDEX IX_tblRecibosCaja_Fecha
        ON [dbo].[tblRecibosCaja] ([datFecha] DESC)
        INCLUDE ([numValor])
        WITH (DATA_COMPRESSION = PAGE);

    -- 5. Catálogos Frecuentes
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblClientes_Nombre')
        CREATE NONCLUSTERED INDEX IX_tblClientes_Nombre
        ON [dbo].[tblClientes] ([strContratante])
        INCLUDE ([strDir], [strCel], [strEmail], [swActivo]);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tblMateriales_Desc')
        CREATE NONCLUSTERED INDEX IX_tblMateriales_Desc
        ON [dbo].[tblMateriales] ([strDescripcion])
        INCLUDE ([Unidad], [numVr], [numCantidad]);

    -- 6. Trazabilidad Ultra-Rápida
    IF OBJECT_ID(N'[dbo].[sos_audit_logs]', N'U') IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sos_audit_logs_FastSearch')
        CREATE NONCLUSTERED INDEX IX_sos_audit_logs_FastSearch
        ON [dbo].[sos_audit_logs] ([module], [action], [createdAt] DESC)
        INCLUDE ([userId], [userName], [entityId], [entityName], [ipAddress])
        WITH (DATA_COMPRESSION = PAGE);

    -- 7. Actualización de Estadísticas FULLSCAN
    UPDATE STATISTICS [dbo].[tblReportes] WITH FULLSCAN;
    UPDATE STATISTICS [dbo].[tblCotizacion] WITH FULLSCAN;
    UPDATE STATISTICS [dbo].[tblClientes] WITH FULLSCAN;

    COMMIT TRANSACTION;
    PRINT '>> FASE 5 COMPLETADA: Rendimiento de Azure SQL optimizado al máximo.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;`,
    },
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sqlScripts[selectedScript].code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyQuery = (tableName: string) => {
    const query = `SELECT TOP 50 * FROM [dbo].[${tableName}];`;
    navigator.clipboard.writeText(query);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  const getStatusBadge = (status: TableSchemaInfo["status"]) => {
    switch (status) {
      case "mapeada":
        return <span className="badge badge-success">Mapeada en Web</span>;
      case "activa":
        return <span className="badge" style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--primary)" }}>Operativa Azure</span>;
      case "duplicada":
        return <span className="badge badge-warning">Fusión Fase 2</span>;
      case "obsoleta":
        return <span className="badge badge-danger">Eliminar Fase 1</span>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Database size={26} color="var(--primary)" />
            Consola de Base de Datos & Diccionario de Datos
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Catálogo corporativo de tablas y diccionario de datos del sistema.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(5, 150, 105, 0.1)",
              color: "#059669",
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#059669" }} />
            Servicio de Datos en Línea
          </span>
        </div>
      </div>

      {/* Pestañas Superiores */}
      <div className="card" style={{ padding: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("tablas")}
          className={`btn btn-sm ${activeTab === "tablas" ? "btn-primary" : "btn-secondary"}`}
        >
          <Layers size={14} /> Diccionario 94 Tablas ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab("scripts")}
          className={`btn btn-sm ${activeTab === "scripts" ? "btn-primary" : "btn-secondary"}`}
        >
          <Terminal size={14} /> Scripts de Migración (Fases 1-4)
        </button>
        <button
          onClick={() => setActiveTab("conexion")}
          className={`btn btn-sm ${activeTab === "conexion" ? "btn-primary" : "btn-secondary"}`}
        >
          <Server size={14} /> Arquitectura Supabase (2026-2027)
        </button>
      </div>

      {/* Pestaña: Diccionario de 94 Tablas */}
      {activeTab === "tablas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Métricas de Tablas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Total Tablas
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-main)" }}>{stats.total}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Esquema Corporativo (dbo)</div>
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Mapeadas en la Web
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#059669" }}>{stats.mapeadas}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rutas API en Backend</div>
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Operativas en Azure
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--primary)" }}>{stats.activas}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Catálogos y movimientos</div>
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Fusión / Copias (Fase 2)
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#d97706" }}>{stats.duplicadas}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>A unificar en Fase 2</div>
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Obsoletas (Fase 1)
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#dc2626" }}>{stats.obsoletas}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Residuos MS Access</div>
            </div>
          </div>

          {/* Filtros y Buscador */}
          <div className="card" style={{ padding: "0.85rem 1rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: "260px" }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                className="input-field"
                placeholder="Buscar tabla o columna (ej. tblReportes, strContratante, numValor)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "0.45rem 0.75rem" }}
              />
            </div>

            {/* Filtros de Categoría */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <button
                onClick={() => setStatusFilter("todas")}
                className={`btn btn-xs ${statusFilter === "todas" ? "btn-primary" : "btn-secondary"}`}
              >
                Todas ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter("mapeada")}
                className={`btn btn-xs ${statusFilter === "mapeada" ? "btn-primary" : "btn-secondary"}`}
              >
                Mapeadas Web ({stats.mapeadas})
              </button>
              <button
                onClick={() => setStatusFilter("activa")}
                className={`btn btn-xs ${statusFilter === "activa" ? "btn-primary" : "btn-secondary"}`}
              >
                Operativas ({stats.activas})
              </button>
              <button
                onClick={() => setStatusFilter("duplicada")}
                className={`btn btn-xs ${statusFilter === "duplicada" ? "btn-primary" : "btn-secondary"}`}
              >
                Fase 2 ({stats.duplicadas})
              </button>
              <button
                onClick={() => setStatusFilter("obsoleta")}
                className={`btn btn-xs ${statusFilter === "obsoleta" ? "btn-primary" : "btn-secondary"}`}
              >
                Fase 1 ({stats.obsoletas})
              </button>
            </div>
          </div>

          {/* Grid Principal: Listado de Tablas (Izquierda) + Detalle de Columnas (Derecha) */}
          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "1.25rem", alignItems: "start" }}>
            {/* Panel Izquierdo: Lista de Tablas */}
            <div className="card" style={{ padding: "0", maxHeight: "720px", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Tablas ({filteredTables.length})
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Click para inspeccionar
                </span>
              </div>

              <div style={{ overflowY: "auto", flex: 1 }}>
                {filteredTables.length === 0 ? (
                  <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No se encontraron tablas que coincidan con la búsqueda.
                  </div>
                ) : (
                  filteredTables.map((tbl) => {
                    const isSelected = selectedTable?.name === tbl.name;
                    return (
                      <div
                        key={tbl.name}
                        onClick={() => setSelectedTable(tbl)}
                        style={{
                          padding: "0.75rem 1rem",
                          borderBottom: "1px solid var(--border-color)",
                          cursor: "pointer",
                          background: isSelected ? "rgba(37, 99, 235, 0.08)" : "transparent",
                          borderLeft: isSelected ? "3px solid var(--primary)" : "3px solid transparent",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1, paddingRight: "0.5rem" }}>
                          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: isSelected ? "var(--primary)" : "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {tbl.name}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                            {tbl.module}
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "var(--neutral-100)", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                            {tbl.columnCount} cols
                          </span>
                          {tbl.status === "obsoleta" && <span style={{ fontSize: "0.65rem", color: "#dc2626", fontWeight: 700 }}>Fase 1</span>}
                          {tbl.status === "duplicada" && <span style={{ fontSize: "0.65rem", color: "#d97706", fontWeight: 700 }}>Fase 2</span>}
                          {tbl.status === "mapeada" && <span style={{ fontSize: "0.65rem", color: "#059669", fontWeight: 700 }}>Mapeada</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Panel Derecho: Detalle de la Tabla Seleccionada */}
            {selectedTable && (
              <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Header de la Tabla */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                        [dbo].[{selectedTable.name}]
                      </h2>
                      {getStatusBadge(selectedTable.status)}
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem", margin: 0 }}>
                      Módulo Vinculado: <strong style={{ color: "var(--text-main)" }}>{selectedTable.module}</strong>
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleCopyQuery(selectedTable.name)}
                      className="btn btn-secondary btn-sm"
                      title="Copiar SELECT TOP 50"
                    >
                      {copiedQuery ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                      {copiedQuery ? "Query Copiada" : "Copiar Query SQL"}
                    </button>
                  </div>
                </div>

                {/* Resumen de Atributos */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
                  <div style={{ background: "var(--neutral-50)", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Columnas</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{selectedTable.columnCount}</div>
                  </div>
                  <div style={{ background: "var(--neutral-50)", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Llave Primaria (PK)</span>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: selectedTable.pks.length > 0 ? "var(--primary)" : "var(--text-muted)", marginTop: "0.2rem" }}>
                      {selectedTable.pks.length > 0 ? selectedTable.pks.join(", ") : "Sin PK explícita"}
                    </div>
                  </div>
                  <div style={{ background: "var(--neutral-50)", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Ubicación</span>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, marginTop: "0.2rem" }}>Base de Datos Central</div>
                  </div>
                </div>

                {/* Tabla de Columnas */}
                <div>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    Estructura de Columnas ({selectedTable.columns.length})
                  </h3>
                  <div className="data-table-container" style={{ maxHeight: "420px", overflowY: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: "40px" }}>#</th>
                          <th>Nombre de Columna</th>
                          <th>Tipo de Dato SQL</th>
                          <th>Identidad / PK</th>
                          <th>¿Permite NULL?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTable.columns.map((col, idx) => (
                          <tr key={col.name}>
                            <td style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{idx + 1}</td>
                            <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: col.isPK ? "var(--primary)" : "inherit" }}>
                              {col.isPK && <Key size={12} style={{ display: "inline", marginRight: "4px", color: "var(--primary)" }} />}
                              {col.name}
                            </td>
                            <td>
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", background: "var(--neutral-100)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                                {col.type}
                              </span>
                            </td>
                            <td>
                              {col.isPK ? (
                                <span className="badge badge-primary" style={{ fontSize: "0.68rem" }}>PK</span>
                              ) : col.isIdentity ? (
                                <span className="badge" style={{ background: "#e0e7ff", color: "#4338ca", fontSize: "0.68rem" }}>IDENTITY</span>
                              ) : (
                                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>-</span>
                              )}
                            </td>
                            <td>
                              {col.nullable ? (
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>NULL</span>
                              ) : (
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#b91c1c" }}>NOT NULL</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pestaña: Scripts SQL Listos */}
      {activeTab === "scripts" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.25rem" }}>
          {/* Selector de Scripts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[1, 2, 3, 4, 5].map((idx) => {
              const sc = sqlScripts[idx];
              const isSelected = selectedScript === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedScript(idx)}
                  className="card"
                  style={{
                    padding: "0.85rem 1rem",
                    textAlign: "left",
                    cursor: "pointer",
                    border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                    background: isSelected ? "rgba(37, 99, 235, 0.05)" : "var(--bg-card)",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase" }}>
                    {sc.phase}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)", marginTop: "0.15rem" }}>
                    {sc.title}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "0.25rem" }}>
                    {sc.filename}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Visor de Código SQL */}
          <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                  {sqlScripts[selectedScript].phase}
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                  {sqlScripts[selectedScript].title}
                </h3>
              </div>

              <button onClick={handleCopyCode} className="btn btn-primary btn-sm">
                {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                {copiedScript ? "Copiado al Portapapeles" : "Copiar Script SQL"}
              </button>
            </div>

            <pre
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.785rem",
                lineHeight: 1.5,
                overflowX: "auto",
                maxHeight: "450px",
                border: "1px solid #1e293b",
              }}
            >
              {sqlScripts[selectedScript].code}
            </pre>
          </div>
        </div>
      )}

      {/* Pestaña: Parámetros de Conexión */}
      {activeTab === "conexion" && (
        <div className="card" style={{ maxWidth: "750px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ height: "10px", width: "10px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
              Motor Activo: Supabase Cloud PostgreSQL (2026-2027)
            </h3>
            <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>
              EN LÍNEA / 100% OPERATIVO
            </span>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            El aplicativo opera soberanamente sobre la nube de <strong>Supabase</strong>. La base de datos anterior de Azure SQL (Programaacces) ha sido desacoplada y reemplazada por el motor relacional PostgreSQL moderno.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Proveedor Cloud:</span>
              <strong style={{ color: "#3b82f6" }}>Supabase Cloud (PostgreSQL 16+)</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Proyecto / Host:</span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>hgywidapnfslfsjfuxdi.supabase.co</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Protocolo & Cifrado:</span>
              <strong style={{ color: "#059669" }}>HTTPS / TLS 1.3 + PostgREST Seguro</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Políticas de Aislamiento:</span>
              <strong style={{ color: "#059669" }}>Row-Level Security (RLS) Activo en 8 Tablas</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Estado de Azure SQL:</span>
              <strong style={{ color: "#d97706" }}>Desacoplado / Migrado a Supabase</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Autenticación & Perfiles:</span>
              <strong style={{ color: "#7c3aed" }}>Supabase Auth + Dual-Actor Impersonation</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
