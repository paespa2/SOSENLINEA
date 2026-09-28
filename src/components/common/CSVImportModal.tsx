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
  const { reportes, addMaterial, importReportesBatch, clearReportes } = useData();

  const [entityType, setEntityType] = useState<"reportes" | "materiales">(defaultEntity);
  const [importMode, setImportMode] = useState<"replace" | "append">("replace");
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
        padCell:
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

    // Mapeo inteligente avanzado para el estándar ERP SOSENLINEA
    const mappings: ColumnMapping[] = headerRow.map((h) => {
      const lower = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      let target = "";

      if (entityType === "reportes") {
        if (/radicado|id|codigo|orden|caso/.test(lower)) target = "id_registro";
        else if (/direcc|inmueble|ubicac|direccion|predio/.test(lower)) target = "direccion";
        else if (/sector|barrio|comuna|ciudad|zona/.test(lower)) target = "sector";
        else if (/cliente|inmobiliaria|solicit|empresa/.test(lower)) target = "cliente";
        else if (/arrendat|inquilino|ocupante/.test(lower)) target = "arrendatario";
        else if (/propiet|dueno|poseedor/.test(lower)) target = "propietario";
        else if (/quien|contrata/.test(lower)) target = "quienContrata";
        else if (/tipo|trabajo|categoria|servicio|actividad|especialidad/.test(lower)) target = "tipoTrabajo";
        else if (/estado|status|fase/.test(lower)) target = "estado";
        else if (/avance|porcentaje|tasa/.test(lower)) target = "tasaAvance";
        else if (/valor|monto|precio|costo|presupuesto|total/.test(lower)) target = "totalCotizacion";
        else if (/fecha|creado|dia/.test(lower)) target = "fecha";
        else if (/tecnico|contratista|operario|responsable|cuadrilla/.test(lower)) target = "tecnico";
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
      filename = "plantilla_modelo_reportes_sosenlinea.csv";
      csvHeader = "Radicado;Fecha;Direccion_Inmueble;Sector;Cliente_Inmobiliaria;Arrendatario;Propietario;Quien_Contrata;Tipo_Trabajo;Contratista_Asignado;Total_Cotizado;Avance_Porcentaje;Estado;Descripcion_Detalle";
      sampleRow = "#1001;2026-09-27;Cra 43A # 18 Sur - 120, Apto 502;El Poblado;Inversiones Santa María;Juan David Gómez;Marta Helena Vélez;Propietario;Mantenimiento General;ESTRUCTURAS Y CONSTRUCCIONES S.A.S.;3800000;65;Cotizado;Reparación de filtración en tubería principal y resane general\r\n#1002;2026-09-25;Calle 116 # 15-40, Oficina 401;Usaquén;Corporación Inmobiliaria Andina;Dra. Sofía Zambrano;Fiduciaria Central;Inmobiliaria;Mantenimiento Eléctrico;ELECTRICOS Y REDES DEL VALLE E.U.;1280000;100;Ejecutado;Mantenimiento preventivo tablero trifásico y balanceo de cargas\r\n#1003;2026-09-24;Circular 73 # 39B-24, Casa;Laureles;Inmuebles La Floresta;Esteban Arango;Guillermo León;Arrendatario;Plomería;SERVICIOS INTEGRALES DE PLOMERÍA TERCEROS;650000;15;Borrador;Revisión de fuga en llave de paso y empaque de sifón\r\n#1004;2026-09-20;Transversal 39 # 72-10;Laureles;Inversiones Santa María;Carolina Montoya;Roberto Botero;Propietario;Mampostería y Pintura;ESTRUCTURAS Y CONSTRUCCIONES S.A.S.;4200000;100;Cobrado;Resane de humedades y pintura general de fachada";
    } else {
      filename = "plantilla_modelo_materiales_sosenlinea.csv";
      csvHeader = "Codigo;Nombre_Material;Categoria;Unidad;Precio_Unitario;Stock_Actual;Stock_Minimo;Ubicacion;Estado";
      sampleRow = "MAT-101;Cable THHN #12 Blanco;Eléctricos;Metro;3200;250;50;Bodega Principal - Estante E1;Optimo\r\nMAT-102;Breaker Termomagnético 20A;Eléctricos;Unidad;18500;45;10;Bodega Principal - Estante E2;Optimo\r\nMAT-103;Tubo PVC Presión 1/2 pulgada;Plomería;Tira 6m;14200;60;15;Bodega Principal - Patio Tubos;Optimo";
    }

    const blob = new Blob(["\uFEFF" + `${csvHeader}\r\n${sampleRow}\r\n`], { type: "text/csv;charset=utf-8;" });
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
        const batchList: Omit<ReporteOrden, "idRegistro">[] = [];

        for (const row of parsedRows) {
          try {
            const sanitizeCsvCell = (val: string): string => {
              const trimmed = val.trim();
              if (/^[=+\-@\t\r]/.test(trimmed)) {
                return trimmed.replace(/^[=+\-@\t\r]+/, "");
              }
              return trimmed;
            };

            const getVal = (target: string) => {
              const mapping = columnMappings.find((m) => m.targetField === target);
              return mapping ? sanitizeCsvCell(row[mapping.csvHeader] || "") : "";
            };

            const direccion = getVal("direccion") || "Dirección no especificada";
            const sector = getVal("sector") || "Medellín Centro";
            const cliente = getVal("cliente") || "Cliente General";
            const arrendatario = getVal("arrendatario") || "";
            const propietario = getVal("propietario") || "";
            const quienContrata = (getVal("quienContrata") as "Propietario" | "Arrendatario" | "Inmobiliaria") || "Propietario";
            const tipoTrabajo = getVal("tipoTrabajo") || "Mantenimiento General";
            const contratista = getVal("tecnico") || "Cuadrilla SOS";
            const estado = (getVal("estado") as ReporteEstado) || "Cotizado";
            const rawValor = getVal("totalCotizacion").replace(/[^0-9.-]+/g, "");
            const valor = parseFloat(rawValor) || 0;
            const rawAvance = getVal("tasaAvance").replace(/[^0-9.]+/g, "");
            const numAvance = rawAvance
              ? parseFloat(rawAvance) / (parseFloat(rawAvance) > 1 ? 100 : 1)
              : (estado === "Ejecutado" || estado === "Cobrado" ? 1.0 : 0.1);
            const desc = getVal("descripcion") || "Registro importado mediante carga masiva CSV.";
            const customId = getVal("id_registro");
            const fecha = getVal("fecha") || new Date().toISOString().split("T")[0];

            const newRep: Omit<ReporteOrden, "idRegistro"> = {
              codigoAlfanumerico: customId || undefined,
              tipoTrabajo: tipoTrabajo,
              idContratante: "CLI-001",
              clienteNombre: cliente,
              arrendatario: arrendatario,
              propietario: propietario,
              quienContrata: quienContrata,
              direccion: direccion,
              sector: sector,
              fecha: fecha,
              idContratista: "CON-001",
              contratistaNombre: contratista,
              estado: estado,
              reporte: desc,
              totalCotizacion: valor,
              tasaAvance: numAvance,
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

            batchList.push(newRep);
            count++;
          } catch (rowErr) {
            errors.push(`Error en fila: ${(rowErr as Error).message}`);
          }
        }

        if (batchList.length > 0) {
          importReportesBatch(batchList, importMode === "replace");
        }
      } else {
        // Importar Materiales
        for (const row of parsedRows) {
          try {
            const sanitizeCsvCell = (val: string): string => {
              const trimmed = val.trim();
              if (/^[=+\-@\t\r]/.test(trimmed)) {
                return trimmed.replace(/^[=+\-@\t\r]+/, "");
              }
              return trimmed;
            };

            const getVal = (target: string) => {
              const mapping = columnMappings.find((m) => m.targetField === target);
              return mapping ? sanitizeCsvCell(row[mapping.csvHeader] || "") : "";
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

              {/* Selector de Modo: Base de Datos Nueva vs Anexar */}
              <div
                style={{
                  background: importMode === "replace" ? "rgba(37, 99, 235, 0.08)" : "rgba(255, 255, 255, 0.04)",
                  border: importMode === "replace" ? "1px solid rgba(59, 130, 246, 0.35)" : "1px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "0.85rem 1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <label style={{ fontSize: "0.825rem", fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: "0.5rem" }}>
                  🎯 Modo de Inicialización de la Base de Datos:
                </label>
                <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      cursor: "pointer",
                      fontSize: "0.825rem",
                      fontWeight: importMode === "replace" ? 700 : 500,
                      color: importMode === "replace" ? "var(--primary)" : "var(--text-main)",
                    }}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                    />
                    <span>✨ Iniciar con Base de Datos Nueva (Reemplazar registros anteriores)</span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      cursor: "pointer",
                      fontSize: "0.825rem",
                      fontWeight: importMode === "append" ? 700 : 500,
                      color: importMode === "append" ? "var(--primary)" : "var(--text-muted)",
                    }}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                    />
                    <span>➕ Anexar a la base de datos existente</span>
                  </label>
                </div>
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
                                <option value="id_registro">Radicado / ID de Orden (#1001)</option>
                                <option value="fecha">Fecha (YYYY-MM-DD)</option>
                                <option value="direccion">Dirección del Inmueble</option>
                                <option value="sector">Sector / Barrio / Ciudad</option>
                                <option value="cliente">Cliente / Inmobiliaria</option>
                                <option value="arrendatario">Arrendatario / Inquilino</option>
                                <option value="propietario">Propietario / Dueño</option>
                                <option value="quienContrata">Quién Contrata (Propietario / Arrendatario / Inmobiliaria)</option>
                                <option value="tipoTrabajo">Tipo de Trabajo / Especialidad</option>
                                <option value="tecnico">Contratista / Técnico Asignado</option>
                                <option value="totalCotizacion">Total Cotizado ($ COP)</option>
                                <option value="tasaAvance">Porcentaje Avance (0 - 100%)</option>
                                <option value="estado">Estado del Caso</option>
                                <option value="descripcion">Descripción / Detalle</option>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <h4 style={{ fontWeight: 800, margin: 0 }}>Vista Previa de la Importación</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                      Se importarán <strong>{parsedRows.length}</strong> registros al módulo de{" "}
                      <strong>{entityType === "reportes" ? "Reportes y Órdenes" : "Materiales"}</strong>.
                    </p>
                  </div>
                  <span
                    style={{
                      background: importMode === "replace" ? "rgba(37, 99, 235, 0.12)" : "rgba(16, 185, 129, 0.12)",
                      color: importMode === "replace" ? "#2563eb" : "#059669",
                      border: importMode === "replace" ? "1px solid rgba(37, 99, 235, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                      padding: "0.3rem 0.65rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {importMode === "replace" ? "✨ Base de Datos Nueva (Reemplazo Limpio)" : "➕ Modo Anexar"}
                  </span>
                </div>
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
                      {importMode === "replace" ? "✨ Inicializar Nueva BD (" : "Confirmar e Importar ("}
                      {parsedRows.length} Registros)
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
