import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Contractor,
  ReporteOrden,
  ReporteEstado,
  HistorialEntrada,
  ActividadAgenda,
  AnexoEtiqueta,
  Cotizacion,
  Movement,
  CuentaCobro,
  Material,
  Client,
  Sector,
  Herramienta,
  KeyItem,
  EntregaMaterial,
  NovedadReport,
  Encuesta,
  AuditEntry,
  MovementStatus,
} from "../types";
import {
  SEED_CONTRACTORS,
  SEED_REPORTES,
  SEED_COTIZACIONES,
  SEED_MOVEMENTS,
  SEED_CUENTAS_COBRO,
  SEED_MATERIALES,
  SEED_CLIENTES,
  SEED_SECTORES,
  SEED_HERRAMIENTAS,
  SEED_LLAVES,
  SEED_ENTREGAS_MATERIALES,
  SEED_NOVEDADES,
  SEED_ENCUESTAS,
  SEED_AUDIT_LOGS,
} from "../data/seedData";
import { useAuth } from "./AuthContext";
import { supabaseDb } from "../services/supabaseAuth";

interface DataContextType {
  // Entidades
  contractors: Contractor[];
  reportes: ReporteOrden[];
  cotizaciones: Cotizacion[];
  movements: Movement[];
  cuentasCobro: CuentaCobro[];
  materiales: Material[];
  clientes: Client[];
  sectores: Sector[];
  herramientas: Herramienta[];
  llaves: KeyItem[];
  entregasMateriales: EntregaMaterial[];
  novedades: NovedadReport[];
  encuestas: Encuesta[];
  auditLogs: AuditEntry[];

  // Acciones CRUD & Operaciones
  addContractor: (data: Omit<Contractor, "id" | "fechaRegistro">) => void;
  updateContractor: (id: string, data: Partial<Contractor>) => void;
  deleteContractor: (id: string) => void;

  addReporte: (data: Omit<ReporteOrden, "idRegistro">) => void;
  updateReporte: (idRegistro: number, data: Partial<ReporteOrden>) => void;
  deleteReporte: (idRegistro: number) => void;
  addHistorialEntry: (idRegistro: number, entrada: { nuevoEstado?: string; nota: string; etiquetaAccion?: string; autor?: string; autorCargo?: string }) => void;
  addAgendaActividad: (idRegistro: number, actividad: Omit<ActividadAgenda, "id">) => void;
  updateAgendaActividad: (idRegistro: number, idActividad: string, data: Partial<ActividadAgenda>) => void;
  addAnexoEtiqueta: (idRegistro: number, anexo: Omit<AnexoEtiqueta, "id" | "fechaCreacion">) => void;

  addCotizacion: (data: Omit<Cotizacion, "idCotizacion">) => void;
  updateCotizacion: (idCotizacion: number, data: Partial<Cotizacion>) => void;
  deleteCotizacion: (idCotizacion: number) => void;

  addMovement: (data: Omit<Movement, "id" | "createdAt">) => void;
  updateMovementStatus: (id: string, newStatus: MovementStatus) => void;
  deleteMovement: (id: string) => void;

  addCuentaCobro: (data: Omit<CuentaCobro, "id">) => void;
  updateCuentaCobroStatus: (id: string, newStatus: "Pendiente" | "Pagada" | "Anulada") => void;

  addMaterial: (data: Omit<Material, "id">) => void;
  updateMaterialStock: (id: string, nuevoStock: number) => void;

  addClient: (data: Omit<Client, "id">) => void;
  updateClient: (id: string, data: Partial<Client>) => void;

  addSector: (data: Omit<Sector, "id">) => void;

  addHerramienta: (data: Omit<Herramienta, "id">) => void;
  updateHerramientaEstado: (id: string, estado: Herramienta["estado"], responsable?: string) => void;

  addLlave: (data: Omit<KeyItem, "id">) => void;
  updateLlavePrestamo: (id: string, estado: "Disponible" | "Prestada" | "Extraviada", custodio?: string) => void;

  addEntregaMaterial: (data: Omit<EntregaMaterial, "id">) => void;
  addNovedad: (data: Omit<NovedadReport, "id">) => void;
  addEncuesta: (data: Omit<Encuesta, "id">) => void;

  // Auditoría directa
  logAudit: (action: AuditEntry["action"], module: string, entityId: string, entityName: string, details: string) => void;
  resetToInitialData: () => void;
  importReportesBatch: (newItems: Omit<ReporteOrden, "idRegistro">[], replaceExisting?: boolean) => void;
  clearReportes: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, currentRole } = useAuth();

  // Helper de persistencia en localStorage
  const load = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`sos_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [contractors, setContractors] = useState<Contractor[]>(() => load("contractors", SEED_CONTRACTORS));
  const [reportes, setReportes] = useState<ReporteOrden[]>(() => load("reportes", SEED_REPORTES));
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(() => load("cotizaciones", SEED_COTIZACIONES));
  const [movements, setMovements] = useState<Movement[]>(() => load("movements", SEED_MOVEMENTS));
  const [cuentasCobro, setCuentasCobro] = useState<CuentaCobro[]>(() => load("cuentas_cobro", SEED_CUENTAS_COBRO));
  const [materiales, setMateriales] = useState<Material[]>(() => load("materiales", SEED_MATERIALES));
  const [clientes, setClientes] = useState<Client[]>(() => load("clientes", SEED_CLIENTES));
  const [sectores, setSectores] = useState<Sector[]>(() => load("sectores", SEED_SECTORES));
  const [herramientas, setHerramientas] = useState<Herramienta[]>(() => load("herramientas", SEED_HERRAMIENTAS));
  const [llaves, setLlaves] = useState<KeyItem[]>(() => load("llaves", SEED_LLAVES));
  const [entregasMateriales, setEntregasMateriales] = useState<EntregaMaterial[]>(() => load("entregas_materiales", SEED_ENTREGAS_MATERIALES));
  const [novedades, setNovedades] = useState<NovedadReport[]>(() => load("novedades", SEED_NOVEDADES));
  const [encuestas, setEncuestas] = useState<Encuesta[]>(() => load("encuestas", SEED_ENCUESTAS));
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => load("audit_logs", SEED_AUDIT_LOGS));

  // Sincronización continua a localStorage
  useEffect(() => { localStorage.setItem("sos_contractors", JSON.stringify(contractors)); }, [contractors]);
  useEffect(() => { localStorage.setItem("sos_reportes", JSON.stringify(reportes)); }, [reportes]);
  useEffect(() => { localStorage.setItem("sos_cotizaciones", JSON.stringify(cotizaciones)); }, [cotizaciones]);
  useEffect(() => { localStorage.setItem("sos_movements", JSON.stringify(movements)); }, [movements]);
  useEffect(() => { localStorage.setItem("sos_cuentas_cobro", JSON.stringify(cuentasCobro)); }, [cuentasCobro]);
  useEffect(() => { localStorage.setItem("sos_materiales", JSON.stringify(materiales)); }, [materiales]);
  useEffect(() => { localStorage.setItem("sos_clientes", JSON.stringify(clientes)); }, [clientes]);
  useEffect(() => { localStorage.setItem("sos_sectores", JSON.stringify(sectores)); }, [sectores]);
  useEffect(() => { localStorage.setItem("sos_herramientas", JSON.stringify(herramientas)); }, [herramientas]);
  useEffect(() => { localStorage.setItem("sos_llaves", JSON.stringify(llaves)); }, [llaves]);
  useEffect(() => { localStorage.setItem("sos_entregas_materiales", JSON.stringify(entregasMateriales)); }, [entregasMateriales]);
  useEffect(() => { localStorage.setItem("sos_novedades", JSON.stringify(novedades)); }, [novedades]);
  useEffect(() => { localStorage.setItem("sos_encuestas", JSON.stringify(encuestas)); }, [encuestas]);
  useEffect(() => { localStorage.setItem("sos_audit_logs", JSON.stringify(auditLogs)); }, [auditLogs]);

  // Sincronización en vivo con Supabase Cloud (2026-2027)
  useEffect(() => {
    async function syncSupabase() {
      try {
        const [supaClientes, supaMateriales, supaContratistas, supaSectores, supaReportes] = await Promise.all([
          supabaseDb.getTable<any>('clientes'),
          supabaseDb.getTable<any>('materiales'),
          supabaseDb.getTable<any>('contratistas'),
          supabaseDb.getTable<any>('sectores'),
          supabaseDb.getTable<any>('reportes'),
        ]);

        if (supaClientes && supaClientes.length > 0) {
          setClientes(supaClientes.map((c: any) => ({
            id: String(c.id),
            tipo: "Inmobiliaria" as const,
            nombre: c.nombre || "Cliente SOS",
            documento: c.nit || "900.000.000",
            telefono: c.telefono || "300 000 0000",
            email: c.email || "contacto@cliente.com",
            inmuebleReferencia: c.direccion || c.sector || "Sede Principal",
            canonOValor: 0,
            fechaContrato: c.created_at ? String(c.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
            estado: c.activo !== false ? ("Activo" as const) : ("Inactivo" as const),
          })));
        }

        if (supaMateriales && supaMateriales.length > 0) {
          setMateriales(supaMateriales.map((m: any) => {
            const stockActual = Number(m.stock_actual) || 0;
            const stockMinimo = Number(m.stock_minimo) || 5;
            const estado = stockActual <= 0 ? ("Agotado" as const) : stockActual <= stockMinimo ? ("Bajo Stock" as const) : ("Optimo" as const);
            return {
              id: String(m.id),
              codigo: m.codigo || `MAT-${m.id}`,
              nombre: m.descripcion || "Material de Almacén",
              categoria: m.categoria || "General",
              unidad: m.unidad || "UND",
              stockActual,
              stockMinimo,
              precioUnitario: Number(m.precio_unitario) || 0,
              ubicacion: "Almacén Central Medellín",
              estado,
            };
          }));
        }

        if (supaContratistas && supaContratistas.length > 0) {
          setContractors(supaContratistas.map((con: any) => ({
            id: String(con.id),
            nombre: con.nombre || "Técnico SOS",
            tipo: (con.tipo === "Proveedor" || con.tipo === "Tercero" ? con.tipo : "Contratista") as any,
            nit: con.nit || "0",
            dv: con.dv || "",
            email: con.email || "",
            telefono: con.telefono || "",
            direccion: con.direccion || "",
            ciudad: con.ciudad || "Medellín",
            sector: con.sector || "",
            especialidad: con.especialidad || "General",
            banco: con.banco || "",
            tipoCta: (con.tipo_cta === "Corriente" ? "Corriente" : "Ahorros") as any,
            numeroCta: con.numero_cta || "",
            activo: con.activo !== false,
            fechaRegistro: con.created_at ? String(con.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
          })));
        }

        if (supaSectores && supaSectores.length > 0) {
          setSectores(supaSectores.map((s: any, idx: number) => ({
            id: String(s.id),
            codigo: `SEC-${String(s.id || idx + 1).padStart(3, "0")}`,
            nombre: s.nombre || "Sector",
            zona: s.zona || "Valle de Aburrá",
            responsable: "Coordinador de Zona",
            activo: s.activo !== false,
          })));
        }

        if (supaReportes && supaReportes.length > 0) {
          const mappedReportes: ReporteOrden[] = supaReportes.map((sr: any) => {
            let obsData: any = {};
            try {
              if (sr.observaciones && typeof sr.observaciones === 'string' && sr.observaciones.startsWith('{')) {
                obsData = JSON.parse(sr.observaciones);
              }
            } catch {}

            return {
              idRegistro: Number(sr.id) || 1000,
              codigoAlfanumerico: sr.numero_orden || `ORD-2026-${sr.id}`,
              tipoTrabajo: sr.descripcion_servicio?.split('|')?.[0]?.replace('[', '')?.trim() || "Mantenimiento General",
              idContratante: String(sr.cliente_id || 'CLI-01'),
              clienteNombre: "Inversiones Santa María",
              arrendatario: obsData.solicitante_nombre || "Cliente Solicitante",
              propietario: "Inversiones Santa María",
              direccion: sr.direccion || "Medellín",
              sector: sr.sector || "El Poblado",
              fecha: sr.fecha || new Date().toISOString().slice(0, 10),
              idContratista: String(sr.contratista_id || ''),
              contratistaNombre: "Sin Asignar",
              estado: (sr.estado || "Se Recibe Información") as ReporteEstado,
              reporte: sr.descripcion_servicio || "Solicitud de servicio",
              totalCotizacion: Number(sr.total) || 0,
              tasaAvance: sr.estado === "Ejecutado" ? 1.0 : 0.05,
              solicitanteNombre: obsData.solicitante_nombre,
              solicitanteTelefono: obsData.solicitante_telefono || "3001234567",
              solicitanteEmail: obsData.solicitante_email,
              solicitanteCanal: obsData.canal_contacto || "WhatsApp",
              urgencia: (sr.prioridad === "Alta" ? "Emergencia" : sr.prioridad === "Media" ? "Urgente" : "Normal") as any,
              origenSolicitud: "Cliente Web",
              estadoContacto: "Pendiente de Contacto",
            };
          });

          setReportes((prev) => {
            const existingIds = new Set(prev.map((p) => p.idRegistro));
            const newOnes = mappedReportes.filter((m) => !existingIds.has(m.idRegistro));
            return [...newOnes, ...prev];
          });
        }
      } catch (e) {
        console.info('Supabase data sync fallback active');
      }
    }

    syncSupabase();
  }, []);

  // Función de registro en la tabla de auditoría (audit_logs)
  const logAudit = (
    action: AuditEntry["action"],
    module: string,
    entityId: string,
    entityName: string,
    details: string
  ) => {
    const newEntry: AuditEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      userId: currentUser?.id || "SYSTEM",
      userName: currentUser?.name || "Sistema",
      userRole: currentRole,
      action,
      module,
      entityId,
      entityName,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // CRUD Contratistas
  const addContractor = (data: Omit<Contractor, "id" | "fechaRegistro">) => {
    const newId = `CONT-${(contractors.length + 1).toString().padStart(3, "0")}`;
    const newCont: Contractor = {
      ...data,
      id: newId,
      fechaRegistro: new Date().toISOString().slice(0, 10),
    };
    setContractors((prev) => [newCont, ...prev]);
    logAudit("CREAR", "Maestros - Contratistas", newId, newCont.nombre, `Registrado ${newCont.tipo} NIT ${newCont.nit}-${newCont.dv}`);
  };

  const updateContractor = (id: string, data: Partial<Contractor>) => {
    setContractors((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data };
          logAudit("ACTUALIZAR", "Maestros - Contratistas", id, updated.nombre, "Modificación de datos de contacto o bancarios");
          return updated;
        }
        return item;
      })
    );
  };

  const deleteContractor = (id: string) => {
    const target = contractors.find((c) => c.id === id);
    setContractors((prev) => prev.filter((item) => item.id !== id));
    if (target) {
      logAudit("ELIMINAR", "Maestros - Contratistas", id, target.nombre, `Eliminado registro de ${target.tipo}`);
    }
  };

  // CRUD Reportes (Órdenes de Trabajo con Sincronía Automática de Cotizaciones)
  const addReporte = (data: Omit<ReporteOrden, "idRegistro">) => {
    // Generación secuencial automática del ID de la Orden (#1001, #1002, ...)
    const newId = Math.max(...reportes.map((r) => r.idRegistro), 1000) + 1;
    const enforcedAvance =
      data.estado === "Ejecutado" || data.estado === "Cobrado"
        ? 1.0
        : data.tasaAvance !== undefined
        ? data.tasaAvance
        : 0.1;

    const nowIso = new Date().toISOString();
    const newReporte: ReporteOrden = {
      ...data,
      idRegistro: newId,
      codigoAlfanumerico: data.codigoAlfanumerico || `SOS-${new Date().getFullYear()}-ORD${newId}`,
      tipoTrabajo: data.tipoTrabajo || "Mantenimiento General",
      tasaAvance: enforcedAvance,
      ultimoActualizado: nowIso,
      agendaActividades: data.agendaActividades || [],
      anexosEtiquetas: data.anexosEtiquetas || [],
      historial: data.historial || [
        {
          id: `HIST-${Date.now()}`,
          fecha: nowIso,
          autor: currentUser?.name || "Administrador",
          autorCargo: currentUser?.cargo || currentRole,
          autorSelloDigital: `SOS-APERTURA-${Date.now().toString(36).toUpperCase()}`,
          nuevoEstado: data.estado || "Borrador",
          nota: "Apertura inicial del caso y registro en sistema.",
          etiquetaAccion: "apertura",
        },
      ],
    };
    setReportes((prev) => [newReporte, ...prev]);

    // Sincronización automática con Cotizaciones si hay presupuesto o cotización activa
    if (data.totalCotizacion && data.totalCotizacion > 0) {
      const nextCotId = Math.max(...cotizaciones.map((c) => c.idCotizacion), 5000) + 1;
      const newCot: Cotizacion = {
        idCotizacion: nextCotId,
        idReporte: newId,
        reporteDireccion: data.direccion,
        clienteNombre: data.clienteNombre,
        contratistaId: data.idContratista,
        contratistaNombre: data.contratistaNombre,
        fecha: data.fecha || new Date().toISOString().slice(0, 10),
        numTodoCosto: data.totalCotizacion,
        numMaterial: Math.round(data.totalCotizacion * 0.4),
        numManoObra: Math.round(data.totalCotizacion * 0.5),
        numTransporte: Math.round(data.totalCotizacion * 0.1),
        estado: data.estado === "Cobrado" || data.estado === "Ejecutado" ? "Aprobada" : "Borrador",
        diasGarantia: 30,
        observaciones: data.reporte,
        items: [
          {
            id: `ITEM-${Date.now().toString().slice(-4)}`,
            descripcion: data.reporte,
            cantidad: 1,
            unidad: "GLB",
            valorUnitario: data.totalCotizacion,
            valorTotal: data.totalCotizacion,
          }
        ],
      };
      setCotizaciones((prev) => [newCot, ...prev]);
      logAudit("CREAR", "Cotizaciones & Presupuestos", String(nextCotId), `Cotización #${nextCotId}`, `Auto-generada en sincronía con Orden #${newId}`);
    }

    logAudit("CREAR", "Órdenes de Trabajo", String(newId), newReporte.direccion, `Nueva orden con cliente ${newReporte.clienteNombre} (ID Secuencial #${newId})`);
  };

  const updateReporte = (idRegistro: number, data: Partial<ReporteOrden>) => {
    setReportes((prev) =>
      prev.map((item) => {
        if (item.idRegistro === idRegistro) {
          const newEstado = data.estado ?? item.estado;
          let enforcedAvance = data.tasaAvance !== undefined ? data.tasaAvance : item.tasaAvance;
          if (newEstado === "Ejecutado" || newEstado === "Cobrado") {
            enforcedAvance = 1.0;
          }

          const nowStr = new Date().toISOString();
          const finalHistorial = data.historial ? [...data.historial] : [...(item.historial || [])];
          if (data.estado && data.estado !== item.estado && !data.historial) {
            finalHistorial.unshift({
              id: `HIST-${Date.now()}`,
              fecha: nowStr,
              autor: currentUser?.name || "Administrador",
              estadoAnterior: item.estado,
              nuevoEstado: data.estado,
              nota: `Actualización de estado: '${item.estado}' ➔ '${data.estado}'`,
              etiquetaAccion: "estado",
            });
          }

          const updated: ReporteOrden = {
            ...item,
            ...data,
            estado: newEstado,
            tasaAvance: enforcedAvance,
            ultimoActualizado: data.ultimoActualizado || nowStr,
            historial: finalHistorial,
          };
          logAudit("ACTUALIZAR", "Órdenes de Trabajo", String(idRegistro), updated.direccion, `Actualización de orden #${idRegistro} a estado ${updated.estado}`);
          return updated;
        }
        return item;
      })
    );

    // Sincronizar automáticamente con la cotización vinculada (idReporte = idRegistro)
    setCotizaciones((prev) => {
      const exists = prev.find((c) => c.idReporte === idRegistro);
      if (exists) {
        return prev.map((c) => {
          if (c.idReporte === idRegistro) {
            return {
              ...c,
              reporteDireccion: data.direccion ?? c.reporteDireccion,
              clienteNombre: data.clienteNombre ?? c.clienteNombre,
              contratistaId: data.idContratista ?? c.contratistaId,
              contratistaNombre: data.contratistaNombre ?? c.contratistaNombre,
              numTodoCosto: data.totalCotizacion !== undefined ? data.totalCotizacion : c.numTodoCosto,
              estado: data.estado === "Cobrado" || data.estado === "Ejecutado" ? "Aprobada" : c.estado,
            };
          }
          return c;
        });
      } else if (data.totalCotizacion && data.totalCotizacion > 0) {
        const nextCotId = Math.max(...prev.map((c) => c.idCotizacion), 5000) + 1;
        const newCot: Cotizacion = {
          idCotizacion: nextCotId,
          idReporte: idRegistro,
          reporteDireccion: data.direccion || "",
          clienteNombre: data.clienteNombre || "Cliente General",
          contratistaId: data.idContratista || "",
          contratistaNombre: data.contratistaNombre || "Sin Asignar",
          fecha: new Date().toISOString().slice(0, 10),
          numTodoCosto: data.totalCotizacion,
          numMaterial: Math.round(data.totalCotizacion * 0.4),
          numManoObra: Math.round(data.totalCotizacion * 0.5),
          numTransporte: Math.round(data.totalCotizacion * 0.1),
          estado: data.estado === "Cobrado" || data.estado === "Ejecutado" ? "Aprobada" : "Borrador",
          diasGarantia: 30,
          observaciones: data.reporte || "",
          items: [
            {
              id: `ITEM-${Date.now().toString().slice(-4)}`,
              descripcion: data.reporte || "Mantenimiento / Obra",
              cantidad: 1,
              unidad: "GLB",
              valorUnitario: data.totalCotizacion,
              valorTotal: data.totalCotizacion,
            }
          ],
        };
        return [newCot, ...prev];
      }
      return prev;
    });
  };

  const deleteReporte = (idRegistro: number) => {
    const target = reportes.find((r) => r.idRegistro === idRegistro);
    setReportes((prev) => prev.filter((item) => item.idRegistro !== idRegistro));
    // Sincronizar eliminación en cotizaciones
    setCotizaciones((prev) => prev.filter((c) => c.idReporte !== idRegistro));
    if (target) {
      logAudit("ELIMINAR", "Órdenes de Trabajo", String(idRegistro), target.direccion, "Orden eliminada del sistema (Sincronía con Cotizaciones)");
    }
  };

  const addHistorialEntry = (
    idRegistro: number,
    entrada: { nuevoEstado?: string; nota: string; etiquetaAccion?: string; autor?: string; autorCargo?: string; autorSelloDigital?: string }
  ) => {
    const nowStr = new Date().toISOString();
    setReportes((prev) =>
      prev.map((r) => {
        if (r.idRegistro === idRegistro) {
          const targetEstado = (entrada.nuevoEstado as ReporteEstado) || r.estado;
          let enforcedAvance = r.tasaAvance;
          if (
            targetEstado === "Ejecutado" ||
            targetEstado === "Cobrado" ||
            targetEstado === "Finalizado" ||
            targetEstado === "Pagado"
          ) {
            enforcedAvance = 1.0;
          }

          const sessionStamp = `SOS-SIG-${Date.now().toString(36).toUpperCase()}`;
          const newEntry: HistorialEntrada = {
            id: `HIST-${Date.now()}`,
            fecha: nowStr,
            autor: entrada.autor || currentUser?.name || "Administrador",
            autorCargo: entrada.autorCargo || currentUser?.cargo || currentRole,
            autorSelloDigital: sessionStamp,
            estadoAnterior: r.estado,
            nuevoEstado: targetEstado,
            nota: entrada.nota,
            etiquetaAccion: entrada.etiquetaAccion || "nota",
          };

          const updated: ReporteOrden = {
            ...r,
            estado: targetEstado,
            tasaAvance: enforcedAvance,
            ultimoActualizado: nowStr,
            historial: [newEntry, ...(r.historial || [])],
          };
          logAudit("ACTUALIZAR", "Proceso & Seguimiento", String(idRegistro), r.direccion, `Novedad: ${entrada.nota} (Estado: ${targetEstado})`);
          return updated;
        }
        return r;
      })
    );
  };

  const addAgendaActividad = (idRegistro: number, actividad: Omit<ActividadAgenda, "id">) => {
    const newAct: ActividadAgenda = {
      ...actividad,
      id: `ACT-${Date.now().toString(36).toUpperCase()}`,
      creadoPor: currentUser?.name || "Administrador",
    };
    const nowStr = new Date().toISOString();
    setReportes((prev) =>
      prev.map((r) => {
        if (r.idRegistro === idRegistro) {
          return {
            ...r,
            ultimoActualizado: nowStr,
            agendaActividades: [...(r.agendaActividades || []), newAct],
          };
        }
        return r;
      })
    );
    logAudit("ACTUALIZAR", "Agenda de Actividades", String(idRegistro), `Actividad: ${actividad.tipoActividad}`, `Agendada para ${actividad.fechaHora}`);
  };

  const updateAgendaActividad = (idRegistro: number, idActividad: string, data: Partial<ActividadAgenda>) => {
    const nowStr = new Date().toISOString();
    setReportes((prev) =>
      prev.map((r) => {
        if (r.idRegistro === idRegistro) {
          return {
            ...r,
            ultimoActualizado: nowStr,
            agendaActividades: (r.agendaActividades || []).map((a) =>
              a.id === idActividad ? { ...a, ...data } : a
            ),
          };
        }
        return r;
      })
    );
  };

  const addAnexoEtiqueta = (idRegistro: number, anexo: Omit<AnexoEtiqueta, "id" | "fechaCreacion">) => {
    const newAnexo: AnexoEtiqueta = {
      ...anexo,
      id: `ANX-${Date.now().toString(36).toUpperCase()}`,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      creadoPor: currentUser?.name || "Administrador",
    };
    const nowStr = new Date().toISOString();
    setReportes((prev) =>
      prev.map((r) => {
        if (r.idRegistro === idRegistro) {
          return {
            ...r,
            ultimoActualizado: nowStr,
            anexosEtiquetas: [...(r.anexosEtiquetas || []), newAnexo],
          };
        }
        return r;
      })
    );
    logAudit("ACTUALIZAR", "Anexos & Etiquetas", String(idRegistro), `Etiqueta: ${anexo.etiqueta}`, anexo.descripcion);
  };

  // Cotizaciones
  const addCotizacion = (data: Omit<Cotizacion, "idCotizacion">) => {
    const newId = Math.max(...cotizaciones.map((c) => c.idCotizacion), 5000) + 1;
    const newCot: Cotizacion = { ...data, idCotizacion: newId };
    setCotizaciones((prev) => [newCot, ...prev]);

    // Sincronizar con la orden si existe
    if (newCot.idReporte) {
      setReportes((rPrev) =>
        rPrev.map((r) => {
          if (r.idRegistro === newCot.idReporte) {
            return {
              ...r,
              totalCotizacion: newCot.numTodoCosto,
              estado: newCot.estado === "Aprobada" ? "Cotizado" : r.estado,
            };
          }
          return r;
        })
      );
    }

    logAudit("CREAR", "Cotizaciones & Presupuestos", String(newId), `Cotización #${newId}`, `Monto total: $ ${newCot.numTodoCosto}`);
  };

  const updateCotizacion = (idCotizacion: number, data: Partial<Cotizacion>) => {
    setCotizaciones((prev) =>
      prev.map((c) => {
        if (c.idCotizacion === idCotizacion) {
          const updated = { ...c, ...data };
          logAudit("ACTUALIZAR", "Cotizaciones", String(idCotizacion), `Cotización #${idCotizacion}`, `Cambio de estado a ${updated.estado}`);

          // Sincronizar con la orden de trabajo asociada
          if (updated.idReporte) {
            setReportes((rPrev) =>
              rPrev.map((r) => {
                if (r.idRegistro === updated.idReporte) {
                  return {
                    ...r,
                    totalCotizacion: updated.numTodoCosto,
                    estado: updated.estado === "Aprobada" ? "Cotizado" : r.estado,
                  };
                }
                return r;
              })
            );
          }

          return updated;
        }
        return c;
      })
    );
  };
 
  const deleteCotizacion = (idCotizacion: number) => {
    setCotizaciones((prev) => prev.filter((c) => c.idCotizacion !== idCotizacion));
    logAudit("ELIMINAR", "Cotizaciones & Presupuestos", String(idCotizacion), `Cotización #${idCotizacion}`, "Cotización eliminada del caso");
  };

  // Movimientos Contables (Ingresos & Egresos)
  const addMovement = (data: Omit<Movement, "id" | "createdAt">) => {
    const newId = `MOV-${(movements.length + 1).toString().padStart(3, "0")}`;
    const newMov: Movement = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setMovements((prev) => [newMov, ...prev]);
    logAudit("CREAR", `Contabilidad - ${newMov.tipo}s`, newId, newMov.concepto, `Monto: $ ${newMov.monto} - Estado: ${newMov.estado}`);
  };

  const updateMovementStatus = (id: string, newStatus: MovementStatus) => {
    setMovements((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          logAudit("CAMBIO_ESTADO", `Contabilidad - ${m.tipo}s`, id, m.concepto, `Estado: ${m.estado} → ${newStatus}`);
          return { ...m, estado: newStatus };
        }
        return m;
      })
    );
  };

  const deleteMovement = (id: string) => {
    const target = movements.find((m) => m.id === id);
    setMovements((prev) => prev.filter((m) => m.id !== id));
    if (target) {
      logAudit("ELIMINAR", `Contabilidad - ${target.tipo}s`, id, target.concepto, `Eliminado registro de ${target.monto}`);
    }
  };

  // Cuentas de Cobro
  const addCuentaCobro = (data: Omit<CuentaCobro, "id">) => {
    const newId = `CC-${(cuentasCobro.length + 1).toString().padStart(3, "0")}`;
    const newCC: CuentaCobro = { ...data, id: newId };
    setCuentasCobro((prev) => [newCC, ...prev]);
    logAudit("CREAR", "Cuentas de Cobro", newId, newCC.numero, `Valor Neto: $ ${newCC.valorNeto} para ${newCC.clienteNombre}`);
  };

  const updateCuentaCobroStatus = (id: string, newStatus: "Pendiente" | "Pagada" | "Anulada") => {
    setCuentasCobro((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          logAudit("CAMBIO_ESTADO", "Cuentas de Cobro", id, c.numero, `Estado actualizado a ${newStatus}`);
          return { ...c, estado: newStatus };
        }
        return c;
      })
    );
  };

  // Materiales
  const addMaterial = (data: Omit<Material, "id">) => {
    const newId = `MAT-${(materiales.length + 1).toString().padStart(3, "0")}`;
    const newMat: Material = { ...data, id: newId };
    setMateriales((prev) => [newMat, ...prev]);
    logAudit("CREAR", "Maestros - Materiales", newId, newMat.nombre, `Stock inicial: ${newMat.stockActual} ${newMat.unidad}`);
  };

  const updateMaterialStock = (id: string, nuevoStock: number) => {
    setMateriales((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nuevoEstado = nuevoStock <= 0 ? "Agotado" : nuevoStock <= m.stockMinimo ? "Bajo Stock" : "Optimo";
          logAudit("ACTUALIZAR", "Inventario Materiales", id, m.nombre, `Ajuste de stock: ${m.stockActual} → ${nuevoStock}`);
          return { ...m, stockActual: nuevoStock, estado: nuevoEstado };
        }
        return m;
      })
    );
  };

  // Clientes
  const addClient = (data: Omit<Client, "id">) => {
    const newId = `CLI-${(clientes.length + 1).toString().padStart(2, "0")}`;
    const newClient: Client = { ...data, id: newId };
    setClientes((prev) => [newClient, ...prev]);
    logAudit("CREAR", "Maestros - Clientes", newId, newClient.nombre, `Nuevo ${newClient.tipo}`);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClientes((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...data };
          logAudit("ACTUALIZAR", "Maestros - Clientes", id, updated.nombre, "Modificación de datos de cliente");
          return updated;
        }
        return c;
      })
    );
  };

  // Sectores
  const addSector = (data: Omit<Sector, "id">) => {
    const newId = `SEC-${(sectores.length + 1).toString().padStart(2, "0")}`;
    const newSec: Sector = { ...data, id: newId };
    setSectores((prev) => [newSec, ...prev]);
    logAudit("CREAR", "Maestros - Sectores", newId, newSec.nombre, `Zona: ${newSec.zona}`);
  };

  // Herramientas
  const addHerramienta = (data: Omit<Herramienta, "id">) => {
    const newId = `HER-${(herramientas.length + 1).toString().padStart(3, "0")}`;
    const newHer: Herramienta = { ...data, id: newId };
    setHerramientas((prev) => [newHer, ...prev]);
    logAudit("CREAR", "Maestros - Herramientas", newId, newHer.nombre, `Grupo: ${newHer.grupo}`);
  };

  const updateHerramientaEstado = (id: string, estado: Herramienta["estado"], responsable?: string) => {
    setHerramientas((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          logAudit("ACTUALIZAR", "Operaciones - Herramientas", id, h.nombre, `Estado: ${h.estado} → ${estado}, Asignado a: ${responsable || "Almacén"}`);
          return {
            ...h,
            estado,
            responsableActual: responsable || h.responsableActual,
            fechaAsignacion: new Date().toISOString().slice(0, 10),
          };
        }
        return h;
      })
    );
  };

  // Llaves
  const addLlave = (data: Omit<KeyItem, "id">) => {
    const newId = `LLV-${(llaves.length + 1).toString().padStart(3, "0")}`;
    const newKey: KeyItem = { ...data, id: newId };
    setLlaves((prev) => [newKey, ...prev]);
    logAudit("CREAR", "Operaciones - Llaves", newId, newKey.inmueble, `Custodio inicial: ${newKey.custodioActual}`);
  };

  const updateLlavePrestamo = (id: string, estado: "Disponible" | "Prestada" | "Extraviada", custodio?: string) => {
    setLlaves((prev) =>
      prev.map((k) => {
        if (k.id === id) {
          const fecha = estado === "Prestada" ? new Date().toISOString().replace("T", " ").slice(0, 16) : undefined;
          logAudit("CAMBIO_ESTADO", "Operaciones - Llaves", id, k.inmueble, `Estado: ${k.estado} → ${estado} (Custodio: ${custodio || "Recepción"})`);
          return {
            ...k,
            estado,
            custodioActual: custodio || (estado === "Disponible" ? "Recepción de Llaves / Caja Fuerte" : k.custodioActual),
            fechaPrestamo: fecha,
          };
        }
        return k;
      })
    );
  };

  // Entregas de Materiales
  const addEntregaMaterial = (data: Omit<EntregaMaterial, "id">) => {
    const newId = `ENT-${(entregasMateriales.length + 1).toString().padStart(2, "0")}`;
    const newEnt: EntregaMaterial = { ...data, id: newId };
    setEntregasMateriales((prev) => [newEnt, ...prev]);
    logAudit("CREAR", "Operaciones - Materiales", newId, newEnt.materialNombre, `Entregado ${newEnt.cantidad} ${newEnt.unidad} a ${newEnt.receptorNombre}`);
  };

  // Novedades
  const addNovedad = (data: Omit<NovedadReport, "id">) => {
    const newId = `NOV-${(novedades.length + 1).toString().padStart(3, "0")}`;
    const newNov: NovedadReport = { ...data, id: newId };
    setNovedades((prev) => [newNov, ...prev]);
    logAudit("CREAR", "Informes - Novedades", newId, newNov.titulo, `Prioridad: ${newNov.prioridad}`);
  };

  // Encuestas
  const addEncuesta = (data: Omit<Encuesta, "id">) => {
    const newId = `ENC-${(encuestas.length + 1).toString().padStart(2, "0")}`;
    const newEnc: Encuesta = { ...data, id: newId };
    setEncuestas((prev) => [newEnc, ...prev]);
    logAudit("CREAR", "Informes - Encuestas", newId, newEnc.cliente, `Calificación: ${newEnc.puntuacion}/5 estrellas`);
  };

  // Importación masiva de reportes (permite reemplazar la BD con datos nuevos limpios o anexar)
  const importReportesBatch = (newItems: Omit<ReporteOrden, "idRegistro">[], replaceExisting: boolean = false) => {
    let startId = replaceExisting ? 1000 : Math.max(...reportes.map((r) => r.idRegistro), 1000);
    const nowIso = new Date().toISOString();

    const preparedReportes: ReporteOrden[] = newItems.map((item, idx) => {
      const id = startId + idx + 1;
      const enforcedAvance =
        item.estado === "Ejecutado" || item.estado === "Cobrado"
          ? 1.0
          : item.tasaAvance !== undefined
          ? item.tasaAvance
          : 0.1;

      return {
        ...item,
        idRegistro: id,
        codigoAlfanumerico: item.codigoAlfanumerico || `#${id}`,
        tipoTrabajo: item.tipoTrabajo || "Mantenimiento General",
        tasaAvance: enforcedAvance,
        ultimoActualizado: nowIso,
        agendaActividades: item.agendaActividades || [],
        anexosEtiquetas: item.anexosEtiquetas || [],
        historial: item.historial || [
          {
            id: `HIST-IMPORT-${id}`,
            fecha: nowIso,
            autor: currentUser?.name || "Importador CSV",
            autorCargo: currentUser?.cargo || currentRole || "Carga Masiva",
            autorSelloDigital: `SOS-CSV-${Date.now().toString(36).toUpperCase()}`,
            nuevoEstado: item.estado || "Cotizado",
            nota: "Registro incorporado mediante importación masiva CSV.",
            etiquetaAccion: "importacion",
          },
        ],
      };
    });

    if (replaceExisting) {
      setReportes(preparedReportes);
      // Sincronizar cotizaciones para los reportes importados
      const newCots: Cotizacion[] = preparedReportes
        .filter((r) => r.totalCotizacion && r.totalCotizacion > 0)
        .map((r, i) => ({
          idCotizacion: 5001 + i,
          idReporte: r.idRegistro,
          reporteDireccion: r.direccion,
          clienteNombre: r.clienteNombre,
          contratistaId: r.idContratista || "CON-001",
          contratistaNombre: r.contratistaNombre || "Cuadrilla SOS",
          fecha: r.fecha || new Date().toISOString().slice(0, 10),
          numTodoCosto: r.totalCotizacion,
          numMaterial: Math.round(r.totalCotizacion * 0.4),
          numManoObra: Math.round(r.totalCotizacion * 0.5),
          numTransporte: Math.round(r.totalCotizacion * 0.1),
          estado: r.estado === "Cobrado" || r.estado === "Ejecutado" ? "Aprobada" : "Borrador",
          diasGarantia: 30,
          observaciones: r.reporte,
          items: [
            {
              id: `ITEM-CSV-${i + 1}`,
              descripcion: r.reporte || r.tipoTrabajo || "Mantenimiento General",
              cantidad: 1,
              unidad: "GLB",
              valorUnitario: r.totalCotizacion,
              valorTotal: r.totalCotizacion,
            },
          ],
        }));
      setCotizaciones(newCots);
      logAudit(
        "CREAR",
        "Base de Datos",
        "NUEVA-BD-CSV",
        "tblReportes",
        `Inicializada nueva base de datos limpia con ${preparedReportes.length} registros desde CSV`
      );
    } else {
      setReportes((prev) => [...preparedReportes, ...prev]);
      logAudit(
        "CREAR",
        "tblReportes",
        "ANEXAR-CSV",
        "Importación",
        `Anexados ${preparedReportes.length} nuevos reportes desde CSV`
      );
    }
  };

  const clearReportes = () => {
    setReportes([]);
    logAudit("ELIMINAR", "tblReportes", "CLEAN-ALL", "Base de Datos", "Vaciado de tabla de reportes para carga limpia");
  };

  // Reset a datos semilla
  const resetToInitialData = () => {
    if (window.confirm("¿Seguro que deseas restablecer todos los datos a la configuración inicial de la BD?")) {
      localStorage.clear();
      setContractors(SEED_CONTRACTORS);
      setReportes(SEED_REPORTES);
      setCotizaciones(SEED_COTIZACIONES);
      setMovements(SEED_MOVEMENTS);
      setCuentasCobro(SEED_CUENTAS_COBRO);
      setMateriales(SEED_MATERIALES);
      setClientes(SEED_CLIENTES);
      setSectores(SEED_SECTORES);
      setHerramientas(SEED_HERRAMIENTAS);
      setLlaves(SEED_LLAVES);
      setEntregasMateriales(SEED_ENTREGAS_MATERIALES);
      setNovedades(SEED_NOVEDADES);
      setEncuestas(SEED_ENCUESTAS);
      setAuditLogs(SEED_AUDIT_LOGS);
      alert("Datos restablecidos con éxito.");
    }
  };

  return (
    <DataContext.Provider
      value={{
        contractors,
        reportes,
        cotizaciones,
        movements,
        cuentasCobro,
        materiales,
        clientes,
        sectores,
        herramientas,
        llaves,
        entregasMateriales,
        novedades,
        encuestas,
        auditLogs,
        addContractor,
        updateContractor,
        deleteContractor,
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
        addMovement,
        updateMovementStatus,
        deleteMovement,
        addCuentaCobro,
        updateCuentaCobroStatus,
        addMaterial,
        updateMaterialStock,
        addClient,
        updateClient,
        addSector,
        addHerramienta,
        updateHerramientaEstado,
        addLlave,
        updateLlavePrestamo,
        addEntregaMaterial,
        addNovedad,
        addEncuesta,
        logAudit,
        resetToInitialData,
        importReportesBatch,
        clearReportes,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
