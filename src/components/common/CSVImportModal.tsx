import React, { useState, useRef } from "react";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Download,
  FileText,
  Table as TableIcon,
  RefreshCw,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import type { ReporteOrden, ReporteEstado, Material } from "../../types";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEntity?: "reportes" | "materiales";
}

interface ColumnMapping {
  csvHeader: string;
  targetField: string;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  defaultEntity = "reportes",
}) => {
  const { reportes, addReporte, addMaterial } = useData();

  const [entityType, setEntityType] = useState<"reportes" | "materiales">(defaultEntity);
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "success">("upload");
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importCount, setImportCount] = useState<number>(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Auto-detect delimiter
  const detectDelimiter = (text: string): string => {
    const firstLine = text.split(/\r?\n/)[0] || "";
    const counts = {
      ",": (firstLine.match(/,/g) || []).length,
      ";": (firstLine.match(/;/g) || []).length,
      "\t": (firstLine.match(/\t/g) || []).length,
      "|": (firstLine.match(/\|/g) || []).length,
    };
    let maxDelim = ",";
    let maxCount = -1;
    (Object.entries(counts) as [string, number][]).forEach(([d, c]) => {
      if (c > maxCount) {
        maxCount = c;
        maxDelim = d;
      }
    });
    return maxCount > 0 ? maxDelim : ",";
  };

  // Robust CSV parser handling quotes
  const parseCSVLine = (line: string, delim: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delim && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const processText = (text: string, customDelim?: string) => {
    const detected = customDelim || detectDelimiter(text);
    setDelimiter(detected);

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      alert("El archivo no contiene suficientes filas para procesar.");
      return;
    }

    const headerRow = parseCSVLine(lines[0], detected).map((h) =>
      h.replace(/^["']|["']$/g, "").trim()
    );
    setHeaders(headerRow);

    const dataRows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i], detected).map((v) =>
        v.replace(/^["']|["']$/g, "").trim()
      );
      if (values.length === 0 || (values.length === 1 && values[0] === "")) continue;

      const rowObj: Record<string, string> = {};
      headerRow.forEach((hdr, idx) => {
        rowObj[hdr] = values[idx] || "";
      });
      dataRows.push(rowObj);
    }

    setParsedRows(dataRows);

    // Initial intelligent field mapping
    const mappings: ColumnMapping[] = headerRow.map((h) => {
      const lower = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      let target = "";

      if (entityType === "reportes") {
        if (/id|codigo|orden|radicado|caso/.test(lower)) target = "id_registro";
        else if (/direcc|inmueble|ubicac|direccion|predio/.test(lower)) target = "direccion";
        else if (/cliente|propiet|solicit|nombre|inmobiliaria/.test(lower)) target = "cliente";
        else if (/tipo|trabajo|categoria|servicio|actividad/.test(lower)) target = "tipoTrabajo";
        else if (/estado|status|fase/.test(lower)) target = "estado";
        else if (/valor|monto|precio|costo|presupuesto|total/.test(lower)) target = "totalCotizacion";
        else if (/fecha|creado|dia/.test(lower)) target = "fecha";
        else if (/tecnico|contratista|operario|responsable/.test(lower)) target = "tecnico";
        else if (/descrip|detalle|observac|nota/.test(lower)) target = "descripcion";
      } else {
        if (/codigo|ref|sku/.test(lower)) target = "codigo";
        else if (/nombre|material|articulo|producto|descripcion/.test(lower)) target = "nombre";
        else if (/unidad|medida|und/.test(lower)) target = "unidad";
        else if (/precio|costo|valor/.test(lower)) target = "precioUnitario";
        else if (/stock|cantidad|existencia/.test(lower)) target = "stock";
      }

      return { csvHeader: h, targetField: target };
    });

    setColumnMappings(mappings);
    setStep("mapping");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setRawText(content);
      processText(content);
    };
    reader.readAsText(uploaded, "utf-8");
  };

  const handleDownloadTemplate = () => {
    let csvHeader = "";
    let sampleRow = "";
    let filename = "";

    if (entityType === "reportes") {
      filename = "plantilla_reportes_sosenlinea.csv";
      csvHeader = "ID_Registro;Direccion;Cliente;Tipo_Trabajo;Estado;Total_Cotizacion;Tecnico;Descripcion";
      sampleRow = "ORD-2026-001;Calle 10 # 43E-12 Medellín;Inmobiliaria Las Palmas;Mantenimiento Eléctrico;Aprobado;350000;Carlos Pérez;Reparación de acometida general";
    } else {
      filename = "plantilla_materiales_sosenlinea.csv";
      csvHeader = "Codigo;Nombre_Material;Unidad;Precio_Unitario;Stock";
      sampleRow = "MAT-010;Cable THHN #12 Blanco;Metro;3200;150";
    }

    const blob = new Blob([`${csvHeader}\n${sampleRow}\n`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = async () => {
    setIsProcessing(true);
    setImportErrors([]);

    let count = 0;
    const errors: string[] = [];

    try {
      if (entityType === "reportes") {
        for (const row of parsedRows) {
          try {
            const getVal = (target: string) => {
              const mapping = columnMappings.find((m) => m.targetField === target);
              return mapping ? (row[mapping.csvHeader] || "").trim() : "";
            };

            const direccion = getVal("direccion") || "Dirección no especificada";
            const cliente = getVal("cliente") || "Cliente General";
            const tipoTrabajo = getVal("tipoTrabajo") || "Mantenimiento General";
            const estado = (getVal("estado") as ReporteEstado) || "Recibido";
            const rawValor = getVal("totalCotizacion").replace(/[^0-9.-]+/g, "");
            const valor = parseFloat(rawValor) || 0;
            const desc = getVal("descripcion") || "Registro importado mediante carga masiva CSV.";
            const customId = getVal("id_registro");

            const nextCodeNum = 1000 + reportes.length + count + 1;
            const generatedCode = customId || `SOS-${nextCodeNum}`;

            const newRep: Omit<ReporteOrden, "idRegistro"> = {
              codigoAlfanumerico: generatedCode,
              tipoTrabajo: tipoTrabajo,
              idContratante: "CLI-001",
              clienteNombre: cliente,
              arrendatario: "",
              propietario: "",
              quienContrata: "Propietario",
              direccion: direccion,
              sector: "Medellín Centro",
              fecha: new Date().toISOString().split("T")[0],
              idContratista: "CON-001",
              contratistaNombre: "Cuadrilla SOS",
              estado: estado,
              reporte: desc,
              totalCotizacion: valor,
              tasaAvance: 0,
              historial: [
                {
                  id: "hist-import-" + Date.now() + "-" + count,
                  fecha: new Date().toISOString(),
                  autor: "Importador CSV",
                  autorCargo: "Carga Masiva",
                  nuevoEstado: estado,
                  nota: "Registro incorporado automáticamente desde tabla externa.",
                },
              ],
            };

            addReporte(newRep);
            count++;
          } catch (rowErr) {
            errors.push(`Error en fila: ${(rowErr as Error).message}`);
          }
        }
      } else {
        // Importar Materiales
        for (const row of parsedRows) {
          try {
            const getVal = (target: string) => {
              const mapping = columnMappings.find((m) => m.targetField === target);
              return mapping ? (row[mapping.csvHeader] || "").trim() : "";
            };

            const rawPrice = getVal("precioUnitario").replace(/[^0-9.-]+/g, "");
            const rawStock = getVal("stock").replace(/[^0-9]+/g, "");

            const qty = parseInt(rawStock, 10) || 0;
            const newMat: Omit<Material, "id"> = {
              codigo: getVal("codigo") || `MAT-${100 + count}`,
              nombre: getVal("nombre") || "Material sin nombre",
              categoria: "General",
              unidad: getVal("unidad") || "Unidad",
              precioUnitario: parseFloat(rawPrice) || 0,
              stockActual: qty,
              stockMinimo: 5,
              ubicacion: "Bodega Principal",
              estado: qty > 5 ? "Optimo" : qty > 0 ? "Bajo Stock" : "Agotado",
            };

            addMaterial(newMat);
            count++;
          } catch (rowErr) {
            errors.push(`Error en fila material: ${(rowErr as Error).message}`);
          }
        }
      }

      setImportCount(count);
      setImportErrors(errors);
      setStep("success");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setRawText("");
    setHeaders([]);
    setParsedRows([]);
    setStep("upload");
    setImportCount(0);
    setImportErrors([]);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(5px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: "850px",
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
            color: "#ffffff",
            padding: "1.25rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileSpreadsheet size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>
                Importador Inteligente de Tablas y CSV
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#bfdbfe", margin: "0.15rem 0 0 0" }}>
                Carga masiva para reportes, órdenes y catálogos recibidos por empresas o clientes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#ffffff",
              padding: "0.4rem",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps Bar */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-color)",
            background: "var(--bg-card)",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "0.75rem",
              textAlign: "center",
              color: step === "upload" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: step === "upload" ? "2px solid var(--primary)" : "none",
            }}
          >
            1. Cargar Archivo
          </div>
          <div
            style={{
              flex: 1,
              padding: "0.75rem",
              textAlign: "center",
              color: step === "mapping" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: step === "mapping" ? "2px solid var(--primary)" : "none",
            }}
          >
            2. Mapeo de Columnas
          </div>
          <div
            style={{
              flex: 1,
              padding: "0.75rem",
              textAlign: "center",
              color: step === "preview" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: step === "preview" ? "2px solid var(--primary)" : "none",
            }}
          >
            3. Vista Previa
          </div>
          <div
            style={{
              flex: 1,
              padding: "0.75rem",
              textAlign: "center",
              color: step === "success" ? "#10b981" : "var(--text-muted)",
              borderBottom: step === "success" ? "2px solid #10b981" : "none",
            }}
          >
            4. Confirmación
          </div>
        </div>

        {/* Body Container */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
          {/* STEP 1: Upload */}
          {step === "upload" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block" }}>
                    Tipo de Información a Importar:
                  </label>
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.35rem" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      <input
                        type="radio"
                        name="entity"
                        checked={entityType === "reportes"}
                        onChange={() => setEntityType("reportes")}
                      />
                      Reportes y Órdenes de Mantenimiento
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      <input
                        type="radio"
                        name="entity"
                        checked={entityType === "materiales"}
                        onChange={() => setEntityType("materiales")}
                      />
                      Materiales e Insumos
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="btn btn-secondary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <Download size={14} />
                  Descargar Plantilla CSV
                </button>
              </div>

              {/* Drag & Drop Area */}
              <div
                style={{
                  border: "2px dashed var(--border-color)",
                  borderRadius: "12px",
                  padding: "2.5rem 1.5rem",
                  textAlign: "center",
                  background: "rgba(30, 58, 138, 0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginBottom: "1.25rem",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(37, 99, 235, 0.1)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem auto",
                  }}
                >
                  <Upload size={28} />
                </div>
                <h4 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.35rem" }}>
                  Arrastra tu archivo CSV aquí o haz clic para examinar
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                  Formatos compatibles: .csv, .tsv, .txt separados por coma, punto y coma (;) o tabulación.
                </p>
              </div>

              {/* Manual Paste fallback */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>
                  O pega directamente los datos copiados desde Excel / Google Sheets:
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  style={{ width: "100%", marginTop: "0.35rem", fontFamily: "monospace", fontSize: "0.75rem" }}
                  placeholder={`Ejemplo:\nID_Registro;Direccion;Cliente;Tipo_Trabajo;Estado;Total_Cotizacion\nORD-001;Calle 10 # 43E-12;Inmobiliaria Sur;Mantenimiento;Aprobado;350000`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => rawText.trim() && processText(rawText)}
                  disabled={!rawText.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: "0.5rem" }}
                >
                  Procesar Texto Pegado
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === "mapping" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h4 style={{ fontWeight: 800, margin: 0 }}>Mapeo Inteligente de Columnas</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                    Hemos detectado {headers.length} columnas y {parsedRows.length} registros (Delimitador: "{delimiter}").
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700 }}>Delimitador:</label>
                  <select
                    className="input-field"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                    value={delimiter}
                    onChange={(e) => processText(rawText, e.target.value)}
                  >
                    <option value=",">Coma (,)</option>
                    <option value=";">Punto y coma (;)</option>
                    <option value="&#9;">Tabulación (\t)</option>
                    <option value="|">Barra (|)</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-main)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(30, 58, 138, 0.05)", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 700 }}>Columna en tu Archivo</th>
                      <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 700 }}>Ejemplo de Dato (Fila 1)</th>
                      <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 700 }}>Campo Destino en SOSENLINEA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columnMappings.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>{m.csvHeader}</td>
                        <td style={{ padding: "0.6rem 1rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                          {parsedRows[0]?.[m.csvHeader] || "(vacío)"}
                        </td>
                        <td style={{ padding: "0.6rem 1rem" }}>
                          <select
                            className="input-field"
                            style={{ padding: "0.35rem 0.5rem", width: "100%", fontSize: "0.8rem" }}
                            value={m.targetField}
                            onChange={(e) => {
                              const updated = [...columnMappings];
                              updated[idx].targetField = e.target.value;
                              setColumnMappings(updated);
                            }}
                          >
                            <option value="">-- Ignorar esta columna --</option>
                            {entityType === "reportes" ? (
                              <>
                                <option value="id_registro">ID / Radicado de Orden</option>
                                <option value="direccion">Dirección del Inmueble</option>
                                <option value="cliente">Cliente / Solicitante</option>
                                <option value="tipoTrabajo">Tipo de Trabajo / Especialidad</option>
                                <option value="estado">Estado del Caso</option>
                                <option value="totalCotizacion">Valor / Monto de Cotización</option>
                                <option value="fecha">Fecha</option>
                                <option value="tecnico">Técnico / Responsable</option>
                                <option value="descripcion">Descripción / Notas</option>
                              </>
                            ) : (
                              <>
                                <option value="codigo">Código Material</option>
                                <option value="nombre">Nombre / Descripción</option>
                                <option value="unidad">Unidad de Medida</option>
                                <option value="precioUnitario">Precio Unitario</option>
                                <option value="stock">Cantidad / Stock</option>
                              </>
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Preview */}
          {step === "preview" && (
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ fontWeight: 800, margin: 0 }}>Vista Previa de la Importación</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                  Se importarán <strong>{parsedRows.length}</strong> registros al módulo de{" "}
                  <strong>{entityType === "reportes" ? "Reportes y Órdenes" : "Materiales"}</strong>.
                </p>
              </div>

              <div
                style={{
                  maxHeight: "340px",
                  overflowY: "auto",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(30, 58, 138, 0.05)", position: "sticky", top: 0, zIndex: 10 }}>
                      <th style={{ padding: "0.5rem 0.75rem", textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>#</th>
                      {columnMappings
                        .filter((m) => m.targetField)
                        .map((m, idx) => (
                          <th key={idx} style={{ padding: "0.5rem 0.75rem", textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                            {m.targetField}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 15).map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "0.45rem 0.75rem", color: "var(--text-muted)" }}>{rIdx + 1}</td>
                        {columnMappings
                          .filter((m) => m.targetField)
                          .map((m, cIdx) => (
                            <td key={cIdx} style={{ padding: "0.45rem 0.75rem" }}>
                              {row[m.csvHeader] || "-"}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 15 && (
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "right" }}>
                  Mostrando las primeras 15 filas de {parsedRows.length} registros.
                </p>
              )}
            </div>
          )}

          {/* STEP 4: Success */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem auto",
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: "0.5rem" }}>
                ¡Importación Exitosa!
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto 1.5rem auto" }}>
                Se han procesado e insertado <strong>{importCount}</strong> registros correctamente en el sistema.
              </p>

              {importErrors.length > 0 && (
                <div
                  className="alert alert-danger"
                  style={{ textAlign: "left", maxWidth: "500px", margin: "0 auto 1.5rem auto", fontSize: "0.8rem" }}
                >
                  <strong>Advertencias durante la importación:</strong>
                  <ul style={{ margin: "0.5rem 0 0 1rem", padding: 0 }}>
                    {importErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  resetAll();
                  onClose();
                }}
                className="btn btn-primary"
              >
                Finalizar y Ver Registros
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step !== "success" && (
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--border-color)",
              background: "var(--bg-main)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              {step !== "upload" && (
                <button
                  type="button"
                  onClick={() => {
                    if (step === "mapping") setStep("upload");
                    if (step === "preview") setStep("mapping");
                  }}
                  className="btn btn-secondary btn-sm"
                  disabled={isProcessing}
                >
                  Atrás
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
                disabled={isProcessing}
              >
                Cancelar
              </button>

              {step === "upload" && (
                <button
                  type="button"
                  onClick={() => rawText.trim() && processText(rawText)}
                  disabled={!rawText.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  Continuar
                  <ArrowRight size={14} />
                </button>
              )}

              {step === "mapping" && (
                <button
                  type="button"
                  onClick={() => setStep("preview")}
                  className="btn btn-primary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  Ver Vista Previa
                  <ArrowRight size={14} />
                </button>
              )}

              {step === "preview" && (
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={isProcessing}
                  className="btn btn-primary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "#10b981", borderColor: "#10b981" }}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Importando Registros...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Confirmar e Importar {parsedRows.length} Registros
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
