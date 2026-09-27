import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { Movement, MovementType, MovementStatus } from "../../../types";
import { formatCOP, formatDateCO } from "../../../utils/formatters";
import { exportToCSV } from "../../../utils/exportUtils";
import { Modal } from "../../common/Modal";
import { StatusBadge } from "../../common/Badge";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Trash2,
  FileCheck,
  Receipt,
  Calendar,
} from "lucide-react";

interface MovimientosViewProps {
  initialType?: MovementType;
}

export const MovimientosView: React.FC<MovimientosViewProps> = ({ initialType = "Egreso" }) => {
  const { movements, contractors, addMovement, updateMovementStatus, deleteMovement } = useData();
  const { can } = useAuth();

  const [activeType, setActiveType] = useState<MovementType>(initialType);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    concepto: "",
    monto: 0,
    cuenta: activeType === "Ingreso" ? "C Ingreso Bancolombia" : "C Egresos Materiales",
    terceroId: contractors[0]?.id || "",
    comprobanteNumero: `CMP-${Date.now().toString().slice(-4)}`,
    estado: "Borrador" as MovementStatus,
    observaciones: "",
  });

  const handleOpenCreate = () => {
    setFormData({
      fecha: new Date().toISOString().slice(0, 10),
      concepto: "",
      monto: 0,
      cuenta: activeType === "Ingreso" ? "C Ingreso Bancolombia" : "C Egresos Materiales",
      terceroId: contractors[0]?.id || "",
      comprobanteNumero: `CMP-${Date.now().toString().slice(-4)}`,
      estado: "Borrador",
      observaciones: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.concepto || formData.monto <= 0) {
      alert("Por favor indica un concepto válido y un monto mayor a cero.");
      return;
    }

    const selTercero = contractors.find((c) => c.id === formData.terceroId);

    addMovement({
      tipo: activeType,
      fecha: formData.fecha,
      concepto: formData.concepto,
      monto: Number(formData.monto),
      cuenta: formData.cuenta,
      terceroNombre: selTercero ? selTercero.nombre : "Varios",
      terceroNit: selTercero ? selTercero.nit : "222222222",
      responsable: "Ing. Pedro Páez",
      comprobanteNumero: formData.comprobanteNumero,
      estado: formData.estado,
      observaciones: formData.observaciones,
    });
    setIsModalOpen(false);
  };

  const handleAdvanceStatus = (id: string, currentStatus: MovementStatus) => {
    if (currentStatus === "Borrador") {
      updateMovementStatus(id, "Registrado");
    } else if (currentStatus === "Registrado") {
      if (can("reconcile")) {
        updateMovementStatus(id, "Conciliado");
      } else {
        alert("Solo roles con permiso de conciliación contable (Admin / Contable) pueden conciliar.");
      }
    }
  };

  const handleDelete = (id: string, concepto: string) => {
    if (window.confirm(`¿Eliminar movimiento contable "${concepto}"?`)) {
      deleteMovement(id);
    }
  };

  const filtered = movements.filter((m) => {
    const matchesType = m.tipo === activeType;
    const matchesSearch =
      m.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.terceroNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.comprobanteNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cuenta.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = selectedEstado === "todos" || m.estado === selectedEstado;
    return matchesType && matchesSearch && matchesEstado;
  });

  const totalMonto = filtered.reduce((acc, m) => acc + m.monto, 0);

  const handleExport = () => {
    exportToCSV(filtered, `Movimientos_Contables_${activeType}_tblEgresos`, [
      { key: "comprobanteNumero", label: "No. Comprobante" },
      { key: "fecha", label: "Fecha" },
      { key: "cuenta", label: "Cuenta Contable" },
      { key: "terceroNombre", label: "Tercero / Contratista" },
      { key: "terceroNit", label: "NIT" },
      { key: "concepto", label: "Concepto" },
      { key: "monto", label: "Monto (COP)" },
      { key: "estado", label: "Estado" },
      { key: "observaciones", label: "Observaciones" },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header con pestañas de Ingresos / Egresos */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {activeType === "Egreso" ? (
              <TrendingDown size={26} color="#dc2626" />
            ) : (
              <TrendingUp size={26} color="#059669" />
            )}
            Módulo Contable: {activeType === "Egreso" ? "C Egresos (tblEgresos)" : "C Ingresos (Recibos de Caja)"}
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Registro financiero, control de estados (Borrador → Registrado → Conciliado) y conciliación bancaria.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {can("export") && (
            <button onClick={handleExport} className="btn btn-secondary btn-sm">
              <Download size={15} />
              Exportar CSV
            </button>
          )}

          {can("create") && (
            <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
              <Plus size={16} />
              Registrar {activeType}
            </button>
          )}
        </div>
      </div>

      {/* Switcher de Tipo & Filtros */}
      <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={() => setActiveType("Egreso")}
            className={`btn btn-sm ${activeType === "Egreso" ? "btn-primary" : "btn-secondary"}`}
            style={{
              background: activeType === "Egreso" ? "#dc2626" : undefined,
              borderColor: activeType === "Egreso" ? "#dc2626" : undefined,
            }}
          >
            <TrendingDown size={14} /> Egresos (tblEgresos)
          </button>
          <button
            onClick={() => setActiveType("Ingreso")}
            className={`btn btn-sm ${activeType === "Ingreso" ? "btn-primary" : "btn-secondary"}`}
            style={{
              background: activeType === "Ingreso" ? "#059669" : undefined,
              borderColor: activeType === "Ingreso" ? "#059669" : undefined,
            }}
          >
            <TrendingUp size={14} /> Ingresos (Recibos)
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, maxWidth: "420px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
            <input
              type="text"
              placeholder="Buscar concepto, tercero, comprobante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.1rem" }}
            />
          </div>

          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="select-field"
            style={{ width: "auto" }}
          >
            <option value="todos">Todos los Estados</option>
            <option value="Borrador">Borrador</option>
            <option value="Registrado">Registrado</option>
            <option value="Conciliado">Conciliado</option>
          </select>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Total Filtrado
          </div>
          <div className="currency-text" style={{ fontSize: "1.2rem", fontWeight: 800, color: activeType === "Egreso" ? "#dc2626" : "#059669" }}>
            {formatCOP(totalMonto)}
          </div>
        </div>
      </div>

      {/* Tabla de Movimientos Responsiva */}
      <div className="table-card">
        <div className="table-responsive-wrapper">
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px" }}>
          <thead>
            <tr>
              <th style={{ minWidth: "120px" }}>Comprobante</th>
              <th style={{ minWidth: "110px" }}>Fecha</th>
              <th style={{ minWidth: "160px" }}>Cuenta Contable</th>
              <th style={{ minWidth: "220px" }}>Concepto</th>
              <th style={{ minWidth: "180px" }}>Tercero / Contratista</th>
              <th style={{ minWidth: "130px" }}>Monto</th>
              <th style={{ minWidth: "95px" }}>Estado</th>
              <th className="table-actions-sticky" style={{ textAlign: "right", minWidth: "130px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No se encontraron movimientos registrados en esta vista.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="badge-order-id" style={{ cursor: "default" }}>
                      {m.comprobanteNumero}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.785rem", whiteSpace: "nowrap" }}>{formatDateCO(m.fecha)}</td>
                  <td>
                    <span style={{ fontSize: "0.785rem", fontWeight: 600, color: "var(--neutral-700)" }}>{m.cuenta}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{m.concepto}</div>
                    {m.observaciones && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{m.observaciones}</div>}
                  </td>
                  <td>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{m.terceroNombre}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>NIT {m.terceroNit}</div>
                  </td>
                  <td className="currency-text" style={{ fontWeight: 800, color: m.tipo === "Egreso" ? "#dc2626" : "#059669" }}>
                    {formatCOP(m.monto)}
                  </td>
                  <td>
                    <StatusBadge status={m.estado} size="sm" />
                  </td>
                  <td className="table-actions-sticky" style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.35rem" }}>
                      {m.estado !== "Conciliado" && can("edit") && (
                        <button
                          onClick={() => handleAdvanceStatus(m.id, m.estado)}
                          className="btn btn-secondary btn-sm"
                          title={m.estado === "Borrador" ? "Avanzar a Registrado" : "Conciliar con banco"}
                          style={{ fontSize: "0.72rem", padding: "0.25rem 0.5rem", whiteSpace: "nowrap" }}
                        >
                          <CheckCircle2 size={13} color={m.estado === "Borrador" ? "#3b82f6" : "#059669"} />
                          {m.estado === "Borrador" ? "Registrar" : "Conciliar"}
                        </button>
                      )}

                      {can("delete") && (
                        <button
                          onClick={() => handleDelete(m.id, m.concepto)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: "0.25rem 0.45rem" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Footer elegante para rematar la tarjeta sin cortes abruptos */}
        <div className="table-footer-bar">
          <span>
            Mostrando <strong>{filtered.length}</strong> de <strong>{movements.length}</strong> asientos contables
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            Libro Contable Sincronizado
          </span>
        </div>
      </div>

      {/* Modal Registrar Movimiento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        badge={activeType}
        title={`Registrar Nuevo ${activeType}`}
        subtitle={`Asiento contable para ${activeType === "Egreso" ? "egresos operativos y compras" : "ingresos y cobros"}`}
        maxWidth="620px"
        footer={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Guardar {activeType}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Fecha del Movimiento *</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">No. Comprobante *</label>
              <input
                type="text"
                value={formData.comprobanteNumero}
                onChange={(e) => setFormData({ ...formData, comprobanteNumero: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Concepto Contable *</label>
            <input
              type="text"
              placeholder="Ej: Pago de materiales orden #1001 o Pago de anticipo"
              value={formData.concepto}
              onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Monto en Pesos Colombianos (COP) *</label>
              <input
                type="number"
                placeholder="Ej: 500000"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Cuenta Destino / Origen</label>
              <select
                value={formData.cuenta}
                onChange={(e) => setFormData({ ...formData, cuenta: e.target.value })}
                className="select-field"
              >
                {activeType === "Egreso" ? (
                  <>
                    <option value="C Egresos Materiales">C Egresos Materiales</option>
                    <option value="C Egresos Contratistas">C Egresos Contratistas</option>
                    <option value="C Egresos Transporte">C Egresos Transporte</option>
                    <option value="C Egresos Administrativos">C Egresos Administrativos</option>
                  </>
                ) : (
                  <>
                    <option value="C Ingreso Bancolombia">C Ingreso Bancolombia</option>
                    <option value="C Ingreso Banco Bogotá">C Ingreso Banco Bogotá</option>
                    <option value="C Ingreso Caja Menor">C Ingreso Caja Menor</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Tercero Asociado</label>
              <select
                value={formData.terceroId}
                onChange={(e) => setFormData({ ...formData, terceroId: e.target.value })}
                className="select-field"
              >
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} (NIT {c.nit})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Estado Inicial</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as MovementStatus })}
                className="select-field"
              >
                <option value="Borrador">Borrador</option>
                <option value="Registrado">Registrado</option>
                <option value="Conciliado">Conciliado</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Observaciones / Soporte</label>
            <input
              type="text"
              placeholder="Número de factura o referencia de consignación..."
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="input-field"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
