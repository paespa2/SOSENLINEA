import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { formatCOP, formatDateCO } from "../../../utils/formatters";
import { triggerPrint } from "../../../utils/exportUtils";
import { Printer, FileText, Key, Receipt, Search, Building2, User, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

export const ImpresionesView: React.FC = () => {
  const { reportes, cuentasCobro, llaves, contractors, movements } = useData();
  const [selectedDoc, setSelectedDoc] = useState<"orden" | "cuenta" | "llaves" | "egreso">("orden");
  const [selectedId, setSelectedId] = useState<string>("");

  // Egresos del movimiento
  const egresos = movements.filter((m) => m.tipo === "Egreso");

  // Registro activo según el tipo de documento seleccionado
  const activeOrden = selectedDoc === "orden"
    ? (reportes.find((r) => String(r.idRegistro) === selectedId) || reportes[0])
    : undefined;

  const activeCuenta = selectedDoc === "cuenta"
    ? (cuentasCobro.find((c) => c.id === selectedId) || cuentasCobro[0])
    : undefined;

  const activeLlave = selectedDoc === "llaves"
    ? (llaves.find((l) => l.id === selectedId) || llaves[0])
    : undefined;

  const activeEgreso = selectedDoc === "egreso"
    ? (egresos.find((e) => e.id === selectedId) || egresos[0])
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Printer size={26} color="var(--primary)" />
            Centro de Impresiones & Documentos Oficiales
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Generación de formatos ejecutivos, actas de entrega, órdenes y comprobantes listos para imprimir o exportar a PDF.
          </p>
        </div>

        <button onClick={triggerPrint} className="btn btn-primary btn-sm">
          <Printer size={15} /> Imprimir Documento Activo
        </button>
      </div>

      {/* Selector de Tipo de Documento y Selector de Registro */}
      <div className="card no-print" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.85rem" }}>
          <button
            onClick={() => { setSelectedDoc("orden"); setSelectedId(""); }}
            className={`btn btn-sm ${selectedDoc === "orden" ? "btn-primary" : "btn-secondary"}`}
          >
            <FileText size={15} /> Orden de Trabajo ({reportes.length})
          </button>
          <button
            onClick={() => { setSelectedDoc("cuenta"); setSelectedId(""); }}
            className={`btn btn-sm ${selectedDoc === "cuenta" ? "btn-primary" : "btn-secondary"}`}
          >
            <Receipt size={15} /> Cuenta de Cobro ({cuentasCobro.length})
          </button>
          <button
            onClick={() => { setSelectedDoc("llaves"); setSelectedId(""); }}
            className={`btn btn-sm ${selectedDoc === "llaves" ? "btn-primary" : "btn-secondary"}`}
          >
            <Key size={15} /> Acta de Llaves ({llaves.length})
          </button>
          <button
            onClick={() => { setSelectedDoc("egreso"); setSelectedId(""); }}
            className={`btn btn-sm ${selectedDoc === "egreso" ? "btn-primary" : "btn-secondary"}`}
          >
            <Receipt size={15} /> Comprobante Egreso ({egresos.length})
          </button>
        </div>

        {/* Dropdown de selección de registro concreto */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Search size={15} color="var(--primary)" />
            Seleccionar Registro:
          </label>

          {selectedDoc === "orden" && (
            <select
              value={activeOrden ? String(activeOrden.idRegistro) : ""}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ padding: "0.45rem 0.85rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem", flex: "1 1 280px", maxWidth: "100%", background: "var(--bg-card)", color: "var(--text-main)" }}
            >
              {reportes.map((r) => (
                <option key={r.idRegistro} value={String(r.idRegistro)}>
                  Orden #{r.idRegistro} — {r.direccion} ({r.clienteNombre || "Cliente"}) — {r.estado}
                </option>
              ))}
            </select>
          )}

          {selectedDoc === "cuenta" && (
            <select
              value={activeCuenta ? activeCuenta.id : ""}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ padding: "0.45rem 0.85rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem", flex: "1 1 280px", maxWidth: "100%", background: "var(--bg-card)", color: "var(--text-main)" }}
            >
              {cuentasCobro.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numero} — {c.clienteNombre} — {formatCOP(c.valorNeto)} ({c.estado})
                </option>
              ))}
            </select>
          )}

          {selectedDoc === "llaves" && (
            <select
              value={activeLlave ? activeLlave.id : ""}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ padding: "0.45rem 0.85rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem", flex: "1 1 280px", maxWidth: "100%", background: "var(--bg-card)", color: "var(--text-main)" }}
            >
              {llaves.map((l) => (
                <option key={l.id} value={l.id}>
                  Llave #{l.codigo} — {l.inmueble} ({l.custodioActual || "Sin custodio"})
                </option>
              ))}
            </select>
          )}

          {selectedDoc === "egreso" && (
            <select
              value={activeEgreso ? activeEgreso.id : ""}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ padding: "0.45rem 0.85rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem", flex: "1 1 280px", maxWidth: "100%", background: "var(--bg-card)", color: "var(--text-main)" }}
            >
              {egresos.map((e) => (
                <option key={e.id} value={e.id}>
                  Egreso {e.id} — {e.concepto} — {formatCOP(e.monto)} ({e.responsable})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Vista Previa del Documento en Papel Blanco (Formato Ejecutivo) */}
      <div
        className="printable-document"
        style={{
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          padding: "3rem 3.5rem",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          maxWidth: "860px",
          margin: "0 auto",
          width: "100%",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Cabecera Corporativa */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #1e3a8a", paddingBottom: "1.25rem", marginBottom: "1.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 900, color: "#1e3a8a", letterSpacing: "-0.02em", margin: 0 }}>
              SOSENLINEA S.A.S.
            </h2>
            <div style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginTop: "0.2rem" }}>
              NIT: 900.887.654-3 • Régimen Responsable de IVA
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Medellín, Antioquia • Tel: (604) 444-1234
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
              operaciones@sosenlinea.co • www.sosenlinea.co
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              DOCUMENTO OFICIAL DEL SISTEMA
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#1e3a8a", fontFamily: "var(--font-mono)", marginTop: "0.2rem" }}>
              {selectedDoc === "orden" && `ORDEN DE TRABAJO #${activeOrden?.idRegistro || 1001}`}
              {selectedDoc === "cuenta" && (activeCuenta?.numero || "CUENTA DE COBRO")}
              {selectedDoc === "llaves" && `ACTA DE CUSTODIA #ACT-${activeLlave?.codigo || "01"}`}
              {selectedDoc === "egreso" && `COMPROBANTE EGRESO #${activeEgreso?.id || "001"}`}
            </div>
            <div style={{ fontSize: "0.825rem", color: "#475569", marginTop: "0.3rem" }}>
              <strong>Fecha de Emisión:</strong> {formatDateCO(new Date())}
            </div>
          </div>
        </div>

        {/* 1. DOCUMENTO: ORDEN DE TRABAJO */}
        {selectedDoc === "orden" && activeOrden && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div>
                <div style={{ fontSize: "0.725rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Inmueble / Ubicación:</div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a" }}>{activeOrden.direccion}</div>
                <div style={{ fontSize: "0.825rem", color: "#475569" }}>Sector / Zona: {activeOrden.sector || "Urbano"}</div>
                {activeOrden.arrendatario && (
                  <div style={{ fontSize: "0.825rem", color: "#475569", marginTop: "0.25rem" }}>
                    <strong>Arrendatario:</strong> {activeOrden.arrendatario}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: "0.725rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Cliente / Contratante:</div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a" }}>{activeOrden.clienteNombre || "Cliente General"}</div>
                <div style={{ fontSize: "0.825rem", color: "#475569" }}>
                  <strong>Propietario:</strong> {activeOrden.propietario || "No especificado"}
                </div>
                <div style={{ fontSize: "0.825rem", color: "#475569", marginTop: "0.25rem" }}>
                  <strong>Estado Operativo:</strong> <span style={{ fontWeight: 800, color: "#1e3a8a" }}>{activeOrden.estado}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem" }}>
                Descripción de los Trabajos y Requerimientos Locativos
              </h4>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#334155", background: "#fdfdfd", padding: "0.75rem", border: "1px solid #f1f5f9", borderRadius: "6px" }}>
                {activeOrden.reporte || "Sin observaciones registradas en el reporte original."}
              </p>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem", color: "#1e3a8a" }}>
                Asignación de Contratista & Valor Autorizado
              </h4>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", textAlign: "left", color: "#475569" }}>
                    <th style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #cbd5e1" }}>Contratista Ejecutor</th>
                    <th style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #cbd5e1" }}>Identificación / NIT</th>
                    <th style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #cbd5e1", textAlign: "right" }}>Valor Autorizado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "0.75rem", fontWeight: 700, borderBottom: "1px solid #e2e8f0" }}>
                      {activeOrden.contratistaNombre || "Por Asignar"}
                    </td>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>
                      {activeOrden.idContratista || "N/A"}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>
                      {formatCOP(activeOrden.totalCotizacion || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {activeOrden.reporte && (
              <div style={{ marginBottom: "1.5rem", fontSize: "0.825rem", color: "#475569" }}>
                <strong>Detalle / Descripción Operativa:</strong> {activeOrden.reporte}
              </div>
            )}
          </div>
        )}

        {/* 2. DOCUMENTO: CUENTA DE COBRO */}
        {selectedDoc === "cuenta" && activeCuenta && (
          <div>
            <div style={{ marginBottom: "1.5rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                <strong>DEUDOR:</strong> {activeCuenta.clienteNombre}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#475569", marginBottom: "0.75rem" }}>
                <strong>FECHA VIGENCIA:</strong> {formatDateCO(activeCuenta.fecha)}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.5, background: "#ffffff", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <strong>CONCEPTO:</strong> {activeCuenta.concepto || "Prestación de servicios de mantenimiento locativo y reparaciones."}
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                  <th style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #cbd5e1" }}>Concepto / Rubro</th>
                  <th style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #cbd5e1", textAlign: "right" }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #e2e8f0" }}>Valor Subtotal / Honorarios Brutos</td>
                  <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontFamily: "var(--font-mono)", borderBottom: "1px solid #e2e8f0" }}>
                    {formatCOP(activeCuenta.valorBruto || activeCuenta.valorNeto)}
                  </td>
                </tr>
                {activeCuenta.retencionFuente > 0 && (
                  <tr>
                    <td style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #e2e8f0", color: "#b91c1c" }}>
                      Retención en la Fuente Aplicada
                    </td>
                    <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontFamily: "var(--font-mono)", color: "#b91c1c", borderBottom: "1px solid #e2e8f0" }}>
                      -{formatCOP(activeCuenta.retencionFuente)}
                    </td>
                  </tr>
                )}
                <tr style={{ background: "#f8fafc" }}>
                  <td style={{ padding: "0.75rem", fontWeight: 800, fontSize: "1rem", color: "#1e3a8a" }}>TOTAL A CANCELAR:</td>
                  <td style={{ padding: "0.75rem", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: "1.15rem", color: "#1e3a8a" }}>
                    {formatCOP(activeCuenta.valorNeto)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontSize: "0.8rem", color: "#475569", background: "#f1f5f9", padding: "0.85rem", borderRadius: "6px" }}>
              <strong>Certificación Bancaria:</strong> Favor consignar en la Cuenta de Ahorros Bancolombia No. <strong>102-887452-90</strong> a nombre de SOSENLINEA S.A.S. (NIT 900.887.654-3). Enviar comprobante a tesoreria@sosenlinea.co.
            </div>
          </div>
        )}

        {/* 3. DOCUMENTO: ACTA DE LLAVES */}
        {selectedDoc === "llaves" && activeLlave && (
          <div>
            <div style={{ marginBottom: "1.5rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Inmueble Custodiado:</div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{activeLlave.inmueble}</div>
                  <div style={{ fontSize: "0.825rem", color: "#475569" }}>Referencia: Llave #{activeLlave.codigo}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Custodio Asignado:</div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{activeLlave.custodioActual}</div>
                  <div style={{ fontSize: "0.825rem", color: "#475569" }}>Estado: <strong>{activeLlave.estado}</strong></div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem", color: "#1e3a8a" }}>
                Términos y Declaración de Responsabilidad de Custodia
              </h4>
              <p style={{ fontSize: "0.825rem", lineHeight: 1.6, color: "#334155" }}>
                Por medio de la presente acta, el custodio declara haber recibido a entera satisfacción el juego de llaves especificado para la atención locativa y diagnósticos en el inmueble indicado. El receptor asume la responsabilidad civil por la guarda y uso exclusivo para los fines encomendados, obligándose a su restitución inmediata una vez concluidas las labores o ante el requerimiento de la administración.
              </p>
            </div>
          </div>
        )}

        {/* 4. DOCUMENTO: COMPROBANTE DE EGRESO */}
        {selectedDoc === "egreso" && activeEgreso && (
          <div>
            <div style={{ marginBottom: "1.5rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Pagado a Favor de:</div>
                  <div style={{ fontWeight: 800, fontSize: "1rem" }}>{activeEgreso.responsable || "Beneficiario"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Fecha del Movimiento:</div>
                  <div style={{ fontWeight: 800, fontSize: "1rem" }}>{formatDateCO(activeEgreso.fecha)}</div>
                </div>
              </div>

              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Concepto del Pago:</div>
                <div style={{ fontSize: "0.9rem", color: "#1e293b", fontWeight: 600 }}>{activeEgreso.concepto}</div>
              </div>
            </div>

            <div style={{ background: "#f1f5f9", padding: "1rem 1.25rem", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e3a8a" }}>VALOR NETO PAGADO:</span>
              <span style={{ fontSize: "1.35rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: "#1e3a8a" }}>
                {formatCOP(activeEgreso.monto)}
              </span>
            </div>
          </div>
        )}

        {/* Firmas de Autorización */}
        <div style={{ marginTop: "3.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", paddingTop: "1rem" }}>
          <div style={{ borderTop: "1px solid #0f172a", paddingTop: "0.45rem", textAlign: "center", fontSize: "0.825rem" }}>
            <strong>Autorizado Por:</strong>
            <div style={{ fontWeight: 700, marginTop: "0.2rem" }}>Ing. Pedro Páez</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Gerencia de Operaciones • PROGRAMA ACCES</div>
          </div>

          <div style={{ borderTop: "1px solid #0f172a", paddingTop: "0.45rem", textAlign: "center", fontSize: "0.825rem" }}>
            <strong>Recibido / Firma Responsable:</strong>
            <div style={{ fontWeight: 700, marginTop: "0.2rem" }}>Conforme y Aceptado</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>C.C. / NIT / Sello</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpresionesView;
