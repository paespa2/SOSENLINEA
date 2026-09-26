import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { Cotizacion, CotizacionItem } from "../../../types";
import { formatCOP, formatDateCO } from "../../../utils/formatters";
import { exportToCSV, triggerPrint } from "../../../utils/exportUtils";
import { Modal } from "../../common/Modal";
import { StatusBadge } from "../../common/Badge";
import {
  Calculator,
  Plus,
  Search,
  Download,
  Printer,
  CheckCircle,
  Eye,
  Building,
  Package,
  Truck,
  Hammer,
} from "lucide-react";

export const CotizacionesView: React.FC = () => {
  const { cotizaciones, updateCotizacion } = useData();
  const { can } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCot, setSelectedCot] = useState<Cotizacion | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenDetail = (cot: Cotizacion) => {
    setSelectedCot(cot);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (id: number) => {
    if (window.confirm(`¿Aprobar formalmente la cotización #${id}?`)) {
      updateCotizacion(id, { estado: "Aprobada" });
      if (selectedCot && selectedCot.idCotizacion === id) {
        setSelectedCot({ ...selectedCot, estado: "Aprobada" });
      }
    }
  };

  const filtered = cotizaciones.filter((c) => {
    return (
      c.reporteDireccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contratistaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(c.idCotizacion).includes(searchTerm)
    );
  });

  const handleExport = () => {
    exportToCSV(filtered, "Presupuestos_Cotizaciones_tblCotizacion", [
      { key: "idCotizacion", label: "No. Cotización" },
      { key: "idReporte", label: "Orden Asociada" },
      { key: "fecha", label: "Fecha" },
      { key: "clienteNombre", label: "Cliente" },
      { key: "reporteDireccion", label: "Inmueble" },
      { key: "contratistaNombre", label: "Contratista" },
      { key: "numMaterial", label: "Costo Materiales" },
      { key: "numManoObra", label: "Costo Mano de Obra" },
      { key: "numTransporte", label: "Transporte" },
      { key: "numTodoCosto", label: "Total Todo Costo" },
      { key: "estado", label: "Estado" },
      { key: "diasGarantia", label: "Días Garantía" },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Calculator size={26} color="var(--primary)" />
            Cotizaciones & Presupuestos (tblCotizacion)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Consolidado unificado de presupuestos con desglose de materiales, mano de obra y transporte.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {can("export") && (
            <button onClick={handleExport} className="btn btn-secondary btn-sm">
              <Download size={15} />
              Exportar CSV
            </button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "relative", width: "380px" }}>
          <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
          <input
            type="text"
            placeholder="Buscar por cotización, dirección, cliente o contratista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2.2rem" }}
          />
        </div>

        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
          {filtered.length} cotizaciones registradas
        </div>
      </div>

      {/* Grid de Cotizaciones */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.25rem" }}>
        {filtered.map((cot) => (
          <div key={cot.idCotizacion} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div>
                  <span style={{ fontSize: "0.725rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Cotización #{cot.idCotizacion} (Orden #{cot.idReporte})
                  </span>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)" }}>
                    {cot.reporteDireccion}
                  </div>
                </div>
                <StatusBadge status={cot.estado} size="sm" />
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                <div>Cliente: <strong style={{ color: "var(--text-main)" }}>{cot.clienteNombre}</strong></div>
                <div>Contratista: <strong>{cot.contratistaNombre}</strong></div>
                <div>Garantía: <strong>{cot.diasGarantia} días</strong></div>
              </div>

              {/* Desglose de Costos */}
              <div style={{ background: "var(--neutral-50)", padding: "0.85rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.785rem", marginBottom: "0.35rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--neutral-600)" }}>
                    <Package size={13} /> Materiales:
                  </span>
                  <span className="currency-text">{formatCOP(cot.numMaterial)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.785rem", marginBottom: "0.35rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--neutral-600)" }}>
                    <Hammer size={13} /> Mano de Obra:
                  </span>
                  <span className="currency-text">{formatCOP(cot.numManoObra)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.785rem", marginBottom: "0.35rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--neutral-600)" }}>
                    <Truck size={13} /> Transporte:
                  </span>
                  <span className="currency-text">{formatCOP(cot.numTransporte)}</span>
                </div>

                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.45rem", marginTop: "0.45rem", display: "flex", justifyContent: "space-between", fontSize: "0.95rem", fontWeight: 800 }}>
                  <span>Total Todo Costo:</span>
                  <span className="currency-text" style={{ color: "var(--primary)" }}>{formatCOP(cot.numTodoCosto)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem" }}>
              <span style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>{formatDateCO(cot.fecha)}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => handleOpenDetail(cot)} className="btn btn-secondary btn-sm">
                  <Eye size={14} /> Ver Ítems
                </button>
                {cot.estado === "Borrador" && can("edit") && (
                  <button onClick={() => handleApprove(cot.idCotizacion)} className="btn btn-success btn-sm">
                    <CheckCircle size={14} /> Aprobar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detalle de Cotización */}
      {selectedCot && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detalle Cotización #${selectedCot.idCotizacion}`}
          maxWidth="750px"
          footer={
            <>
              <button onClick={triggerPrint} className="btn btn-secondary btn-sm">
                <Printer size={15} /> Imprimir / PDF
              </button>
              <button onClick={() => setIsDetailModalOpen(false)} className="btn btn-primary btn-sm">
                Cerrar
              </button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", background: "var(--neutral-50)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Inmueble & Obra:</div>
                <div style={{ fontWeight: 800, fontSize: "1rem" }}>{selectedCot.reporteDireccion}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cliente: {selectedCot.clienteNombre}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Presupuestado:</div>
                <div className="currency-text" style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)" }}>
                  {formatCOP(selectedCot.numTodoCosto)}
                </div>
                <StatusBadge status={selectedCot.estado} size="sm" />
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Ítems y Materiales Presupuestados (tblDesCotizacion)
              </h4>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Ambiente</th>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                      <th>Valor Unitario</th>
                      <th style={{ textAlign: "right" }}>Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCot.items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.descripcion}</td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.ambiente || "General"}</td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{item.cantidad}</td>
                        <td>{item.unidad}</td>
                        <td className="currency-text">{formatCOP(item.valorUnitario)}</td>
                        <td className="currency-text" style={{ textAlign: "right", fontWeight: 700 }}>
                          {formatCOP(item.valorTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--neutral-50)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
              <strong>Observaciones:</strong> {selectedCot.observaciones}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
