import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { CuentaCobro, InvoiceStatus } from "../../../types";
import { formatCOP, formatDateCO } from "../../../utils/formatters";
import { exportToCSV, triggerPrint } from "../../../utils/exportUtils";
import { Modal } from "../../common/Modal";
import { StatusBadge } from "../../common/Badge";
import {
  Receipt,
  Plus,
  Search,
  Download,
  Printer,
  CheckCircle,
  Eye,
  FileText,
} from "lucide-react";

export const CuentasCobroView: React.FC = () => {
  const { cuentasCobro, updateCuentaCobroStatus, addCuentaCobro, clientes } = useData();
  const { can } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedCC, setSelectedCC] = useState<CuentaCobro | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    numero: `CC-2024-09${cuentasCobro.length + 1}`,
    clienteNombre: clientes[0]?.nombre || "Inversiones Santa María",
    clienteNit: clientes[0]?.documento || "900789456-2",
    fecha: new Date().toISOString().slice(0, 10),
    fechaVencimiento: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    concepto: "",
    valorBruto: 0,
    retencionFuente: 0,
    iva: 0,
    estado: "Pendiente" as InvoiceStatus,
  });

  const handleBrutoChange = (bruto: number) => {
    const rete = Math.round(bruto * 0.04); // Retención estándar 4% servicios
    setFormData((prev) => ({
      ...prev,
      valorBruto: bruto,
      retencionFuente: rete,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.concepto || formData.valorBruto <= 0) {
      alert("Indica un concepto y valor bruto válido.");
      return;
    }

    const valorNeto = formData.valorBruto - formData.retencionFuente + formData.iva;

    addCuentaCobro({
      ...formData,
      valorNeto,
      responsable: "Ing. Pedro Páez",
    });
    setIsCreateModalOpen(false);
  };

  const handleOpenPrint = (cc: CuentaCobro) => {
    setSelectedCC(cc);
    setIsPrintModalOpen(true);
  };

  const handleMarkPaid = (id: string) => {
    if (window.confirm("¿Confirmar que esta cuenta de cobro fue pagada en su totalidad?")) {
      updateCuentaCobroStatus(id, "Pagada");
    }
  };

  const filtered = cuentasCobro.filter((c) => {
    const matchesSearch =
      c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.concepto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = selectedEstado === "todos" || c.estado === selectedEstado;
    return matchesSearch && matchesEstado;
  });

  const totalPorCobrar = filtered
    .filter((c) => c.estado === "Pendiente")
    .reduce((acc, c) => acc + c.valorNeto, 0);

  const handleExport = () => {
    exportToCSV(filtered, "Cuentas_Cobro_tblCuentasCobro", [
      { key: "numero", label: "No. Cuenta Cobro" },
      { key: "fecha", label: "Fecha Emisión" },
      { key: "fechaVencimiento", label: "Fecha Vencimiento" },
      { key: "clienteNombre", label: "Cliente" },
      { key: "clienteNit", label: "NIT Cliente" },
      { key: "concepto", label: "Concepto" },
      { key: "valorBruto", label: "Valor Bruto" },
      { key: "retencionFuente", label: "Retención Fuente (4%)" },
      { key: "valorNeto", label: "Valor Neto a Pagar" },
      { key: "estado", label: "Estado" },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Receipt size={26} color="var(--primary)" />
            Cuentas de Cobro & Facturación (tblCuentasCobro)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Control de cuentas de cobro emitidas con retenciones tributarias colombianas e impresión oficial.
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
            <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={16} />
              Nueva Cuenta de Cobro
            </button>
          )}
        </div>
      </div>

      {/* Buscador & Total Pendiente */}
      <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "280px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
            <input
              type="text"
              placeholder="Buscar por número, cliente o concepto..."
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
            <option value="Pendiente">Solo Pendientes</option>
            <option value="Pagada">Solo Pagadas</option>
            <option value="Anulada">Anuladas</option>
          </select>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Total Pendiente de Pago
          </div>
          <div className="currency-text" style={{ fontSize: "1.2rem", fontWeight: 800, color: "#d97706" }}>
            {formatCOP(totalPorCobrar)}
          </div>
        </div>
      </div>

      {/* Tabla de Cuentas */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Cuenta</th>
              <th>Fecha / Vence</th>
              <th>Cliente & NIT</th>
              <th>Concepto</th>
              <th>Valor Bruto</th>
              <th>Retefuente (4%)</th>
              <th>Valor Neto</th>
              <th>Estado</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No se encontraron cuentas de cobro registradas.
                </td>
              </tr>
            ) : (
              filtered.map((cc) => (
                <tr key={cc.id}>
                  <td style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--primary)" }}>
                    {cc.numero}
                  </td>
                  <td style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    <div>{formatDateCO(cc.fecha)}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Vence: {formatDateCO(cc.fechaVencimiento)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{cc.clienteNombre}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>NIT {cc.clienteNit}</div>
                  </td>
                  <td style={{ fontSize: "0.8rem", maxWidth: "240px" }}>{cc.concepto}</td>
                  <td className="currency-text">{formatCOP(cc.valorBruto)}</td>
                  <td className="currency-text" style={{ color: "#dc2626" }}>-{formatCOP(cc.retencionFuente)}</td>
                  <td className="currency-text" style={{ fontWeight: 800, color: "var(--text-main)" }}>
                    {formatCOP(cc.valorNeto)}
                  </td>
                  <td>
                    <StatusBadge status={cc.estado} size="sm" />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                      <button
                        onClick={() => handleOpenPrint(cc)}
                        className="btn btn-secondary btn-sm"
                        title="Ver Documento Imprimible"
                        style={{ padding: "0.25rem 0.5rem" }}
                      >
                        <Printer size={13} /> Formato
                      </button>

                      {cc.estado === "Pendiente" && can("edit") && (
                        <button
                          onClick={() => handleMarkPaid(cc.id)}
                          className="btn btn-success btn-sm"
                          title="Marcar como Pagada"
                          style={{ padding: "0.25rem 0.5rem" }}
                        >
                          <CheckCircle size={13} /> Pagada
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

      {/* Modal Crear Cuenta de Cobro */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Cuenta de Cobro"
        maxWidth="620px"
        footer={
          <>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Generar Cuenta de Cobro
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Número Consecutivo *</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Cliente / Entidad a Cobrar</label>
              <select
                value={formData.clienteNombre}
                onChange={(e) => {
                  const sel = clientes.find((cli) => cli.nombre === e.target.value);
                  setFormData({
                    ...formData,
                    clienteNombre: e.target.value,
                    clienteNit: sel ? sel.documento : formData.clienteNit,
                  });
                }}
                className="select-field"
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre} (NIT {c.documento})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Fecha Emisión</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Fecha Vencimiento</label>
              <input
                type="date"
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Concepto del Cobro *</label>
            <textarea
              rows={2}
              placeholder="Ej: Servicios profesionales de mantenimiento locativo..."
              value={formData.concepto}
              onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
              className="textarea-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr", gap: "0.75rem" }}>
            <div className="input-group">
              <label className="input-label">Valor Bruto (COP) *</label>
              <input
                type="number"
                placeholder="Ej: 2000000"
                value={formData.valorBruto}
                onChange={(e) => handleBrutoChange(Number(e.target.value))}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Retefuente (4%)</label>
              <input
                type="number"
                value={formData.retencionFuente}
                onChange={(e) => setFormData({ ...formData, retencionFuente: Number(e.target.value) })}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Valor Neto Calculado</label>
              <div
                style={{
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 0.85rem",
                  background: "rgba(5, 150, 105, 0.1)",
                  color: "#059669",
                  fontWeight: 800,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatCOP(formData.valorBruto - formData.retencionFuente + formData.iva)}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal / Formato Imprimible de Cuenta de Cobro (Colombiana) */}
      {selectedCC && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`Vista Oficial - Cuenta de Cobro #${selectedCC.numero}`}
          maxWidth="700px"
          footer={
            <>
              <button onClick={triggerPrint} className="btn btn-primary">
                <Printer size={15} /> Imprimir / Guardar PDF
              </button>
              <button onClick={() => setIsPrintModalOpen(false)} className="btn btn-secondary">
                Cerrar
              </button>
            </>
          }
        >
          <div
            style={{
              padding: "1.5rem",
              background: "#ffffff",
              border: "1px solid var(--neutral-300)",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-sans)",
              color: "#000000",
            }}
          >
            {/* Encabezado */}
            <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                CUENTA DE COBRO
              </h2>
              <div style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: "0.25rem" }}>
                N° {selectedCC.numero}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "0.2rem" }}>
                Ciudad y Fecha: Medellín, {formatDateCO(selectedCC.fecha)}
              </div>
            </div>

            {/* Datos del Deudor */}
            <div style={{ marginBottom: "1.25rem", fontSize: "0.875rem", lineHeight: 1.6 }}>
              <div><strong>DEBE A:</strong> {selectedCC.responsable}</div>
              <div><strong>C.C. / NIT:</strong> 71.234.567 de Medellín</div>
              <div style={{ marginTop: "0.5rem" }}><strong>CLIENTE (DEUDOR):</strong> {selectedCC.clienteNombre}</div>
              <div><strong>NIT:</strong> {selectedCC.clienteNit}</div>
            </div>

            {/* Concepto */}
            <div style={{ marginBottom: "1.25rem", padding: "1rem", background: "#f9f9f9", borderRadius: "6px", border: "1px solid #eee" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#666", marginBottom: "0.25rem" }}>
                POR CONCEPTO DE:
              </div>
              <div style={{ fontSize: "0.9rem" }}>{selectedCC.concepto}</div>
            </div>

            {/* Liquidación Monetaria */}
            <div style={{ marginBottom: "1.5rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "0.5rem 0" }}>Valor de los Servicios (Bruto):</td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {formatCOP(selectedCC.valorBruto)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "0.5rem 0" }}>Menos Retención en la Fuente (4%):</td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: "#dc2626" }}>
                      -{formatCOP(selectedCC.retencionFuente)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "2px solid #000", fontSize: "1.05rem", fontWeight: 800 }}>
                    <td style={{ padding: "0.75rem 0" }}>TOTAL NETO A PAGAR:</td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: "#1e3a8a" }}>
                      {formatCOP(selectedCC.valorNeto)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Declaración y Firma */}
            <div style={{ fontSize: "0.75rem", color: "#555", marginTop: "1rem", lineHeight: 1.4 }}>
              Manifiesto bajo la gravedad de juramento que no soy responsable del impuesto sobre las ventas (IVA) y que cumplo con los requisitos del Régimen Simplificado (No responsable de IVA según Art. 437 E.T.).
            </div>

            <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ borderTop: "1px solid #000", width: "240px", paddingTop: "0.35rem", textAlign: "center", fontSize: "0.8rem" }}>
                <strong>Firma del Prestador</strong>
                <div>C.C. 71.234.567</div>
              </div>

              <div style={{ borderTop: "1px solid #000", width: "240px", paddingTop: "0.35rem", textAlign: "center", fontSize: "0.8rem" }}>
                <strong>Firma Recibido / Aprobado</strong>
                <div>{selectedCC.clienteNombre}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
