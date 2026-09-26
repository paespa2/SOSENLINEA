import React, { useState, useMemo } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { NovedadReport, Encuesta, ReporteEstado } from "../../../types";
import { formatCOP, formatDateCO, formatDateTimeCO } from "../../../utils/formatters";
import { exportToCSV, triggerPrint } from "../../../utils/exportUtils";
import { StatusBadge } from "../../common/Badge";
import { Modal } from "../../common/Modal";
import {
  CalendarDays,
  AlertTriangle,
  Star,
  Plus,
  Download,
  Printer,
  CheckCircle,
  Clock,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Building,
  User,
  Activity,
  Layers,
  Calendar,
} from "lucide-react";

export const InformeDiarioView: React.FC = () => {
  const { reportes, cotizaciones, movements, novedades, llaves } = useData();
  const today = new Date().toISOString().slice(0, 10);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipoTrabajo, setSelectedTipoTrabajo] = useState("todos");
  const [selectedEstado, setSelectedEstado] = useState("todos");

  const tiposTrabajoDisponibles = useMemo(() => {
    const set = new Set<string>();
    reportes.forEach((r) => {
      if (r.tipoTrabajo) set.add(r.tipoTrabajo);
    });
    return Array.from(set);
  }, [reportes]);

  const ordenesFiltradas = useMemo(() => {
    return reportes.filter((r) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.idRegistro.toString().includes(q) ||
        (r.codigoAlfanumerico && r.codigoAlfanumerico.toLowerCase().includes(q)) ||
        r.direccion.toLowerCase().includes(q) ||
        r.clienteNombre.toLowerCase().includes(q) ||
        (r.arrendatario && r.arrendatario.toLowerCase().includes(q)) ||
        (r.propietario && r.propietario.toLowerCase().includes(q)) ||
        (r.contratistaNombre && r.contratistaNombre.toLowerCase().includes(q)) ||
        (r.tecnicoCotizacionNombre && r.tecnicoCotizacionNombre.toLowerCase().includes(q)) ||
        (r.tecnicoEjecucionNombre && r.tecnicoEjecucionNombre.toLowerCase().includes(q));

      const matchTipo = selectedTipoTrabajo === "todos" || r.tipoTrabajo === selectedTipoTrabajo;
      const matchEstado = selectedEstado === "todos" || r.estado === selectedEstado;

      return matchSearch && matchTipo && matchEstado;
    });
  }, [reportes, searchTerm, selectedTipoTrabajo, selectedEstado]);

  const movimientosHoy = movements.slice(0, 6);
  const totalIngresosHoy = movements
    .filter((m) => m.tipo === "Ingreso")
    .reduce((acc, m) => acc + m.monto, 0);
  const totalEgresosHoy = movements
    .filter((m) => m.tipo === "Egreso")
    .reduce((acc, m) => acc + m.monto, 0);

  const handleExportarInforme = () => {
    const data = ordenesFiltradas.map((r) => {
      const cots = cotizaciones.filter((c) => c.idReporte === r.idRegistro);
      const totalCotizado = cots.reduce((acc, c) => acc + c.numTodoCosto, 0);
      return {
        "ID Registro": r.idRegistro,
        "Radicado / Código": r.codigoAlfanumerico || `#${r.idRegistro}`,
        "Tipo de Trabajo": r.tipoTrabajo || "Mantenimiento General",
        "Fecha": r.fecha,
        "Dirección": r.direccion,
        "Sector": r.sector,
        "Cliente": r.clienteNombre,
        "Quién Contrata": r.quienContrata || "Inmobiliaria",
        "Arrendatario": r.arrendatario || "N/A",
        "Propietario": r.propietario || "N/A",
        "Técnico Cotización": r.tecnicoCotizacionNombre || "N/A",
        "Técnico Ejecución": r.tecnicoEjecucionNombre || r.contratistaNombre || "N/A",
        "Estado Actual": r.estado,
        "Sub-Cotizaciones Asociadas": cots.length,
        "Valor Total Cotizado COP": totalCotizado,
        "Avance %": `${Math.round(r.tasaAvance * 100)}%`,
        "Actividades en Agenda": r.agendaActividades?.length || 0,
        "Última Novedad": r.ultimoActualizado || r.fecha,
      };
    });
    exportToCSV(data, `informe_diario_operativo_${today}.csv`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header del Informe */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <CalendarDays size={26} color="var(--primary)" />
            Informe Diario Consolidado & Seguimiento Operativo
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Supervisión diaria de casos (ID Registro / Radicado), sub-cotizaciones ligadas, agenda y finanzas al {formatDateCO(today)}.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <button onClick={handleExportarInforme} className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <FileSpreadsheet size={15} color="#16a34a" /> Exportar CSV
          </button>
          <button onClick={triggerPrint} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Printer size={15} /> Imprimir Informe (PDF)
          </button>
        </div>
      </div>

      {/* KPI Cards Rápidas del Día */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem" }}>
        <div className="card" style={{ padding: "0.9rem 1rem", borderLeft: "4px solid #1e3a8a" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Total Casos Activos</div>
          <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "#1e3a8a", marginTop: "0.2rem" }}>
            {reportes.length} <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>casos</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "#0891b2", marginTop: "0.2rem" }}>
            {ordenesFiltradas.length} coinciden con filtros actuales
          </div>
        </div>

        <div className="card" style={{ padding: "0.9rem 1rem", borderLeft: "4px solid #0891b2" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Sub-Cotizaciones Ligadas</div>
          <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "#0891b2", marginTop: "0.2rem" }}>
            {cotizaciones.length} <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>cotizaciones</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Asociadas a expedientes ID Registro
          </div>
        </div>

        <div className="card" style={{ padding: "0.9rem 1rem", borderLeft: "4px solid #16a34a" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Ingresos Registrados</div>
          <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#16a34a", marginTop: "0.2rem" }}>
            {formatCOP(totalIngresosHoy)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Anticipos y cancelaciones recibidas
          </div>
        </div>

        <div className="card" style={{ padding: "0.9rem 1rem", borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Egresos Operativos</div>
          <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#dc2626", marginTop: "0.2rem" }}>
            {formatCOP(totalEgresosHoy)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Materiales, cuadrillas y viáticos
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros por ID Registro, Radicado, Tipo de Trabajo y Estado */}
      <div
        className="card"
        style={{
          padding: "0.85rem 1rem",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          background: "var(--surface)",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 260px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Buscar por ID, Radicado, inmueble, cliente o técnico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2.3rem", fontSize: "0.825rem", height: "36px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Tipo:</span>
          <select
            value={selectedTipoTrabajo}
            onChange={(e) => setSelectedTipoTrabajo(e.target.value)}
            className="select-field"
            style={{ fontSize: "0.8rem", height: "36px" }}
          >
            <option value="todos">Todos los Tipos de Trabajo</option>
            {tiposTrabajoDisponibles.map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Estado:</span>
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="select-field"
            style={{ fontSize: "0.8rem", height: "36px" }}
          >
            <option value="todos">Todos los Estados</option>
            <option value="Cotización Digital">Cotización Digital</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Anticipo">Anticipo</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Visita Especializada">Visita Especializada</option>
            <option value="Se Programa Control de Calidad">Control de Calidad</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Garantía">Garantía / En Garantía</option>
            <option value="Pagado">Pagado</option>
            <option value="Sí Está Facturado">Sí Está Facturado</option>
            <option value="Caso Cancelado">Caso Cancelado</option>
          </select>
        </div>

        {(searchTerm || selectedTipoTrabajo !== "todos" || selectedEstado !== "todos") && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedTipoTrabajo("todos");
              setSelectedEstado("todos");
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.75rem", height: "36px" }}
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.25rem" }}>
        {/* Panel Izquierdo: Casos y Órdenes con Sub-Cotizaciones Ligadas */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Layers size={18} color="var(--primary)" />
              Expedientes de Casos & Cotizaciones Ligadas ({ordenesFiltradas.length})
            </h3>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Matriz ID Registro ↔ ID Cotización
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "600px", overflowY: "auto" }}>
            {ordenesFiltradas.map((r) => {
              const cots = cotizaciones.filter((c) => c.idReporte === r.idRegistro);
              const totalCot = cots.reduce((acc, c) => acc + c.numTodoCosto, 0);
              const actsPendientes = r.agendaActividades?.filter((a) => a.estado === "Programada") || [];

              return (
                <div
                  key={r.idRegistro}
                  style={{
                    padding: "0.85rem",
                    background: "var(--neutral-50, #f8fafc)",
                    borderRadius: "8px",
                    border: "1px solid var(--neutral-200)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.4rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 900, color: "#1e3a8a", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
                          #{r.idRegistro}
                        </span>
                        {r.codigoAlfanumerico && (
                          <span
                            style={{
                              background: "rgba(8,145,178,0.12)",
                              color: "#0891b2",
                              border: "1px solid rgba(8,145,178,0.3)",
                              padding: "0.1rem 0.45rem",
                              borderRadius: "4px",
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                            }}
                          >
                            Rad: {r.codigoAlfanumerico}
                          </span>
                        )}
                        <span
                          style={{
                            background: "#1e3a8a",
                            color: "#fff",
                            padding: "0.1rem 0.45rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                          }}
                        >
                          {r.tipoTrabajo || "Mantenimiento"}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)" }}>
                          {r.direccion}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        Cliente: <strong>{r.clienteNombre}</strong> • Sector: <strong>{r.sector}</strong> • Contrata: <strong>{r.quienContrata || "Inmobiliaria"}</strong>
                      </div>
                    </div>

                    <StatusBadge status={r.estado} size="sm" />
                  </div>

                  {/* Sub-Cotizaciones Ligadas al Caso */}
                  <div
                    style={{
                      background: "var(--surface)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid var(--neutral-200)",
                      fontSize: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                      <span style={{ fontWeight: 700, color: "#0891b2", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <FileText size={13} />
                        Sub-Cotizaciones Ligadas ({cots.length}):
                      </span>
                      <span style={{ fontWeight: 800, color: "var(--text-main)" }}>
                        Total: {formatCOP(totalCot)}
                      </span>
                    </div>

                    {cots.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {cots.map((c) => (
                          <span
                            key={c.idCotizacion}
                            style={{
                              background: "var(--neutral-100, #f1f5f9)",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              fontFamily: "var(--font-mono)",
                              color: "#334155",
                              border: "1px solid var(--neutral-200)",
                            }}
                          >
                            <strong>#{c.idCotizacion}</strong>: {formatCOP(c.numTodoCosto)} ({c.items?.length || 0} ítems)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.7rem" }}>
                        Sin sub-cotizaciones registradas aún bajo este idRegistro.
                      </span>
                    )}
                  </div>

                  {/* Detalle Técnico y Agenda */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.725rem", color: "var(--text-muted)" }}>
                    <div>
                      <span>Téc. Cot: <strong>{r.tecnicoCotizacionNombre || "No asignado"}</strong></span>
                      <span style={{ margin: "0 0.4rem" }}>•</span>
                      <span>Téc. Ejec: <strong>{r.tecnicoEjecucionNombre || r.contratistaNombre || "No asignado"}</strong></span>
                    </div>

                    {actsPendientes.length > 0 && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#0891b2", fontWeight: 700 }}>
                        <Clock size={12} /> {actsPendientes.length} citas pendientes en agenda
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Derecho: Flujo de Caja y Novedades Operativas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Movimientos Financieros */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0 }}>
                Últimos Movimientos Contables
              </h3>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Caja & Bancos
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {movimientosHoy.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.6rem 0.75rem",
                    background: "var(--neutral-50, #f8fafc)",
                    borderRadius: "6px",
                    border: "1px solid var(--neutral-200)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text-main)" }}>{m.concepto}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {m.terceroNombre} • {m.cuenta} • {formatDateCO(m.fecha)}
                    </div>
                  </div>
                  <div
                    className="currency-text"
                    style={{
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      color: m.tipo === "Egreso" ? "#dc2626" : "#16a34a",
                    }}
                  >
                    {m.tipo === "Egreso" ? "-" : "+"}{formatCOP(m.monto)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Control de Llaves Activas */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0 }}>
                Llaves en Préstamo Operativo
              </h3>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                {llaves.filter((k) => k.estado === "Prestada").length} prestadas
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {llaves
                .filter((k) => k.estado === "Prestada")
                .slice(0, 4)
                .map((k) => (
                  <div
                    key={k.id}
                    style={{
                      padding: "0.55rem 0.75rem",
                      background: "rgba(217,119,6,0.06)",
                      border: "1px solid rgba(217,119,6,0.25)",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#b45309" }}>{k.codigo}</strong> • {k.inmueble}
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        En poder de: {k.custodioActual || "Cuadrilla"} ({k.fechaPrestamo ? formatDateCO(k.fechaPrestamo) : "Hoy"})
                      </div>
                    </div>
                    <span style={{ fontSize: "0.68rem", background: "#fef3c7", color: "#b45309", padding: "0.15rem 0.45rem", borderRadius: "4px", fontWeight: 700 }}>
                      Prestada
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NovedadesView: React.FC = () => {
  const { novedades, addNovedad } = useData();
  const { can } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    titulo: "",
    prioridad: "Media" as NovedadReport["prioridad"],
    categoria: "Infraestructura" as NovedadReport["categoria"],
    responsable: "Ing. Pedro Páez",
    estado: "Abierto" as NovedadReport["estado"],
    descripcion: "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.descripcion) return;
    addNovedad(formData);
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <AlertTriangle size={26} color="#d97706" />
            Informe de Novedades & Alertas (tblNovedades)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Registro de imprevistos, incidentes en obra, inconsistencias contables o laborales.
          </p>
        </div>

        {can("create") && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            Reportar Novedad
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {novedades.map((nov) => (
          <div
            key={nov.id}
            className="card"
            style={{
              borderLeft: `4px solid ${
                nov.prioridad === "Urgente" || nov.prioridad === "Alta" ? "#dc2626" : "#d97706"
              }`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  background: nov.prioridad === "Urgente" ? "#fee2e2" : "#fef3c7",
                  color: nov.prioridad === "Urgente" ? "#dc2626" : "#b45309",
                }}
              >
                Prioridad: {nov.prioridad}
              </span>
              <StatusBadge status={nov.estado} size="sm" />
            </div>

            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.35rem" }}>{nov.titulo}</h3>
            <p style={{ fontSize: "0.825rem", color: "var(--neutral-600)", marginBottom: "0.75rem" }}>
              {nov.descripcion}
            </p>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem" }}>
              <div>Responsable: <strong>{nov.responsable}</strong></div>
              <div>Categoría: {nov.categoria} • Fecha: {formatDateCO(nov.fecha)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Reportar Novedad */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reportar Nueva Novedad"
        maxWidth="550px"
        footer={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Guardar Novedad
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label">Título del Suceso *</label>
            <input
              type="text"
              placeholder="Ej: Fuga de agua en tubería empotrada"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Prioridad</label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as NovedadReport["prioridad"] })}
                className="select-field"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value as NovedadReport["categoria"] })}
                className="select-field"
              >
                <option value="Infraestructura">Infraestructura</option>
                <option value="Contable">Contable</option>
                <option value="Personal">Personal</option>
                <option value="Seguridad">Seguridad</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Descripción Detallada *</label>
            <textarea
              rows={3}
              placeholder="Explica qué sucedió y las acciones recomendadas..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="textarea-field"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const EncuestasView: React.FC = () => {
  const { encuestas, addEncuesta, clientes } = useData();
  const { can } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    cliente: clientes[0]?.nombre || "Inversiones Santa María",
    inmueble: "Sede Principal",
    puntuacion: 5,
    comentario: "",
    atendidoPor: "Cuadrilla Técnica",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.comentario) return;
    addEncuesta(formData);
    setIsModalOpen(false);
  };

  const promedio = (encuestas.reduce((acc, e) => acc + e.puntuacion, 0) / (encuestas.length || 1)).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Star size={26} color="#eab308" />
            Encuestas de Satisfacción del Cliente
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Valoración del servicio post-mantenimiento e intervenciones realizadas en inmuebles.
          </p>
        </div>

        {can("create") && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            Registrar Encuesta
          </button>
        )}
      </div>

      {/* Promedio General */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem" }}>
        <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#eab308", fontFamily: "var(--font-mono)" }}>
          {promedio} / 5.0
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Índice de Satisfacción Global</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Basado en {encuestas.length} valoraciones registradas por arrendatarios y propietarios.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
        {encuestas.map((enc) => (
          <div key={enc.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{enc.cliente}</span>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    fill={star <= enc.puntuacion ? "#eab308" : "none"}
                    color={star <= enc.puntuacion ? "#eab308" : "var(--neutral-300)"}
                  />
                ))}
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--neutral-700)", fontStyle: "italic", marginBottom: "0.85rem" }}>
              "{enc.comentario}"
            </p>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem" }}>
              <div>Inmueble: {enc.inmueble}</div>
              <div>Atendido por: {enc.atendidoPor} • {formatDateCO(enc.fecha)}</div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Encuesta de Satisfacción"
        maxWidth="500px"
        footer={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Guardar Valoración
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label">Cliente</label>
            <input
              type="text"
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Puntuación (1 a 5 Estrellas)</label>
            <select
              value={formData.puntuacion}
              onChange={(e) => setFormData({ ...formData, puntuacion: Number(e.target.value) })}
              className="select-field"
            >
              <option value={5}>⭐⭐⭐⭐⭐ 5 Estrellas (Excelente)</option>
              <option value={4}>⭐⭐⭐⭐ 4 Estrellas (Bueno)</option>
              <option value={3}>⭐⭐⭐ 3 Estrellas (Regular)</option>
              <option value={2}>⭐⭐ 2 Estrellas (Deficiente)</option>
              <option value={1}>⭐ 1 Estrella (Pésimo)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Comentario o Testimonio *</label>
            <textarea
              rows={3}
              placeholder="¿Qué opinó el cliente del servicio prestado?"
              value={formData.comentario}
              onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
              className="textarea-field"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
