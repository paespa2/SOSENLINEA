import React, { useState, useMemo, useRef, useEffect } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import {
  ReporteOrden,
  ReporteEstado,
  Cotizacion,
  CotizacionItem,
  EtiquetaCotizacion,
  FirmaElectronica,
  HistorialEntrada,
  ActividadAgenda,
  AnexoEtiqueta,
} from "../../../types";
import { formatCOP, formatDateCO, formatDateTimeCO } from "../../../utils/formatters";
import { exportToCSV, triggerPrint } from "../../../utils/exportUtils";
import { Modal } from "../../common/Modal";
import { StatusBadge } from "../../common/Badge";
import { CSVImportModal } from "../../common/CSVImportModal";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Building,
  User,
  Users,
  MapPin,
  Calendar,
  CheckCircle,
  Calculator,
  PlusCircle,
  Sparkles,
  Link as LinkIcon,
  Wrench,
  Check,
  X,
  Layers,
  AlertTriangle,
  Key,
  CheckSquare,
  Printer,
  FileText,
  Tag,
  PenTool,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Package,
  Truck,
  RotateCcw,
  Save,
  Clock,
  History,
  MessageSquare,
  Mail,
  Send,
  Copy,
  ExternalLink,
  Activity,
  CheckCheck,
  Bus,
  Phone,
} from "lucide-react";

/** Lista completa de todos los estados solicitados organizados por fase operativa */
const ESTADOS_GRUPOS: { grupo: string; estados: ReporteEstado[] }[] = [
  {
    grupo: "Cotizaciones & Negociación",
    estados: [
      "Cotización Digital",
      "Cotización Revisada",
      "Aprobado",
      "Cotización No Aprobada",
      "Recotizar Nuevamente",
      "Memorando Digital",
      "Cotizado",
      "Borrador",
    ],
  },
  {
    grupo: "Comunicaciones & Atención al Cliente",
    estados: [
      "Mensaje de WhatsApp",
      "Se Envió Correo Electrónico",
      "Se Recibe Información",
      "Se Da Información al Cliente",
    ],
  },
  {
    grupo: "Operaciones, Cuadrillas & Terreno",
    estados: [
      "Visita Especializada",
      "En Progreso",
      "En Revisión",
      "Se Programa Control de Calidad",
      "Ejecutado",
      "Finalizado",
      "Garantía",
      "En Garantía",
      "Aplazado",
      "Caso Cancelado",
      "Cancelado",
      "Descartado",
    ],
  },
  {
    grupo: "Financiero, Facturación & Pagos",
    estados: [
      "Anticipo",
      "Por Pagar",
      "Pagado",
      "Sí Está Facturado",
      "Cobrado",
    ],
  },
];

/** Todos los estados aplanados para selects y validaciones */
const TODOS_LOS_ESTADOS: ReporteEstado[] = ESTADOS_GRUPOS.flatMap((g) => g.estados);

/** Catálogo predeterminado de etiquetas técnicas para cotizaciones */
const DEFAULT_ETIQUETAS: EtiquetaCotizacion[] = [
  {
    id: "etiq-garantia-mo",
    nombre: "Garantía de Mano de Obra",
    color: "#2563eb",
    descripcion:
      "Todos los trabajos de mano de obra técnica ejecutados cuentan con garantía certificada de 30 a 90 días calendario contra defectos de instalación o aplicación, contados a partir de la firma del acta de entrega.",
  },
  {
    id: "etiq-materiales-calidad",
    nombre: "Materiales Normados y de Primera Calidad",
    color: "#059669",
    descripcion:
      "Los insumos, tuberías, pinturas, accesorios hidrosanitarios y elementos eléctricos suministrados cumplen con normas técnicas Icontec / NTC y certificaciones vigentes de fabricante original.",
  },
  {
    id: "etiq-seguridad-alturas",
    nombre: "Protocolo de Seguridad y Alturas (ARL)",
    color: "#d97706",
    descripcion:
      "El personal técnico asignado cuenta con afiliación activa a Seguridad Social y ARL, equipos de protección individual (EPP) y certificación vigente para trabajo seguro en alturas según normatividad vigente.",
  },
  {
    id: "etiq-recibo-satisfaccion",
    nombre: "Entrega a Conformidad Inmobiliaria",
    color: "#7c3aed",
    descripcion:
      "La finalización formal de la labor está sujeta a acta de recibo a satisfacción debidamente firmada por el arrendatario, propietario o supervisor inmobiliario autorizado con registro fotográfico.",
  },
  {
    id: "etiq-atencion-urgencia",
    nombre: "Atención Prioritaria / Urgencia Locativa",
    color: "#dc2626",
    descripcion:
      "Trabajo clasificado con programación de ejecución inmediata para contención de daños locativos graves, mitigación de filtraciones y restablecimiento urgente de la habitabilidad del inmueble.",
  },
  {
    id: "etiq-hidrosanitaria",
    nombre: "Inspección Hidrosanitaria & Sondeo Oculto",
    color: "#0891b2",
    descripcion:
      "Diagnóstico técnico de redes no visibles con prueba hidrostática y reposición de acabados circundantes para asegurar la ausencia total de humedades remanentes.",
  },
];

const UNIDADES_MEDIDA = [
  { id: "UN", label: "UN - Unidad" },
  { id: "GLB", label: "GLB - Global" },
  { id: "M2", label: "M2 - Metro Cuadrado" },
  { id: "ML", label: "ML - Metro Lineal" },
  { id: "HR", label: "HR - Hora Técnico" },
  { id: "DIA", label: "DIA - Jornada Día" },
  { id: "KG", label: "KG - Kilogramo" },
  { id: "LT", label: "LT - Litro / Galón" },
  { id: "VIAJE", label: "VIAJE - Transporte" },
  { id: "PZA", label: "PZA - Pieza / Repuesto" },
];

export const ReportesView: React.FC = () => {
  const {
    reportes,
    contractors,
    clientes,
    sectores,
    cotizaciones,
    llaves,
    addReporte,
    updateReporte,
    deleteReporte,
    addHistorialEntry,
    addAgendaActividad,
    updateAgendaActividad,
    addAnexoEtiqueta,
    addCotizacion,
    updateCotizacion,
    deleteCotizacion,
    addSector,
    addClient,
    addContractor,
  } = useData();
  const { can, currentUser, currentRole } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReporteOrden | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [copiadoFeedback, setCopiadoFeedback] = useState<string | null>(null);

  // Navegación de 4 partes en el formulario: Reporte, Cotización, Firma, y Proceso & Seguimiento
  const [formStep, setFormStep] = useState<"reporte" | "cotizacion" | "firma" | "proceso">("reporte");

  // Estados para creación rápida dentro de los desplegables
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [newSectorName, setNewSectorName] = useState("");

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  const [isAddingContractor, setIsAddingContractor] = useState(false);
  const [newContractorName, setNewContractorName] = useState("");

  const [customCategories, setCustomCategories] = useState<string[]>([
    "Plomería & Fontanería",
    "Pintura & Estuco",
    "Electricidad & Redes",
    "Obra Civil & Mampostería",
    "Impermeabilizaciones & Techos",
    "Cerrajería & Puertas",
    "Carpintería & Muebles",
    "Mantenimiento General",
  ]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Mantenimiento General");

  // Estados para incluir o no participantes en el reporte (Checklist de selección opcional)
  const [includeArrendatario, setIncludeArrendatario] = useState(false);
  const [includePropietario, setIncludePropietario] = useState(false);
  const [includeContratista, setIncludeContratista] = useState(true);

  // Form State para Parte 1 (Reporte / Caso)
  const [formData, setFormData] = useState({
    codigoAlfanumerico: "",
    tipoTrabajo: "Mantenimiento General",
    clienteNombre: clientes[0]?.nombre || "Inversiones Santa María",
    arrendatario: "",
    arrendatarioDocTipo: "CC",
    arrendatarioDocNumero: "",
    propietario: "",
    propietarioDocTipo: "CC",
    propietarioDocNumero: "",
    quienContrata: "Propietario" as "Arrendatario" | "Propietario" | "Inmobiliaria" | "Tercero",
    direccion: "",
    rutasTransporte: "",
    referenciaContacto: "",
    fecha: new Date().toISOString().slice(0, 10),
    idContratista: contractors[0]?.id || "",
    contratistaNombre: contractors[0]?.nombre || "",
    tecnicoCotizacionNombre: "",
    tecnicoEjecucionNombre: "",
    sector: "El Poblado",
    estado: "Borrador" as ReporteEstado,
    reporte: "",
    totalCotizacion: 0,
    tasaAvance: 0.1,
  });

  // Estado del Proceso & Seguimiento en la pestaña 4
  const [nuevoEstadoProceso, setNuevoEstadoProceso] = useState<ReporteEstado>("Mensaje de WhatsApp");
  const [nuevaNotaProceso, setNuevaNotaProceso] = useState("");
  const [nuevaAccionProceso, setNuevaAccionProceso] = useState<string>("whatsapp");

  // Estado para la Agenda de Actividades y Horarios (Pestaña 4)
  const [nuevaAgendaData, setNuevaAgendaData] = useState<{
    fechaHora: string;
    tipoActividad: ActividadAgenda["tipoActividad"];
    tecnicoNombre: string;
    observaciones: string;
  }>({
    fechaHora: "",
    tipoActividad: "Visita Técnica",
    tecnicoNombre: "",
    observaciones: "",
  });

  // Estado para Anexos y Notas por Etiquetas (Pestaña 4)
  const [nuevoAnexoData, setNuevoAnexoData] = useState<{
    etiqueta: string;
    duracionEstimada: string;
    descripcion: string;
  }>({
    etiqueta: "Mantenimiento Preventivo",
    duracionEstimada: "1 día",
    descripcion: "",
  });

  // Filtros de WhatsApp Multicanal: Destinatario y Propósito
  const [destinatarioWhatsApp, setDestinatarioWhatsApp] = useState<"Todos" | "Arrendatario" | "Propietario" | "Proveedor">("Todos");
  const [propositoWhatsApp, setPropositoWhatsApp] = useState<"Todos" | "Accion" | "Confirmacion">("Todos");

  // Modal de diálogo de acción para personalizar llamada o WhatsApp
  const [accionDialogOpen, setAccionDialogOpen] = useState(false);
  const [accionDialogData, setAccionDialogData] = useState<{
    titulo: string;
    mensaje: string;
    etiqueta: string;
    telefono: string;
  } | null>(null);

  // Cálculo de ID automático consecutivo para nuevas órdenes
  const nextOrderId = useMemo(() => {
    return Math.max(...reportes.map((r) => r.idRegistro), 1000) + 1;
  }, [reportes]);

  const currentOrderId = editingItem ? editingItem.idRegistro : nextOrderId;

  // Reporte en tiempo real (para reflejar historial actualizado al vuelo)
  const activeReporteEnVivo = useMemo(() => {
    if (!editingItem) return null;
    return reportes.find((r) => r.idRegistro === editingItem.idRegistro) || editingItem;
  }, [reportes, editingItem]);

  // Catálogo persistente de etiquetas (almacenado en localStorage para futuros reportes)
  const [etiquetasCatalog, setEtiquetasCatalog] = useState<EtiquetaCotizacion[]>(() => {
    try {
      const saved = localStorage.getItem("sos_etiquetas_catalogo");
      return saved ? JSON.parse(saved) : DEFAULT_ETIQUETAS;
    } catch {
      return DEFAULT_ETIQUETAS;
    }
  });

  // Estado para creación de nueva etiqueta personalizada
  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDesc, setNewTagDesc] = useState("");

  // Estado de Cotización Activa (Parte 2 y 3)
  const [activeCotizacion, setActiveCotizacion] = useState<Cotizacion | null>(null);

  // Cotizaciones existentes para este Caso en específico (Sujetas al idRegistro)
  const caseCotizaciones = useMemo(() => {
    return cotizaciones.filter((c) => c.idReporte === currentOrderId);
  }, [cotizaciones, currentOrderId]);

  // Lista unificada de sectores
  const availableSectores = useMemo(() => {
    const list = new Set<string>();
    sectores.forEach((s) => list.add(s.nombre));
    reportes.forEach((r) => {
      if (r.sector) list.add(r.sector);
    });
    list.add("El Poblado");
    list.add("Laureles");
    list.add("Belén");
    list.add("Envigado");
    return Array.from(list);
  }, [sectores, reportes]);

  // Lista unificada de clientes
  const availableClients = useMemo(() => {
    const list = new Set<string>();
    clientes.forEach((c) => list.add(c.nombre));
    reportes.forEach((r) => {
      if (r.clienteNombre) list.add(r.clienteNombre);
    });
    list.add("Inversiones Santa María");
    list.add("Corporación Inmobiliaria Andina");
    list.add("Inmuebles La Floresta");
    return Array.from(list);
  }, [clientes, reportes]);

  // Coherencia operativa: Comprobar si hay llaves prestadas activas para este inmueble
  const pendingKeys = useMemo(() => {
    if (!formData.direccion.trim()) return [];
    const dirLower = formData.direccion.toLowerCase().trim();
    return llaves.filter(
      (l) => l.inmueble.toLowerCase().includes(dirLower) && l.estado === "Prestada"
    );
  }, [llaves, formData.direccion]);

  // Canvas de Firma Electrónica
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [firmaDatos, setFirmaDatos] = useState<FirmaElectronica>({
    firmante: "",
    documento: "",
    rol: "Arrendatario / Receptor",
    fechaFirma: "",
    trazoFirma: "",
    hashCertificado: "",
  });

  // Inicializar o crear cotización por defecto para un caso
  const createDefaultCotizacion = (idReporteNum: number, currentPresupuesto: number): Cotizacion => {
    const nextCotId = Math.max(...cotizaciones.map((c) => c.idCotizacion), 5000) + 1;
    const moVal = Math.round(currentPresupuesto * 0.5) || 350000;
    const matVal = Math.round(currentPresupuesto * 0.4) || 280000;
    const transVal = Math.round(currentPresupuesto * 0.1) || 50000;
    const totalVal = moVal + matVal + transVal;

    const initialDescripciones: Record<string, string> = {};
    etiquetasCatalog.slice(0, 2).forEach((et) => {
      initialDescripciones[et.nombre] = et.descripcion;
    });

    return {
      idCotizacion: nextCotId,
      idReporte: idReporteNum,
      titulo: `Cotización Principal - Caso #${idReporteNum}`,
      reporteDireccion: formData.direccion || "Inmueble Urbano",
      clienteNombre: formData.clienteNombre || "Cliente Inmobiliario",
      contratistaId: formData.idContratista || "",
      contratistaNombre: formData.contratistaNombre || "Sin Asignar",
      fecha: formData.fecha || new Date().toISOString().slice(0, 10),
      numMaterial: matVal,
      numManoObra: moVal,
      numTransporte: transVal,
      numTodoCosto: totalVal,
      estado: "Borrador",
      diasGarantia: 30,
      observaciones: formData.reporte || "Mantenimiento locativo con materiales normados.",
      items: [
        {
          id: `ITEM-MO-1`,
          tipo: "Mano de Obra",
          descripcion: formData.reporte || "Mano de obra técnica especializada",
          cantidad: 1,
          unidad: "GLB",
          valorUnitario: moVal,
          valorTotal: moVal,
        },
        {
          id: `ITEM-MAT-1`,
          tipo: "Material",
          descripcion: "Suministro de materiales e insumos de reparación",
          cantidad: 1,
          unidad: "GLB",
          valorUnitario: matVal,
          valorTotal: matVal,
        },
        {
          id: `ITEM-TRA-1`,
          tipo: "Transporte",
          descripcion: "Transporte, acarreo de materiales y retiro de escombros",
          cantidad: 1,
          unidad: "VIAJE",
          valorUnitario: transVal,
          valorTotal: transVal,
        },
      ],
      etiquetas: etiquetasCatalog.slice(0, 2).map((et) => et.nombre),
      etiquetasDescripciones: initialDescripciones,
      firmaElectronica: undefined,
    };
  };

  // Abrir Modal para crear nuevo Reporte
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormError(null);
    setFeedbackSuccess(null);
    setFormStep("reporte");
    setIsAddingSector(false);
    setIsAddingClient(false);
    setIsAddingContractor(false);
    setIsAddingCategory(false);
    setIncludeArrendatario(false);
    setIncludePropietario(false);
    setIncludeContratista(true);

    const initialFormData = {
      codigoAlfanumerico: `SOS-${new Date().getFullYear()}-ORD${nextOrderId}`,
      tipoTrabajo: "Mantenimiento Preventivo",
      clienteNombre: availableClients[0] || "Inversiones Santa María",
      arrendatario: "",
      arrendatarioDocTipo: "CC",
      arrendatarioDocNumero: "",
      propietario: "",
      propietarioDocTipo: "CC",
      propietarioDocNumero: "",
      quienContrata: "Propietario" as "Arrendatario" | "Propietario" | "Inmobiliaria" | "Tercero",
      direccion: "",
      rutasTransporte: "",
      referenciaContacto: "",
      fecha: new Date().toISOString().slice(0, 10),
      idContratista: contractors[0]?.id || "",
      contratistaNombre: contractors[0]?.nombre || "",
      tecnicoCotizacionNombre: "",
      tecnicoEjecucionNombre: "",
      sector: availableSectores[0] || "El Poblado",
      estado: "Borrador" as ReporteEstado,
      reporte: "",
      totalCotizacion: 680000,
      tasaAvance: 0.1,
    };
    setFormData(initialFormData);

    const defaultCot = createDefaultCotizacion(nextOrderId, 680000);
    setActiveCotizacion(defaultCot);
    setFirmaDatos({
      firmante: "",
      documento: "",
      rol: "Arrendatario / Receptor",
      fechaFirma: "",
      trazoFirma: "",
      hashCertificado: "",
    });

    setIsModalOpen(true);
  };

  // Abrir Modal para editar Reporte existente
  const handleOpenEdit = (
    item: ReporteOrden,
    targetStep: "reporte" | "cotizacion" | "firma" | "proceso" = "reporte"
  ) => {
    setEditingItem(item);
    setFormError(null);
    setFeedbackSuccess(null);
    setFormStep(targetStep);
    setIsAddingSector(false);
    setIsAddingClient(false);
    setIsAddingContractor(false);
    setIsAddingCategory(false);

    setIncludeArrendatario(Boolean(item.arrendatario && item.arrendatario.trim().length > 0));
    setIncludePropietario(Boolean(item.propietario && item.propietario.trim().length > 0));
    setIncludeContratista(
      Boolean(item.idContratista && item.idContratista.trim().length > 0 && item.contratistaNombre !== "Sin Asignar")
    );

    setFormData({
      codigoAlfanumerico: item.codigoAlfanumerico || `SOS-${new Date().getFullYear()}-ORD${item.idRegistro}`,
      tipoTrabajo: item.tipoTrabajo || "Mantenimiento General",
      clienteNombre: item.clienteNombre || availableClients[0],
      arrendatario: item.arrendatario || "",
      arrendatarioDocTipo: item.arrendatarioDocTipo || "CC",
      arrendatarioDocNumero: item.arrendatarioDocNumero || "",
      propietario: item.propietario || "",
      propietarioDocTipo: item.propietarioDocTipo || "CC",
      propietarioDocNumero: item.propietarioDocNumero || "",
      quienContrata: item.quienContrata || "Propietario",
      direccion: item.direccion,
      rutasTransporte: item.rutasTransporte || "",
      referenciaContacto: item.referenciaContacto || "",
      fecha: item.fecha,
      idContratista: item.idContratista || "",
      contratistaNombre: item.contratistaNombre || "Sin Asignar",
      tecnicoCotizacionNombre: item.tecnicoCotizacionNombre || "",
      tecnicoEjecucionNombre: item.tecnicoEjecucionNombre || "",
      sector: item.sector || "El Poblado",
      estado: item.estado,
      reporte: item.reporte,
      totalCotizacion: item.totalCotizacion,
      tasaAvance: item.tasaAvance,
    });

    // Encontrar cotizaciones asociadas a este caso
    const cots = cotizaciones.filter((c) => c.idReporte === item.idRegistro);
    if (cots.length > 0) {
      setActiveCotizacion(cots[0]);
      if (cots[0].firmaElectronica) {
        setFirmaDatos(cots[0].firmaElectronica);
      } else {
        setFirmaDatos({
          firmante: item.arrendatario || item.propietario || item.contratistaNombre || "",
          documento: "",
          rol: item.arrendatario ? "Arrendatario" : item.propietario ? "Propietario" : "Contratista",
          fechaFirma: "",
          trazoFirma: "",
          hashCertificado: "",
        });
      }
    } else {
      const newDefault = createDefaultCotizacion(item.idRegistro, item.totalCotizacion || 680000);
      setActiveCotizacion(newDefault);
      setFirmaDatos({
        firmante: item.arrendatario || item.propietario || item.contratistaNombre || "",
        documento: "",
        rol: item.arrendatario ? "Arrendatario" : item.propietario ? "Propietario" : "Contratista",
        fechaFirma: "",
        trazoFirma: "",
        hashCertificado: "",
      });
    }

    setIsModalOpen(true);
  };

  // Creación rápida inline de nuevo Sector
  const handleQuickAddSector = () => {
    if (!newSectorName.trim()) return;
    const name = newSectorName.trim();
    addSector({
      nombre: name,
      codigo: `SEC-${name.slice(0, 3).toUpperCase()}`,
      zona: "Valle de Aburrá",
      ruta: "Ruta Urbana",
      responsable: "Operaciones",
      activo: true,
    });
    setFormData((prev) => ({ ...prev, sector: name }));
    setNewSectorName("");
    setIsAddingSector(false);
  };

  // Creación rápida inline de nuevo Cliente
  const handleQuickAddClient = () => {
    if (!newClientName.trim()) return;
    const name = newClientName.trim();
    addClient({
      nombre: name,
      tipo: "Inmobiliaria",
      documento: `901${Date.now().toString().slice(-6)}-1`,
      telefono: "(604) 444-0000",
      email: `contacto@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.co`,
      inmuebleReferencia: formData.direccion || "Inmueble Urbano",
      canonOValor: 0,
      fechaContrato: new Date().toISOString().slice(0, 10),
      estado: "Activo",
    });
    setFormData((prev) => ({ ...prev, clienteNombre: name }));
    setNewClientName("");
    setIsAddingClient(false);
  };

  // Creación rápida inline de nuevo Contratista
  const handleQuickAddContractor = () => {
    if (!newContractorName.trim()) return;
    const name = newContractorName.trim();
    addContractor({
      nombre: name,
      tipo: "Contratista",
      nit: `901${Date.now().toString().slice(-6)}`,
      dv: "3",
      email: `contacto@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.co`,
      telefono: "(604) 555-0101",
      direccion: "Medellín",
      ciudad: "Medellín",
      sector: formData.sector || "El Poblado",
      activo: true,
    });
    setNewContractorName("");
    setIsAddingContractor(false);
  };

  // Creación rápida inline de nueva Categoría de Trabajo
  const handleQuickAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const name = newCategoryName.trim();
    if (!customCategories.includes(name)) {
      setCustomCategories((prev) => [...prev, name]);
    }
    setSelectedCategory(name);
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  // Manejador de cambio de estado con ajuste automático de avance
  const handleEstadoChange = (newEstado: ReporteEstado) => {
    let newAvance = formData.tasaAvance;
    if (
      newEstado === "Ejecutado" ||
      newEstado === "Cobrado" ||
      newEstado === "Finalizado" ||
      newEstado === "Pagado"
    ) {
      newAvance = 1.0;
    } else if (newEstado === "Cotizado" && (newAvance <= 0.1 || newAvance === 1.0)) {
      newAvance = 0.5;
    } else if (newEstado === "Borrador" && newAvance > 0.25) {
      newAvance = 0.1;
    }
    setFormData((prev) => ({
      ...prev,
      estado: newEstado,
      tasaAvance: newAvance,
    }));
    setFormError(null);
  };

  const handleAvanceChange = (val: number) => {
    const clamped = Math.max(0, Math.min(1, Number(val.toFixed(2))));
    let newEstado = formData.estado;
    if (clamped >= 1.0 && (newEstado === "Borrador" || newEstado === "Cotizado")) {
      newEstado = "Ejecutado";
    } else if (clamped < 1.0 && (newEstado === "Ejecutado" || newEstado === "Finalizado")) {
      newEstado = "Cotizado";
    }
    setFormData((prev) => ({
      ...prev,
      tasaAvance: clamped,
      estado: newEstado,
    }));
    setFormError(null);
  };

  // Validar y Guardar Parte 1 (Reporte / Caso)
  const handleSaveReporte = (e?: React.FormEvent, proceedToStep2 = false) => {
    if (e) e.preventDefault();
    setFormError(null);

    // Validación base
    if (!formData.direccion.trim()) {
      setFormError("La Dirección del Inmueble es obligatoria.");
      return false;
    }
    if (!formData.clienteNombre.trim()) {
      setFormError("El Cliente / Inmobiliaria (Contratante) es obligatorio.");
      return false;
    }
    if (!formData.sector.trim()) {
      setFormError("El Sector del Inmueble es obligatorio.");
      return false;
    }
    if (!formData.reporte.trim()) {
      setFormError("La Descripción Detallada del trabajo o novedad es obligatoria.");
      return false;
    }

    if (includeArrendatario && !formData.arrendatario.trim()) {
      setFormError("Marcaste incluir Arrendatario; ingresa su nombre o desmarca la casilla del checklist.");
      return false;
    }
    if (includePropietario && !formData.propietario.trim()) {
      setFormError("Marcaste incluir Propietario; ingresa su nombre o desmarca la casilla del checklist.");
      return false;
    }
    if (includeContratista && (!formData.idContratista || formData.contratistaNombre === "Sin Asignar")) {
      setFormError("Marcaste asignar Contratista; selecciona el contratista responsable de la lista.");
      return false;
    }

    const finalArrendatario = includeArrendatario ? formData.arrendatario.trim() : "";
    const finalPropietario = includePropietario ? formData.propietario.trim() : "";
    const finalIdContratista = includeContratista ? formData.idContratista : "";
    const selectedCont = contractors.find((c) => c.id === finalIdContratista);
    const finalContratistaNombre = includeContratista
      ? selectedCont
        ? selectedCont.nombre
        : formData.contratistaNombre || "Sin Asignar"
      : "Sin Asignar";

    const finalAvance =
      formData.estado === "Ejecutado" ||
      formData.estado === "Cobrado" ||
      formData.estado === "Finalizado" ||
      formData.estado === "Pagado"
        ? 1.0
        : formData.tasaAvance;

    const selectedCli = clientes.find((cl) => cl.nombre === formData.clienteNombre);
    const clientId = selectedCli ? selectedCli.id : "CLI-01";

    if (editingItem) {
      updateReporte(editingItem.idRegistro, {
        ...formData,
        arrendatario: finalArrendatario,
        propietario: finalPropietario,
        idContratista: finalIdContratista,
        contratistaNombre: finalContratistaNombre,
        tasaAvance: finalAvance,
        idContratante: clientId,
      });
    } else {
      addReporte({
        ...formData,
        arrendatario: finalArrendatario,
        propietario: finalPropietario,
        idContratista: finalIdContratista,
        contratistaNombre: finalContratistaNombre,
        tasaAvance: finalAvance,
        idContratante: clientId,
      });
    }

    // Actualizar cotización activa con los datos actualizados del reporte
    if (activeCotizacion) {
      const updatedCot: Cotizacion = {
        ...activeCotizacion,
        reporteDireccion: formData.direccion,
        clienteNombre: formData.clienteNombre,
        contratistaId: finalIdContratista,
        contratistaNombre: finalContratistaNombre,
      };
      setActiveCotizacion(updatedCot);
      const existsInList = cotizaciones.some((c) => c.idCotizacion === updatedCot.idCotizacion);
      if (existsInList) {
        updateCotizacion(updatedCot.idCotizacion, updatedCot);
      } else {
        addCotizacion(updatedCot);
      }
    }

    setFeedbackSuccess("Reporte de trabajo guardado exitosamente.");
    setTimeout(() => setFeedbackSuccess(null), 3000);

    if (proceedToStep2) {
      setFormStep("cotizacion");
    }
    return true;
  };

  // Multi-cotización: Crear una nueva cotización adicional/alternativa vinculada al mismo Caso (#idRegistro)
  const handleCreateNewCaseCotizacion = () => {
    const nextCotId = Math.max(...cotizaciones.map((c) => c.idCotizacion), 5000) + 1;
    const initialDescripciones: Record<string, string> = {};
    etiquetasCatalog.slice(0, 2).forEach((et) => {
      initialDescripciones[et.nombre] = et.descripcion;
    });

    const newCot: Cotizacion = {
      idCotizacion: nextCotId,
      idReporte: currentOrderId,
      titulo: `Cotización Opción B - Caso #${currentOrderId}`,
      reporteDireccion: formData.direccion || "Inmueble Urbano",
      clienteNombre: formData.clienteNombre || "Cliente Inmobiliario",
      contratistaId: formData.idContratista || "",
      contratistaNombre: formData.contratistaNombre || "Sin Asignar",
      fecha: new Date().toISOString().slice(0, 10),
      numMaterial: 150000,
      numManoObra: 250000,
      numTransporte: 40000,
      numTodoCosto: 440000,
      estado: "Borrador",
      diasGarantia: 30,
      observaciones: "Cotización alternativa con alcance de trabajo ajustado.",
      items: [
        {
          id: `ITEM-MO-${Date.now().toString().slice(-4)}`,
          tipo: "Mano de Obra",
          descripcion: "Mano de obra técnica de reparación específica",
          cantidad: 1,
          unidad: "GLB",
          valorUnitario: 250000,
          valorTotal: 250000,
        },
        {
          id: `ITEM-MAT-${Date.now().toString().slice(-4)}`,
          tipo: "Material",
          descripcion: "Suministro de materiales puntuales",
          cantidad: 1,
          unidad: "GLB",
          valorUnitario: 150000,
          valorTotal: 150000,
        },
      ],
      etiquetas: etiquetasCatalog.slice(0, 2).map((et) => et.nombre),
      etiquetasDescripciones: initialDescripciones,
    };

    addCotizacion(newCot);
    setActiveCotizacion(newCot);
    setFeedbackSuccess(`Nueva Cotización #${nextCotId} creada y vinculada al Caso #${currentOrderId}.`);
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  // Manejo de Ítems dentro de la Cotización Activa (Parte 2)
  const handleItemFieldChange = (
    index: number,
    field: keyof CotizacionItem,
    value: string | number
  ) => {
    if (!activeCotizacion) return;
    const items = [...activeCotizacion.items];
    const current = { ...items[index] };

    if (field === "cantidad") {
      const q = Math.max(0, Number(value));
      current.cantidad = q;
      current.valorTotal = Math.round(q * current.valorUnitario);
    } else if (field === "valorUnitario") {
      const vu = Math.max(0, Number(value));
      current.valorUnitario = vu;
      current.valorTotal = Math.round(current.cantidad * vu);
    } else if (field === "descripcion") {
      current.descripcion = String(value);
    } else if (field === "unidad") {
      current.unidad = String(value);
    } else if (field === "tipo") {
      current.tipo = value as CotizacionItem["tipo"];
    }

    items[index] = current;

    // Recalcular subtotales por tipo
    let mo = 0;
    let mat = 0;
    let trans = 0;

    items.forEach((it) => {
      if (it.tipo === "Mano de Obra") mo += it.valorTotal;
      else if (it.tipo === "Material") mat += it.valorTotal;
      else trans += it.valorTotal;
    });

    const total = mo + mat + trans;

    const updatedCot: Cotizacion = {
      ...activeCotizacion,
      items,
      numManoObra: mo,
      numMaterial: mat,
      numTransporte: trans,
      numTodoCosto: total,
    };

    setActiveCotizacion(updatedCot);

    // Sincronizar automáticamente con el total del presupuesto del reporte
    setFormData((prev) => ({
      ...prev,
      totalCotizacion: total,
    }));
  };

  const handleAddItem = (tipo: "Mano de Obra" | "Material" | "Transporte" | "Equipo") => {
    if (!activeCotizacion) return;
    const newItem: CotizacionItem = {
      id: `ITEM-${Date.now().toString().slice(-5)}`,
      tipo,
      descripcion:
        tipo === "Mano de Obra"
          ? "Técnico especializado oficial"
          : tipo === "Material"
          ? "Material o insumo de instalación"
          : tipo === "Transporte"
          ? "Acarreo y transporte logístico"
          : "Herramienta o equipo de precisión",
      cantidad: 1,
      unidad: tipo === "Mano de Obra" ? "GLB" : tipo === "Material" ? "UN" : "VIAJE",
      valorUnitario: tipo === "Mano de Obra" ? 180000 : tipo === "Material" ? 65000 : 45000,
      valorTotal: tipo === "Mano de Obra" ? 180000 : tipo === "Material" ? 65000 : 45000,
    };

    const items = [...activeCotizacion.items, newItem];
    let mo = 0;
    let mat = 0;
    let trans = 0;

    items.forEach((it) => {
      if (it.tipo === "Mano de Obra") mo += it.valorTotal;
      else if (it.tipo === "Material") mat += it.valorTotal;
      else trans += it.valorTotal;
    });

    const total = mo + mat + trans;

    const updatedCot: Cotizacion = {
      ...activeCotizacion,
      items,
      numManoObra: mo,
      numMaterial: mat,
      numTransporte: trans,
      numTodoCosto: total,
    };

    setActiveCotizacion(updatedCot);
    setFormData((prev) => ({ ...prev, totalCotizacion: total }));
  };

  const handleDeleteItem = (index: number) => {
    if (!activeCotizacion) return;
    if (activeCotizacion.items.length <= 1) {
      alert("La cotización debe tener al menos 1 ítem presupuestado.");
      return;
    }
    const items = activeCotizacion.items.filter((_, i) => i !== index);
    let mo = 0;
    let mat = 0;
    let trans = 0;

    items.forEach((it) => {
      if (it.tipo === "Mano de Obra") mo += it.valorTotal;
      else if (it.tipo === "Material") mat += it.valorTotal;
      else trans += it.valorTotal;
    });

    const total = mo + mat + trans;

    const updatedCot: Cotizacion = {
      ...activeCotizacion,
      items,
      numManoObra: mo,
      numMaterial: mat,
      numTransporte: trans,
      numTodoCosto: total,
    };

    setActiveCotizacion(updatedCot);
    setFormData((prev) => ({ ...prev, totalCotizacion: total }));
  };

  // Manejo de Etiquetas Técnicas en Cotización
  const handleToggleEtiqueta = (tagName: string) => {
    if (!activeCotizacion) return;
    const currentTags = activeCotizacion.etiquetas || [];
    const isSelected = currentTags.includes(tagName);

    let updatedTags: string[];
    const descripciones = { ...(activeCotizacion.etiquetasDescripciones || {}) };

    if (isSelected) {
      updatedTags = currentTags.filter((t) => t !== tagName);
    } else {
      updatedTags = [...currentTags, tagName];
      if (!descripciones[tagName]) {
        const found = etiquetasCatalog.find((e) => e.nombre === tagName);
        descripciones[tagName] = found ? found.descripcion : "Término técnico de ejecución.";
      }
    }

    setActiveCotizacion({
      ...activeCotizacion,
      etiquetas: updatedTags,
      etiquetasDescripciones: descripciones,
    });
  };

  const handleEditEtiquetaDescripcion = (tagName: string, newDesc: string) => {
    if (!activeCotizacion) return;
    const descripciones = {
      ...(activeCotizacion.etiquetasDescripciones || {}),
      [tagName]: newDesc,
    };
    setActiveCotizacion({
      ...activeCotizacion,
      etiquetasDescripciones: descripciones,
    });
  };

  // Guardar descripción editada como predeterminada para futuros reportes
  const handleSaveDescriptionAsDefault = (tagName: string, desc: string) => {
    const updated = etiquetasCatalog.map((et) => {
      if (et.nombre === tagName) {
        return { ...et, descripcion: desc };
      }
      return et;
    });
    setEtiquetasCatalog(updated);
    localStorage.setItem("sos_etiquetas_catalogo", JSON.stringify(updated));
    setFeedbackSuccess(`Descripción de '${tagName}' guardada como predeterminada para futuros casos.`);
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  // Crear nueva etiqueta técnica personalizada
  const handleCreateCustomTag = () => {
    if (!newTagName.trim() || !newTagDesc.trim()) return;
    const name = newTagName.trim();
    const desc = newTagDesc.trim();

    const newTag: EtiquetaCotizacion = {
      id: `etiq-${Date.now().toString().slice(-5)}`,
      nombre: name,
      color: "#0284c7",
      descripcion: desc,
    };

    const updatedCatalog = [...etiquetasCatalog, newTag];
    setEtiquetasCatalog(updatedCatalog);
    localStorage.setItem("sos_etiquetas_catalogo", JSON.stringify(updatedCatalog));

    // Agregar de inmediato a la cotización activa
    if (activeCotizacion) {
      const currentTags = activeCotizacion.etiquetas || [];
      const updatedTags = currentTags.includes(name) ? currentTags : [...currentTags, name];
      const descripciones = {
        ...(activeCotizacion.etiquetasDescripciones || {}),
        [name]: desc,
      };
      setActiveCotizacion({
        ...activeCotizacion,
        etiquetas: updatedTags,
        etiquetasDescripciones: descripciones,
      });
    }

    setNewTagName("");
    setNewTagDesc("");
    setIsAddingCustomTag(false);
    setFeedbackSuccess(`Nueva etiqueta '${name}' guardada en el catálogo general.`);
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  // Guardar Cotización y sincronizar
  const handleSaveCotizacion = () => {
    if (!activeCotizacion) return;
    const exists = cotizaciones.some((c) => c.idCotizacion === activeCotizacion.idCotizacion);
    if (exists) {
      updateCotizacion(activeCotizacion.idCotizacion, activeCotizacion);
    } else {
      addCotizacion(activeCotizacion);
    }

    // Actualizar también la orden en base de datos si existe
    if (editingItem) {
      updateReporte(editingItem.idRegistro, {
        totalCotizacion: activeCotizacion.numTodoCosto,
        estado: activeCotizacion.estado === "Aprobada" ? "Cotizado" : editingItem.estado,
      });
    }

    setFeedbackSuccess(`Cotización #${activeCotizacion.idCotizacion} guardada exitosamente.`);
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  // Eventos del Canvas de Firma Electrónica (Mouse & Touch)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFirmaDatos((prev) => ({
      ...prev,
      trazoFirma: "",
      hashCertificado: "",
      fechaFirma: "",
    }));
  };

  const handleCertifySignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const now = new Date();
    const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString()}`;
    const hash = `SOS-SHA256-${currentOrderId}-${Date.now().toString(16).toUpperCase()}`;

    if (!firmaDatos.firmante.trim()) {
      alert("Por favor ingresa el nombre de la persona que firma.");
      return;
    }

    const updatedFirma: FirmaElectronica = {
      ...firmaDatos,
      fechaFirma: dateFormatted,
      trazoFirma: dataUrl,
      hashCertificado: hash,
    };

    setFirmaDatos(updatedFirma);

    if (activeCotizacion) {
      const updatedCot = {
        ...activeCotizacion,
        firmaElectronica: updatedFirma,
        estado: "Aprobada" as const,
      };
      setActiveCotizacion(updatedCot);
      const exists = cotizaciones.some((c) => c.idCotizacion === updatedCot.idCotizacion);
      if (exists) {
        updateCotizacion(updatedCot.idCotizacion, updatedCot);
      } else {
        addCotizacion(updatedCot);
      }
    }

    setFeedbackSuccess("Firma electrónica estampada y validada con certificado de integridad.");
    setTimeout(() => setFeedbackSuccess(null), 3500);
  };

  // REGISTRO DEL PROCESO & SEGUIMIENTO (Paso 4)
  const handleRegistrarNovedadProceso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNotaProceso.trim()) {
      alert("Por favor ingresa la nota o descripción de la novedad del proceso.");
      return;
    }

    // Actualizar estado del formulario
    setFormData((prev) => ({
      ...prev,
      estado: nuevoEstadoProceso,
    }));

    if (editingItem) {
      addHistorialEntry(editingItem.idRegistro, {
        nuevoEstado: nuevoEstadoProceso,
        nota: nuevaNotaProceso.trim(),
        etiquetaAccion: nuevaAccionProceso,
        autor: currentUser?.name || "Administrador",
      });
    }

    setNuevaNotaProceso("");
    setFeedbackSuccess(`Proceso actualizado a estado '${nuevoEstadoProceso}' con novedad registrada.`);
    setTimeout(() => setFeedbackSuccess(null), 3500);
  };

  // AGENDAR ACTIVIDAD / HORARIO
  const handleCrearActividadAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaAgendaData.fechaHora) {
      alert("Por favor selecciona la fecha y hora de la actividad.");
      return;
    }
    if (editingItem) {
      addAgendaActividad(editingItem.idRegistro, {
        fechaHora: nuevaAgendaData.fechaHora,
        tipoActividad: nuevaAgendaData.tipoActividad,
        tecnicoNombre: nuevaAgendaData.tecnicoNombre || formData.tecnicoEjecucionNombre || formData.contratistaNombre || "Por Asignar",
        estado: "Programada",
        observaciones: nuevaAgendaData.observaciones,
      });
      // Registrar automáticamente en el historial
      addHistorialEntry(editingItem.idRegistro, {
        nuevoEstado: "Visita Especializada",
        nota: `[AGENDA] ${nuevaAgendaData.tipoActividad} programada para el ${formatDateTimeCO(nuevaAgendaData.fechaHora)} con técnico ${nuevaAgendaData.tecnicoNombre || formData.contratistaNombre}. ${nuevaAgendaData.observaciones}`,
        etiquetaAccion: "visita",
        autor: currentUser?.name || "Administrador",
      });
    }
    setNuevaAgendaData({
      fechaHora: "",
      tipoActividad: "Visita Técnica",
      tecnicoNombre: "",
      observaciones: "",
    });
    setFeedbackSuccess("Actividad agendada y registrada en el cronograma del caso.");
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  const handleToggleActividadEstado = (actId: string, currentStatus: string) => {
    if (!editingItem) return;
    const nextStatus = currentStatus === "Cumplida" ? "Programada" : "Cumplida";
    updateAgendaActividad(editingItem.idRegistro, actId, { estado: nextStatus as ActividadAgenda["estado"] });
    setFeedbackSuccess(`Estado de la actividad actualizado a '${nextStatus}'.`);
    setTimeout(() => setFeedbackSuccess(null), 2500);
  };

  // AÑADIR ANEXO TÉCNICO / NOTA POR ETIQUETA
  const handleCrearAnexoEtiqueta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAnexoData.descripcion.trim()) {
      alert("Por favor ingresa la descripción técnica o reforma del anexo.");
      return;
    }
    if (editingItem) {
      addAnexoEtiqueta(editingItem.idRegistro, {
        etiqueta: nuevoAnexoData.etiqueta,
        duracionEstimada: nuevoAnexoData.duracionEstimada,
        descripcion: nuevoAnexoData.descripcion.trim(),
      });
      addHistorialEntry(editingItem.idRegistro, {
        nota: `[ANEXO - ${nuevoAnexoData.etiqueta}] (${nuevoAnexoData.duracionEstimada}): ${nuevoAnexoData.descripcion}`,
        etiquetaAccion: "nota",
        autor: currentUser?.name || "Administrador",
      });
    }
    setNuevoAnexoData({
      etiqueta: "Mantenimiento Preventivo",
      duracionEstimada: "1 día",
      descripcion: "",
    });
    setFeedbackSuccess("Anexo técnico por etiqueta registrado exitosamente.");
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  // Copiar mensaje predeterminado de notificación por WhatsApp a un clic
  const handleCopiarMensajeWhatsApp = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoFeedback(texto);
    setTimeout(() => setCopiadoFeedback(null), 3000);
  };

  // Abrir WhatsApp Web con mensaje precargado
  const handleAbrirWhatsApp = (telefono: string, texto: string) => {
    const cleanPhone = telefono.replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(texto);
    const url = cleanPhone ? `https://wa.me/57${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  // Abrir diálogo interactivo de acción para personalizar la notificación
  const handleAbrirDialogoAccion = (titulo: string, texto: string, etiqueta: string, defaultPhone?: string) => {
    setAccionDialogData({
      titulo,
      mensaje: texto,
      etiqueta,
      telefono: defaultPhone || "3004567890",
    });
    setAccionDialogOpen(true);
  };

  // Enviar y registrar desde el diálogo de acción
  const handleEjecutarDialogoAccion = () => {
    if (!accionDialogData) return;
    handleAbrirWhatsApp(accionDialogData.telefono, accionDialogData.mensaje);
    if (editingItem) {
      addHistorialEntry(editingItem.idRegistro, {
        nuevoEstado:
          accionDialogData.etiqueta.includes("Cotización")
            ? "Cotización Digital"
            : accionDialogData.etiqueta.includes("Visita")
            ? "Visita Especializada"
            : accionDialogData.etiqueta.includes("Anticipo")
            ? "Anticipo"
            : "Mensaje de WhatsApp",
        nota: `[${accionDialogData.etiqueta}] Mensaje enviado a ${accionDialogData.telefono}: ${accionDialogData.mensaje}`,
        etiquetaAccion: "whatsapp",
        autor: currentUser?.name || "Administrador",
      });
    }
    setAccionDialogOpen(false);
    setFeedbackSuccess("Llamada a la acción ejecutada y registrada en el historial.");
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  // Plantillas de Notificaciones de WhatsApp Multicanal dinámicas
  const plantillasWhatsApp = useMemo(() => {
    const id = currentOrderId;
    const radicado = formData.codigoAlfanumerico || `#${id}`;
    const dir = formData.direccion || "el inmueble";
    const cli = formData.clienteNombre || "Estimado cliente";
    const cont = formData.contratistaNombre || "nuestro técnico asignado";
    const arr = formData.arrendatario || "Arrendatario";
    const prop = formData.propietario || cli;
    const total = formatCOP(activeCotizacion?.numTodoCosto || formData.totalCotizacion || 0);
    const tipo = formData.tipoTrabajo || "mantenimiento general";
    const rutas = formData.rutasTransporte || "Rutas principales urbanas";
    const ref = formData.referenciaContacto || "Recepción / Contacto en predio";
    const asesor = currentUser?.name || "Asesor SOSENLINEA";

    return [
      // CANAL: ARRENDATARIO - LLAMADO A LA ACCIÓN (CTA)
      {
        id: "arr-cta-visita",
        destinatario: "Arrendatario" as const,
        proposito: "Accion" as const,
        etiqueta: "Coordinar Horario de Visita",
        estadoAsociado: "Visita Especializada" as ReporteEstado,
        color: "#0891b2",
        texto: `Hola ${arr}, le saluda ${asesor} de SOSENLINEA. Nos comunicamos respecto a su reporte de ${tipo} en ${dir} (Caso ${radicado}). Por favor indíquenos qué día y jornada le queda mejor para coordinar la visita técnica y permitir el ingreso. ¡Quedamos muy atentos!`,
      },
      {
        id: "arr-cta-conformidad",
        destinatario: "Arrendatario" as const,
        proposito: "Accion" as const,
        etiqueta: "Aprobación de Recibido / Firma",
        estadoAsociado: "Se Programa Control de Calidad" as ReporteEstado,
        color: "#16a34a",
        texto: `Hola ${arr}, le saluda ${asesor} de SOSENLINEA. Las labores de ${tipo} en ${dir} (Caso ${radicado}) han concluido. ¿Nos confirma si todo ha quedado a su entera satisfacción para proceder con la firma digital del acta de recibo?`,
      },

      // CANAL: ARRENDATARIO - CONFIRMACIÓN
      {
        id: "arr-conf-visita",
        destinatario: "Arrendatario" as const,
        proposito: "Confirmacion" as const,
        etiqueta: "Confirmación de Visita Técnica",
        estadoAsociado: "Visita Especializada" as ReporteEstado,
        color: "#0284c7",
        texto: `Estimado(a) ${arr}, confirmamos que su visita técnica para ${tipo} en ${dir} (Caso ${radicado}) ha quedado formalmente programada con el técnico ${formData.tecnicoEjecucionNombre || cont}. Ante cualquier inquietud, estamos para servirle. - ${asesor}, SOSENLINEA.`,
      },
      {
        id: "arr-conf-reporte",
        destinatario: "Arrendatario" as const,
        proposito: "Confirmacion" as const,
        etiqueta: "Recepción de Novedad Locativa",
        estadoAsociado: "Se Recibe Información" as ReporteEstado,
        color: "#7c3aed",
        texto: `Estimado(a) ${arr}, hemos recibido con éxito su reporte locativo de ${tipo} para el inmueble ${dir}. Su caso fue radicado bajo el número ${radicado} y nuestro equipo técnico ya se encuentra gestionándolo. - ${asesor}, SOSENLINEA.`,
      },

      // CANAL: PROPIETARIO / CONTRATANTE - LLAMADO A LA ACCIÓN (CTA)
      {
        id: "prop-cta-cot",
        destinatario: "Propietario" as const,
        proposito: "Accion" as const,
        etiqueta: "Aprobación de Cotización Digital",
        estadoAsociado: "Cotización Digital" as ReporteEstado,
        color: "#2563eb",
        texto: `Estimado(a) ${prop}, le saluda ${asesor} de SOSENLINEA. Le compartimos la Cotización Digital del Caso ${radicado} para ${dir} por valor de ${total}. Agradecemos por favor su confirmación o aprobación para programar las cuadrillas de ejecución.`,
      },
      {
        id: "prop-cta-anticipo",
        destinatario: "Propietario" as const,
        proposito: "Accion" as const,
        etiqueta: "Solicitud de Anticipo para Compras",
        estadoAsociado: "Anticipo" as ReporteEstado,
        color: "#d97706",
        texto: `Estimado(a) ${prop}, para dar inicio a los trabajos de ${tipo} en ${dir} (Caso ${radicado}), le solicitamos amablemente el pago del anticipo correspondiente. Agradecemos compartirnos el comprobante para dar salida a los materiales. - ${asesor}, SOSENLINEA.`,
      },

      // CANAL: PROPIETARIO / CONTRATANTE - CONFIRMACIÓN
      {
        id: "prop-conf-pago",
        destinatario: "Propietario" as const,
        proposito: "Confirmacion" as const,
        etiqueta: "Confirmación de Pago Recibido",
        estadoAsociado: "Pagado" as ReporteEstado,
        color: "#059669",
        texto: `Confirmamos la recepción satisfactoria de su pago para el Caso ${radicado} en ${dir}. Las labores quedan agendadas en nuestro sistema operativo. Agradecemos su confianza. - ${asesor}, SOSENLINEA.`,
      },
      {
        id: "prop-conf-garantia",
        destinatario: "Propietario" as const,
        proposito: "Confirmacion" as const,
        etiqueta: "Activación de Garantía Técnica",
        estadoAsociado: "En Garantía" as ReporteEstado,
        color: "#dc2626",
        texto: `Estimado(a) ${prop}, le informamos que se ha activado el protocolo de Garantía Técnica para el Caso ${radicado} en ${dir}. Nuestro equipo técnico especializado realizará la revisión sin costo alguno. - ${asesor}, SOSENLINEA.`,
      },

      // CANAL: PROVEEDOR / TÉCNICO - LLAMADO A LA ACCIÓN (CTA)
      {
        id: "prov-cta-asignacion",
        destinatario: "Proveedor" as const,
        proposito: "Accion" as const,
        etiqueta: "Asignación de Orden de Trabajo",
        estadoAsociado: "En Progreso" as ReporteEstado,
        color: "#0891b2",
        texto: `Atención ${cont}, se le asigna la Orden ${radicado} para ${tipo} en ${dir}. Rutas sugeridas: ${rutas}. Contacto en sitio: ${ref}. Por favor confirmar de recibido y hora estimada de llegada a la labor. - ${asesor}, SOSENLINEA.`,
      },
      {
        id: "prov-cta-avance",
        destinatario: "Proveedor" as const,
        proposito: "Accion" as const,
        etiqueta: "Solicitud de Reporte de Avance",
        estadoAsociado: "En Progreso" as ReporteEstado,
        color: "#d97706",
        texto: `Hola ${cont}, solicitamos por favor enviar reporte fotográfico de avance y novedades de la labor en ${dir} (Caso ${radicado}) para actualización del expediente en plataforma. - ${asesor}, SOSENLINEA.`,
      },

      // CANAL: PROVEEDOR / TÉCNICO - CONFIRMACIÓN
      {
        id: "prov-conf-programacion",
        destinatario: "Proveedor" as const,
        proposito: "Confirmacion" as const,
        etiqueta: "Programación en Terreno Aprobada",
        estadoAsociado: "En Progreso" as ReporteEstado,
        color: "#059669",
        texto: `Confirmada la programación para el inmueble ${dir} (Caso ${radicado}). Todo el material presupuestado se encuentra listo para retiro o despacho. ¡Éxitos en la labor! - ${asesor}, SOSENLINEA.`,
      },
    ];
  }, [currentOrderId, formData, activeCotizacion, currentUser]);


  // Cargar trazo guardado en el canvas si existe al entrar al paso 3
  useEffect(() => {
    if (formStep === "firma" && firmaDatos.trazoFirma && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.src = firmaDatos.trazoFirma;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
      }
    }
  }, [formStep, firmaDatos.trazoFirma]);

  const handleDelete = (id: number, dir: string) => {
    if (window.confirm(`¿Deseas eliminar la orden #${id} (${dir})?`)) {
      deleteReporte(id);
    }
  };

  const filtered = reportes.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      r.direccion.toLowerCase().includes(term) ||
      (r.arrendatario && r.arrendatario.toLowerCase().includes(term)) ||
      (r.propietario && r.propietario.toLowerCase().includes(term)) ||
      (r.contratistaNombre && r.contratistaNombre.toLowerCase().includes(term)) ||
      (r.clienteNombre && r.clienteNombre.toLowerCase().includes(term)) ||
      (r.tipoTrabajo && r.tipoTrabajo.toLowerCase().includes(term)) ||
      (r.codigoAlfanumerico && r.codigoAlfanumerico.toLowerCase().includes(term)) ||
      (r.rutasTransporte && r.rutasTransporte.toLowerCase().includes(term)) ||
      (r.referenciaContacto && r.referenciaContacto.toLowerCase().includes(term)) ||
      String(r.idRegistro).includes(term);

    const matchesEstado = selectedEstado === "todos" || r.estado === selectedEstado;
    return matchesSearch && matchesEstado;
  });

  const handleExport = () => {
    exportToCSV(filtered, "Ordenes_Trabajo_tblReportes", [
      { key: "idRegistro", label: "No. Orden" },
      { key: "codigoAlfanumerico", label: "Radicado" },
      { key: "tipoTrabajo", label: "Tipo de Trabajo" },
      { key: "fecha", label: "Fecha" },
      { key: "direccion", label: "Inmueble / Dirección" },
      { key: "rutasTransporte", label: "Rutas de Buses" },
      { key: "arrendatario", label: "Arrendatario" },
      { key: "propietario", label: "Propietario" },
      { key: "contratistaNombre", label: "Contratista" },
      { key: "totalCotizacion", label: "Total Cotización" },
      { key: "estado", label: "Estado" },
      { key: "reporte", label: "Descripción" },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text-main)",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <FileSpreadsheet size={26} color="var(--primary)" />
            Órdenes de Trabajo / Reportes (tblReportes)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Seguimiento de momento a momento, registro del proceso, historial en vivo, cotizaciones múltiples y llamadas a la acción por WhatsApp a un clic.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setIsCSVModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(37, 99, 235, 0.08)", color: "var(--primary)", borderColor: "rgba(37, 99, 235, 0.3)" }}
            title="Importar tablas y registros masivos desde archivos CSV o Excel"
          >
            <Upload size={15} />
            Importar CSV
          </button>

          {can("export") && (
            <button onClick={handleExport} className="btn btn-secondary btn-sm">
              <Download size={15} />
              Exportar CSV
            </button>
          )}

          {can("create") && (
            <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
              <Plus size={15} />
              Nuevo Reporte
            </button>
          )}
        </div>
      </div>

      {/* Buscador y Filtros con TODOS los nuevos estados */}
      <div
        className="card no-print"
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ position: "relative", width: "380px", maxWidth: "100%" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--neutral-400)",
            }}
          />
          <input
            type="text"
            placeholder="Buscar por radicado, inmueble, tipo trabajo, contratista, #caso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2rem" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Estado:
          </span>
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="select-field"
            style={{ width: "240px", fontSize: "0.8rem" }}
          >
            <option value="todos">Todos los Estados ({TODOS_LOS_ESTADOS.length})</option>
            {ESTADOS_GRUPOS.map((g) => (
              <optgroup key={g.grupo} label={g.grupo}>
                {g.estados.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Reportes con Seguimiento de Momento a Momento */}
      <div className="table-card no-print">
        <div className="table-responsive-wrapper">
          <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: "75px", width: "80px", textAlign: "center" }}># Orden</th>
              <th style={{ minWidth: "120px" }}>Fecha / Actualizado</th>
              <th style={{ minWidth: "160px" }}>Inmueble / Rutas</th>
              <th style={{ minWidth: "150px" }}>Participantes & Identificación</th>
              <th style={{ minWidth: "135px" }}>Técnicos & Contratista</th>
              <th style={{ textAlign: "right", minWidth: "110px" }}>Total Cotizado</th>
              <th style={{ minWidth: "90px" }}>Avance</th>
              <th className="table-col-before-sticky" style={{ minWidth: "135px" }}>Estado Actual</th>
              <th className="table-actions-sticky" style={{ textAlign: "right", minWidth: "155px" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No se encontraron órdenes ni reportes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.idRegistro}>
                  <td style={{ fontFamily: "var(--font-mono)", textAlign: "center", width: "80px" }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(r, "proceso")}
                      className="badge-order-id"
                      title={`Radicado: ${r.codigoAlfanumerico || '#' + r.idRegistro} • Clic para ver proceso y seguimiento`}
                    >
                      #{r.idRegistro}
                    </button>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-main)", fontWeight: 600 }}>
                      {formatDateCO(r.fecha)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Clock size={11} color="var(--primary)" />
                      <span>{r.ultimoActualizado ? formatDateTimeCO(r.ultimoActualizado) : "Actualizado"}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{r.direccion}</div>
                    <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.2rem" }}>
                      <span>{r.sector}</span>
                      <span>•</span>
                      <span style={{ color: "var(--primary)", fontWeight: 600 }}>{r.clienteNombre}</span>
                      {r.tipoTrabajo && (
                        <span
                          style={{
                            fontSize: "0.62rem",
                            background: "rgba(8,145,178,0.1)",
                            color: "#0891b2",
                            padding: "0.1rem 0.35rem",
                            borderRadius: "3px",
                            fontWeight: 700,
                          }}
                        >
                          {r.tipoTrabajo}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: "0.8rem" }}>
                    {r.arrendatario ? (
                      <div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Arr:</span> {r.arrendatario}
                      </div>
                    ) : null}
                    {r.propietario ? (
                      <div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Prop:</span> {r.propietario}
                      </div>
                    ) : null}
                    {!r.arrendatario && !r.propietario && (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.75rem" }}>
                        Directo Inmobiliaria
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.825rem" }}>
                      <Wrench size={13} color="var(--primary)" />
                      <span>{r.contratistaNombre || "Sin Asignar"}</span>
                    </div>
                  </td>
                  <td className="currency-text" style={{ fontWeight: 700 }}>
                    {formatCOP(r.totalCotizacion)}
                  </td>
                  <td style={{ width: "105px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <div
                        style={{
                          flex: 1,
                          height: "6px",
                          background: "var(--neutral-200)",
                          borderRadius: "9999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.round(r.tasaAvance * 100)}%`,
                            background: r.tasaAvance >= 1 ? "#059669" : "#3b82f6",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                        {Math.round(r.tasaAvance * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="table-col-before-sticky" style={{ minWidth: "135px", whiteSpace: "nowrap" }}>
                    <StatusBadge status={r.estado} size="sm" />
                  </td>
                  <td className="table-actions-sticky" style={{ textAlign: "right", minWidth: "155px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.35rem" }}>
                      {can("edit") && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(r, "proceso")}
                            className="btn btn-secondary btn-sm"
                            title="Proceso, Seguimiento & WhatsApp"
                            style={{ padding: "0.3rem 0.45rem", color: "#0891b2" }}
                          >
                            <History size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(r, "reporte")}
                            className="btn btn-secondary btn-sm"
                            title="Editar Reporte (Parte 1)"
                            style={{ padding: "0.3rem 0.45rem" }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(r, "cotizacion")}
                            className="btn btn-secondary btn-sm"
                            title="Cotizaciones del Caso (Parte 2)"
                            style={{ padding: "0.3rem 0.45rem", color: "var(--primary)" }}
                          >
                            <Calculator size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(r, "firma")}
                            className="btn btn-secondary btn-sm"
                            title="PDF & Firma Electrónica (Parte 3)"
                            style={{ padding: "0.3rem 0.45rem", color: "#16a34a" }}
                          >
                            <PenTool size={13} />
                          </button>
                        </>
                      )}
                      {can("delete") && (
                        <button
                          onClick={() => handleDelete(r.idRegistro, r.direccion)}
                          className="btn btn-danger btn-sm"
                          title="Eliminar Orden"
                          style={{ padding: "0.3rem 0.45rem" }}
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
            Mostrando <strong>{filtered.length}</strong> de <strong>{reportes.length}</strong> órdenes registradas
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            Sistema Sincronizado y Operativo
          </span>
        </div>
      </div>

      {/* =========================================================================
          MODAL MULTI-PARTE: 
          PARTE 1: Reporte / Caso (#idRegistro) con Todos los Tipos de Estados
          PARTE 2: Cotizaciones del Caso (Múltiples registros para el mismo Caso)
          PARTE 3: Documento PDF con Firma Electrónica
          PARTE 4: REGISTRO DEL PROCESO & Seguimiento de Momento a Momento (Historial y WhatsApp a un Clic)
         ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        badge={`#${currentOrderId}`}
        title={
          formStep === "reporte"
            ? (editingItem ? "Editar Reporte" : "Nuevo Reporte")
            : formStep === "cotizacion"
            ? "Cotizaciones del Caso"
            : formStep === "firma"
            ? "Documento & Firma Electrónica"
            : "Seguimiento y Proceso en Vivo"
        }
        subtitle={editingItem ? `${editingItem.direccion} • ${editingItem.clienteNombre}` : "Formulario Oficial de Mantenimiento y Operaciones"}
        maxWidth="1020px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Barra de Navegación de los 4 Pasos del Formulario */}
          <div
            className="step-tabs-header no-print"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--neutral-100, #f1f5f9)",
              padding: "0.35rem",
              borderRadius: "var(--radius-md)",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}
          >
            <button
              type="button"
              onClick={() => setFormStep("reporte")}
              style={{
                flex: "1 1 auto",
                minWidth: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: "0.55rem 0.65rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: formStep === "reporte" ? "var(--surface, #ffffff)" : "transparent",
                color: formStep === "reporte" ? "var(--primary)" : "var(--text-muted)",
                fontWeight: formStep === "reporte" ? 800 : 600,
                fontSize: "0.8rem",
                boxShadow: formStep === "reporte" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <FileSpreadsheet size={14} />
              <span>1. Reporte</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (formStep === "reporte") {
                  handleSaveReporte(undefined, true);
                } else {
                  setFormStep("cotizacion");
                }
              }}
              style={{
                flex: "1 1 auto",
                minWidth: "130px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: "0.55rem 0.65rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: formStep === "cotizacion" ? "var(--surface, #ffffff)" : "transparent",
                color: formStep === "cotizacion" ? "var(--primary)" : "var(--text-muted)",
                fontWeight: formStep === "cotizacion" ? 800 : 600,
                fontSize: "0.8rem",
                boxShadow: formStep === "cotizacion" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Calculator size={14} />
              <span>2. Cotizaciones ({caseCotizaciones.length || 1})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleSaveCotizacion();
                setFormStep("firma");
              }}
              style={{
                flex: "1 1 auto",
                minWidth: "125px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: "0.55rem 0.65rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: formStep === "firma" ? "var(--surface, #ffffff)" : "transparent",
                color: formStep === "firma" ? "#16a34a" : "var(--text-muted)",
                fontWeight: formStep === "firma" ? 800 : 600,
                fontSize: "0.8rem",
                boxShadow: formStep === "firma" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <PenTool size={14} />
              <span>3. PDF & Firma</span>
            </button>

            <button
              type="button"
              onClick={() => setFormStep("proceso")}
              style={{
                flex: "1 1 auto",
                minWidth: "135px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: "0.55rem 0.65rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: formStep === "proceso" ? "var(--surface, #ffffff)" : "transparent",
                color: formStep === "proceso" ? "#0891b2" : "var(--text-muted)",
                fontWeight: formStep === "proceso" ? 800 : 600,
                fontSize: "0.8rem",
                boxShadow: formStep === "proceso" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Activity size={14} />
              <span>4. Proceso en Vivo</span>
            </button>
          </div>

          {/* Feedback de Éxito / Notificación */}
          {feedbackSuccess && (
            <div
              className="no-print"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#059669",
                borderRadius: "var(--radius-md)",
                padding: "0.65rem 0.9rem",
                fontSize: "0.825rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 600,
              }}
            >
              <CheckCircle size={16} />
              <span>{feedbackSuccess}</span>
            </div>
          )}

          {/* Banner de Errores */}
          {formError && (
            <div
              className="no-print"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "var(--danger)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                fontSize: "0.825rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 600,
              }}
            >
              <AlertTriangle size={17} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )}

          {/* =========================================================================
              PARTE 1: FORMULARIO PRINCIPAL DEL REPORTE / CASO CON TODOS LOS ESTADOS
             ========================================================================= */}
          {formStep === "reporte" && (
            <form
              onSubmit={(e) => handleSaveReporte(e, false)}
              style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
            >
              {/* Header Card de Sincronía y Consecutivo de BD */}
              <div
                style={{
                  padding: "0.85rem 1rem",
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(30,58,138,0.04) 100%)",
                  border: "1px solid rgba(37,99,235,0.2)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flex: 1, minWidth: "280px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "8px",
                      background: "var(--primary)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                    }}
                  >
                    #{currentOrderId}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-main)" }}>
                        {editingItem ? `Reporte #${editingItem.idRegistro}` : `Nuevo Reporte #${nextOrderId}`}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background: "rgba(37,99,235,0.1)",
                          color: "var(--primary)",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        ID BD: #{currentOrderId}
                      </span>
                    </div>

                    {/* Radicado Alfanumérico Editable */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.3rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>
                        Radicado Alfanumérico:
                      </span>
                      <input
                        type="text"
                        placeholder="Ej. SOS-2026-ORD1001"
                        value={formData.codigoAlfanumerico}
                        onChange={(e) => setFormData({ ...formData, codigoAlfanumerico: e.target.value })}
                        className="input-field"
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.5rem",
                          height: "26px",
                          width: "170px",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  {/* Selector de Tipo de Trabajo fijo sobre el seguimiento */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      Tipo de Trabajo (Seguimiento Fijo):
                    </span>
                    <select
                      value={formData.tipoTrabajo}
                      onChange={(e) => setFormData({ ...formData, tipoTrabajo: e.target.value })}
                      className="select-field"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", height: "28px", fontWeight: 700 }}
                    >
                      <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                      <option value="Mantenimiento Correctivo">Mantenimiento Correctivo</option>
                      <option value="Reforma & Adecuación Locativa">Reforma & Adecuación Locativa</option>
                      <option value="Garantía Técnica">Garantía Técnica</option>
                      <option value="Inspección Técnica / Cotización">Inspección Técnica / Cotización</option>
                      <option value="Plomería & Redes">Plomería & Redes</option>
                      <option value="Electricidad & Redes">Electricidad & Redes</option>
                      <option value="Pintura & Estuco">Pintura & Estuco</option>
                      <option value="Cerrajería & Puertas">Cerrajería & Puertas</option>
                    </select>
                  </div>

                  <span
                    className="badge badge-info"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.75rem",
                      padding: "0.35rem 0.65rem",
                    }}
                  >
                    <Clock size={13} />
                    {activeReporteEnVivo?.ultimoActualizado
                      ? `Último: ${formatDateTimeCO(activeReporteEnVivo.ultimoActualizado)}`
                      : "Sincronizado en vivo"}
                  </span>
                </div>
              </div>

              {/* Advertencia de Custodia de Llaves del Inmueble */}
              {pendingKeys.length > 0 && (
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#b45309",
                    borderRadius: "var(--radius-md)",
                    padding: "0.65rem 0.9rem",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  <Key size={15} color="#d97706" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Custodia de Llaves:</strong> Existen {pendingKeys.length} llave(s) en calidad de PRESTADA para este inmueble en poder de {pendingKeys[0].custodioActual || "cuadrilla de campo"}.
                  </span>
                </div>
              )}

              {/* Dirección y Rutas de Transporte / Buses */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem" }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <MapPin size={14} color="var(--primary)" />
                    Dirección del Inmueble *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Cra 43A # 18 Sur - 120, Apto 502"
                    value={formData.direccion}
                    onChange={(e) => {
                      setFormData({ ...formData, direccion: e.target.value });
                      setFormError(null);
                    }}
                    className="input-field"
                    required
                  />
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Bus size={14} color="#0891b2" />
                    Rutas de Buses / Sistema de Transporte
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ruta Poblado 135 / Metro Estación Aguacatala / Integrado"
                    value={formData.rutasTransporte}
                    onChange={(e) => setFormData({ ...formData, rutasTransporte: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Sector y Referencia para Contacto */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Sector Desplegable */}
                <div className="input-group" style={{ margin: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <label className="input-label" style={{ margin: 0 }}>Sector *</label>
                    {!isAddingSector && (
                      <button
                        type="button"
                        onClick={() => setIsAddingSector(true)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--primary)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: 0,
                        }}
                      >
                        <PlusCircle size={13} />
                        + Incluir nuevo
                      </button>
                    )}
                  </div>

                  {isAddingSector ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nuevo sector..."
                        value={newSectorName}
                        onChange={(e) => setNewSectorName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleQuickAddSector();
                          } else if (e.key === "Escape") {
                            setIsAddingSector(false);
                          }
                        }}
                        className="input-field"
                        style={{ fontSize: "0.85rem", padding: "0.45rem 0.65rem" }}
                      />
                      <button
                        type="button"
                        onClick={handleQuickAddSector}
                        className="btn btn-success btn-sm"
                        style={{ padding: "0.45rem 0.65rem" }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSector(false);
                          setNewSectorName("");
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.45rem 0.65rem" }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <select
                        value={formData.sector}
                        onChange={(e) => {
                          if (e.target.value === "__NEW__") {
                            setIsAddingSector(true);
                          } else {
                            setFormData({ ...formData, sector: e.target.value });
                            setFormError(null);
                          }
                        }}
                        className="select-field"
                        style={{ flex: 1 }}
                      >
                        {availableSectores.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                        <option value="__NEW__" style={{ fontWeight: 700, color: "var(--primary)" }}>
                          + Incluir nuevo Sector...
                        </option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsAddingSector(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0 0.6rem" }}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Phone size={14} color="#0891b2" />
                    Referencia de Contacto / Comunicación
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Portería Edif. Los Naranjos - Tel: 300 234 5678"
                    value={formData.referenciaContacto}
                    onChange={(e) => setFormData({ ...formData, referenciaContacto: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Cliente / Inmobiliaria y Quién Contrata */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem" }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <label className="input-label" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Building size={14} color="var(--primary)" />
                      Cliente / Inmobiliaria (Contratante) *
                    </label>
                    {!isAddingClient && (
                      <button
                        type="button"
                        onClick={() => setIsAddingClient(true)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--primary)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: 0,
                        }}
                      >
                        <PlusCircle size={13} />
                        + Incluir nuevo
                      </button>
                    )}
                  </div>

                  {isAddingClient ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nombre del cliente o inmobiliaria..."
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleQuickAddClient();
                          } else if (e.key === "Escape") {
                            setIsAddingClient(false);
                          }
                        }}
                        className="input-field"
                        style={{ fontSize: "0.85rem", padding: "0.45rem 0.65rem" }}
                      />
                      <button
                        type="button"
                        onClick={handleQuickAddClient}
                        className="btn btn-success btn-sm"
                        style={{ padding: "0.45rem 0.65rem" }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingClient(false);
                          setNewClientName("");
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.45rem 0.65rem" }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <select
                        value={formData.clienteNombre}
                        onChange={(e) => {
                          if (e.target.value === "__NEW__") {
                            setIsAddingClient(true);
                          } else {
                            setFormData({ ...formData, clienteNombre: e.target.value });
                            setFormError(null);
                          }
                        }}
                        className="select-field"
                        style={{ flex: 1 }}
                      >
                        {availableClients.map((cli) => (
                          <option key={cli} value={cli}>
                            {cli}
                          </option>
                        ))}
                        <option value="__NEW__" style={{ fontWeight: 700, color: "var(--primary)" }}>
                          + Incluir nuevo Cliente / Inmobiliaria...
                        </option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsAddingClient(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0 0.6rem" }}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quién Contrata (Contratante Real) */}
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Users size={14} color="var(--primary)" />
                    ¿Quién Contrata el Servicio? *
                  </label>
                  <select
                    value={formData.quienContrata}
                    onChange={(e) => setFormData({ ...formData, quienContrata: e.target.value as any })}
                    className="select-field"
                    style={{ fontWeight: 700 }}
                  >
                    <option value="Propietario">Propietario (Contrata directamente)</option>
                    <option value="Arrendatario">Arrendatario (Contrata habitante)</option>
                    <option value="Inmobiliaria">Inmobiliaria / Administración</option>
                    <option value="Tercero">Tercero / Aseguradora</option>
                  </select>
                </div>
              </div>

              {/* Checklist de Participantes con Documento de Identidad */}
              <div
                style={{
                  padding: "1rem",
                  background: "var(--neutral-50, #f8fafc)",
                  border: "1px solid var(--neutral-200, #e2e8f0)",
                  borderRadius: "var(--radius-md, 8px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)" }}>
                    <CheckSquare size={16} color="var(--primary)" />
                    <span>Checklist de Participantes e Identificación (NIT / CC / Pasaporte)</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Chulea para incluir datos completos de las partes
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.825rem",
                      cursor: "pointer",
                      padding: "0.45rem 0.65rem",
                      background: includeArrendatario ? "rgba(37,99,235,0.06)" : "var(--surface)",
                      border: `1px solid ${includeArrendatario ? "var(--primary)" : "var(--neutral-300)"}`,
                      borderRadius: "6px",
                      fontWeight: includeArrendatario ? 700 : 500,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={includeArrendatario}
                      onChange={(e) => {
                        setIncludeArrendatario(e.target.checked);
                        setFormError(null);
                      }}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <span>Incluir Arrendatario</span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.825rem",
                      cursor: "pointer",
                      padding: "0.45rem 0.65rem",
                      background: includePropietario ? "rgba(37,99,235,0.06)" : "var(--surface)",
                      border: `1px solid ${includePropietario ? "var(--primary)" : "var(--neutral-300)"}`,
                      borderRadius: "6px",
                      fontWeight: includePropietario ? 700 : 500,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={includePropietario}
                      onChange={(e) => {
                        setIncludePropietario(e.target.checked);
                        setFormError(null);
                      }}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <span>Incluir Propietario</span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.825rem",
                      cursor: "pointer",
                      padding: "0.45rem 0.65rem",
                      background: includeContratista ? "rgba(37,99,235,0.06)" : "var(--surface)",
                      border: `1px solid ${includeContratista ? "var(--primary)" : "var(--neutral-300)"}`,
                      borderRadius: "6px",
                      fontWeight: includeContratista ? 700 : 500,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={includeContratista}
                      onChange={(e) => {
                        setIncludeContratista(e.target.checked);
                        setFormError(null);
                      }}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <span>Asignar Contratista / Cuadrilla</span>
                  </label>
                </div>

                {/* Campos Arrendatario */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.25rem" }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 0.3rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <User size={13} color="var(--primary)" />
                        Arrendatario / Inquilino
                      </span>
                      <span style={{ fontSize: "0.68rem", color: includeArrendatario ? "#16a34a" : "var(--text-muted)", fontWeight: 600 }}>
                        {includeArrendatario ? "✓ Incluido" : "✗ No Aplica / Vacante"}
                      </span>
                    </label>
                    {includeArrendatario ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <input
                          type="text"
                          placeholder="Nombre completo..."
                          value={formData.arrendatario}
                          onChange={(e) => {
                            setFormData({ ...formData, arrendatario: e.target.value });
                            setFormError(null);
                          }}
                          className="input-field"
                        />
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <select
                            value={formData.arrendatarioDocTipo || "CC"}
                            onChange={(e) => setFormData({ ...formData, arrendatarioDocTipo: e.target.value })}
                            className="select-field"
                            style={{ width: "85px", fontSize: "0.75rem" }}
                          >
                            <option value="CC">C.C.</option>
                            <option value="NIT">NIT</option>
                            <option value="CE">C.E.</option>
                            <option value="PAS">Pasaporte</option>
                            <option value="TI">T.I.</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Número de documento..."
                            value={formData.arrendatarioDocNumero || ""}
                            onChange={(e) => setFormData({ ...formData, arrendatarioDocNumero: e.target.value })}
                            className="input-field"
                            style={{ flex: 1, fontSize: "0.8rem" }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "0.55rem 0.75rem",
                          background: "rgba(0,0,0,0.02)",
                          border: "1px dashed var(--neutral-300, #cbd5e1)",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Sin arrendatario asignado (inmueble vacante o gestión directa)
                      </div>
                    )}
                  </div>

                  {/* Campos Propietario */}
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 0.3rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <User size={13} color="var(--primary)" />
                        Propietario del Inmueble
                      </span>
                      <span style={{ fontSize: "0.68rem", color: includePropietario ? "#16a34a" : "var(--text-muted)", fontWeight: 600 }}>
                        {includePropietario ? "✓ Incluido" : "✗ No Aplica / Inmobiliaria"}
                      </span>
                    </label>
                    {includePropietario ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <input
                          type="text"
                          placeholder="Nombre completo..."
                          value={formData.propietario}
                          onChange={(e) => {
                            setFormData({ ...formData, propietario: e.target.value });
                            setFormError(null);
                          }}
                          className="input-field"
                        />
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <select
                            value={formData.propietarioDocTipo || "CC"}
                            onChange={(e) => setFormData({ ...formData, propietarioDocTipo: e.target.value })}
                            className="select-field"
                            style={{ width: "85px", fontSize: "0.75rem" }}
                          >
                            <option value="CC">C.C.</option>
                            <option value="NIT">NIT</option>
                            <option value="CE">C.E.</option>
                            <option value="PAS">Pasaporte</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Número de documento..."
                            value={formData.propietarioDocNumero || ""}
                            onChange={(e) => setFormData({ ...formData, propietarioDocNumero: e.target.value })}
                            className="input-field"
                            style={{ flex: 1, fontSize: "0.8rem" }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "0.55rem 0.75rem",
                          background: "rgba(0,0,0,0.02)",
                          border: "1px dashed var(--neutral-300, #cbd5e1)",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Sin propietario registrado (gestionado directo por cliente)
                      </div>
                    )}
                  </div>
                </div>

                {/* Asignación de Técnicos (Cotización y Ejecución) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem", paddingTop: "0.65rem", borderTop: "1px dashed #e2e8f0" }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label" style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <Wrench size={13} color="var(--primary)" />
                      Técnico de Cotización (Evaluación / Medidas):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Ing. Carlos Mendoza"
                      value={formData.tecnicoCotizacionNombre}
                      onChange={(e) => setFormData({ ...formData, tecnicoCotizacionNombre: e.target.value })}
                      className="input-field"
                      style={{ fontSize: "0.8rem" }}
                    />
                  </div>

                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label" style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <Wrench size={13} color="#059669" />
                      Técnico de Ejecución (Cuadrilla en Terreno):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Mtro. Jaime Restrepo"
                      value={formData.tecnicoEjecucionNombre}
                      onChange={(e) => setFormData({ ...formData, tecnicoEjecucionNombre: e.target.value })}
                      className="input-field"
                      style={{ fontSize: "0.8rem" }}
                    />
                  </div>
                </div>

                {/* Contratista */}
                {includeContratista ? (
                  <div className="input-group" style={{ margin: 0, marginTop: "0.35rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <label className="input-label" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Wrench size={14} color="var(--primary)" />
                        Empresa Contratista Vinculada
                      </label>
                      {!isAddingContractor && (
                        <button
                          type="button"
                          onClick={() => setIsAddingContractor(true)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--primary)",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: 0,
                          }}
                        >
                          <PlusCircle size={13} />
                          + Incluir nuevo
                        </button>
                      )}
                    </div>

                    {isAddingContractor ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <input
                          type="text"
                          autoFocus
                          placeholder="Nombre del contratista..."
                          value={newContractorName}
                          onChange={(e) => setNewContractorName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleQuickAddContractor();
                            } else if (e.key === "Escape") {
                              setIsAddingContractor(false);
                            }
                          }}
                          className="input-field"
                          style={{ fontSize: "0.85rem", padding: "0.45rem 0.65rem" }}
                        />
                        <button
                          type="button"
                          onClick={handleQuickAddContractor}
                          className="btn btn-success btn-sm"
                          style={{ padding: "0.45rem 0.65rem" }}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingContractor(false);
                            setNewContractorName("");
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.45rem 0.65rem" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <select
                          value={formData.idContratista}
                          onChange={(e) => {
                            if (e.target.value === "__NEW__") {
                              setIsAddingContractor(true);
                            } else {
                              const cont = contractors.find((c) => c.id === e.target.value);
                              setFormData({
                                ...formData,
                                idContratista: e.target.value,
                                contratistaNombre: cont ? cont.nombre : formData.contratistaNombre,
                              });
                              setFormError(null);
                            }
                          }}
                          className="select-field"
                          style={{ flex: 1 }}
                        >
                          <option value="">-- Seleccionar Contratista / Empresa --</option>
                          {contractors.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre} ({c.tipo})
                            </option>
                          ))}
                          <option value="__NEW__" style={{ fontWeight: 700, color: "var(--primary)" }}>
                            + Registrar nuevo Contratista...
                          </option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsAddingContractor(true)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0 0.6rem" }}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Estado del Reporte (Con TODOS los tipos de estados requeridos) y Fecha */}
              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1rem" }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <label className="input-label" style={{ margin: 0 }}>
                      Estado del Caso / Proceso *
                    </label>
                    <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: 700 }}>
                      Momento a Momento
                    </span>
                  </div>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleEstadoChange(e.target.value as ReporteEstado)}
                    className="select-field"
                    style={{ fontWeight: 600 }}
                  >
                    {ESTADOS_GRUPOS.map((g) => (
                      <optgroup key={g.grupo} label={g.grupo}>
                        {g.estados.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Calendar size={13} color="var(--primary)" />
                    Fecha del Reporte *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Categoría o Especialidad Desplegable */}
              <div className="input-group" style={{ margin: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <label className="input-label" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Layers size={14} color="var(--primary)" />
                    Categoría / Tipo de Trabajo
                  </label>
                  {!isAddingCategory && (
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: 0,
                      }}
                    >
                      <PlusCircle size={13} />
                      + Incluir nuevo tipo
                    </button>
                  )}
                </div>

                {isAddingCategory ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nueva categoría o especialidad..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleQuickAddCategory();
                        } else if (e.key === "Escape") {
                          setIsAddingCategory(false);
                        }
                      }}
                      className="input-field"
                      style={{ fontSize: "0.85rem", padding: "0.45rem 0.65rem" }}
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      className="btn btn-success btn-sm"
                      style={{ padding: "0.45rem 0.65rem" }}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName("");
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0.45rem 0.65rem" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        if (e.target.value === "__NEW__") {
                          setIsAddingCategory(true);
                        } else {
                          setSelectedCategory(e.target.value);
                        }
                      }}
                      className="select-field"
                      style={{ flex: 1 }}
                    >
                      {customCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__NEW__" style={{ fontWeight: 700, color: "var(--primary)" }}>
                        + Incluir nuevo campo de categoría...
                      </option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0 0.6rem" }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Descripción Detallada */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Descripción Detallada del Trabajo o Novedad *</label>
                <textarea
                  rows={3}
                  placeholder="Describa el trabajo a realizar, diagnóstico o novedad..."
                  value={formData.reporte}
                  onChange={(e) => {
                    setFormData({ ...formData, reporte: e.target.value });
                    setFormError(null);
                  }}
                  className="textarea-field"
                  required
                />
              </div>

              {/* Presupuesto y Tasa de Avance */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Calculator size={14} color="var(--primary)" />
                    Presupuesto Base / Cotización (COP)
                  </label>
                  <input
                    type="number"
                    value={formData.totalCotizacion || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, totalCotizacion: Number(e.target.value) });
                      setFormError(null);
                    }}
                    className="input-field"
                    placeholder="680000"
                  />
                  <span style={{ fontSize: "0.725rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.2rem" }}>
                    <CheckCircle size={12} /> Sincronizado automáticamente con la Parte 2 (Cotizaciones)
                  </span>
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label className="input-label" style={{ margin: 0 }}>Tasa de Avance (0.0 a 1.0)</label>
                    <span style={{ fontSize: "0.775rem", fontWeight: 700, color: "var(--text-main)" }}>
                      {Math.round((formData.tasaAvance || 0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={formData.tasaAvance}
                    onChange={(e) => handleAvanceChange(Number(e.target.value))}
                    className="input-field"
                    placeholder="0.65"
                  />
                  <div
                    style={{
                      height: "5px",
                      background: "var(--neutral-200)",
                      borderRadius: "9999px",
                      overflow: "hidden",
                      marginTop: "0.35rem",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, Math.round((formData.tasaAvance || 0) * 100))}%`,
                        background: formData.tasaAvance >= 1 ? "#059669" : "#3b82f6",
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción Parte 1 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--neutral-200)",
                  marginTop: "0.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                  >
                    <Save size={14} />
                    Guardar Reporte
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSaveReporte(e, true)}
                    className="btn btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    <span>Siguiente: Cotizaciones del Caso</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* =========================================================================
              PARTE 2: GESTIÓN DE COTIZACIONES SUJETAS AL NÚMERO DE IDREGISTRO
              Permite múltiples cotizaciones por caso (con la misma información del reporte)
             ========================================================================= */}
          {formStep === "cotizacion" && activeCotizacion && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Header de Vinculación al Caso idRegistro */}
              <div
                style={{
                  padding: "0.85rem 1rem",
                  background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(16,185,129,0.04) 100%)",
                  border: "1px solid rgba(37,99,235,0.2)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "0.95rem" }}>
                    <span>Caso / Reporte Principal:</span>
                    <span
                      style={{
                        background: "var(--primary)",
                        color: "#fff",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      #{currentOrderId}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "0.85rem" }}>
                      ({formData.direccion} • {formData.clienteNombre})
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Múltiples cotizaciones sujetas al mismo identificador de caso con información heredada del reporte.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateNewCaseCotizacion}
                  className="btn btn-primary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Plus size={14} />
                  + Nueva Cotización para este Caso
                </button>
              </div>

              {/* Selector / Pestañas de Cotizaciones vinculadas al Caso */}
              {caseCotizaciones.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.775rem", fontWeight: 700, color: "var(--text-muted)" }}>
                    Cotizaciones del Caso #{currentOrderId}:
                  </span>
                  {caseCotizaciones.map((cot, idx) => {
                    const isSelected = activeCotizacion?.idCotizacion === cot.idCotizacion;
                    return (
                      <div
                        key={cot.idCotizacion}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: "6px",
                          overflow: "hidden",
                          border: `1px solid ${isSelected ? "var(--primary)" : "var(--neutral-300)"}`,
                          background: isSelected ? "rgba(37,99,235,0.08)" : "var(--surface)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveCotizacion(cot)}
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: "0.4rem 0.75rem",
                            fontSize: "0.8rem",
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? "var(--primary)" : "var(--text-main)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <span>{cot.titulo || `Opción ${idx + 1}`}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            (#{cot.idCotizacion})
                          </span>
                          <span style={{ fontWeight: 800, color: isSelected ? "var(--primary)" : "var(--text-main)" }}>
                            {formatCOP(cot.numTodoCosto)}
                          </span>
                        </button>
                        {caseCotizaciones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar la Cotización #${cot.idCotizacion}?`)) {
                                deleteCotizacion(cot.idCotizacion);
                                const remaining = caseCotizaciones.filter((c) => c.idCotizacion !== cot.idCotizacion);
                                if (remaining.length > 0) setActiveCotizacion(remaining[0]);
                              }
                            }}
                            title="Eliminar esta cotización"
                            style={{
                              border: "none",
                              background: "transparent",
                              padding: "0.4rem 0.5rem",
                              color: "var(--neutral-400)",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Título y Estado de la Cotización Activa */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Título o Concepto de esta Cotización</label>
                  <input
                    type="text"
                    value={activeCotizacion.titulo || ""}
                    onChange={(e) => setActiveCotizacion({ ...activeCotizacion, titulo: e.target.value })}
                    className="input-field"
                    placeholder="Ej. Cotización Principal - Reparación Hidrosanitaria Integral"
                  />
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Estado de la Cotización</label>
                  <select
                    value={activeCotizacion.estado}
                    onChange={(e) =>
                      setActiveCotizacion({
                        ...activeCotizacion,
                        estado: e.target.value as Cotizacion["estado"],
                      })
                    }
                    className="select-field"
                  >
                    <option value="Borrador">Borrador (Propuesta)</option>
                    <option value="Aprobada">Aprobada por Cliente</option>
                    <option value="Rechazada">Rechazada</option>
                    <option value="Facturada">Facturada</option>
                  </select>
                </div>
              </div>

              {/* TABLA DINÁMICA DE ÍTEMS PRESUPUESTADOS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label className="input-label" style={{ margin: 0, fontWeight: 800, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Calculator size={15} color="var(--primary)" />
                    <span>Listado de Ítems, Mano de Obra y Materiales (Precios Ajustables)</span>
                  </label>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Campos de unidades y precios unitarios editables en tiempo real
                  </span>
                </div>

                <div
                  style={{
                    border: "1px solid var(--neutral-200)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    background: "var(--surface)",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
                    <thead>
                      <tr style={{ background: "var(--neutral-100, #f8fafc)", borderBottom: "1px solid var(--neutral-200)" }}>
                        <th style={{ padding: "0.55rem 0.65rem", textAlign: "left", width: "140px" }}>Tipo</th>
                        <th style={{ padding: "0.55rem 0.65rem", textAlign: "left" }}>Descripción de la Labor o Insumo</th>
                        <th style={{ padding: "0.55rem 0.65rem", textAlign: "left", width: "110px" }}>Unidad</th>
                        <th style={{ padding: "0.55rem 0.65rem", textAlign: "right", width: "85px" }}>Cant.</th>
                        <th style={{ padding: "0.55rem 0.65rem", textAlign: "right", width: "125px" }}>Precio Unitario</th>
                        <th style={{ padding: "0.55rem 0.65rem", textAlign: "right", width: "125px" }}>Subtotal</th>
                        <th style={{ padding: "0.55rem 0.4rem", textAlign: "center", width: "40px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCotizacion.items.map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: "1px solid var(--neutral-200)" }}>
                          <td style={{ padding: "0.4rem 0.6rem" }}>
                            <select
                              value={item.tipo || "Mano de Obra"}
                              onChange={(e) => handleItemFieldChange(idx, "tipo", e.target.value)}
                              className="select-field"
                              style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem", height: "auto" }}
                            >
                              <option value="Mano de Obra">Mano de Obra</option>
                              <option value="Material">Material</option>
                              <option value="Transporte">Transporte</option>
                              <option value="Equipo">Equipo / Herram.</option>
                            </select>
                          </td>
                          <td style={{ padding: "0.4rem 0.6rem" }}>
                            <input
                              type="text"
                              value={item.descripcion}
                              onChange={(e) => handleItemFieldChange(idx, "descripcion", e.target.value)}
                              className="input-field"
                              style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem", height: "auto" }}
                              placeholder="Descripción del trabajo..."
                            />
                          </td>
                          <td style={{ padding: "0.4rem 0.6rem" }}>
                            <select
                              value={item.unidad || "GLB"}
                              onChange={(e) => handleItemFieldChange(idx, "unidad", e.target.value)}
                              className="select-field"
                              style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem", height: "auto" }}
                            >
                              {UNIDADES_MEDIDA.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "0.4rem 0.6rem" }}>
                            <input
                              type="number"
                              min="0.1"
                              step="any"
                              value={item.cantidad}
                              onChange={(e) => handleItemFieldChange(idx, "cantidad", e.target.value)}
                              className="input-field"
                              style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem", height: "auto", textAlign: "right" }}
                            />
                          </td>
                          <td style={{ padding: "0.4rem 0.6rem" }}>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={item.valorUnitario}
                              onChange={(e) => handleItemFieldChange(idx, "valorUnitario", e.target.value)}
                              className="input-field"
                              style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem", height: "auto", textAlign: "right" }}
                            />
                          </td>
                          <td style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                            {formatCOP(item.valorTotal)}
                          </td>
                          <td style={{ padding: "0.4rem 0.4rem", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(idx)}
                              style={{
                                border: "none",
                                background: "none",
                                color: "var(--danger)",
                                cursor: "pointer",
                                padding: "0.2rem",
                              }}
                              title="Eliminar ítem"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Botones rápidos para agregar tipos de ítems */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                  <button
                    type="button"
                    onClick={() => handleAddItem("Mano de Obra")}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                  >
                    <Wrench size={13} color="var(--primary)" />
                    + Mano de Obra
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem("Material")}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                  >
                    <Package size={13} color="#059669" />
                    + Material / Insumo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem("Transporte")}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                  >
                    <Truck size={13} color="#d97706" />
                    + Transporte / Acarreo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem("Equipo")}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                  >
                    <PlusCircle size={13} color="#7c3aed" />
                    + Herramienta / Equipo
                  </button>
                </div>
              </div>

              {/* Resumen de Costos y Subtotales */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "0.75rem",
                  padding: "0.85rem 1rem",
                  background: "var(--neutral-50, #f8fafc)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--neutral-200)",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                    Subtotal Mano de Obra
                  </span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {formatCOP(activeCotizacion.numManoObra)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                    Subtotal Materiales
                  </span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {formatCOP(activeCotizacion.numMaterial)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                    Transporte y Equipos
                  </span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {formatCOP(activeCotizacion.numTransporte)}
                  </span>
                </div>
                <div style={{ borderLeft: "2px solid var(--primary)", paddingLeft: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 700, display: "block" }}>
                    TOTAL TODO COSTO (COP)
                  </span>
                  <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--primary)" }}>
                    {formatCOP(activeCotizacion.numTodoCosto)}
                  </span>
                </div>
              </div>

              {/* APARTADO DE NOTAS, GARANTÍA Y TÉRMINOS */}
              <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "1rem" }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Notas Técnicas, Observaciones y Condiciones</label>
                  <textarea
                    rows={2}
                    value={activeCotizacion.observaciones}
                    onChange={(e) =>
                      setActiveCotizacion({ ...activeCotizacion, observaciones: e.target.value })
                    }
                    className="textarea-field"
                    placeholder="Condiciones del servicio, restricciones de horario, exclusiones de obra..."
                  />
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Días de Garantía Técnica</label>
                  <input
                    type="number"
                    value={activeCotizacion.diasGarantia || 30}
                    onChange={(e) =>
                      setActiveCotizacion({
                        ...activeCotizacion,
                        diasGarantia: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="input-field"
                    placeholder="30"
                  />
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Cobertura contra vicios ocultos de instalación
                  </span>
                </div>
              </div>

              {/* APARTADO DE ETIQUETAS TÉCNICAS REUTILIZABLES CON DESCRIPCIONES */}
              <div
                style={{
                  padding: "1rem",
                  background: "var(--neutral-50, #f8fafc)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--neutral-200)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 800, fontSize: "0.85rem" }}>
                    <Tag size={15} color="var(--primary)" />
                    <span>Etiquetas Técnicas del Formulario (Aparecen en el PDF con su descripción)</span>
                  </div>
                  {!isAddingCustomTag && (
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomTag(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <PlusCircle size={13} />
                      + Crear Nueva Etiqueta Personalizada
                    </button>
                  )}
                </div>

                {/* Formulario para agregar nueva etiqueta al catálogo persistente */}
                {isAddingCustomTag && (
                  <div
                    style={{
                      background: "var(--surface)",
                      padding: "0.85rem",
                      borderRadius: "6px",
                      border: "1px solid var(--neutral-300)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text-main)" }}>
                      Registrar Nueva Etiqueta Reutilizable en Catálogo:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "0.6rem" }}>
                      <input
                        type="text"
                        placeholder="Nombre de la Etiqueta (Ej. Protocolo Bioseguridad)"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="input-field"
                        style={{ fontSize: "0.8rem" }}
                      />
                      <input
                        type="text"
                        placeholder="Descripción técnica que aparecerá en el PDF..."
                        value={newTagDesc}
                        onChange={(e) => setNewTagDesc(e.target.value)}
                        className="input-field"
                        style={{ fontSize: "0.8rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomTag(false)}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateCustomTag}
                        className="btn btn-primary btn-sm"
                      >
                        Guardar en Catálogo Permanente
                      </button>
                    </div>
                  </div>
                )}

                {/* Grid de Etiquetas disponibles */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {etiquetasCatalog.map((et) => {
                    const isChecked = (activeCotizacion.etiquetas || []).includes(et.nombre);
                    const currentDesc =
                      activeCotizacion.etiquetasDescripciones?.[et.nombre] ?? et.descripcion;

                    return (
                      <div
                        key={et.id}
                        style={{
                          background: isChecked ? "rgba(37,99,235,0.03)" : "var(--surface)",
                          border: `1px solid ${isChecked ? "rgba(37,99,235,0.3)" : "var(--neutral-200)"}`,
                          borderRadius: "6px",
                          padding: "0.65rem 0.85rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.4rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              cursor: "pointer",
                              fontWeight: isChecked ? 700 : 500,
                              fontSize: "0.825rem",
                              color: isChecked ? "var(--primary)" : "var(--text-main)",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleEtiqueta(et.nombre)}
                              style={{ width: "15px", height: "15px", cursor: "pointer" }}
                            />
                            <span>{et.nombre}</span>
                          </label>

                          {isChecked && (
                            <button
                              type="button"
                              onClick={() => handleSaveDescriptionAsDefault(et.nombre, currentDesc)}
                              title="Guardar este texto como predeterminado para todos los casos futuros"
                              style={{
                                background: "none",
                                border: "none",
                                color: "#059669",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <Save size={12} />
                              Guardar como predeterminado para futuros reportes
                            </button>
                          )}
                        </div>

                        {isChecked && (
                          <textarea
                            rows={2}
                            value={currentDesc}
                            onChange={(e) => handleEditEtiquetaDescripcion(et.nombre, e.target.value)}
                            className="textarea-field"
                            style={{
                              fontSize: "0.775rem",
                              padding: "0.4rem 0.6rem",
                              background: "var(--surface)",
                            }}
                            placeholder="Descripción que se imprimirá en el PDF..."
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botones de Navegación Parte 2 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--neutral-200)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setFormStep("reporte")}
                  className="btn btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <ArrowLeft size={15} />
                  <span>Volver a Datos del Reporte</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={handleSaveCotizacion}
                    className="btn btn-secondary"
                  >
                    <Save size={14} />
                    Guardar Cotización
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCotizacion();
                      setFormStep("firma");
                    }}
                    className="btn btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    <span>Continuar a Documento PDF & Firma</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PARTE 3: DOCUMENTO PDF CON FIRMA ELECTRÓNICA
              Formato oficial para impresión y certificación digital
             ========================================================================= */}
          {formStep === "firma" && activeCotizacion && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Barra Superior con Acciones de Impresión */}
              <div
                className="no-print"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "var(--neutral-100, #f8fafc)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--neutral-200)",
                }}
              >
                <div style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
                  Vista previa oficial del documento para cliente, contratista e inmobiliaria.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setFormStep("cotizacion")}
                    className="btn btn-secondary btn-sm"
                  >
                    <ArrowLeft size={14} />
                    Volver a Cotización
                  </button>
                  <button
                    type="button"
                    onClick={triggerPrint}
                    className="btn btn-primary btn-sm"
                    style={{ background: "#0f172a" }}
                  >
                    <Printer size={15} />
                    Imprimir / Descargar PDF Oficial
                  </button>
                </div>
              </div>

              {/* DOCUMENTO OFICIAL FORMATEADO PARA PDF & IMPRESIÓN */}
              <div
                className="printable-pdf-document"
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  padding: "2rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--neutral-300, #cbd5e1)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  fontFamily: "var(--font-sans, system-ui, sans-serif)",
                }}
              >
                {/* Membrete Oficial */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    borderBottom: "2px solid #0f172a",
                    paddingBottom: "1rem",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#1e3a8a", letterSpacing: "-0.5px" }}>
                      SOSENLINEA S.A.S.
                    </div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>
                      SERVICIOS OPERATIVOS, MANTENIMIENTO & REPARACIONES
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                      NIT: 901.458.789-2 • Medellín & Valle de Aburrá, Antioquia • Tel: (604) 444-0123
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-block",
                        background: "#1e3a8a",
                        color: "#ffffff",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "4px",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      ORDEN & COTIZACIÓN OFICIAL
                    </div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 800, marginTop: "0.35rem", color: "#0f172a" }}>
                      CASO BD: #{currentOrderId}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      Cotización No. #{activeCotizacion.idCotizacion}
                    </div>
                  </div>
                </div>

                {/* Metadatos del Inmueble y Participantes */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr",
                    gap: "1rem",
                    background: "#f8fafc",
                    padding: "0.85rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div>
                      <strong>Dirección Inmueble:</strong> {formData.direccion}
                    </div>
                    <div>
                      <strong>Sector / Zona:</strong> {formData.sector} (Medellín y V. de Aburrá)
                    </div>
                    <div>
                      <strong>Cliente / Inmobiliaria:</strong> {formData.clienteNombre}
                    </div>
                    <div>
                      <strong>Concepto / Título:</strong> {activeCotizacion.titulo || "Mantenimiento Técnico Integral"}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div>
                      <strong>Fecha de Registro:</strong> {formatDateCO(activeCotizacion.fecha || formData.fecha)}
                    </div>
                    {includeArrendatario && formData.arrendatario ? (
                      <div>
                        <strong>Arrendatario:</strong> {formData.arrendatario}
                      </div>
                    ) : null}
                    {includePropietario && formData.propietario ? (
                      <div>
                        <strong>Propietario:</strong> {formData.propietario}
                      </div>
                    ) : null}
                    <div>
                      <strong>Contratista Asignado:</strong> {formData.contratistaNombre || "Personal Técnico SOSENLINEA"}
                    </div>
                  </div>
                </div>

                {/* Tabla de Ítems Cotizados en el Documento */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e3a8a", marginBottom: "0.4rem" }}>
                    DESGLOSE DE ACTIVIDADES, MATERIALES Y MANO DE OBRA:
                  </div>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.8rem",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #cbd5e1" }}>
                        <th style={{ padding: "0.5rem", textAlign: "left", width: "35px" }}>#</th>
                        <th style={{ padding: "0.5rem", textAlign: "left", width: "120px" }}>Tipo</th>
                        <th style={{ padding: "0.5rem", textAlign: "left" }}>Descripción del Trabajo / Insumo</th>
                        <th style={{ padding: "0.5rem", textAlign: "center", width: "70px" }}>Unidad</th>
                        <th style={{ padding: "0.5rem", textAlign: "right", width: "65px" }}>Cant.</th>
                        <th style={{ padding: "0.5rem", textAlign: "right", width: "110px" }}>Vr. Unitario</th>
                        <th style={{ padding: "0.5rem", textAlign: "right", width: "120px" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCotizacion.items.map((it, idx) => (
                        <tr key={it.id || idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "0.45rem 0.5rem", textAlign: "left", color: "#64748b" }}>{idx + 1}</td>
                          <td style={{ padding: "0.45rem 0.5rem", fontWeight: 600 }}>{it.tipo}</td>
                          <td style={{ padding: "0.45rem 0.5rem" }}>{it.descripcion}</td>
                          <td style={{ padding: "0.45rem 0.5rem", textAlign: "center" }}>{it.unidad}</td>
                          <td style={{ padding: "0.45rem 0.5rem", textAlign: "right" }}>{it.cantidad}</td>
                          <td style={{ padding: "0.45rem 0.5rem", textAlign: "right" }}>{formatCOP(it.valorUnitario)}</td>
                          <td style={{ padding: "0.45rem 0.5rem", textAlign: "right", fontWeight: 700 }}>
                            {formatCOP(it.valorTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "#f8fafc", borderTop: "2px solid #cbd5e1" }}>
                        <td colSpan={5} style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontWeight: 700 }}>
                          Subtotal Mano de Obra:
                        </td>
                        <td colSpan={2} style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontWeight: 700 }}>
                          {formatCOP(activeCotizacion.numManoObra)}
                        </td>
                      </tr>
                      <tr style={{ background: "#f8fafc" }}>
                        <td colSpan={5} style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontWeight: 700 }}>
                          Subtotal Materiales e Insumos:
                        </td>
                        <td colSpan={2} style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontWeight: 700 }}>
                          {formatCOP(activeCotizacion.numMaterial)}
                        </td>
                      </tr>
                      <tr style={{ background: "#f8fafc" }}>
                        <td colSpan={5} style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontWeight: 700 }}>
                          Transporte, Acarreos y Equipos:
                        </td>
                        <td colSpan={2} style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontWeight: 700 }}>
                          {formatCOP(activeCotizacion.numTransporte)}
                        </td>
                      </tr>
                      <tr style={{ background: "#1e3a8a", color: "#ffffff", fontWeight: 800, fontSize: "0.9rem" }}>
                        <td colSpan={5} style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>
                          VALOR TOTAL A TODO COSTO (COP):
                        </td>
                        <td colSpan={2} style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>
                          {formatCOP(activeCotizacion.numTodoCosto)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Notas y Garantía */}
                <div style={{ fontSize: "0.775rem", lineHeight: 1.5, background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div>
                    <strong>Observaciones y Condiciones:</strong> {activeCotizacion.observaciones || "Mantenimiento locativo profesional sujeto a términos contractuales."}
                  </div>
                  <div style={{ marginTop: "0.25rem", color: "#1e3a8a", fontWeight: 700 }}>
                    🛡️ Garantía Técnica: {activeCotizacion.diasGarantia || 30} días calendario a partir de la firma de conformidad.
                  </div>
                </div>

                {/* Etiquetas y Cláusulas Técnicas Seleccionadas */}
                {activeCotizacion.etiquetas && activeCotizacion.etiquetas.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.825rem", color: "#1e3a8a" }}>
                      CLÁUSULAS TÉCNICAS Y ETIQUETAS DE CERTIFICACIÓN:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {activeCotizacion.etiquetas.map((tagName) => {
                        const desc =
                          activeCotizacion.etiquetasDescripciones?.[tagName] ||
                          etiquetasCatalog.find((e) => e.nombre === tagName)?.descripcion ||
                          "Cláusula de calidad y garantía técnica de cumplimiento.";
                        return (
                          <div
                            key={tagName}
                            style={{
                              background: "#f8fafc",
                              borderLeft: "3px solid #1e3a8a",
                              padding: "0.45rem 0.75rem",
                              fontSize: "0.75rem",
                              lineHeight: 1.4,
                            }}
                          >
                            <span style={{ fontWeight: 800, color: "#1e3a8a" }}>{tagName}: </span>
                            <span style={{ color: "#334155" }}>{desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SECCIÓN DE FIRMA ELECTRÓNICA */}
                <div
                  style={{
                    borderTop: "2px dashed #cbd5e1",
                    paddingTop: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ShieldCheck size={16} color="#16a34a" />
                    <span>CONSTANCIA DE ACEPTACIÓN & FIRMA ELECTRÓNICA (Ley 527 de 1999)</span>
                  </div>

                  {/* Campos del Firmante */}
                  <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "0.75rem" }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.75rem" }}>Nombre Completo del Firmante *</label>
                      <input
                        type="text"
                        placeholder="Ej. Juan David Gómez"
                        value={firmaDatos.firmante}
                        onChange={(e) => setFirmaDatos({ ...firmaDatos, firmante: e.target.value })}
                        className="input-field"
                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
                      />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.75rem" }}>Cédula / Documento *</label>
                      <input
                        type="text"
                        placeholder="C.C. 1.020.304.506"
                        value={firmaDatos.documento || ""}
                        onChange={(e) => setFirmaDatos({ ...firmaDatos, documento: e.target.value })}
                        className="input-field"
                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
                      />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.75rem" }}>Rol en el Inmueble</label>
                      <select
                        value={firmaDatos.rol || "Arrendatario"}
                        onChange={(e) => setFirmaDatos({ ...firmaDatos, rol: e.target.value })}
                        className="select-field"
                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
                      >
                        <option value="Arrendatario">Arrendatario</option>
                        <option value="Propietario">Propietario</option>
                        <option value="Contratista">Contratista Ejecutor</option>
                        <option value="Supervisor Inmobiliario">Supervisor Inmobiliario</option>
                      </select>
                    </div>
                  </div>

                  {/* Canvas interactivo de trazo de firma */}
                  <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "280px" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.3rem" }}>
                        Trazo de Firma Digital (Táctil o Cursor del mouse):
                      </div>
                      <div
                        style={{
                          border: "1.5px solid #94a3b8",
                          borderRadius: "6px",
                          background: "#ffffff",
                          display: "inline-block",
                          position: "relative",
                        }}
                      >
                        <canvas
                          ref={canvasRef}
                          width={440}
                          height={140}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          style={{
                            display: "block",
                            cursor: "crosshair",
                            touchAction: "none",
                            background: "#ffffff",
                            maxWidth: "100%",
                          }}
                        />
                      </div>

                      {/* Controles de firma */}
                      <div
                        className="signature-pad-controls no-print"
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.4rem" }}
                      >
                        <button
                          type="button"
                          onClick={handleClearSignature}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.72rem", padding: "0.3rem 0.5rem" }}
                        >
                          <RotateCcw size={12} />
                          Limpiar Trazo
                        </button>
                        <button
                          type="button"
                          onClick={handleCertifySignature}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem", background: "#16a34a" }}
                        >
                          <CheckCircle size={12} />
                          Estampar & Certificar Firma Digital
                        </button>
                      </div>
                    </div>

                    {/* Certificado de Integridad Digital */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: "260px",
                        background: firmaDatos.hashCertificado ? "rgba(16, 185, 129, 0.05)" : "#f8fafc",
                        border: `1px solid ${firmaDatos.hashCertificado ? "#10b981" : "#e2e8f0"}`,
                        padding: "0.85rem 1rem",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ fontWeight: 800, color: firmaDatos.hashCertificado ? "#059669" : "#64748b", marginBottom: "0.3rem" }}>
                        {firmaDatos.hashCertificado ? "✓ FIRMA DIGITALIZADA VÁLIDA" : "⏳ FIRMA PENDIENTE DE CERTIFICACIÓN"}
                      </div>
                      <div>
                        <strong>Firmante:</strong> {firmaDatos.firmante || "Sin registrar"}
                      </div>
                      <div>
                        <strong>Documento:</strong> {firmaDatos.documento || "Sin registrar"}
                      </div>
                      <div>
                        <strong>Calidad / Rol:</strong> {firmaDatos.rol || "Receptor"}
                      </div>
                      <div>
                        <strong>Fecha / Hora:</strong> {firmaDatos.fechaFirma || new Date().toISOString().slice(0, 10)}
                      </div>
                      {firmaDatos.hashCertificado && (
                        <div style={{ marginTop: "0.4rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "#059669", wordBreak: "break-all" }}>
                          <strong>Hash de Autenticidad:</strong> {firmaDatos.hashCertificado}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones finales de navegación */}
              <div
                className="no-print"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--neutral-200)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setFormStep("cotizacion")}
                  className="btn btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <ArrowLeft size={15} />
                  <span>Volver a Editar Cotización</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={triggerPrint}
                    className="btn btn-secondary"
                  >
                    <Printer size={15} />
                    Imprimir Documento
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveReporte();
                      handleSaveCotizacion();
                      setFormStep("proceso");
                    }}
                    className="btn btn-primary"
                    style={{ background: "#0891b2" }}
                  >
                    <span>Ir a Proceso & Seguimiento</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PARTE 4: REGISTRO DEL PROCESO & SEGUIMIENTO EN VIVO (MOMENTO A MOMENTO)
              Historial de novedades, actualización de estados y WhatsApp a un clic
             ========================================================================= */}
          {formStep === "proceso" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Header de Seguimiento en Vivo */}
              <div
                style={{
                  padding: "0.85rem 1rem",
                  background: "linear-gradient(135deg, rgba(8,145,178,0.08) 0%, rgba(37,99,235,0.05) 100%)",
                  border: "1px solid rgba(8,145,178,0.25)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "0.95rem" }}>
                    <Activity size={18} color="#0891b2" />
                    <span>REGISTRO DEL PROCESO & SEGUIMIENTO EN VIVO:</span>
                    <span
                      style={{
                        background: "#0891b2",
                        color: "#fff",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      CASO #{currentOrderId}
                    </span>
                    {formData.codigoAlfanumerico && (
                      <span
                        style={{
                          background: "rgba(8,145,178,0.15)",
                          color: "#0891b2",
                          border: "1px solid #0891b2",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        Radicado: {formData.codigoAlfanumerico}
                      </span>
                    )}
                    <span
                      style={{
                        background: "#1e3a8a",
                        color: "#fff",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {formData.tipoTrabajo}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Inmueble: <strong>{formData.direccion}</strong> • Cliente: <strong>{formData.clienteNombre}</strong> • Estado actual: <strong>{formData.estado}</strong>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#0891b2", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ShieldCheck size={13} />
                    <span>Operador en Sesión: <strong>{currentUser?.name || "Administrador"}</strong> ({currentRole})</span>
                    <span>•</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      Sello de Sesión: {currentUser?.id ? `SOS-SIG-${currentUser.id.toUpperCase()}-OP` : "SOS-SIG-SESSION-ACTIVE"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    className="badge badge-info"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.75rem",
                      padding: "0.35rem 0.75rem",
                    }}
                  >
                    <Clock size={13} />
                    {activeReporteEnVivo?.ultimoActualizado
                      ? `Última Novedad: ${formatDateTimeCO(activeReporteEnVivo.ultimoActualizado)}`
                      : "Registro activo"}
                  </span>
                </div>
              </div>

              {/* CARD 1: REGISTRAR NUEVA ACTUALIZACIÓN DE ESTADO Y NOVEDAD */}
              <div
                style={{
                  background: "var(--neutral-50, #f8fafc)",
                  padding: "1rem 1.15rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--neutral-200)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <History size={16} color="var(--primary)" />
                  <span>Actualizar Estado del Caso & Registrar Novedad en la Bitácora:</span>
                </div>

                <form onSubmit={handleRegistrarNovedadProceso} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "0.75rem" }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.75rem" }}>
                        Nuevo Estado del Proceso:
                      </label>
                      <select
                        value={nuevoEstadoProceso}
                        onChange={(e) => setNuevoEstadoProceso(e.target.value as ReporteEstado)}
                        className="select-field"
                        style={{ fontSize: "0.8rem", fontWeight: 700 }}
                      >
                        {ESTADOS_GRUPOS.map((g) => (
                          <optgroup key={g.grupo} label={g.grupo}>
                            {g.estados.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.75rem" }}>
                        Canal / Tipo de Acción:
                      </label>
                      <select
                        value={nuevaAccionProceso}
                        onChange={(e) => setNuevaAccionProceso(e.target.value)}
                        className="select-field"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <option value="whatsapp">Mensaje de WhatsApp</option>
                        <option value="correo">Correo Electrónico</option>
                        <option value="llamada">Llamada Telefónica</option>
                        <option value="visita">Visita en Terreno</option>
                        <option value="calidad">Control de Calidad</option>
                        <option value="pago">Gestión de Pago / Anticipo</option>
                        <option value="garantia">Inspección de Garantía</option>
                        <option value="nota">Nota Interna Operativa</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label" style={{ fontSize: "0.75rem" }}>
                      Descripción de la Novedad o Acuerdo con el Cliente / Cuadrilla:
                    </label>
                    <textarea
                      rows={2}
                      value={nuevaNotaProceso}
                      onChange={(e) => setNuevaNotaProceso(e.target.value)}
                      placeholder="Ej. Se envió cotización digital por WhatsApp; arrendatario confirma recepción y solicita visita técnica..."
                      className="textarea-field"
                      style={{ fontSize: "0.8rem" }}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      style={{ background: "#0891b2", display: "flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      <Send size={13} />
                      Registrar en el Historial del Caso
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD 2: CRONOGRAMA & AGENDA DE ACTIVIDADES Y HORARIOS DE ATENCIÓN */}
              <div
                style={{
                  background: "var(--surface)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--neutral-200)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Calendar size={16} color="#0891b2" />
                    <span>Agenda de Actividades & Horarios Programados:</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {activeReporteEnVivo?.agendaActividades?.length || 0} actividades en cronograma
                  </span>
                </div>

                {/* Formulario para programar actividad */}
                <form
                  onSubmit={handleCrearActividadAgenda}
                  style={{
                    background: "var(--neutral-50, #f8fafc)",
                    padding: "0.75rem 0.85rem",
                    borderRadius: "6px",
                    border: "1px dashed var(--neutral-300)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.65rem",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1.2fr", gap: "0.65rem" }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.72rem" }}>
                        Fecha y Hora Programada:
                      </label>
                      <input
                        type="datetime-local"
                        value={nuevaAgendaData.fechaHora}
                        onChange={(e) => setNuevaAgendaData((prev) => ({ ...prev, fechaHora: e.target.value }))}
                        className="input-field"
                        style={{ fontSize: "0.78rem" }}
                        required
                      />
                    </div>

                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.72rem" }}>
                        Tipo de Actividad:
                      </label>
                      <select
                        value={nuevaAgendaData.tipoActividad}
                        onChange={(e) =>
                          setNuevaAgendaData((prev) => ({
                            ...prev,
                            tipoActividad: e.target.value as ActividadAgenda["tipoActividad"],
                          }))
                        }
                        className="select-field"
                        style={{ fontSize: "0.78rem" }}
                      >
                        <option value="Visita Técnica">Visita Técnica</option>
                        <option value="Control de Calidad">Control de Calidad</option>
                        <option value="Ejecución en Terreno">Ejecución en Terreno</option>
                        <option value="Revisión de Garantía">Revisión de Garantía</option>
                        <option value="Entrega a Conformidad">Entrega a Conformidad</option>
                        <option value="Inspección de Cotización">Inspección de Cotización</option>
                      </select>
                    </div>

                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.72rem" }}>
                        Técnico / Responsable:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Jorge Ramírez"
                        value={nuevaAgendaData.tecnicoNombre}
                        onChange={(e) => setNuevaAgendaData((prev) => ({ ...prev, tecnicoNombre: e.target.value }))}
                        className="input-field"
                        style={{ fontSize: "0.78rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "0.65rem", alignItems: "flex-end" }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.72rem" }}>
                        Observaciones / Instrucciones para la cuadrilla:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Llevar escalera de 4 cuerpos y equipo de prueba de presión"
                        value={nuevaAgendaData.observaciones}
                        onChange={(e) => setNuevaAgendaData((prev) => ({ ...prev, observaciones: e.target.value }))}
                        className="input-field"
                        style={{ fontSize: "0.78rem" }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-secondary btn-sm"
                      style={{ background: "#0891b2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", fontSize: "0.75rem", height: "34px" }}
                    >
                      <Plus size={13} />
                      Agendar en Cronograma
                    </button>
                  </div>
                </form>

                {/* Listado de actividades agendadas */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {activeReporteEnVivo?.agendaActividades && activeReporteEnVivo.agendaActividades.length > 0 ? (
                    activeReporteEnVivo.agendaActividades.map((act) => {
                      const isCumplida = act.estado === "Cumplida";
                      return (
                        <div
                          key={act.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.6rem 0.8rem",
                            background: isCumplida ? "rgba(22,163,74,0.05)" : "var(--neutral-50, #f8fafc)",
                            border: isCumplida ? "1px solid rgba(22,163,74,0.3)" : "1px solid var(--neutral-200)",
                            borderRadius: "6px",
                            fontSize: "0.775rem",
                            gap: "0.75rem",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flex: 1 }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                padding: "0.15rem 0.45rem",
                                borderRadius: "4px",
                                background: isCumplida ? "#16a34a" : "#0891b2",
                                color: "#fff",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                              }}
                            >
                              <Calendar size={11} />
                              {formatDateTimeCO(act.fechaHora)}
                            </span>

                            <span
                              style={{
                                background: "rgba(8,145,178,0.12)",
                                color: "#0891b2",
                                padding: "0.15rem 0.45rem",
                                borderRadius: "4px",
                                fontWeight: 700,
                                fontSize: "0.72rem",
                              }}
                            >
                              {act.tipoActividad}
                            </span>

                            <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                              Técnico: <strong>{act.tecnicoNombre}</strong>
                            </span>

                            {act.observaciones && (
                              <span style={{ color: "var(--text-muted)", fontSize: "0.725rem" }}>
                                • {act.observaciones}
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span
                              style={{
                                padding: "0.15rem 0.45rem",
                                borderRadius: "4px",
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                background: isCumplida ? "rgba(22,163,74,0.15)" : "rgba(217,119,6,0.15)",
                                color: isCumplida ? "#16a34a" : "#d97706",
                              }}
                            >
                              {act.estado}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleActividadEstado(act.id, act.estado)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                fontSize: "0.7rem",
                                padding: "0.25rem 0.5rem",
                                color: isCumplida ? "var(--text-muted)" : "#16a34a",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <CheckCircle size={12} />
                              {isCumplida ? "Reabrir" : "Marcar Cumplida"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", padding: "0.4rem" }}>
                      No hay actividades agendadas en este momento. Utiliza el formulario superior para programar citas o visitas técnicas.
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 3: ANEXOS TÉCNICOS & NOTAS POR ETIQUETAS */}
              <div
                style={{
                  background: "var(--surface)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--neutral-200)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Tag size={16} color="#2563eb" />
                    <span>Anexos Técnicos & Notas por Etiquetas de Reforma:</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {activeReporteEnVivo?.anexosEtiquetas?.length || 0} anexos registrados
                  </span>
                </div>

                {/* Formulario para añadir anexo */}
                <form
                  onSubmit={handleCrearAnexoEtiqueta}
                  style={{
                    background: "var(--neutral-50, #f8fafc)",
                    padding: "0.75rem 0.85rem",
                    borderRadius: "6px",
                    border: "1px dashed var(--neutral-300)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.65rem",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0.65rem" }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.72rem" }}>
                        Etiqueta de Clasificación:
                      </label>
                      <select
                        value={nuevoAnexoData.etiqueta}
                        onChange={(e) => setNuevoAnexoData((prev) => ({ ...prev, etiqueta: e.target.value }))}
                        className="select-field"
                        style={{ fontSize: "0.78rem" }}
                      >
                        <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                        <option value="Reforma Locativa">Reforma Locativa</option>
                        <option value="Corrección Hidráulica">Corrección Hidráulica</option>
                        <option value="Red Eléctrica">Red Eléctrica</option>
                        <option value="Enchape & Acabados">Enchape & Acabados</option>
                        <option value="Impermeabilización">Impermeabilización</option>
                        <option value="Pintura & Estuco">Pintura & Estuco</option>
                        <option value="Diagnóstico Oculto">Diagnóstico Oculto</option>
                        <option value="Cerrajería & Seguridad">Cerrajería & Seguridad</option>
                      </select>
                    </div>

                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.72rem" }}>
                        Duración Estimada de la Labor:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 1 día, 4 horas, 3 días hábiles"
                        value={nuevoAnexoData.duracionEstimada}
                        onChange={(e) => setNuevoAnexoData((prev) => ({ ...prev, duracionEstimada: e.target.value }))}
                        className="input-field"
                        style={{ fontSize: "0.78rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "0.65rem", alignItems: "flex-end" }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: "0.72rem" }}>
                        Descripción del Anexo Técnico / Reforma:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Se requiere retiro de enchape previo, resane con impermeabilizante y aplicación de 2 capas..."
                        value={nuevoAnexoData.descripcion}
                        onChange={(e) => setNuevoAnexoData((prev) => ({ ...prev, descripcion: e.target.value }))}
                        className="input-field"
                        style={{ fontSize: "0.78rem" }}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-secondary btn-sm"
                      style={{ background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", fontSize: "0.75rem", height: "34px" }}
                    >
                      <Plus size={13} />
                      Añadir Anexo Técnico
                    </button>
                  </div>
                </form>

                {/* Listado de anexos */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {activeReporteEnVivo?.anexosEtiquetas && activeReporteEnVivo.anexosEtiquetas.length > 0 ? (
                    activeReporteEnVivo.anexosEtiquetas.map((anx) => (
                      <div
                        key={anx.id}
                        style={{
                          padding: "0.65rem 0.85rem",
                          background: "var(--neutral-50, #f8fafc)",
                          borderRadius: "6px",
                          border: "1px solid var(--neutral-200)",
                          borderLeft: "3px solid #2563eb",
                          fontSize: "0.775rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.3rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span
                              style={{
                                background: "rgba(37,99,235,0.12)",
                                color: "#2563eb",
                                padding: "0.15rem 0.45rem",
                                borderRadius: "4px",
                                fontWeight: 800,
                                fontSize: "0.72rem",
                              }}
                            >
                              {anx.etiqueta}
                            </span>
                            {anx.duracionEstimada && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontSize: "0.7rem",
                                  color: "var(--text-muted)",
                                }}
                              >
                                <Clock size={11} />
                                {anx.duracionEstimada}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                            {formatDateTimeCO(anx.fechaCreacion)}
                          </span>
                        </div>
                        <div style={{ color: "#334155", lineHeight: 1.4 }}>
                          {anx.descripcion}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", padding: "0.4rem" }}>
                      No se han registrado anexos o notas técnicas adicionales por etiqueta.
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 4: LLAMADAS A LA ACCIÓN & NOTIFICACIONES POR WHATSAPP MULTICANAL A UN CLIC */}
              <div
                style={{
                  background: "var(--surface)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--neutral-200)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <MessageSquare size={16} color="#16a34a" />
                    <span>Notificaciones por WhatsApp Multicanal (A un solo clic):</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Enviado a nombre de: <strong>{currentUser?.name || "Asesor SOSENLINEA"}</strong>
                  </span>
                </div>

                {/* Filtros Multicanal: Destinatario y Propósito */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", padding: "0.6rem 0.75rem", background: "var(--neutral-50, #f8fafc)", borderRadius: "6px", border: "1px solid var(--neutral-200)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", marginRight: "0.2rem" }}>
                      Destinatario:
                    </span>
                    {(["Todos", "Arrendatario", "Propietario", "Proveedor"] as const).map((dest) => (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => setDestinatarioWhatsApp(dest)}
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "4px",
                          border: destinatarioWhatsApp === dest ? "1px solid #16a34a" : "1px solid var(--neutral-300)",
                          background: destinatarioWhatsApp === dest ? "#16a34a" : "var(--surface)",
                          color: destinatarioWhatsApp === dest ? "#fff" : "var(--text-main)",
                          fontWeight: destinatarioWhatsApp === dest ? 700 : 500,
                          cursor: "pointer",
                        }}
                      >
                        {dest === "Todos" ? "Todos" : dest === "Propietario" ? "Propietario / Cliente" : dest === "Proveedor" ? "Proveedor / Técnico" : "Arrendatario"}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", marginRight: "0.2rem" }}>
                      Propósito:
                    </span>
                    {(["Todos", "Accion", "Confirmacion"] as const).map((prop) => (
                      <button
                        key={prop}
                        type="button"
                        onClick={() => setPropositoWhatsApp(prop)}
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "4px",
                          border: propositoWhatsApp === prop ? "1px solid #0891b2" : "1px solid var(--neutral-300)",
                          background: propositoWhatsApp === prop ? "#0891b2" : "var(--surface)",
                          color: propositoWhatsApp === prop ? "#fff" : "var(--text-main)",
                          fontWeight: propositoWhatsApp === prop ? 700 : 500,
                          cursor: "pointer",
                        }}
                      >
                        {prop === "Todos" ? "Todos" : prop === "Accion" ? "⚡ Llamado a la Acción (CTA)" : "📋 Confirmación Informativa"}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  {plantillasWhatsApp
                    .filter((pl) => {
                      const matchDest = destinatarioWhatsApp === "Todos" ? true : pl.destinatario === destinatarioWhatsApp;
                      const matchProp = propositoWhatsApp === "Todos" ? true : pl.proposito === propositoWhatsApp;
                      return matchDest && matchProp;
                    })
                    .map((pl) => {
                      const isCopiado = copiadoFeedback === pl.texto;
                      return (
                        <div
                          key={pl.id}
                          style={{
                            background: "var(--neutral-50, #f8fafc)",
                            border: "1px solid var(--neutral-200)",
                            borderRadius: "6px",
                            padding: "0.75rem",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "0.5rem",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem", flexWrap: "wrap", gap: "0.25rem" }}>
                              <span
                                style={{
                                  fontSize: "0.725rem",
                                  fontWeight: 800,
                                  color: pl.color,
                                  background: "rgba(0,0,0,0.03)",
                                  padding: "0.15rem 0.45rem",
                                  borderRadius: "4px",
                                }}
                              >
                                {pl.etiqueta}
                              </span>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <span style={{ fontSize: "0.65rem", background: "rgba(8,145,178,0.1)", color: "#0891b2", padding: "0.1rem 0.35rem", borderRadius: "3px", fontWeight: 700 }}>
                                  {pl.destinatario}
                                </span>
                                <span style={{ fontSize: "0.65rem", background: "rgba(0,0,0,0.05)", color: "var(--text-muted)", padding: "0.1rem 0.35rem", borderRadius: "3px" }}>
                                  {pl.proposito === "Accion" ? "CTA" : "Info"}
                                </span>
                              </div>
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.4, margin: 0 }}>
                              {pl.texto}
                            </p>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", paddingTop: "0.4rem", borderTop: "1px solid var(--neutral-200)" }}>
                            <button
                              type="button"
                              onClick={() => handleCopiarMensajeWhatsApp(pl.texto)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                flex: 1,
                                fontSize: "0.7rem",
                                padding: "0.3rem 0.5rem",
                                color: isCopiado ? "#16a34a" : "var(--text-main)",
                                fontWeight: isCopiado ? 800 : 600,
                              }}
                            >
                              {isCopiado ? <CheckCheck size={12} color="#16a34a" /> : <Copy size={12} />}
                              {isCopiado ? "¡Copiado!" : "Copiar Mensaje"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAbrirWhatsApp("", pl.texto)}
                              className="btn btn-secondary btn-sm"
                              title="Abrir en WhatsApp Web / App"
                              style={{
                                fontSize: "0.7rem",
                                padding: "0.3rem 0.5rem",
                                color: "#16a34a",
                              }}
                            >
                              <ExternalLink size={12} />
                              WhatsApp
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAbrirDialogoAccion(pl.etiqueta, pl.texto, pl.etiqueta)}
                              className="btn btn-secondary btn-sm"
                              title="Abrir diálogo de acción para personalizar"
                              style={{
                                fontSize: "0.7rem",
                                padding: "0.3rem 0.5rem",
                                color: "var(--primary)",
                              }}
                            >
                              <Send size={12} />
                              Diálogo
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* CARD 5: HISTORIAL EN VIVO DEL REPORTE (TIMELINE DE PROGRESO CON SELLO DIGITAL) */}
              <div
                style={{
                  background: "var(--surface)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--neutral-200)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Clock size={16} color="var(--primary)" />
                    <span>Historial y Bitácora del Caso #{currentOrderId} (Momento a Momento):</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Total eventos: {activeReporteEnVivo?.historial?.length || 1}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {activeReporteEnVivo?.historial && activeReporteEnVivo.historial.length > 0 ? (
                    activeReporteEnVivo.historial.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                          padding: "0.65rem 0.85rem",
                          background: "var(--neutral-50, #f8fafc)",
                          borderRadius: "6px",
                          borderLeft: "3px solid var(--primary)",
                          fontSize: "0.775rem",
                        }}
                      >
                        <div style={{ marginTop: "0.15rem" }}>
                          {entry.etiquetaAccion === "whatsapp" ? (
                            <MessageSquare size={15} color="#16a34a" />
                          ) : entry.etiquetaAccion === "correo" ? (
                            <Mail size={15} color="#2563eb" />
                          ) : (
                            <Activity size={15} color="#0891b2" />
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.3rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 800, color: "var(--text-main)" }}>
                                {entry.autor || "Administrador"}
                              </span>
                              {entry.autorCargo && (
                                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", background: "rgba(0,0,0,0.04)", padding: "0.1rem 0.35rem", borderRadius: "3px" }}>
                                  {entry.autorCargo}
                                </span>
                              )}
                              {entry.nuevoEstado && (
                                <StatusBadge status={entry.nuevoEstado} size="sm" />
                              )}
                              {entry.autorSelloDigital && (
                                <span
                                  style={{
                                    fontSize: "0.65rem",
                                    fontFamily: "var(--font-mono)",
                                    color: "#0891b2",
                                    background: "rgba(8,145,178,0.08)",
                                    padding: "0.1rem 0.35rem",
                                    borderRadius: "3px",
                                    border: "1px solid rgba(8,145,178,0.2)",
                                  }}
                                  title="Firma / Sello digital criptográfico de autoría"
                                >
                                  {entry.autorSelloDigital}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                              {formatDateTimeCO(entry.fecha)}
                            </span>
                          </div>

                          <div style={{ marginTop: "0.25rem", color: "#334155", lineHeight: 1.4 }}>
                            {entry.nota}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        background: "var(--neutral-50, #f8fafc)",
                        borderRadius: "6px",
                        borderLeft: "3px solid #10b981",
                        fontSize: "0.775rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-main)" }}>
                          Caso aperturado con estado inicial '{formData.estado}'
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {formatDateCO(formData.fecha)}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        Descripción inicial: {formData.reporte || "Diagnóstico locativo"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Navegación Parte 4 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--neutral-200)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setFormStep("reporte")}
                  className="btn btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <ArrowLeft size={15} />
                  <span>Volver al Reporte (Parte 1)</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveReporte();
                      setIsModalOpen(false);
                    }}
                    className="btn btn-primary"
                    style={{ background: "#16a34a" }}
                  >
                    <CheckCircle size={15} />
                    Finalizar y Cerrar Caso
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* DIÁLOGO MODAL INTERACTIVO DE LLAMADA A LA ACCIÓN (WHATSAPP PERSONALIZADO) */}
      {accionDialogOpen && accionDialogData && (
        <Modal
          isOpen={accionDialogOpen}
          onClose={() => setAccionDialogOpen(false)}
          badge="WhatsApp"
          title={accionDialogData.titulo}
          subtitle={`Canal: ${accionDialogData.etiqueta}`}
          maxWidth="560px"
        >

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: 0 }}>
              Puedes ajustar el número de teléfono del destinatario y personalizar el mensaje antes de enviarlo por WhatsApp y registrarlo en el historial del caso.
            </p>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Número de WhatsApp del Destinatario (Celular)</label>
              <input
                type="text"
                value={accionDialogData.telefono}
                onChange={(e) =>
                  setAccionDialogData({ ...accionDialogData, telefono: e.target.value })
                }
                className="input-field"
                placeholder="Ej. 3001234567"
              />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Texto del Mensaje</label>
              <textarea
                rows={4}
                value={accionDialogData.mensaje}
                onChange={(e) =>
                  setAccionDialogData({ ...accionDialogData, mensaje: e.target.value })
                }
                className="textarea-field"
                style={{ fontSize: "0.8rem" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", paddingTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setAccionDialogOpen(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEjecutarDialogoAccion}
                className="btn btn-primary"
                style={{ background: "#16a34a", display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Send size={14} />
                Enviar por WhatsApp y Registrar en Historial
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Inteligente de Importación de Tablas CSV */}
      <CSVImportModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        defaultEntity="reportes"
      />
    </div>
  );
};
