import React, { useState, useMemo } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { Cotizacion, CotizacionItem, ReporteOrden } from "../../../types";
import { formatCOP, formatDateCO, formatDateTimeCO } from "../../../utils/formatters";
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
  Edit2,
  Trash2,
  Send,
  MessageSquare,
  FileText,
  FileCheck2,
  AlertCircle,
  Clock,
  User,
  MapPin,
  Share2,
  Save,
  DollarSign,
  PlusCircle,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";

export const CotizacionesView: React.FC = () => {
  const {
    cotizaciones,
    reportes,
    clientes,
    updateCotizacion,
    addCotizacion,
    updateReporte,
    addHistorialEntry,
  } = useData();
  const { can, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedCot, setSelectedCot] = useState<Cotizacion | null>(null);

  // Modales
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppSuccessMessage, setWhatsAppSuccessMessage] = useState<string | null>(null);

  // Estado para la Edición de Cotización y Costos Extras
  const [editingCot, setEditingCot] = useState<Cotizacion | null>(null);
  const [extraItems, setExtraItems] = useState<CotizacionItem[]>([]);
  const [newExtraItem, setNewExtraItem] = useState<{
    descripcion: string;
    ambiente: string;
    cantidad: number;
    unidad: string;
    valorUnitario: number;
  }>({
    descripcion: "",
    ambiente: "General",
    cantidad: 1,
    unidad: "Unidad",
    valorUnitario: 0,
  });

  // Estado para el modal de envío por WhatsApp
  const [whatsAppData, setWhatsAppData] = useState<{
    telefono: string;
    destinatarioNombre: string;
    mensaje: string;
    idReporte: number;
    idCotizacion: number;
  }>({
    telefono: "",
    destinatarioNombre: "",
    mensaje: "",
    idReporte: 0,
    idCotizacion: 0,
  });

  // Abrir vista detallada / documento imprimible
  const handleOpenDetail = (cot: Cotizacion) => {
    setSelectedCot(cot);
    setIsDetailModalOpen(true);
  };

  // Abrir modal de edición para añadir costos extras
  const handleOpenEdit = (cot: Cotizacion) => {
    setEditingCot({ ...cot });
    setExtraItems([...(cot.items || [])]);
    setIsEditModalOpen(true);
  };

  // Abrir modal de envío por WhatsApp al cliente del reporte
  const handleOpenWhatsApp = (cot: Cotizacion) => {
    const rep = reportes.find((r) => r.idRegistro === cot.idReporte);
    const clienteObj = clientes.find((c) => c.nombre === cot.clienteNombre);

    // Intentar obtener el teléfono de referencia o del cliente
    let rawTel = rep?.referenciaContacto || clienteObj?.telefono || "";
    // Limpiar caracteres
    const cleanTel = rawTel.replace(/[^0-9]/g, "");

    const clientName = cot.clienteNombre || rep?.arrendatario || rep?.propietario || "Cliente";
    const dir = cot.reporteDireccion || rep?.direccion || "Inmueble";
    const totalFormateado = formatCOP(cot.numTodoCosto);

    const defaultMsg = `Estimado(a) ${clientName}, le saludamos de SOSENLINEA.\n\nLe compartimos la Cotización / Documentación Oficial para el Caso #${cot.idReporte} (${dir}):\n- Concepto: ${cot.titulo || "Mantenimiento Locativo"}\n- Mano de Obra: ${formatCOP(cot.numManoObra)}\n- Materiales e Insumos: ${formatCOP(cot.numMaterial)}\n- Transporte / Logística: ${formatCOP(cot.numTransporte)}\n*TOTAL TODO COSTO: ${totalFormateado}*\n\n✓ Garantía certificada: ${cot.diasGarantia} días calendario.\n\nAgradecemos por favor su confirmación para proceder con las cuadrillas de ejecución.`;

    setWhatsAppData({
      telefono: cleanTel,
      destinatarioNombre: clientName,
      mensaje: defaultMsg,
      idReporte: cot.idReporte,
      idCotizacion: cot.idCotizacion,
    });
    setWhatsAppSuccessMessage(null);
    setIsWhatsAppModalOpen(true);
  };

  // Ejecutar el envío por WhatsApp y registrar en el historial del reporte
  const handleSendWhatsApp = () => {
    if (!whatsAppData.telefono.trim()) {
      alert("Por favor ingresa un número de teléfono celular válido.");
      return;
    }

    // Registrar en el historial del reporte asociado
    if (whatsAppData.idReporte) {
      addHistorialEntry(whatsAppData.idReporte, {
        nuevoEstado: "Mensaje de WhatsApp",
        nota: `Se compartió la Cotización #${whatsAppData.idCotizacion} por WhatsApp al contacto ${whatsAppData.telefono} (${whatsAppData.destinatarioNombre}).`,
        etiquetaAccion: "whatsapp",
        autor: currentUser?.name || "Administrador",
      });
    }

    // Construir enlace de WhatsApp Web / App
    let formattedPhone = whatsAppData.telefono.replace(/[^0-9]/g, "");
    if (!formattedPhone.startsWith("57") && formattedPhone.length === 10) {
      formattedPhone = "57" + formattedPhone;
    }

    const encodedText = encodeURIComponent(whatsAppData.mensaje);
    const url = `https://wa.me/${formattedPhone}?text=${encodedText}`;

    window.open(url, "_blank");

    setWhatsAppSuccessMessage("¡Mensaje generado y registrado formalmente en el expediente!");
    setTimeout(() => {
      setIsWhatsAppModalOpen(false);
    }, 1200);
  };

  // Agregar costo extra a la cotización en edición
  const handleAddExtraItem = () => {
    if (!newExtraItem.descripcion.trim()) {
      alert("Ingresa la descripción del costo o material extra.");
      return;
    }
    if (newExtraItem.valorUnitario <= 0) {
      alert("El valor unitario debe ser mayor a 0.");
      return;
    }

    const newItem: CotizacionItem = {
      id: Date.now().toString(),
      descripcion: newExtraItem.descripcion,
      ambiente: newExtraItem.ambiente || "General",
      cantidad: Number(newExtraItem.cantidad) || 1,
      unidad: newExtraItem.unidad || "Unidad",
      valorUnitario: Number(newExtraItem.valorUnitario),
      valorTotal: (Number(newExtraItem.cantidad) || 1) * Number(newExtraItem.valorUnitario),
    };

    setExtraItems([...extraItems, newItem]);
    setNewExtraItem({
      descripcion: "",
      ambiente: "General",
      cantidad: 1,
      unidad: "Unidad",
      valorUnitario: 0,
    });
  };

  // Eliminar ítem en edición
  const handleRemoveExtraItem = (id: string) => {
    setExtraItems(extraItems.filter((i) => i.id !== id));
  };

  // Guardar cambios de la cotización y sincronizar con el reporte
  const handleSaveCotizacionEdits = () => {
    if (!editingCot) return;

    // Calcular el total de los ítems de materiales/extras
    const totalItems = extraItems.reduce((acc, it) => acc + (it.valorTotal || 0), 0);
    const nuevoTotal = (editingCot.numManoObra || 0) + (editingCot.numTransporte || 0) + totalItems;

    const updatedData: Partial<Cotizacion> = {
      titulo: editingCot.titulo,
      numManoObra: editingCot.numManoObra,
      numMaterial: totalItems,
      numTransporte: editingCot.numTransporte,
      numTodoCosto: nuevoTotal,
      estado: editingCot.estado,
      diasGarantia: editingCot.diasGarantia,
      observaciones: editingCot.observaciones,
      items: extraItems,
    };

    updateCotizacion(editingCot.idCotizacion, updatedData);

    // Sincronizar el valor total con el reporte asociado
    if (editingCot.idReporte) {
      updateReporte(editingCot.idReporte, {
        totalCotizacion: nuevoTotal,
      });

      // Añadir constancia en el historial del reporte
      addHistorialEntry(editingCot.idReporte, {
        nota: `Se actualizaron costos extras en la Cotización #${editingCot.idCotizacion}. Nuevo total: ${formatCOP(nuevoTotal)}.`,
        autor: currentUser?.name || "Administrador",
      });
    }

    setIsEditModalOpen(false);
    setEditingCot(null);
  };

  // Cambiar estado formal de la cotización
  const handleUpdateStatus = (id: number, nuevoEstado: Cotizacion["estado"]) => {
    updateCotizacion(id, { estado: nuevoEstado });
    const cot = cotizaciones.find((c) => c.idCotizacion === id);
    if (cot && cot.idReporte) {
      addHistorialEntry(cot.idReporte, {
        nuevoEstado: nuevoEstado === "Aprobada" ? "Aprobado" : nuevoEstado,
        nota: `La Cotización #${id} fue marcada formalmente como "${nuevoEstado}".`,
        autor: currentUser?.name || "Administrador",
      });
    }
  };

  // Filtrado de cotizaciones
  const filtered = useMemo(() => {
    return cotizaciones.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        c.reporteDireccion.toLowerCase().includes(q) ||
        c.clienteNombre.toLowerCase().includes(q) ||
        (c.contratistaNombre || "").toLowerCase().includes(q) ||
        String(c.idCotizacion).includes(q) ||
        String(c.idReporte).includes(q);

      const matchEstado = selectedEstado === "todos" || c.estado === selectedEstado;

      return matchSearch && matchEstado;
    });
  }, [cotizaciones, searchTerm, selectedEstado]);

  const handleExport = () => {
    exportToCSV(filtered, "Cotizaciones_Presupuestos_SOSENLINEA", [
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
      {/* ── Header Principal ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Calculator size={26} color="var(--primary)" />
            Cotizaciones y Presupuestos Oficiales
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Presupuestos vinculados directamente a las órdenes de trabajo, con adición de costos extras, generación de documentos y envío por WhatsApp.
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

      {/* ── Buscador y Filtros ── */}
      <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ position: "relative", width: "380px", maxWidth: "100%" }}>
          <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
          <input
            type="text"
            placeholder="Buscar por #cotización, #orden, dirección, cliente o contratista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2.2rem" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Estado:</span>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="select-field"
              style={{ fontSize: "0.8rem", padding: "0.35rem 0.65rem", height: "34px" }}
            >
              <option value="todos">Todos los Estados</option>
              <option value="Borrador">Borrador</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Facturada">Facturada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
            {filtered.length} cotizaciones
          </div>
        </div>
      </div>

      {/* ── Grilla de Cotizaciones ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.25rem" }}>
        {filtered.map((cot) => {
          const repAsociado = reportes.find((r) => r.idRegistro === cot.idReporte);

          return (
            <div
              key={cot.idCotizacion}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderLeft: `4px solid ${
                  cot.estado === "Aprobada" ? "#10b981" : cot.estado === "Facturada" ? "#2563eb" : "#f59e0b"
                }`,
                transition: "all 0.2s ease",
              }}
            >
              <div>
                {/* Cabecera de la Tarjeta */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: "var(--primary)",
                          background: "rgba(37, 99, 235, 0.1)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "6px",
                          fontFamily: "monospace",
                        }}
                      >
                        Cotización #{cot.idCotizacion}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          background: "var(--neutral-100)",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                        }}
                      >
                        Orden #{cot.idReporte}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)", margin: "0.4rem 0 0 0" }}>
                      {cot.reporteDireccion}
                    </h3>
                  </div>

                  <StatusBadge status={cot.estado} size="sm" />
                </div>

                {/* Datos del Cliente y Solicitante */}
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.85rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <div>
                    Cliente: <strong style={{ color: "var(--text-main)" }}>{cot.clienteNombre}</strong>
                    {repAsociado?.arrendatario && <span> • Arr: {repAsociado.arrendatario}</span>}
                  </div>
                  <div>
                    Cuadrilla: <strong>{cot.contratistaNombre || "SOS Operaciones"}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <span>Garantía: <strong>{cot.diasGarantia} días</strong></span>
                    <span>Fecha: <strong>{formatDateCO(cot.fecha)}</strong></span>
                  </div>
                </div>

                {/* Desglose Económico de Costos */}
                <div style={{ background: "var(--neutral-50)", padding: "0.85rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.785rem", marginBottom: "0.3rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--neutral-600)" }}>
                      <Hammer size={13} /> Mano de Obra:
                    </span>
                    <span className="currency-text">{formatCOP(cot.numManoObra)}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.785rem", marginBottom: "0.3rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--neutral-600)" }}>
                      <Package size={13} /> Materiales e Insumos ({cot.items?.length || 0} ítems):
                    </span>
                    <span className="currency-text">{formatCOP(cot.numMaterial)}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.785rem", marginBottom: "0.3rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--neutral-600)" }}>
                      <Truck size={13} /> Transporte / Logística:
                    </span>
                    <span className="currency-text">{formatCOP(cot.numTransporte)}</span>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.45rem", marginTop: "0.45rem", display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 800 }}>
                    <span>Total Todo Costo:</span>
                    <span className="currency-text" style={{ color: "var(--primary)" }}>{formatCOP(cot.numTodoCosto)}</span>
                  </div>
                </div>
              </div>

              {/* Acciones de la Tarjeta */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "0.85rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {/* Botón WhatsApp de 1 Clic */}
                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp(cot)}
                  className="btn btn-sm"
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    borderColor: "#16a34a",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                  title="Enviar cotización por WhatsApp al cliente del reporte"
                >
                  <Send size={13} />
                  WhatsApp
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {/* Editar para añadir costos extras */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cot)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                    title="Editar y agregar costos extras"
                  >
                    <Edit2 size={13} />
                    Editar / Extras
                  </button>

                  {/* Ver documento imprimible / Factura */}
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(cot)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                    title="Ver documento oficial imprimible o descargar PDF"
                  >
                    <Printer size={13} />
                    Documento
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: EDICIÓN COMPLETA Y ADICIÓN DE COSTOS EXTRAS               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isEditModalOpen && editingCot && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Editar Cotización #${editingCot.idCotizacion} - Orden #${editingCot.idReporte}`}
          maxWidth="850px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCotizacionEdits}
                className="btn btn-primary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Save size={14} />
                Guardar Cambios y Actualizar Reporte
              </button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: 0 }}>
              Modifica los valores base o agrega nuevos ítems y materiales de costos extras. Al guardar, el presupuesto total se actualizará automáticamente tanto en la cotización como en el expediente de la orden de trabajo.
            </p>

            {/* Ajustes Generales de Costos Base */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Mano de Obra ($)</label>
                <input
                  type="number"
                  className="input-field"
                  value={editingCot.numManoObra}
                  onChange={(e) =>
                    setEditingCot({ ...editingCot, numManoObra: Number(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Transporte / Viáticos ($)</label>
                <input
                  type="number"
                  className="input-field"
                  value={editingCot.numTransporte}
                  onChange={(e) =>
                    setEditingCot({ ...editingCot, numTransporte: Number(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Estado de la Cotización</label>
                <select
                  className="select-field"
                  value={editingCot.estado}
                  onChange={(e) =>
                    setEditingCot({ ...editingCot, estado: e.target.value as Cotizacion["estado"] })
                  }
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="Facturada">Facturada</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Días de Garantía</label>
                <input
                  type="number"
                  className="input-field"
                  value={editingCot.diasGarantia}
                  onChange={(e) =>
                    setEditingCot({ ...editingCot, diasGarantia: Number(e.target.value) || 30 })
                  }
                />
              </div>
            </div>

            {/* Sección de Ítems / Materiales y Costos Extras */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 800, margin: 0, textTransform: "uppercase" }}>
                  Desglose de Ítems & Costos Extras (Materiales, Insumos, Repuestos)
                </h4>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)" }}>
                  Subtotal Ítems: {formatCOP(extraItems.reduce((acc, it) => acc + (it.valorTotal || 0), 0))}
                </span>
              </div>

              {/* Formulario Rápido para Añadir Nuevo Costo Extra */}
              <div
                style={{
                  background: "rgba(37, 99, 235, 0.04)",
                  border: "1px dashed var(--border-color)",
                  borderRadius: "8px",
                  padding: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.5rem" }}>
                  + Añadir Ítem de Costo Extra:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Descripción del costo extra..."
                    className="input-field"
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem", flex: "2 1 200px" }}
                    value={newExtraItem.descripcion}
                    onChange={(e) => setNewExtraItem({ ...newExtraItem, descripcion: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Ambiente / Zona"
                    className="input-field"
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem", flex: "1 1 120px" }}
                    value={newExtraItem.ambiente}
                    onChange={(e) => setNewExtraItem({ ...newExtraItem, ambiente: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Cant."
                    className="input-field"
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem", flex: "0 1 70px" }}
                    value={newExtraItem.cantidad}
                    min={1}
                    onChange={(e) => setNewExtraItem({ ...newExtraItem, cantidad: Number(e.target.value) || 1 })}
                  />
                  <input
                    type="text"
                    placeholder="Unidad (Und, m, gl)"
                    className="input-field"
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem", flex: "1 1 90px" }}
                    value={newExtraItem.unidad}
                    onChange={(e) => setNewExtraItem({ ...newExtraItem, unidad: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Valor Unitario ($)"
                    className="input-field"
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem", flex: "1 1 120px" }}
                    value={newExtraItem.valorUnitario || ""}
                    onChange={(e) => setNewExtraItem({ ...newExtraItem, valorUnitario: Number(e.target.value) || 0 })}
                  />
                  <button
                    type="button"
                    onClick={handleAddExtraItem}
                    className="btn btn-primary btn-sm"
                    style={{ padding: "0.4rem 0.85rem", whiteSpace: "nowrap" }}
                  >
                    <Plus size={14} /> Añadir
                  </button>
                </div>
              </div>

              {/* Tabla de Ítems Existentes */}
              <div className="table-responsive-wrapper" style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
                <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "550px" }}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: "160px" }}>Descripción</th>
                      <th style={{ minWidth: "110px" }}>Ambiente</th>
                      <th style={{ minWidth: "60px" }}>Cant.</th>
                      <th style={{ minWidth: "70px" }}>Unidad</th>
                      <th style={{ minWidth: "110px" }}>Valor Unit.</th>
                      <th style={{ minWidth: "110px" }}>Total</th>
                      <th className="table-actions-sticky" style={{ minWidth: "70px", textAlign: "right" }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)" }}>
                          No hay ítems registrados aún. Añade uno con el formulario superior.
                        </td>
                      </tr>
                    ) : (
                      extraItems.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600 }}>{item.descripcion}</td>
                          <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{item.ambiente}</td>
                          <td style={{ fontFamily: "monospace" }}>{item.cantidad}</td>
                          <td>{item.unidad}</td>
                          <td className="currency-text">{formatCOP(item.valorUnitario)}</td>
                          <td className="currency-text" style={{ fontWeight: 700 }}>{formatCOP(item.valorTotal)}</td>
                          <td className="table-actions-sticky" style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveExtraItem(item.id)}
                              className="btn btn-danger btn-xs"
                              style={{ padding: "0.2rem 0.4rem" }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Global Recalculado */}
            <div
              style={{
                background: "var(--neutral-100)",
                padding: "0.85rem 1.25rem",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                Nuevo Total Todo Costo Proyectado:
              </span>
              <span className="currency-text" style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--primary)" }}>
                {formatCOP(
                  (editingCot.numManoObra || 0) +
                    (editingCot.numTransporte || 0) +
                    extraItems.reduce((acc, it) => acc + (it.valorTotal || 0), 0)
                )}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: DOCUMENTO OFICIAL / FACTURA / IMPRIMIBLE Y PDF             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isDetailModalOpen && selectedCot && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Documento Oficial: Cotización #${selectedCot.idCotizacion} (Orden #${selectedCot.idReporte})`}
          maxWidth="850px"
          footer={
            <>
              <button
                type="button"
                onClick={() => handleOpenWhatsApp(selectedCot)}
                className="btn btn-sm"
                style={{ background: "#16a34a", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Send size={14} />
                Enviar por WhatsApp
              </button>

              <button
                type="button"
                onClick={() => triggerPrint()}
                className="btn btn-secondary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Printer size={14} />
                Imprimir / Descargar PDF
              </button>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="btn btn-primary btn-sm"
              >
                Cerrar
              </button>
            </>
          }
        >
          {/* Documento Imprimible Membretado */}
          <div className="printable-document" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "0.5rem" }}>
            {/* Cabecera Membretada SOSENLINEA */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1e3a8a", paddingBottom: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ShieldCheck size={28} color="#1e3a8a" />
                  <div>
                    <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#1e3a8a", margin: 0, letterSpacing: "-0.02em" }}>
                      SOSENLINEA S.A.S.
                    </h2>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      NIT: 901.458.789-2 • Soluciones y Mantenimiento Inmobiliario
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.35rem" }}>
                  Medellín, Antioquia • PBX: (604) 444-7890 • info@sosenlinea.com
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e3a8a" }}>
                  COTIZACIÓN / ORDEN OFICIAL
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#dc2626", fontFamily: "monospace" }}>
                  #{selectedCot.idCotizacion}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Caso Radicado: #{selectedCot.idReporte}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Fecha: {formatDateCO(selectedCot.fecha)}
                </div>
              </div>
            </div>

            {/* Datos del Inmueble y Contratante */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: "var(--neutral-50)", padding: "0.85rem", borderRadius: "8px" }}>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Inmueble / Ubicación del Trabajo:
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-main)" }}>
                  {selectedCot.reporteDireccion}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Cliente / Inmobiliaria: <strong>{selectedCot.clienteNombre}</strong>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Cuadrilla y Responsable Técnico:
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                  {selectedCot.contratistaNombre || "Cuadrilla SOSENLINEA"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Garantía Técnica: <strong>{selectedCot.diasGarantia} días calendario</strong>
                </div>
              </div>
            </div>

            {/* Tabla Detallada de Labores y Materiales */}
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Desglose de Conceptos y Materiales Presupuestados
              </h4>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
                <thead>
                  <tr style={{ background: "rgba(30, 58, 138, 0.08)", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "0.5rem", textAlign: "left" }}>Descripción</th>
                    <th style={{ padding: "0.5rem", textAlign: "left" }}>Ambiente</th>
                    <th style={{ padding: "0.5rem", textAlign: "center" }}>Cant.</th>
                    <th style={{ padding: "0.5rem", textAlign: "center" }}>Unidad</th>
                    <th style={{ padding: "0.5rem", textAlign: "right" }}>Valor Unit.</th>
                    <th style={{ padding: "0.5rem", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCot.items && selectedCot.items.length > 0 ? (
                    selectedCot.items.map((it) => (
                      <tr key={it.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "0.45rem", fontWeight: 600 }}>{it.descripcion}</td>
                        <td style={{ padding: "0.45rem", color: "var(--text-muted)" }}>{it.ambiente}</td>
                        <td style={{ padding: "0.45rem", textAlign: "center" }}>{it.cantidad}</td>
                        <td style={{ padding: "0.45rem", textAlign: "center" }}>{it.unidad}</td>
                        <td style={{ padding: "0.45rem", textAlign: "right" }} className="currency-text">{formatCOP(it.valorUnitario)}</td>
                        <td style={{ padding: "0.45rem", textAlign: "right", fontWeight: 700 }} className="currency-text">{formatCOP(it.valorTotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)" }}>
                        Mantenimiento locativo según especificaciones de la orden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Resumen de Liquidación */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Mano de Obra Certificada:</span>
                  <span className="currency-text">{formatCOP(selectedCot.numManoObra)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Materiales e Insumos:</span>
                  <span className="currency-text">{formatCOP(selectedCot.numMaterial)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Transporte y Logística:</span>
                  <span className="currency-text">{formatCOP(selectedCot.numTransporte)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #1e3a8a", paddingTop: "0.4rem", fontWeight: 900, fontSize: "1.1rem", color: "#1e3a8a" }}>
                  <span>TOTAL TODO COSTO:</span>
                  <span className="currency-text">{formatCOP(selectedCot.numTodoCosto)}</span>
                </div>
              </div>
            </div>

            {/* Firmas y Sellos Digitales */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <div style={{ border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                  POR SOSENLINEA S.A.S. (Emisor Autorizado)
                </div>
                {selectedCot.firmaElectronica?.trazoFirma ? (
                  <img
                    src={selectedCot.firmaElectronica.trazoFirma}
                    alt="Firma Digital"
                    style={{ maxHeight: "50px", margin: "0 auto" }}
                  />
                ) : (
                  <div style={{ height: "45px", display: "flex", alignItems: "center", justifyContent: "center", fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    Sello Digital: SOS-SIG-2026-ADM
                  </div>
                )}
                <div style={{ borderTop: "1px solid var(--neutral-300)", paddingTop: "0.25rem", fontSize: "0.75rem", fontWeight: 700 }}>
                  Dirección Operativa y Técnica
                </div>
              </div>

              <div style={{ border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                  ACEPTACIÓN Y CONFORMIDAD (Cliente / Inmobiliaria)
                </div>
                <div style={{ height: "45px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--neutral-400)", fontSize: "0.75rem" }}>
                  Firma o Aprobación Digital
                </div>
                <div style={{ borderTop: "1px solid var(--neutral-300)", paddingTop: "0.25rem", fontSize: "0.75rem", fontWeight: 700 }}>
                  {selectedCot.clienteNombre}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 3: ENVÍO DIRECTO POR WHATSAPP AL CLIENTE DEL REPORTE          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isWhatsAppModalOpen && (
        <Modal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          title="Enviar Cotización por WhatsApp al Cliente"
          maxWidth="580px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="btn btn-primary btn-sm"
                style={{ background: "#16a34a", borderColor: "#16a34a", display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Send size={14} />
                Abrir WhatsApp y Registrar en Caso
              </button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: 0 }}>
              Al enviar, se abrirá el chat de WhatsApp con el mensaje pre-redactado y se registrará formalmente una anotación de auditoría en el expediente del caso.
            </p>

            {whatsAppSuccessMessage && (
              <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle size={16} />
                <span>{whatsAppSuccessMessage}</span>
              </div>
            )}

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Destinatario / Cliente</label>
              <input
                type="text"
                className="input-field"
                value={whatsAppData.destinatarioNombre}
                onChange={(e) =>
                  setWhatsAppData({ ...whatsAppData, destinatarioNombre: e.target.value })
                }
              />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Número Celular (WhatsApp)</label>
              <input
                type="tel"
                placeholder="Ejemplo: 3104567890 o 573104567890"
                className="input-field"
                value={whatsAppData.telefono}
                onChange={(e) =>
                  setWhatsAppData({ ...whatsAppData, telefono: e.target.value })
                }
              />
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                Se detecta automáticamente desde los datos de contacto del reporte o cliente.
              </span>
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Mensaje Pre-redactado</label>
              <textarea
                rows={6}
                className="textarea-field"
                style={{ fontSize: "0.8rem", fontFamily: "inherit" }}
                value={whatsAppData.mensaje}
                onChange={(e) =>
                  setWhatsAppData({ ...whatsAppData, mensaje: e.target.value })
                }
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
