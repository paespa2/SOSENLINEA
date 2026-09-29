import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { StatusBadge } from "../../common/Badge";
import { CSVImportModal } from "../../common/CSVImportModal";
import { ModuleId, ReporteOrden } from "../../../types";
import {
  FileSpreadsheet,
  Calculator,
  Key,
  Printer,
  History,
  Database,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  ShieldCheck,
  Eye,
  Wrench,
  CheckSquare,
  AlertCircle,
  Plus,
  Upload,
  Search,
  MapPin,
  User,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface DashboardViewProps {
  onNavigate: (module: ModuleId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { reportes, novedades, llaves, auditLogs, cotizaciones } = useData();
  const { currentUser, currentRole, effectiveRole } = useAuth();

  // Estados de control
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"todos" | "progreso" | "revision" | "pendiente" | "garantia">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  // Simulación de actualización automática en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncTime(new Date());
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSyncTime(new Date());
      setIsRefreshing(false);
    }, 500);
  };

  // Saludo dinámico según la hora del día
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // ── Métricas Operativas Clave ──────────────────────────────────────────────
  const casosEnProgreso = useMemo(
    () => reportes.filter((r) => r.estado === "En Progreso" || r.estado === "Visita Especializada"),
    [reportes]
  );

  const casosEnRevision = useMemo(
    () => reportes.filter((r) => r.estado === "En Revisión" || r.estado === "Se Programa Control de Calidad"),
    [reportes]
  );

  const casosPendientes = useMemo(
    () =>
      reportes.filter(
        (r) =>
          r.estado === "Borrador" ||
          r.estado === "Cotizado" ||
          r.estado === "Cotización Digital" ||
          r.estado === "Recotizar Nuevamente"
      ),
    [reportes]
  );

  const casosResueltos = useMemo(
    () => reportes.filter((r) => r.estado === "Ejecutado" || r.estado === "Finalizado" || r.estado === "Cobrado" || r.estado === "Pagado"),
    [reportes]
  );

  const casosGarantia = useMemo(
    () => reportes.filter((r) => r.estado === "Garantía" || r.estado === "En Garantía"),
    [reportes]
  );

  // Tasa de avance promedio de casos en ejecución
  const promedioAvance = useMemo(() => {
    if (casosEnProgreso.length === 0) return 0;
    const total = casosEnProgreso.reduce((acc, r) => acc + (r.tasaAvance || 0), 0);
    return Math.round((total / casosEnProgreso.length) * 100);
  }, [casosEnProgreso]);

  // Órdenes filtradas para la tabla principal
  const ordenesFiltradas = useMemo(() => {
    return reportes.filter((r) => {
      // Filtro de estado
      if (statusFilter === "progreso" && r.estado !== "En Progreso" && r.estado !== "Visita Especializada") return false;
      if (statusFilter === "revision" && r.estado !== "En Revisión" && r.estado !== "Se Programa Control de Calidad") return false;
      if (statusFilter === "pendiente" && !["Borrador", "Cotizado", "Cotización Digital", "Recotizar Nuevamente"].includes(r.estado)) return false;
      if (statusFilter === "garantia" && !["Garantía", "En Garantía"].includes(r.estado)) return false;

      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = (r.codigoAlfanumerico || "").toLowerCase().includes(q) || String(r.idRegistro).includes(q);
        const matchesDir = (r.direccion || "").toLowerCase().includes(q);
        const matchesClient = (r.clienteNombre || "").toLowerCase().includes(q);
        const matchesType = (r.tipoTrabajo || "").toLowerCase().includes(q);
        const matchesContractor = (r.contratistaNombre || "").toLowerCase().includes(q);
        return matchesCode || matchesDir || matchesClient || matchesType || matchesContractor;
      }

      return true;
    });
  }, [reportes, statusFilter, searchQuery]);

  // Distribución por especialidad / tipo de trabajo
  const distribucionTrabajos = useMemo(() => {
    const counts: Record<string, number> = {};
    reportes.forEach((r) => {
      const cat = r.tipoTrabajo || "Mantenimiento General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [reportes]);

  const pendingClientRequests = useMemo(() => {
    return reportes.filter(
      (r) =>
        r.estado === "Se Recibe Información" ||
        r.origenSolicitud === "Cliente Web" ||
        (r.solicitanteTelefono && r.estadoContacto === "Pendiente de Contacto")
    );
  }, [reportes]);

  const llavesPrestadas = useMemo(
    () => llaves.filter((k) => k.estado === "Prestada"),
    [llaves]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: "1600px", margin: "0 auto" }}>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO EJECUTIVO PROFESIONAL (SOBRIO, LIMPIO Y ELEGANTE)          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%)",
          borderRadius: "var(--radius-xl)",
          padding: "1.75rem 2rem",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
          boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Adorno sutil de fondo */}
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "-40px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "680px", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
              padding: "0.3rem 0.85rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <ShieldCheck size={14} color="#60a5fa" />
            <span style={{ color: "#bfdbfe" }}>Sistema Corporativo • SOSENLINEA Cloud</span>
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              margin: "0 0 0.4rem 0",
              lineHeight: 1.2,
            }}
          >
            {greeting}, {currentUser?.name || "Administrador"}
          </h1>
          <p
            style={{
              color: "#cbd5e1",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: "600px",
            }}
          >
            Supervisión integral de novedades locativas, flujo de cotizaciones y avance de cuadrillas en tiempo real en Medellín y el Valle de Aburrá.
          </p>
        </div>

        {/* Acciones Rápidas y Estado de Sincronización */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.85rem", zIndex: 1 }}>
          {/* Badge de Conexión en Vivo */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(10px)",
              padding: "0.45rem 0.9rem",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 10px #10b981",
              }}
            />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2e8f0" }}>
              En Línea
            </span>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>•</span>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              {lastSyncTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <button
              type="button"
              onClick={handleManualRefresh}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
              title="Refrescar datos del sistema"
            >
              <RefreshCw size={12} className={isRefreshing ? "spin-icon" : ""} />
            </button>
          </div>

          {/* Botones de Acción Inmediata */}
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {effectiveRole === "usuario" ? (
              <button
                type="button"
                onClick={() => onNavigate("reportes-ordenes")}
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  padding: "0.55rem 1.15rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <Sparkles size={16} />
                <span>+ Iniciar Solicitud de Servicio / PQR</span>
              </button>
            ) : (
              <>
                {pendingClientRequests.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigate("reportes-ordenes")}
                    className="btn btn-warning btn-sm"
                    style={{
                      background: "rgba(245, 158, 11, 0.2)",
                      color: "#fbbf24",
                      borderColor: "rgba(245, 158, 11, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontWeight: 700,
                    }}
                    title="Ver solicitudes de clientes pendientes de contacto"
                  >
                    <span>🔔 {pendingClientRequests.length} Solicitudes Pendientes</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCSVModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                backdropFilter: "blur(8px)",
              }}
            >
              <Upload size={14} />
              Importar Tablas / CSV
            </button>

            <button
              type="button"
              onClick={() => onNavigate("reportes-ordenes")}
              className="btn btn-primary btn-sm"
              style={{
                background: "#2563eb",
                borderColor: "#3b82f6",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              }}
            >
              <Plus size={14} />
              Gestionar Órdenes
            </button>
            </>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. KPIS Y TARJETAS DE RENDIMIENTO OPERATIVO (CONFORT VISUAL)       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "var(--text-main)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              margin: 0,
            }}
          >
            <Activity size={18} color="var(--primary)" />
            <span>Métricas Operativas del Periodo</span>
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Total Casos Registrados: <strong>{reportes.length}</strong>
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.1rem",
          }}
        >
          {/* TARJETA 1: EN PROGRESO */}
          <div
            className="card"
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderTop: "4px solid #f59e0b",
              boxShadow: "var(--shadow-sm)",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onClick={() => setStatusFilter("progreso")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  En Ejecución Activa
                </span>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#d97706", marginTop: "0.25rem", lineHeight: 1 }}>
                  {casosEnProgreso.length}
                </div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wrench size={20} />
              </div>
            </div>

            <div style={{ marginTop: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                <span>Avance promedio en sitio</span>
                <strong style={{ color: "#d97706" }}>{promedioAvance}%</strong>
              </div>
              <div style={{ height: 6, background: "var(--neutral-100)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${promedioAvance}%`, background: "#f59e0b", borderRadius: 3 }} />
              </div>
            </div>
          </div>

          {/* TARJETA 2: EN REVISIÓN & CONTROL */}
          <div
            className="card"
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderTop: "4px solid #3b82f6",
              boxShadow: "var(--shadow-sm)",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onClick={() => setStatusFilter("revision")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Control de Calidad
                </span>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2563eb", marginTop: "0.25rem", lineHeight: 1 }}>
                  {casosEnRevision.length}
                </div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  background: "rgba(59, 130, 246, 0.1)",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckSquare size={20} />
              </div>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.85rem 0 0 0", lineHeight: 1.4 }}>
              Casos listos para auditoría fotográfica y acta de entrega a inmobiliaria.
            </p>
          </div>

          {/* TARJETA 3: PENDIENTES & COTIZACIONES */}
          <div
            className="card"
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderTop: "4px solid #8b5cf6",
              boxShadow: "var(--shadow-sm)",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onClick={() => setStatusFilter("pendiente")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Por Cotizar / Aprobar
                </span>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#7c3aed", marginTop: "0.25rem", lineHeight: 1 }}>
                  {casosPendientes.length}
                </div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  background: "rgba(139, 92, 246, 0.1)",
                  color: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Calculator size={20} />
              </div>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.85rem 0 0 0", lineHeight: 1.4 }}>
              Cotizaciones digitales emitidas o en evaluación de propietario.
            </p>
          </div>

          {/* TARJETA 4: FINALIZADOS A SATISFACCIÓN */}
          <div
            className="card"
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderTop: "4px solid #10b981",
              boxShadow: "var(--shadow-sm)",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onClick={() => setStatusFilter("todos")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Casos Resueltos
                </span>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#059669", marginTop: "0.25rem", lineHeight: 1 }}>
                  {casosResueltos.length}
                </div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={20} />
              </div>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.85rem 0 0 0", lineHeight: 1.4 }}>
              Órdenes finalizadas a conformidad con paz y salvo entregado.
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. ACCESOS RÁPIDOS A MÓDULOS DEL SISTEMA                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.85rem",
        }}
      >
        <div
          className="card"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            transition: "all 0.15s ease",
          }}
          onClick={() => onNavigate("reportes-ordenes")}
        >
          <div style={{ padding: "0.5rem", borderRadius: "8px", background: "rgba(59, 130, 246, 0.1)", color: "#2563eb" }}>
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.825rem" }}>Órdenes de Trabajo</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{reportes.length} expedientes</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            transition: "all 0.15s ease",
          }}
          onClick={() => onNavigate("cotizaciones")}
        >
          <div style={{ padding: "0.5rem", borderRadius: "8px", background: "rgba(139, 92, 246, 0.1)", color: "#7c3aed" }}>
            <Calculator size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.825rem" }}>Cotizaciones</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{cotizaciones.length} presupuestos</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            transition: "all 0.15s ease",
          }}
          onClick={() => onNavigate("llaves")}
        >
          <div style={{ padding: "0.5rem", borderRadius: "8px", background: "rgba(217, 119, 6, 0.1)", color: "#d97706" }}>
            <Key size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.825rem" }}>Gestión de Llaves</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{llavesPrestadas.length} en custodia</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            transition: "all 0.15s ease",
          }}
          onClick={() => onNavigate("impresiones")}
        >
          <div style={{ padding: "0.5rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", color: "#059669" }}>
            <Printer size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.825rem" }}>Impresiones & Vales</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Actas con firma</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            transition: "all 0.15s ease",
          }}
          onClick={() => onNavigate("auditoria")}
        >
          <div style={{ padding: "0.5rem", borderRadius: "8px", background: "rgba(79, 70, 229, 0.1)", color: "#4f46e5" }}>
            <History size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.825rem" }}>Registro de Auditoría</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{auditLogs.length} eventos seguros</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. GRILLA PRINCIPAL: TABLA DE CASOS & SALUD OPERATIVA LATERAL       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="dashboard-main-grid">
        {/* COLUMNA IZQUIERDA: TABLA Y BUSCADOR DE CASOS */}
        <div className="card" style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
          {/* Header de la Tabla con Buscador y Filtros Segmentados */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 0.2rem 0", color: "var(--text-main)" }}>
                  Órdenes y Procesos Activos
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                  Expedientes en terreno, seguimiento y llamadas a la acción
                </p>
              </div>

              {/* Buscador Rápido Reactivo */}
              <div style={{ position: "relative", width: "280px" }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--neutral-400)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar caso, predio o cuadrilla..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "2rem", fontSize: "0.78rem", height: "34px" }}
                />
              </div>
            </div>

            {/* Segmented Control (Pestañas Modernas) */}
            <div
              style={{
                display: "inline-flex",
                background: "var(--neutral-100)",
                padding: "3px",
                borderRadius: "10px",
                gap: "2px",
                overflowX: "auto",
                maxWidth: "100%",
              }}
            >
              {[
                { id: "todos", label: `Todos (${reportes.length})` },
                { id: "progreso", label: `En Progreso (${casosEnProgreso.length})` },
                { id: "revision", label: `En Revisión (${casosEnRevision.length})` },
                { id: "pendiente", label: `Por Cotizar (${casosPendientes.length})` },
                { id: "garantia", label: `Garantías (${casosGarantia.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  style={{
                    background: statusFilter === tab.id ? "var(--bg-card)" : "transparent",
                    color: statusFilter === tab.id ? "var(--text-main)" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.35rem 0.75rem",
                    fontSize: "0.75rem",
                    fontWeight: statusFilter === tab.id ? 700 : 500,
                    cursor: "pointer",
                    boxShadow: statusFilter === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de Registros en Tarjeta Estilizada con Remate Inferior */}
          <div className="table-card" style={{ marginBottom: 0 }}>
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: "75px", width: "80px", textAlign: "center" }}>#</th>
                    <th style={{ minWidth: "160px" }}>Inmueble & Solicitante</th>
                    <th style={{ minWidth: "130px" }}>Especialidad</th>
                    <th style={{ minWidth: "130px" }}>Cuadrilla</th>
                    <th style={{ minWidth: "90px" }}>Avance</th>
                    <th style={{ minWidth: "110px" }}>Estado</th>
                    <th className="table-actions-sticky" style={{ textAlign: "right", minWidth: "85px" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
                        <AlertCircle size={24} style={{ margin: "0 auto 0.5rem auto", opacity: 0.5 }} />
                        <div>No se encontraron órdenes para los criterios seleccionados.</div>
                      </td>
                    </tr>
                  ) : (
                    ordenesFiltradas.slice(0, 10).map((r) => {
                      const percent = Math.round((r.tasaAvance || 0) * 100);
                      return (
                        <tr key={r.idRegistro}>
                          <td style={{ textAlign: "center", width: "80px" }}>
                            <button
                              type="button"
                              onClick={() => onNavigate("reportes-ordenes")}
                              className="badge-order-id"
                              title={`Radicado: ${r.codigoAlfanumerico || '#' + r.idRegistro} • Clic para ver`}
                            >
                              #{r.idRegistro}
                            </button>
                          </td>

                          <td>
                            <div style={{ fontWeight: 600, fontSize: "0.825rem", color: "var(--text-main)" }}>
                              {r.direccion}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.15rem" }}>
                              <User size={11} />
                              <span>{r.clienteNombre}</span>
                              <span>•</span>
                              <span>{r.fecha}</span>
                            </div>
                          </td>

                          <td>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                background: "rgba(37, 99, 235, 0.08)",
                                color: "var(--primary)",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "6px",
                              }}
                            >
                              {r.tipoTrabajo || "Mantenimiento"}
                            </span>
                          </td>

                          <td>
                            <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                              {r.contratistaNombre || "Sin asignar"}
                            </div>
                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                              {r.sector}
                            </div>
                          </td>

                          <td style={{ minWidth: "90px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: "0.2rem" }}>
                              <span style={{ fontWeight: 700 }}>{percent}%</span>
                            </div>
                            <div style={{ height: 5, background: "var(--neutral-200)", borderRadius: 3, overflow: "hidden" }}>
                              <div
                                style={{
                                  height: "100%",
                                  width: `${percent}%`,
                                  background: percent >= 80 ? "#10b981" : percent >= 40 ? "#f59e0b" : "#3b82f6",
                                  borderRadius: 3,
                                }}
                              />
                            </div>
                          </td>

                          <td>
                            <StatusBadge status={r.estado} size="sm" />
                          </td>

                          <td className="table-actions-sticky" style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => onNavigate("reportes-ordenes")}
                              className="btn btn-secondary btn-xs"
                              style={{ padding: "0.3rem 0.55rem" }}
                              title="Ver expediente completo"
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

            {/* Footer con contorno y paginación en base firme de la tarjeta */}
            <div className="table-footer-bar">
              <span>
                Mostrando {Math.min(10, ordenesFiltradas.length)} de {ordenesFiltradas.length} órdenes filtradas
              </span>
              <button
                type="button"
                onClick={() => onNavigate("reportes-ordenes")}
                className="btn btn-secondary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
              >
                Ver Todas las Órdenes
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>


        {/* COLUMNA DERECHA: SALUD OPERATIVA & NOVEDADES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* WIDGET 1: DISTRIBUCIÓN POR ESPECIALIDAD */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <div style={{ width: 30, height: 30, borderRadius: "8px", background: "rgba(37, 99, 235, 0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 800, margin: 0 }}>Distribución Operativa</h4>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Casos según tipo de servicio</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {distribucionTrabajos.map(([categoria, cant], idx) => {
                const percent = Math.round((cant / (reportes.length || 1)) * 100);
                return (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 600 }}>{categoria}</span>
                      <span style={{ color: "var(--text-muted)" }}>{cant} casos ({percent}%)</span>
                    </div>
                    <div style={{ height: 6, background: "var(--neutral-100)", borderRadius: 3, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${percent}%`,
                          background: idx === 0 ? "#1e40af" : idx === 1 ? "#2563eb" : idx === 2 ? "#3b82f6" : "#60a5fa",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WIDGET 2: NOVEDADES CRÍTICAS LIGADAS A REPORTES */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 30, height: 30, borderRadius: "8px", background: "rgba(245, 158, 11, 0.12)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 800, margin: 0 }}>Novedades Recientes</h4>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Incidencias en terreno</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("informes-novedades")}
                className="btn btn-secondary btn-xs"
                style={{ fontSize: "0.7rem" }}
              >
                Ver Todas
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {novedades.slice(0, 3).map((nov) => {
                const rep = reportes.find((r) => r.idRegistro === nov.reporteId);
                return (
                  <div
                    key={nov.id}
                    style={{
                      padding: "0.7rem",
                      borderRadius: "8px",
                      background: "var(--neutral-50)",
                      border: "1px solid var(--border-color)",
                      borderLeft: `3px solid ${nov.prioridad === "Urgente" ? "#ef4444" : "#f59e0b"}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{nov.titulo}</span>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#d97706" }}>{nov.prioridad}</span>
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.35 }}>
                      {nov.descripcion}
                    </div>
                    {rep && (
                      <div style={{ fontSize: "0.68rem", color: "var(--primary)", marginTop: "0.3rem", fontWeight: 600 }}>
                        📍 {rep.direccion}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* WIDGET 3: CONTROL DE LLAVES */}
          <div
            className="card"
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              background: "rgba(217, 119, 6, 0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <div style={{ width: 34, height: 34, borderRadius: "8px", background: "rgba(217, 119, 6, 0.12)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Key size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.825rem", fontWeight: 800 }}>Custodia de Llaves</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  {llavesPrestadas.length} juegos entregados a cuadrillas
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("llaves")}
              className="btn btn-secondary btn-xs"
            >
              Controlar
            </button>
          </div>
        </div>
      </div>

      {/* Modal Inteligente de Importación de CSV */}
      <CSVImportModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        defaultEntity="reportes"
      />
    </div>
  );
};
