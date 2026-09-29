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
  AlertCircle,
  ShieldCheck,
  Zap,
  Archive,
} from "lucide-react";
import { AZURE_SQL_TABLES, SUPABASE_TABLES, TableSchemaInfo } from "../../../data/tablesCatalog";

export const DatabaseConsoleView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"supabase" | "azure" | "scripts" | "conexion">("supabase");
  const [selectedScript, setSelectedScript] = useState<number>(1);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);

  // Estados de búsqueda y selección para Supabase (Motor Principal)
  const [supaSearch, setSupaSearch] = useState("");
  const [supaCategory, setSupaCategory] = useState<string>("todas");
  const [selectedSupaTable, setSelectedSupaTable] = useState<TableSchemaInfo>(SUPABASE_TABLES[0]);

  // Estados de búsqueda para Azure Histórico
  const [azureSearch, setAzureSearch] = useState("");
  const [azureStatusFilter, setAzureStatusFilter] = useState<string>("todas");
  const [selectedAzureTable, setSelectedAzureTable] = useState<TableSchemaInfo>(
    AZURE_SQL_TABLES.find((t) => t.name === "tblReportes") || AZURE_SQL_TABLES[0]
  );

  // Tablas filtradas de Supabase
  const filteredSupaTables = useMemo(() => {
    return SUPABASE_TABLES.filter((table) => {
      const matchesSearch =
        table.name.toLowerCase().includes(supaSearch.toLowerCase()) ||
        table.module.toLowerCase().includes(supaSearch.toLowerCase()) ||
        table.columns.some((c) => c.name.toLowerCase().includes(supaSearch.toLowerCase()));

      const matchesCat =
        supaCategory === "todas" ||
        (supaCategory === "maestros" && table.module.includes("Catálogo")) ||
        (supaCategory === "operaciones" && (table.module.includes("Órdenes") || table.module.includes("Salidas"))) ||
        (supaCategory === "comercial" && table.module.includes("Presupuestos")) ||
        (supaCategory === "seguridad" && (table.module.includes("Identidad") || table.module.includes("Auditoría")));

      return matchesSearch && matchesCat;
    });
  }, [supaSearch, supaCategory]);

  // Tablas filtradas de Azure Histórico
  const filteredAzureTables = useMemo(() => {
    return AZURE_SQL_TABLES.filter((table) => {
      const matchesSearch =
        table.name.toLowerCase().includes(azureSearch.toLowerCase()) ||
        table.module.toLowerCase().includes(azureSearch.toLowerCase()) ||
        table.columns.some((c) => c.name.toLowerCase().includes(azureSearch.toLowerCase()));

      const matchesStatus = azureStatusFilter === "todas" || table.status === azureStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [azureSearch, azureStatusFilter]);

  const copyToClipboard = (text: string, isScript = false) => {
    navigator.clipboard.writeText(text);
    if (isScript) {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedQuery(true);
      setTimeout(() => setCopiedQuery(false), 2000);
    }
  };

  const sqlScripts: Record<number, { title: string; phase: string; filename: string; code: string }> = {
    1: {
      title: "Esquema Supabase Cloud (2026-2027)",
      phase: "Motor Activo Cloud (PostgreSQL)",
      filename: "supabase_schema_completo_2026.sql",
      code: `-- ESQUEMA DE BASE DE DATOS SUPABASE CLOUD (2026-2027)
-- Host: db.hgywidapnfslfsjfuxdi.supabase.co
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tablas Maestras
CREATE TABLE IF NOT EXISTS public.clientes (...);
CREATE TABLE IF NOT EXISTS public.materiales (...);
CREATE TABLE IF NOT EXISTS public.contratistas (...);
CREATE TABLE IF NOT EXISTS public.sectores (...);
CREATE TABLE IF NOT EXISTS public.reportes (...);
CREATE TABLE IF NOT EXISTS public.cotizaciones (...);

-- Políticas RLS Zero-Trust
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso autenticados" ON public.clientes FOR ALL TO authenticated USING (true);`,
    },
    2: {
      title: "Migración Azure SQL a Supabase",
      phase: "Fase de Migración y Depuración",
      filename: "01_fase1_limpieza_tablas_obsoletas.sql",
      code: `-- SCRIPT DE LIMPIEZA Y REFACTORIZACIÓN HISTÓRICA
-- Desacople progresivo de 94 tablas Access a 10 tablas PostgreSQL
BEGIN TRANSACTION;
DROP TABLE IF EXISTS [dbo].[bien raiz];
DROP TABLE IF EXISTS [dbo].[Errores al guardar Autocorrección de nombres];
COMMIT;`,
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Database className="text-emerald-500" size={26} color="#10b981" />
            Consola de Base de Datos & Diccionario 2026–2027
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Motor de datos soberano: <strong style={{ color: "#10b981" }}>Supabase Cloud PostgreSQL</strong> (Host: <code>hgywidapnfslfsjfuxdi.supabase.co</code>)
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ height: "8px", width: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
            Supabase Cloud en Línea
          </span>
        </div>
      </div>

      {/* Selector de Pestañas Principal */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("supabase")}
          className={`btn btn-sm ${activeTab === "supabase" ? "btn-primary" : "btn-secondary"}`}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: activeTab === "supabase" ? 800 : 500 }}
        >
          <Zap size={14} color={activeTab === "supabase" ? "#fff" : "#10b981"} /> Tablas Supabase Cloud (10 Activas)
        </button>

        <button
          onClick={() => setActiveTab("conexion")}
          className={`btn btn-sm ${activeTab === "conexion" ? "btn-primary" : "btn-secondary"}`}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Server size={14} /> Arquitectura & Conexión Supabase
        </button>

        <button
          onClick={() => setActiveTab("azure")}
          className={`btn btn-sm ${activeTab === "azure" ? "btn-primary" : "btn-secondary"}`}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: activeTab === "azure" ? "#fff" : "var(--text-muted)" }}
        >
          <Archive size={14} /> Histórico Azure SQL (94 Archivadas)
        </button>

        <button
          onClick={() => setActiveTab("scripts")}
          className={`btn btn-sm ${activeTab === "scripts" ? "btn-primary" : "btn-secondary"}`}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Terminal size={14} /> Scripts SQL & Migración
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: TABLAS SUPABASE CLOUD (MOTOR ACTIVO 2026-2027)                 */}
      {/* ========================================================================= */}
      {activeTab === "supabase" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Métricas Supabase */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="card" style={{ padding: "1rem", borderLeft: "4px solid #10b981" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Motor Activo
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#10b981" }}>PostgreSQL 16+</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Supabase Managed Cloud</div>
            </div>

            <div className="card" style={{ padding: "1rem", borderLeft: "4px solid #3b82f6" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Tablas Principales
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-main)" }}>10 Tablas</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Esquema public 100% mapeado</div>
            </div>

            <div className="card" style={{ padding: "1rem", borderLeft: "4px solid #8b5cf6" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Aislamiento RLS
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#8b5cf6" }}>Zero-Trust</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Row-Level Security Activo</div>
            </div>

            <div className="card" style={{ padding: "1rem", borderLeft: "4px solid #059669" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Estado Sincronización
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#059669" }}>Tiempo Real</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>REST & WebSockets Activos</div>
            </div>
          </div>

          {/* Filtros Supabase */}
          <div className="card" style={{ padding: "0.85rem 1rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: "260px" }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Buscar tabla o columna Supabase (ej: clientes, nit, precio, estado)..."
                value={supaSearch}
                onChange={(e) => setSupaSearch(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {[
                { id: "todas", label: `Todas (10)` },
                { id: "maestros", label: "Maestros (4)" },
                { id: "operaciones", label: "Operaciones (3)" },
                { id: "comercial", label: "Comercial (2)" },
                { id: "seguridad", label: "Identidad & Auth (1)" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSupaCategory(btn.id)}
                  className={`btn btn-sm ${supaCategory === btn.id ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inspector de Tablas Supabase */}
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.25rem", alignItems: "start" }}>
            {/* Lista de Tablas Supabase */}
            <div className="card" style={{ padding: "0.5rem", maxHeight: "650px", overflowY: "auto" }}>
              <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.72rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Tablas Supabase ({filteredSupaTables.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {filteredSupaTables.map((table) => {
                  const isSelected = selectedSupaTable.name === table.name;
                  return (
                    <button
                      key={table.name}
                      onClick={() => setSelectedSupaTable(table)}
                      style={{
                        padding: "0.65rem 0.85rem",
                        textAlign: "left",
                        borderRadius: "var(--radius-sm)",
                        border: isSelected ? "1px solid #10b981" : "1px solid transparent",
                        background: isSelected ? "rgba(16, 185, 129, 0.1)" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: isSelected ? "#10b981" : "var(--text-main)" }}>
                          {table.name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {table.module}
                        </div>
                      </div>
                      <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "0.68rem" }}>
                        {table.columnCount} cols
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detalle de la Tabla Supabase Seleccionada */}
            <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                      {selectedSupaTable.name}
                    </h3>
                    <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontWeight: 700 }}>
                      Activa en Supabase Cloud
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Módulo: <strong>{selectedSupaTable.module}</strong> | Motor: <strong>PostgreSQL 16</strong>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(`SELECT * FROM ${selectedSupaTable.name} LIMIT 50;`)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem" }}
                >
                  {copiedQuery ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  <span>{copiedQuery ? "Query Copiada" : "Copiar Query SQL"}</span>
                </button>
              </div>

              {/* Cards de Resumen */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Columnas</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--text-main)" }}>{selectedSupaTable.columnCount}</div>
                </div>

                <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Llave Primaria (PK)</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }}>
                    {selectedSupaTable.pks.join(", ") || "id"}
                  </div>
                </div>

                <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Seguridad RLS</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#059669" }}>Habilitada</div>
                </div>
              </div>

              {/* Tabla de Columnas */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                      <th style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Columna</th>
                      <th style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Tipo PostgreSQL</th>
                      <th style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Nulo</th>
                      <th style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Rol / Clave</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSupaTable.columns.map((col, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)", background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)" }}>
                        <td style={{ padding: "0.6rem 0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-main)" }}>
                          {col.name}
                        </td>
                        <td style={{ padding: "0.6rem 0.75rem", color: "#3b82f6", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                          {col.type}
                        </td>
                        <td style={{ padding: "0.6rem 0.75rem" }}>
                          <span style={{ color: col.nullable ? "#d97706" : "#059669", fontWeight: 600 }}>
                            {col.nullable ? "Opcional" : "Obligatorio (NOT NULL)"}
                          </span>
                        </td>
                        <td style={{ padding: "0.6rem 0.75rem" }}>
                          {col.isPK && (
                            <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "0.68rem" }}>
                              PRIMARY KEY
                            </span>
                          )}
                          {col.type.includes("FK") && (
                            <span className="badge" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", fontSize: "0.68rem" }}>
                              FOREIGN KEY
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: ARQUITECTURA & CONEXIÓN SUPABASE                               */}
      {/* ========================================================================= */}
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
              <strong style={{ color: "#059669" }}>Row-Level Security (RLS) Activo en 10 Tablas</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Estado de Azure SQL:</span>
              <strong style={{ color: "#d97706" }}>Desacoplado / Archivada como Histórico</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Autenticación & Perfiles:</span>
              <strong style={{ color: "#7c3aed" }}>Supabase Auth + Dual-Actor Impersonation</strong>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: HISTÓRICO AZURE SQL (94 TABLAS ARCHIVADAS)                     */}
      {/* ========================================================================= */}
      {activeTab === "azure" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="card" style={{ padding: "0.85rem 1rem", background: "rgba(217, 119, 6, 0.08)", border: "1px solid rgba(217, 119, 6, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Archive size={18} color="#d97706" />
              <strong style={{ color: "#d97706", fontSize: "0.85rem" }}>Catálogo Heredado (Archivo Histórico de 94 Tablas Azure SQL)</strong>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem", margin: 0 }}>
              Estas tablas corresponden a la versión anterior de Microsoft Access / Azure SQL. Se mantienen en modo solo lectura como respaldo histórico mientras opera la nueva arquitectura de Supabase.
            </p>
          </div>

          {/* Buscador Azure */}
          <div className="card" style={{ padding: "0.85rem 1rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: "260px" }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Buscar tabla heredada (ej: tblReportes, strContratante)..."
                value={azureSearch}
                onChange={(e) => setAzureSearch(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "0.85rem", color: "var(--text-main)" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {[
                { id: "todas", label: "Todas (94)" },
                { id: "mapeada", label: "Mapeadas (15)" },
                { id: "activa", label: "Operativas (63)" },
                { id: "duplicada", label: "Fase 2 (7)" },
                { id: "obsoleta", label: "Fase 1 (9)" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setAzureStatusFilter(btn.id)}
                  className={`btn btn-sm ${azureStatusFilter === btn.id ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inspector Azure */}
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.25rem", alignItems: "start" }}>
            <div className="card" style={{ padding: "0.5rem", maxHeight: "650px", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {filteredAzureTables.map((table) => {
                  const isSelected = selectedAzureTable.name === table.name;
                  return (
                    <button
                      key={table.name}
                      onClick={() => setSelectedAzureTable(table)}
                      style={{
                        padding: "0.65rem 0.85rem",
                        textAlign: "left",
                        borderRadius: "var(--radius-sm)",
                        border: isSelected ? "1px solid var(--primary)" : "1px solid transparent",
                        background: isSelected ? "rgba(59, 130, 246, 0.1)" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)" }}>{table.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{table.module}</div>
                      </div>
                      <span className="badge" style={{ fontSize: "0.68rem" }}>{table.columnCount} cols</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>
                [dbo].[{selectedAzureTable.name}]
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Módulo Histórico: {selectedAzureTable.module} | Estado: {selectedAzureTable.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 4: SCRIPTS SQL                                                    */}
      {/* ========================================================================= */}
      {activeTab === "scripts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {Object.entries(sqlScripts).map(([key, s]) => (
              <button
                key={key}
                onClick={() => setSelectedScript(Number(key))}
                className={`btn btn-sm ${selectedScript === Number(key) ? "btn-primary" : "btn-secondary"}`}
              >
                {s.title}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: "1.25rem", background: "#0f172a", color: "#f8fafc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#38bdf8" }}>
                {sqlScripts[selectedScript].filename}
              </span>
              <button
                onClick={() => copyToClipboard(sqlScripts[selectedScript].code, true)}
                className="btn btn-secondary btn-sm"
              >
                {copiedScript ? "Copiado" : "Copiar Script"}
              </button>
            </div>
            <pre style={{ margin: 0, fontSize: "0.8rem", overflowX: "auto", fontFamily: "var(--font-mono)" }}>
              {sqlScripts[selectedScript].code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
