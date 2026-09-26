import React, { useState, useEffect, useCallback } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { exportToCSV } from "../../../utils/exportUtils";
import { auditApi } from "../../../services/api";
import { History, Search, Download, RefreshCw, Filter, CheckCircle2, Shield, AlertCircle } from "lucide-react";

export const AuditLogsView: React.FC = () => {
  const { auditLogs: fallbackLogs } = useData();
  const { can } = useAuth();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("todas");
  const [selectedModule, setSelectedModule] = useState<string>("todos");

  const fetchLiveLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditApi.getLogs({ limit: 200 });
      if (res && res.data && res.data.length > 0) {
        setLogs(res.data);
        setIsLiveApi(true);
      } else {
        setLogs(fallbackLogs);
        setIsLiveApi(false);
      }
    } catch {
      // Fallback a logs de contexto si el backend aún no tiene token o está offline
      setLogs(fallbackLogs);
      setIsLiveApi(false);
    } finally {
      setLoading(false);
    }
  }, [fallbackLogs]);

  useEffect(() => {
    fetchLiveLogs();
  }, [fetchLiveLogs]);

  const filtered = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (log.entityName || "").toLowerCase().includes(term) ||
      (log.module || "").toLowerCase().includes(term) ||
      (log.details || "").toLowerCase().includes(term) ||
      (log.userName || "").toLowerCase().includes(term);

    const matchesAction = selectedAction === "todas" || log.action === selectedAction;
    const matchesModule = selectedModule === "todos" || log.module === selectedModule;
    return matchesSearch && matchesAction && matchesModule;
  });

  const availableModules = Array.from(new Set(logs.map((l) => l.module))).filter(Boolean);

  const handleExport = () => {
    exportToCSV(filtered, "Trazabilidad_Auditoria_sos_audit_logs", [
      { key: "id", label: "ID Log" },
      { key: "timestamp", label: "Fecha y Hora" },
      { key: "action", label: "Acción" },
      { key: "module", label: "Módulo" },
      { key: "userName", label: "Usuario" },
      { key: "userRole", label: "Rol" },
      { key: "entityName", label: "Entidad Modificada" },
      { key: "details", label: "Detalle de Cambios" },
      { key: "ipAddress", label: "Dirección IP" },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <History size={26} color="var(--primary)" />
            Pistas de Auditoría y Trazabilidad (sos_audit_logs)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Registro inmutable de todas las operaciones realizadas en la plataforma según los requisitos DIAN y control interno.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: isLiveApi ? "rgba(5, 150, 105, 0.1)" : "rgba(217, 119, 6, 0.1)",
              color: isLiveApi ? "#059669" : "#d97706",
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isLiveApi ? "#059669" : "#d97706" }} />
            {isLiveApi ? "Auditoría en Tiempo Real" : "Modo Local / Fallback"}
          </span>

          <button
            onClick={fetchLiveLogs}
            className="btn btn-secondary btn-sm"
            title="Recargar logs"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Actualizar
          </button>

          {can("export") && (
            <button onClick={handleExport} className="btn btn-primary btn-sm">
              <Download size={14} /> Exportar Pistas CSV
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="card" style={{ padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flex: 1, minWidth: "300px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
            <input
              type="text"
              placeholder="Buscar por entidad, usuario o detalle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.1rem", width: "100%" }}
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="select-field"
            style={{ width: "auto" }}
          >
            <option value="todas">Todas las Acciones</option>
            <option value="CREAR">CREAR</option>
            <option value="ACTUALIZAR">ACTUALIZAR</option>
            <option value="CAMBIO_ESTADO">CAMBIO_ESTADO</option>
            <option value="ELIMINAR">ELIMINAR</option>
          </select>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="select-field"
            style={{ width: "auto" }}
          >
            <option value="todos">Todos los Módulos</option>
            {availableModules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>
          {filtered.length} eventos registrados
        </div>
      </div>

      {/* Tabla de Logs Responsiva */}
      <div className="table-responsive-wrapper card" style={{ padding: 0 }}>
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "950px" }}>
          <thead>
            <tr>
              <th style={{ minWidth: "150px" }}>Timestamp (UTC)</th>
              <th style={{ minWidth: "110px" }}>Acción</th>
              <th style={{ minWidth: "110px" }}>Módulo</th>
              <th style={{ minWidth: "160px" }}>Usuario & Rol</th>
              <th style={{ minWidth: "160px" }}>Registro Afectado</th>
              <th style={{ minWidth: "260px" }}>Detalle de la Operación</th>
              <th style={{ minWidth: "100px" }}>IP Origen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  No se encontraron eventos de auditoría con los filtros actuales.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    {log.timestamp}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        background:
                          log.action === "CREAR"
                            ? "rgba(5, 150, 105, 0.1)"
                            : log.action === "ELIMINAR"
                            ? "rgba(220, 38, 38, 0.1)"
                            : "rgba(37, 99, 235, 0.1)",
                        color:
                          log.action === "CREAR"
                            ? "#047857"
                            : log.action === "ELIMINAR"
                            ? "#dc2626"
                            : "#1d4ed8",
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: "0.8rem" }}>{log.module}</td>
                  <td style={{ fontSize: "0.8rem" }}>
                    <div style={{ fontWeight: 700 }}>{log.userName}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{log.userRole}</div>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: "0.825rem", color: "var(--text-main)" }}>{log.entityName}</td>
                  <td style={{ fontSize: "0.8rem", color: "var(--neutral-700)" }}>{log.details}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {log.ipAddress || "127.0.0.1"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
