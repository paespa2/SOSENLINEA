import React, { useState } from "react";
import { calculateDianDV, validateDianNit, formatDianNit } from "../../../utils/dianNit";
import { FileCheck2, CheckCircle, XCircle, Info, Copy, Check } from "lucide-react";

export const NitValidatorView: React.FC = () => {
  const [singleNit, setSingleNit] = useState("900456123");
  const [singleDV, setSingleDV] = useState("");
  const [copied, setCopied] = useState(false);

  // Batch NIT state
  const [batchText, setBatchText] = useState(
    "900456123\n890901234\n901234567\n71234567\n900789456\n800222333"
  );

  const calculatedDV = calculateDianDV(singleNit);
  const isValidCheck = singleDV ? validateDianNit(singleNit, singleDV) : null;
  const formattedResult = formatDianNit(singleNit, calculatedDV);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cálculo por lotes
  const batchList = batchText
    .split("\n")
    .map((line) => line.trim().replace(/\D/g, ""))
    .filter((n) => n.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FileCheck2 size={26} color="var(--primary)" />
          Actualización y Validador de NIT (Algoritmo DIAN)
        </h1>
        <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
          Cálculo matemático oficial del Dígito de Verificación (DV) mediante Módulo 11 (Decreto 4714 / DIAN Colombia).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
        {/* Calculadora Individual */}
        <div className="card">
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Calculador Individual de Dígito de Verificación
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Ingresa cualquier NIT o cédula para calcular o verificar de inmediato su DV oficial.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Número de Identificación (NIT) *</label>
                <input
                  type="text"
                  placeholder="Ej: 900456123"
                  value={singleNit}
                  onChange={(e) => setSingleNit(e.target.value.replace(/\D/g, ""))}
                  className="input-field"
                  style={{ fontSize: "1.1rem", fontFamily: "var(--font-mono)", fontWeight: 700 }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Verificar con DV (Opcional)</label>
                <input
                  type="text"
                  maxLength={1}
                  placeholder="Ej: 4"
                  value={singleDV}
                  onChange={(e) => setSingleDV(e.target.value.replace(/\D/g, ""))}
                  className="input-field"
                  style={{ fontSize: "1.1rem", fontFamily: "var(--font-mono)", textAlign: "center", fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Resultado del Cálculo */}
            <div
              style={{
                background: "var(--neutral-50)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Dígito de Verificación Calculado:
                </span>
                <span
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 900,
                    fontFamily: "var(--font-mono)",
                    color: "var(--primary)",
                    background: "rgba(37, 99, 235, 0.1)",
                    padding: "0.15rem 1rem",
                    borderRadius: "8px",
                  }}
                >
                  {calculatedDV || "-"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  NIT Formateado Oficial:
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-main)" }}>
                    {formattedResult || "-"}
                  </span>
                  <button onClick={handleCopy} className="btn btn-secondary btn-sm" title="Copiar al portapapeles">
                    {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {singleDV && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    background: isValidCheck ? "rgba(5, 150, 105, 0.1)" : "rgba(220, 38, 38, 0.1)",
                    color: isValidCheck ? "#047857" : "#b91c1c",
                  }}
                >
                  {isValidCheck ? (
                    <>
                      <CheckCircle size={16} /> El DV ingresado ({singleDV}) coincide exactamente con el cálculo DIAN.
                    </>
                  ) : (
                    <>
                      <XCircle size={16} /> El DV ingresado ({singleDV}) NO coincide. El correcto según DIAN es ({calculatedDV}).
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--neutral-50)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: "2px", color: "var(--neutral-500)" }} />
              <span>
                <strong>Factores primos ponderados DIAN:</strong> [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]. Se calcula el residuo Módulo 11 para obtener el DV legal para tributación y contratación.
              </span>
            </div>
          </div>
        </div>

        {/* Procesador por Lotes */}
        <div className="card">
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Validación y Cálculo Masivo de NITs
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Pega una lista de NITs (uno por línea) para generar en lote sus dígitos verificadores.
          </p>

          <div className="input-group">
            <textarea
              rows={5}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              className="textarea-field"
              placeholder="Ingresa los NITs aquí, uno por línea..."
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
              Resultados Calculados ({batchList.length}):
            </span>

            <div
              className="table-responsive-wrapper"
              style={{
                marginTop: "0.5rem",
                maxHeight: "220px",
                overflowY: "auto",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", minWidth: "320px" }}>
                <thead>
                  <tr>
                    <th>NIT Original</th>
                    <th>DV</th>
                    <th style={{ textAlign: "right" }}>Formato Completo DIAN</th>
                  </tr>
                </thead>
                <tbody>
                  {batchList.map((nit, idx) => {
                    const dv = calculateDianDV(nit);
                    return (
                      <tr key={idx}>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{nit}</td>
                        <td style={{ fontWeight: 800, color: "var(--primary)" }}>{dv}</td>
                        <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                          {formatDianNit(nit, dv)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
