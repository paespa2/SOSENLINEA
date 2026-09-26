import React, { useState, useEffect } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { StatusBadge } from "../../common/Badge";
import { ModuleId, ReporteOrden, NovedadReport } from "../../../types";
import {
  FileSpreadsheet,
  Calculator,
  Key,
  Printer,
  History,
  Database,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  ShieldCheck,
  Filter,
  Eye,
  Wrench,
  CheckSquare,
  FileCheck2,
  AlertCircle
} from "lucide-react";

interface DashboardViewProps {
  onNavigate: (module: ModuleId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { reportes, novedades, llaves, auditLogs } = useData();
  const { currentUser, currentRole, permissions } = useAuth();

  // Estados de control de actualización en tiempo real
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"todos" | "progreso" | "revision" | "pendiente">("todos");

  // Simulación de actualización reactiva en tiempo real (Polling / SSE Heartbeat)
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSyncTime(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  // ── 1. Estadísticas requeridas (Sin métricas contables de ingresos) ─────────
  // Casos Resueltos (Ejecutados o Cobrados)
  const casosResueltos = reportes.filter(
    (r) => r.estado === "Ejecutado" || r.estado === "Cobrado"
  ).length;

  // Casos Pendientes (Borradores o en fase de cotización previa)
  const casosPendientes = reportes.filter(
    (r) => r.estado === "Borrador" || r.estado === "Cotizado"
  ).length;

  // Casos En Revisión (Auditoría de acabados, validación técnica o entrega)
  const casosEnRevision = reportes.filter(
    (r) => r.estado === "En Revisión"
  ).length;

  // Casos En Progreso (En ejecución activa en terreno, no finalizados)
  const casosEnProgreso = reportes.filter(
    (r) => r.estado === "En Progreso"
  ).length;

  // ── 2. Órdenes y Procesos en Curso (No finalizados) ────────────────────────
  const ordenesNoFinalizadas = reportes.filter(
    (r) => r.estado !== "Ejecutado" && r.estado !== "Cobrado" && r.estado !== "Descartado"
  );

  const ordenesFiltradas = ordenesNoFinalizadas.filter((r) => {
    if (statusFilter === "progreso") return r.estado === "En Progreso";
    if (statusFilter === "revision") return r.estado === "En Revisión";
    if (statusFilter === "pendiente") return r.estado === "Borrador" || r.estado === "Cotizado";
    return true;
  });

  // Llaves activas en custodia
  const llavesPrestadas = llaves.filter((k) => k.estado === "Prestada").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HEADER PRINCIPAL: ROL ADMINISTRADOR Y ACTUALIZACIÓN EN TIEMPO REAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)",
          borderRadius: "var(--radius-xl)",
          padding: "1.5rem 1.75rem",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.25)",
        }}
      >
        <div style={{ maxWidth: "620px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(6px)",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              marginBottom: "0.6rem",
            }}
          >
            <ShieldCheck size={14} color="#93c5fd" />
            <span>Panel de Gestión Operativa • SOSENLINEA</span>
          </div>

          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 0.35rem 0" }}>
            Panel de Operaciones en Tiempo Real
          </h1>
          <p style={{ opacity: 0.85, fontSize: "0.85rem", lineHeight: 1.45, margin: 0 }}>
            Supervisión continua de órdenes de trabajo en curso, seguimiento de avances de cuadrillas y control de novedades operativas asociadas a reportes diarios.
          </p>
        </div>

        {/* Bloque de Estado en Vivo para Administrador */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "0.4rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 10px #10b981",
                animation: "pulse 2s infinite",
              }}
            />
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#93c5fd" }}>
              TIEMPO REAL ACTIVO
            </span>
          </div>

          <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.8)" }}>
            Usuario: <strong>{currentUser?.name || "Administrador"}</strong> ({currentRole === "admin" ? "Admin" : "Auxiliar"})
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
            <span style={{ fontSize: "0.68rem", opacity: 0.75 }}>
              Sinc: {lastSyncTime.toLocaleTimeString()}
            </span>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="btn btn-secondary btn-xs"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                border: "none",
                padding: "0.2rem 0.55rem",
                fontSize: "0.68rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
              title="Refrescar datos del sistema"
            >
              <RefreshCw size={12} className={isRefreshing ? "spin-icon" : ""} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4 ESTADÍSTICAS OPERATIVAS OBLIGATORIAS (SIN DATOS DE INGRESOS)     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
            <Activity size={18} color="var(--primary)" />
            <span>Balance de Casos Operativos del Sistema</span>
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Total Órdenes Registradas: <strong>{reportes.length}</strong>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem" }}>
          {/* 1. CASOS EN PROGRESO (EN EJECUCIÓN ACTIVA) */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.25rem",
              borderLeft: "4px solid #f59e0b",
              background: "var(--bg-card)",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onClick={() => setStatusFilter("progreso")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  En Progreso
                </span>
                <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#d97706", marginTop: "0.2rem" }}>
                  {casosEnProgreso}
                </div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={20} />
              </div>
            </div>
            <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              Órdenes en ejecución técnica activa en terreno
            </div>
          </div>

          {/* 2. CASOS EN REVISIÓN */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.25rem",
              borderLeft: "4px solid #3b82f6",
              background: "var(--bg-card)",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onClick={() => setStatusFilter("revision")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  En Revisión
                </span>
                <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#2563eb", marginTop: "0.2rem" }}>
                  {casosEnRevision}
                </div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckSquare size={20} />
              </div>
            </div>
            <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              En verificación técnica y auditoría de entrega
            </div>
          </div>

          {/* 3. CASOS PENDIENTES */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.25rem",
              borderLeft: "4px solid #8b5cf6",
              background: "var(--bg-card)",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onClick={() => setStatusFilter("pendiente")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Casos Pendientes
                </span>
                <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#7c3aed", marginTop: "0.2rem" }}>
                  {casosPendientes}
                </div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertCircle size={20} />
              </div>
            </div>
            <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              Borradores y solicitudes pendientes de cotización
            </div>
          </div>

          {/* 4. CASOS RESUELTOS */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.25rem",
              borderLeft: "4px solid #10b981",
              background: "var(--bg-card)",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onClick={() => setStatusFilter("todos")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Casos Resueltos
                </span>
                <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#059669", marginTop: "0.2rem" }}>
                  {casosResueltos}
                </div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              Órdenes finalizadas y ejecutadas a satisfacción
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ACCESO RÁPIDO PRIORIZADO AL MENÚ PRINCIPAL                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Layers size={18} color="var(--primary)" />
          <span>Accesos Rápidos del Menú Principal</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
          <div
            className="card"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.85rem", padding: "1rem" }}
            onClick={() => onNavigate("reportes-ordenes")}
          >
            <div style={{ padding: "0.55rem", borderRadius: "8px", background: "rgba(59, 130, 246, 0.12)", color: "#2563eb" }}>
              <FileSpreadsheet size={20} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: "0.825rem", color: "var(--text-main)" }}>Órdenes de Trabajo</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{ordenesNoFinalizadas.length} en curso</div>
            </div>
          </div>

          <div
            className="card"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.85rem", padding: "1rem" }}
            onClick={() => onNavigate("cotizaciones")}
          >
            <div style={{ padding: "0.55rem", borderRadius: "8px", background: "rgba(139, 92, 246, 0.12)", color: "#7c3aed" }}>
              <Calculator size={20} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: "0.825rem", color: "var(--text-main)" }}>Cotizaciones</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>tblCotizacion activa</div>
            </div>
          </div>

          <div
            className="card"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.85rem", padding: "1rem" }}
            onClick={() => onNavigate("llaves")}
          >
            <div style={{ padding: "0.55rem", borderRadius: "8px", background: "rgba(217, 119, 6, 0.12)", color: "#d97706" }}>
              <Key size={20} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: "0.825rem", color: "var(--text-main)" }}>Gestión de Llaves</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{llavesPrestadas} en préstamo</div>
            </div>
          </div>

          <div
            className="card"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.85rem", padding: "1rem" }}
            onClick={() => onNavigate("impresiones")}
          >
            <div style={{ padding: "0.55rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}>
              <Printer size={20} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: "0.825rem", color: "var(--text-main)" }}>Impresiones</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Vales y documentos</div>
            </div>
          </div>

          <div
            className="card"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.85rem", padding: "1rem" }}
            onClick={() => onNavigate("auditoria")}
          >
            <div style={{ padding: "0.55rem", borderRadius: "8px", background: "rgba(79, 70, 229, 0.12)", color: "#4f46e5" }}>
              <History size={20} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: "0.825rem", color: "var(--text-main)" }}>Auditoría</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{auditLogs.length} logs seguros</div>
            </div>
          </div>

          <div
            className="card"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.85rem", padding: "1rem" }}
            onClick={() => onNavigate("azure-sql-console")}
          >
            <div style={{ padding: "0.55rem", borderRadius: "8px", background: "rgba(6, 182, 212, 0.12)", color: "#0891b2" }}>
              <Database size={20} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: "0.825rem", color: "var(--text-main)" }}>Base de Datos</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Consola & Catálogo</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* GRILLA PRINCIPAL: ÓRDENES EN CURSO & NOVEDADES ASOCIADAS A REPORTES */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: "1.25rem" }}>
        {/* COLUMNA 1: PROCESOS Y ÓRDENES EN EJECUCIÓN (NO FINALIZADOS) */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 0.2rem 0", color: "var(--text-main)" }}>
                Procesos y Órdenes en Ejecución Activa
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                Visualización en tiempo real de casos no finalizados y reportes en curso
              </p>
            </div>

            {/* Selector de Filtros Rápidos */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <button
                type="button"
                onClick={() => setStatusFilter("todos")}
                className={`btn btn-xs ${statusFilter === "todos" ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
              >
                Todos ({ordenesNoFinalizadas.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("progreso")}
                className={`btn btn-xs ${statusFilter === "progreso" ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
              >
                En Progreso ({casosEnProgreso})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("revision")}
                className={`btn btn-xs ${statusFilter === "revision" ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
              >
                En Revisión ({casosEnRevision})
              </button>
            </div>
          </div>

          {/* Tabla de Casos en Ejecución */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No. Orden</th>
                  <th>Inmueble / Cliente</th>
                  <th>Contratista Asignado</th>
                  <th>Avance</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No hay procesos pendientes en este filtro.
                    </td>
                  </tr>
                ) : (
                  ordenesFiltradas.map((r) => {
                    const linkedNovs = novedades.filter((n) => n.reporteId === r.idRegistro);
                    const progressPercent = Math.round(r.tasaAvance * 100);

                    return (
                      <tr key={r.idRegistro}>
                        <td>
                          <div style={{ fontWeight: 800, color: "var(--primary)" }}>
                            #{r.idRegistro}
                          </div>
                          {linkedNovs.length > 0 && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                background: "#fef3c7",
                                color: "#b45309",
                                padding: "0.1rem 0.35rem",
                                borderRadius: "4px",
                                marginTop: "0.2rem",
                              }}
                            >
                              <AlertTriangle size={10} />
                              {linkedNovs.length} novedad{linkedNovs.length > 1 ? "es" : ""}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: "0.825rem", color: "var(--text-main)" }}>
                            {r.direccion}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {r.clienteNombre} {r.arrendatario ? `• Arr: ${r.arrendatario}` : ""}
                          </div>
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--neutral-500)",
                              marginTop: "0.15rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "240px",
                            }}
                          >
                            {r.reporte}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.78rem", fontWeight: 500 }}>
                            {r.contratistaNombre}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                            Sector: {r.sector}
                          </div>
                        </td>
                        <td style={{ minWidth: "110px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.2rem", fontSize: "0.72rem" }}>
                            <span style={{ fontWeight: 700 }}>{progressPercent}%</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>
                              {r.tareasPendientes ? `${r.tareasPendientes} tareas` : "En curso"}
                            </span>
                          </div>
                          <div
                            style={{
                              height: 6,
                              width: "100%",
                              background: "var(--neutral-200)",
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${progressPercent}%`,
                                background:
                                  progressPercent >= 80
                                    ? "#10b981"
                                    : progressPercent >= 40
                                    ? "#f59e0b"
                                    : "#3b82f6",
                                borderRadius: 3,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={r.estado} size="sm" />
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => onNavigate("reportes-ordenes")}
                            className="btn btn-secondary btn-xs"
                            title="Ver detalles completos del reporte"
                            style={{ padding: "0.25rem 0.5rem" }}
                          >
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.85rem" }}>
            <button
              type="button"
              onClick={() => onNavigate("reportes-ordenes")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.78rem" }}
            >
              Ir a Tabla Completa de Reportes <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* COLUMNA 2: NOVEDADES OPERATIVAS RECIENTES LIGADAS A SUS REPORTES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "6px", background: "rgba(245, 158, 11, 0.15)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.925rem", fontWeight: 800, margin: 0 }}>
                    Novedades Operativas Recientes
                  </h3>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Ligadas a sus correspondientes reportes
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate("informes-novedades")}
                className="btn btn-secondary btn-xs"
              >
                Ver Todas
              </button>
            </div>

            {/* Listado de Novedades con Reporte Asociado */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {novedades.map((nov) => {
                const reporteAsociado = reportes.find((r) => r.idRegistro === nov.reporteId);

                return (
                  <div
                    key={nov.id}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "10px",
                      background: "var(--neutral-50)",
                      border: "1px solid var(--border-color)",
                      borderLeft: `4px solid ${
                        nov.prioridad === "Urgente"
                          ? "#ef4444"
                          : nov.prioridad === "Alta"
                          ? "#f59e0b"
                          : "#3b82f6"
                      }`,
                    }}
                  >
                    {/* Encabezado: Título y Prioridad */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text-main)", lineHeight: 1.3 }}>
                        {nov.titulo}
                      </span>
                      <StatusBadge status={nov.estado} size="sm" />
                    </div>

                    {/* Vínculo con el Reporte / Orden de Trabajo */}
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        border: "1px dashed var(--neutral-300)",
                        borderRadius: "6px",
                        padding: "0.35rem 0.5rem",
                        margin: "0.4rem 0",
                        fontSize: "0.72rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", overflow: "hidden" }}>
                        <span style={{ fontWeight: 800, color: "var(--primary)" }}>
                          Reporte #{nov.reporteId || "S/N"}:
                        </span>
                        <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {reporteAsociado ? `${reporteAsociado.direccion}` : "Incidencia General"}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#d97706" }}>
                        {nov.prioridad}
                      </span>
                    </div>

                    {/* Descripción de la Novedad */}
                    <p style={{ fontSize: "0.725rem", color: "var(--text-muted)", margin: "0.35rem 0", lineHeight: 1.4 }}>
                      {nov.descripcion}
                    </p>

                    {/* Pie: Responsable y Fecha */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--neutral-400)", paddingTop: "0.25rem" }}>
                      <span>Resp: {nov.responsable}</span>
                      <span>{nov.fecha}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tarjeta de Seguridad y Auditoría en Tiempo Real */}
          <div
            className="card"
            style={{
              padding: "1rem 1.25rem",
              background: "rgba(30, 58, 138, 0.03)",
              border: "1px solid rgba(30, 58, 138, 0.12)",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span style={{ fontWeight: 800, fontSize: "0.8rem", color: "var(--primary)" }}>
                Garantía Operativa y Auditoría Transaccional
              </span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
              Cada actualización de orden de trabajo y novedad se registra en tiempo real con trazabilidad de usuario, fecha y registro de auditoría segura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
