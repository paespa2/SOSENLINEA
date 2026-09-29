export type Role = "admin" | "auxiliar" | "maestros" | "contable" | "campo" | "usuario" | "desarrollador";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  cargo?: string;
  telefono?: string;
  selloDigital?: string;
  username?: string;
}

export type ModuleCategory = "principal" | "contable" | "maestros" | "informes" | "operaciones" | "auditoria";

export type ModuleId =
  // Menú Principal
  | "dashboard"
  | "reportes-ordenes"
  | "cotizaciones"
  | "llaves"
  | "impresiones"
  | "auditoria"
  // Menú Contable
  | "contable-ingresos"
  | "contable-egresos"
  | "contable-actualizar"
  | "contable-nit"
  | "contable-cuentas-cobro"
  // Menú Maestros
  | "maestros-terceros"
  | "maestros-materiales"
  | "maestros-clientes"
  | "maestros-sectores"
  | "maestros-herramientas"
  // Menú Informes
  | "informes-agenda"
  | "informes-novedades"
  | "informes-general"
  | "informes-casos"
  | "informes-diario"
  | "informes-encuestas"
  // Operaciones de Campo
  | "operaciones-herramientas"
  | "operaciones-materiales"
  // Consola Azure SQL
  | "azure-sql-console";

export interface RolePermissions {
  role: Role;
  label: string;
  description: string;
  color: string;
  allowedModules: ModuleId[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canAudit: boolean;
  canReconcile: boolean;
}

export type ThirdPartyType = "Contratista" | "Proveedor" | "Tercero";

/** Mapeado desde tblContratistas (Azure SQL) */
export interface Contractor {
  id: string;
  nombre: string;
  tipo: ThirdPartyType;
  nit: string;
  dv: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  sector: string;
  contacto?: string;
  banco?: string;
  tipoCta?: "Ahorros" | "Corriente";
  numeroCta?: string;
  activo: boolean;
  especialidad?: string;
  productoServicio?: string;
  categoria?: string;
  fechaRegistro: string;
}

/** Mapeado desde tblReportes (Azure SQL - Centro de Órdenes de Trabajo) */
export type ReporteEstado =
  | "Borrador"
  | "Cotizado"
  | "En Progreso"
  | "En Revisión"
  | "Ejecutado"
  | "Cobrado"
  | "Descartado"
  | "Garantía"
  | "En Garantía"
  | "Anticipo"
  | "Aprobado"
  | "Caso Cancelado"
  | "Cancelado"
  | "Cotización No Aprobada"
  | "Cotización Digital"
  | "Memorando Digital"
  | "Cotización Revisada"
  | "Mensaje de WhatsApp"
  | "Se Envió Correo Electrónico"
  | "Sí Está Facturado"
  | "Visita Especializada"
  | "Recotizar Nuevamente"
  | "Se Recibe Información"
  | "Se Da Información al Cliente"
  | "Se Programa Control de Calidad"
  | "Pagado"
  | "Por Pagar"
  | "Aplazado"
  | "Finalizado";

export interface ActividadAgenda {
  id: string;
  fechaHora: string;
  tipoActividad: "Visita Técnica" | "Cotización en Sitio" | "Ejecución" | "Control de Calidad" | "Entrega de Llaves" | "Reunión Informativa";
  tecnicoId?: string;
  tecnicoNombre?: string;
  estado: "Programada" | "En Curso" | "Cumplida" | "Reprogramada" | "Cancelada";
  observaciones?: string;
  creadoPor?: string;
}

export interface AnexoEtiqueta {
  id: string;
  etiqueta: string;
  duracionEstimada?: string;
  descripcion: string;
  fechaCreacion: string;
  creadoPor?: string;
}

export interface HistorialEntrada {
  id: string;
  fecha: string;
  autor?: string;
  autorCargo?: string;
  autorSelloDigital?: string;
  estadoAnterior?: string;
  nuevoEstado: string;
  nota: string;
  etiquetaAccion?: string;
}

export interface ReporteOrden {
  idRegistro: number;
  codigoAlfanumerico?: string; // Radicado editable, ej: SOS-2026-ORD1001
  tipoTrabajo?: string;        // Mantenimiento Preventivo, Correctivo, Reforma, etc.
  
  idContratante: string; // Cliente
  clienteNombre: string;
  
  // Arrendatario
  arrendatario: string;
  arrendatarioDocTipo?: string;
  arrendatarioDocNumero?: string;
  
  // Propietario
  propietario: string;
  propietarioDocTipo?: string;
  propietarioDocNumero?: string;
  
  // Quién contrata
  quienContrata?: "Arrendatario" | "Propietario" | "Inmobiliaria" | "Tercero";
  
  direccion: string;
  rutasTransporte?: string;    // Rutas de buses y sistema de transporte público
  referenciaContacto?: string; // Teléfono o contacto de referencia en el predio
  sector: string;
  
  fecha: string;
  idContratista: string;
  contratistaNombre: string;
  
  // Técnicos
  tecnicoCotizacionId?: string;
  tecnicoCotizacionNombre?: string;
  tecnicoEjecucionId?: string;
  tecnicoEjecucionNombre?: string;
  
  estado: ReporteEstado;
  reporte: string; // Descripción del problema
  fechaTerminado?: string;
  fechaAprobada?: string;
  totalCotizacion: number;
  tasaAvance: number; // 0 a 1 (0% a 100%)
  tareasPendientes?: number;
  ultimoActualizado?: string;
  
  // Historial, Agenda y Anexos
  historial?: HistorialEntrada[];
  agendaActividades?: ActividadAgenda[];
  anexosEtiquetas?: AnexoEtiqueta[];
  
  // Solicitud de Servicio / PQR del Cliente
  solicitanteNombre?: string;
  solicitanteTelefono?: string;
  solicitanteEmail?: string;
  solicitanteCanal?: 'WhatsApp' | 'Llamada' | 'Correo';
  urgencia?: 'Normal' | 'Urgente' | 'Emergencia';
  inmuebleDetalle?: string;
  origenSolicitud?: 'Cliente Web' | 'Operador Interno' | 'Llamada PQR';
  horarioPreferido?: string;
  estadoContacto?: 'Pendiente de Contacto' | 'Contactado por WhatsApp' | 'Contactado por Llamada' | 'Asignado a Cuadrilla';
}

/** Mapeado desde tblCotizacion + tblDesCotizacion (Azure SQL) */
export interface CotizacionItem {
  id: string;
  tipo?: "Mano de Obra" | "Material" | "Transporte" | "Equipo";
  descripcion: string;
  cantidad: number;
  unidad: string;
  valorUnitario: number;
  valorTotal: number;
  ambiente?: string;
}

export interface EtiquetaCotizacion {
  id: string;
  nombre: string;
  color?: string;
  descripcion: string;
}

export interface FirmaElectronica {
  firmante: string;
  documento?: string;
  rol?: string;
  fechaFirma: string;
  trazoFirma?: string;
  hashCertificado?: string;
}

export interface Cotizacion {
  idCotizacion: number;
  idReporte: number;
  titulo?: string;
  reporteDireccion: string;
  clienteNombre: string;
  contratistaId: string;
  contratistaNombre: string;
  fecha: string;
  numMaterial: number;
  numManoObra: number;
  numTransporte: number;
  numTodoCosto: number; // Total
  estado: "Borrador" | "Aprobada" | "Rechazada" | "Facturada";
  diasGarantia: number;
  observaciones: string;
  items: CotizacionItem[];
  etiquetas?: string[];
  etiquetasDescripciones?: Record<string, string>;
  firmaElectronica?: FirmaElectronica;
}

export type MovementType = "Ingreso" | "Egreso";
export type MovementStatus = "Borrador" | "Registrado" | "Conciliado";

/** Mapeado desde tblEgresos y tblRecibosCaja (Azure SQL) */
export interface Movement {
  id: string;
  tipo: MovementType;
  fecha: string;
  concepto: string;
  monto: number;
  cuenta: string;
  terceroNombre: string;
  terceroNit: string;
  responsable: string;
  comprobanteNumero: string;
  idCotizacion?: number;
  estado: MovementStatus;
  observaciones?: string;
  createdAt: string;
}

export type InvoiceStatus = "Pendiente" | "Pagada" | "Anulada";

/** Mapeado desde tblCuentasCobro (Azure SQL) */
export interface CuentaCobro {
  id: string;
  numero: string;
  clienteNombre: string;
  clienteNit: string;
  fecha: string;
  fechaVencimiento: string;
  concepto: string;
  valorBruto: number;
  retencionFuente: number;
  iva: number;
  valorNeto: number;
  estado: InvoiceStatus;
  responsable: string;
  idReporte?: number;
}

/** Mapeado desde tblMateriales (Azure SQL) */
export interface Material {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  ubicacion: string;
  estado: "Optimo" | "Bajo Stock" | "Agotado";
}

export type ClientType = "Arrendatario" | "Propietario" | "Inmobiliaria";

/** Mapeado desde tblClientes (Azure SQL) */
export interface Client {
  id: string;
  tipo: ClientType;
  nombre: string;
  documento: string;
  telefono: string;
  email: string;
  inmuebleReferencia: string;
  canonOValor: number;
  fechaContrato: string;
  estado: "Activo" | "Inactivo" | "En Mora";
}

/** Mapeado desde tblSectores (Azure SQL) */
export interface Sector {
  id: string;
  codigo: string;
  nombre: string;
  zona: string;
  ruta?: string;
  responsable: string;
  activo: boolean;
}

export interface ToolGroup {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  totalUnidades: number;
}

/** Mapeado desde tblHerramientas (Azure SQL) */
export interface Herramienta {
  id: string;
  codigo: string;
  nombre: string;
  grupo: string;
  estado: "Disponible" | "En Uso" | "En Mantenimiento" | "De Baja";
  responsableActual?: string;
  fechaAsignacion?: string;
  observaciones?: string;
}

/** Mapeado desde tblLlaves (Azure SQL) */
export interface KeyItem {
  id: string;
  codigo: string;
  inmueble: string;
  direccion: string;
  propietario: string;
  estado: "Disponible" | "Prestada" | "Extraviada";
  custodioActual?: string;
  fechaPrestamo?: string;
  observaciones?: string;
}

/** Mapeado desde tblEntregaMateriales (Azure SQL) */
export interface EntregaMaterial {
  id: string;
  fecha: string;
  materialNombre: string;
  cantidad: number;
  unidad: string;
  receptorNombre: string;
  receptorCargo: string;
  ordenTrabajo: string;
  entregadoPor: string;
}

/** Mapeado desde tblNovedades (Azure SQL) */
export interface NovedadReport {
  id: string;
  reporteId?: number; // ID de la orden o reporte asociado en tblReportes
  fecha: string;
  titulo: string;
  prioridad: "Baja" | "Media" | "Alta" | "Urgente";
  categoria: "Infraestructura" | "Contable" | "Personal" | "Seguridad";
  responsable: string;
  estado: "Abierto" | "En Proceso" | "Resuelto";
  descripcion: string;
}

/** Mapeado desde tblPreguntasEncuesta y tblRespuestasEncuesta (Azure SQL) */
export interface Encuesta {
  id: string;
  fecha: string;
  cliente: string;
  inmueble: string;
  puntuacion: number; // 1-5
  comentario: string;
  atendidoPor: string;
}

/** Mapeado desde tabla audit_logs de la refactorización Azure SQL */
export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: "CREAR" | "ACTUALIZAR" | "ELIMINAR" | "ELIMINAR_CON_OTP" | "RESTAURAR_RESPALDO" | "CAMBIO_ESTADO" | "CONCILIAR";
  module: string;
  entityId: string;
  entityName: string;
  details: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
}


/** Registro de Papelera y Respaldo de Seguridad ante Eliminación (2026-2027) */
export interface PapeleraItem {
  id: string; // ej. TRASH-172756...
  entidad: 'reporte' | 'cotizacion' | 'cliente' | 'contratista' | 'material';
  idOriginal: string | number;
  titulo: string;
  resumen: string;
  datos: any; // Payload completo de respaldo
  fechaEliminacion: string;
  eliminadoPor: string;
  adminEmailNotificado: string;
  otpVerificado: string;
  restaurable: boolean;
}
