import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { ReporteOrden, ReporteEstado } from '../../../types';
import { supabaseDb } from '../../../services/supabaseAuth';
import {
  Wrench,
  Send,
  Phone,
  MessageSquare,
  Building,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Sparkles,
  X,
  User,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SolicitudServicioClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newReporte: ReporteOrden) => void;
}

export const SolicitudServicioClienteModal: React.FC<SolicitudServicioClienteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { reportes, addReporte, clientes, sectores, logAudit } = useData();
  const { currentUser } = useAuth();

  // Estados del Formulario
  const [solicitanteNombre, setSolicitanteNombre] = useState(
    currentUser?.name && currentUser.name !== 'Invitado' ? currentUser.name : ''
  );
  const [solicitanteTelefono, setSolicitanteTelefono] = useState(
    currentUser?.telefono || ''
  );
  const [solicitanteEmail, setSolicitanteEmail] = useState(
    currentUser?.email || ''
  );
  const [solicitanteCanal, setSolicitanteCanal] = useState<'WhatsApp' | 'Llamada' | 'Correo'>('WhatsApp');
  
  const [clienteNombre, setClienteNombre] = useState(
    clientes[0]?.nombre || 'Inversiones Santa María'
  );
  const [direccion, setDireccion] = useState('');
  const [inmuebleDetalle, setInmuebleDetalle] = useState('');
  const [sector, setSector] = useState(sectores[0]?.nombre || 'El Poblado');

  const [tipoTrabajo, setTipoTrabajo] = useState('Mantenimiento Correctivo');
  const [urgencia, setUrgencia] = useState<'Normal' | 'Urgente' | 'Emergencia'>('Normal');
  const [horarioPreferido, setHorarioPreferido] = useState('Cualquier horario');
  const [reporte, setReporte] = useState('');

  // Estados de interfaz y feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketGenerado, setTicketGenerado] = useState<ReporteOrden | null>(null);
  const [copiado, setCopiado] = useState(false);

  if (!isOpen) return null;

  // Calculo de consecutivo
  const nextOrderId = Math.max(...reportes.map((r) => r.idRegistro), 1000) + 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validaciones
    if (!solicitanteNombre.trim()) {
      setFormError('Por favor ingresa tu nombre completo o persona de contacto.');
      return;
    }
    const cleanPhone = solicitanteTelefono.replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      setFormError('Por favor ingresa un número de teléfono celular válido (mínimo 7 a 10 dígitos).');
      return;
    }
    if (!direccion.trim()) {
      setFormError('Por favor ingresa la dirección del inmueble donde se requiere el servicio.');
      return;
    }
    if (!reporte.trim() || reporte.trim().length < 8) {
      setFormError('Por favor describe detalladamente la novedad, daño o trabajo requerido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const nowIso = new Date().toISOString();
      const fechaHoy = nowIso.slice(0, 10);
      const codigo = `REQ-${new Date().getFullYear()}-${nextOrderId}`;
      const direccionCompleta = inmuebleDetalle.trim()
        ? `${direccion.trim()} - ${inmuebleDetalle.trim()}`
        : direccion.trim();

      const matchedCliente = clientes.find((c) => c.nombre === clienteNombre);
      const idCliente = matchedCliente ? matchedCliente.id : 'CLI-01';

      const nuevaOrden: ReporteOrden = {
        idRegistro: nextOrderId,
        codigoAlfanumerico: codigo,
        tipoTrabajo,
        idContratante: idCliente,
        clienteNombre,
        arrendatario: solicitanteNombre.trim(),
        propietario: clienteNombre,
        quienContrata: 'Arrendatario',
        direccion: direccionCompleta,
        referenciaContacto: `Tel: ${solicitanteTelefono} (${solicitanteNombre})`,
        sector,
        fecha: fechaHoy,
        idContratista: '',
        contratistaNombre: 'Sin Asignar (Pendiente de Asignación)',
        estado: 'Se Recibe Información' as ReporteEstado,
        reporte: reporte.trim(),
        totalCotizacion: 0,
        tasaAvance: 0.05,
        solicitanteNombre: solicitanteNombre.trim(),
        solicitanteTelefono: solicitanteTelefono.trim(),
        solicitanteEmail: solicitanteEmail.trim(),
        solicitanteCanal,
        urgencia,
        inmuebleDetalle: inmuebleDetalle.trim(),
        origenSolicitud: 'Cliente Web',
        horarioPreferido,
        estadoContacto: 'Pendiente de Contacto',
        historial: [
          {
            id: `HIST-REQ-${Date.now()}`,
            fecha: nowIso,
            autor: solicitanteNombre.trim(),
            autorCargo: 'Cliente Solicitante',
            autorSelloDigital: `REQ-WEB-${Date.now().toString(36).toUpperCase()}`,
            nuevoEstado: 'Se Recibe Información',
            nota: `Solicitud de servicio radicada vía portal cliente. Contacto: ${solicitanteTelefono} (${solicitanteCanal}). Urgencia: ${urgencia}. En espera de respuesta por parte de Administración o Auxiliar.`,
            etiquetaAccion: 'solicitud_cliente',
          },
        ],
      };

      // 1. Guardar en memoria y estado reactivo de la aplicación
      addReporte(nuevaOrden);

      // 2. Registro en bitácora de auditoría
      if (logAudit) {
        logAudit(
          'CREAR',
          'tblReportes',
          codigo,
          'Portal Cliente',
          `Cliente ${solicitanteNombre} radicó solicitud de servicio #${nextOrderId} para ${direccionCompleta}. Contacto: ${solicitanteTelefono}`
        );
      }

      // 3. Sincronización en segundo plano con Supabase Cloud PostgreSQL
      try {
        await supabaseDb.insertRow('reportes', {
          numero_orden: codigo,
          fecha: fechaHoy,
          cliente_id: 1,
          contratista_id: 1,
          sector,
          direccion: direccionCompleta,
          descripcion_servicio: `[${tipoTrabajo} | ${urgencia}] ${reporte.trim()}`,
          estado: 'Se Recibe Información',
          prioridad: urgencia === 'Emergencia' ? 'Alta' : urgencia === 'Urgente' ? 'Media' : 'Baja',
          total: 0,
          observaciones: JSON.stringify({
            solicitante_nombre: solicitanteNombre.trim(),
            solicitante_telefono: solicitanteTelefono.trim(),
            solicitante_email: solicitanteEmail.trim(),
            canal_contacto: solicitanteCanal,
            horario_preferido: horarioPreferido,
            inmueble_detalle: inmuebleDetalle.trim(),
            origen: 'Portal Cliente Web',
          }),
        });
      } catch (supaErr) {
        console.info('Supabase background sync notice:', supaErr);
      }

      setTicketGenerado(nuevaOrden);
      if (onSuccess) onSuccess(nuevaOrden);
    } catch (err: any) {
      setFormError(err.message || 'Error al radicar la solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopiarRadicado = () => {
    if (!ticketGenerado) return;
    const texto = `Radicado SOS EN LINEA: #${ticketGenerado.idRegistro} (${ticketGenerado.codigoAlfanumerico}) - Inmueble: ${ticketGenerado.direccion}`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const handleAbrirWhatsAppSoporte = () => {
    if (!ticketGenerado) return;
    const mensaje = `Hola SOS EN LINEA, acabo de radicar la solicitud de servicio #${ticketGenerado.idRegistro} (${ticketGenerado.codigoAlfanumerico}) para el inmueble: ${ticketGenerado.direccion}. Mi nombre es ${ticketGenerado.solicitanteNombre} y mi teléfono es ${ticketGenerado.solicitanteTelefono}. Deseo confirmar la atención de mi solicitud. ¡Muchas gracias!`;
    const url = `https://wa.me/573001234567?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleCerrarYReset = () => {
    setTicketGenerado(null);
    setFormError(null);
    setDireccion('');
    setInmuebleDetalle('');
    setReporte('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'var(--surface, #ffffff)',
          color: 'var(--text-main, #0f172a)',
          width: '100%',
          maxWidth: '740px',
          maxHeight: '92vh',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                  Radicar Solicitud de Servicio
                </h2>
                <span
                  style={{
                    background: 'rgba(37, 99, 235, 0.3)',
                    color: '#93c5fd',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(147, 197, 253, 0.3)',
                  }}
                >
                  PQR #{nextOrderId}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Déjanos tus datos de contacto para que el Administrador o Auxiliar coordine tu requerimiento.
              </p>
            </div>
          </div>

          <button
            onClick={handleCerrarYReset}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {ticketGenerado ? (
            /* Vista de Confirmación y Éxito */
            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle2 size={40} />
              </div>

              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#10b981',
                }}
              >
                ¡Solicitud Radicada Exitosamente!
              </span>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0.25rem 0', color: 'var(--text-main)' }}>
                Orden de Servicio #{ticketGenerado.idRegistro}
              </h3>
              <p style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 1.25rem 0' }}>
                Código Radicado: {ticketGenerado.codigoAlfanumerico}
              </p>

              {/* Tarjeta Resumen del Ticket */}
              <div
                style={{
                  background: 'var(--background, #f8fafc)',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'left',
                  margin: '0 auto 1.5rem auto',
                  maxWidth: '540px',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Contacto Solicitante</span>
                    <strong>{ticketGenerado.solicitanteNombre}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Teléfono / Celular</span>
                    <strong style={{ color: '#2563eb' }}>{ticketGenerado.solicitanteTelefono}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Ubicación</span>
                    <span>{ticketGenerado.direccion}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Urgencia</span>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.1rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background:
                          ticketGenerado.urgencia === 'Emergencia'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : ticketGenerado.urgencia === 'Urgente'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                        color:
                          ticketGenerado.urgencia === 'Emergencia'
                            ? '#dc2626'
                            : ticketGenerado.urgencia === 'Urgente'
                            ? '#d97706'
                            : '#059669',
                      }}
                    >
                      {ticketGenerado.urgencia}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '0.65rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Requerimiento</span>
                  <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-main)' }}>
                    &ldquo;{ticketGenerado.reporte}&rdquo;
                  </p>
                </div>
              </div>

              {/* Mensaje de Atención Inmediata */}
              <div
                style={{
                  background: 'rgba(37, 99, 235, 0.06)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  borderRadius: '10px',
                  padding: '0.9rem 1.1rem',
                  maxWidth: '540px',
                  margin: '0 auto 1.5rem auto',
                  fontSize: '0.825rem',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textAlign: 'left',
                }}
              >
                <ShieldCheck size={26} color="#2563eb" style={{ flexShrink: 0 }} />
                <span>
                  Tu petición ya fue asignada al buzón prioritario. Un <strong>Administrador</strong> o <strong>Auxiliar Administrativo</strong> se comunicará contigo vía <strong>{ticketGenerado.solicitanteCanal}</strong> para coordinar la visita técnica.
                </span>
              </div>

              {/* Botones de Acción Posterior */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleCopiarRadicado}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
                >
                  {copiado ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  {copiado ? '¡Radicado Copiado!' : 'Copiar Radicado'}
                </button>

                <button
                  type="button"
                  onClick={handleAbrirWhatsAppSoporte}
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem 1.25rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)',
                  }}
                >
                  <MessageSquare size={16} />
                  Confirmar por WhatsApp con Soporte
                </button>

                <button
                  type="button"
                  onClick={handleCerrarYReset}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Ver Mi Solicitud en el Sistema
                </button>
              </div>
            </div>
          ) : (
            /* Formulario de Entrada para el Cliente */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {formError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#dc2626',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              {/* SECCIÓN 1: DATOS DE CONTACTO */}
              <div
                style={{
                  background: 'var(--background, #f8fafc)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '12px',
                  padding: '1.15rem 1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: 'var(--primary)',
                    marginBottom: '0.85rem',
                  }}
                >
                  <User size={16} />
                  <span>1. Tus Datos de Contacto Directo</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Nombre de Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carlos Restrepo"
                      value={solicitanteNombre}
                      onChange={(e) => setSolicitanteNombre(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Teléfono Celular / WhatsApp *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone
                        size={15}
                        style={{
                          position: 'absolute',
                          left: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#22c55e',
                        }}
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Ej: 300 123 4567"
                        value={solicitanteTelefono}
                        onChange={(e) => setSolicitanteTelefono(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', paddingLeft: '2.1rem', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={solicitanteEmail}
                      onChange={(e) => setSolicitanteEmail(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      ¿Cómo prefieres ser contactado?
                    </label>
                    <select
                      value={solicitanteCanal}
                      onChange={(e) => setSolicitanteCanal(e.target.value as any)}
                      className="select-field"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      <option value="WhatsApp">💬 WhatsApp (Respuesta más rápida)</option>
                      <option value="Llamada">📞 Llamada Telefónica Directa</option>
                      <option value="Correo">✉️ Correo Electrónico</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: UBICACIÓN DEL INMUEBLE */}
              <div
                style={{
                  background: 'var(--background, #f8fafc)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '12px',
                  padding: '1.15rem 1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: 'var(--primary)',
                    marginBottom: '0.85rem',
                  }}
                >
                  <Building size={16} />
                  <span>2. Inmueble y Ubicación del Servicio</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Inmobiliaria / Razón Social / Copropiedad
                    </label>
                    <select
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      className="select-field"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      {clientes.map((c) => (
                        <option key={c.id} value={c.nombre}>
                          {c.nombre} ({c.documento ? `Doc: ${c.documento}` : 'Activo'})
                        </option>
                      ))}
                      <option value="Inversiones Santa María">Inversiones Santa María</option>
                      <option value="Corporación Inmobiliaria Andina">Corporación Inmobiliaria Andina</option>
                      <option value="Cliente Particular">Cliente Particular / Propietario Directo</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Dirección del Inmueble *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <MapPin
                        size={15}
                        style={{
                          position: 'absolute',
                          left: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#64748b',
                        }}
                      />
                      <input
                        type="text"
                        required
                        placeholder="Ej: Calle 10 # 43E-12"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', paddingLeft: '2.1rem', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Apto / Casa / Oficina / Local
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Apto 502, Torre 1"
                      value={inmuebleDetalle}
                      onChange={(e) => setInmuebleDetalle(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Sector / Zona
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="select-field"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      {sectores.map((s) => (
                        <option key={s.id} value={s.nombre}>
                          {s.nombre}
                        </option>
                      ))}
                      <option value="El Poblado">El Poblado</option>
                      <option value="Laureles">Laureles</option>
                      <option value="Belén">Belén</option>
                      <option value="Envigado">Envigado</option>
                      <option value="Sabaneta">Sabaneta</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: DETALLE DEL SERVICIO */}
              <div
                style={{
                  background: 'var(--background, #f8fafc)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '12px',
                  padding: '1.15rem 1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: 'var(--primary)',
                    marginBottom: '0.85rem',
                  }}
                >
                  <Wrench size={16} />
                  <span>3. Detalle del Requerimiento Técnico</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Tipo de Servicio Requerido
                    </label>
                    <select
                      value={tipoTrabajo}
                      onChange={(e) => setTipoTrabajo(e.target.value)}
                      className="select-field"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      <option value="Mantenimiento Correctivo">Mantenimiento Correctivo (General)</option>
                      <option value="Electricidad & Redes">Electricidad & Redes (Breakers, Tomas, Cortos)</option>
                      <option value="Plomería & Fontanería / Fugas">Plomería & Fontanería (Fugas, Sanitarios)</option>
                      <option value="Cerrajería & Puertas">Cerrajería & Puertas (Chapas, Cerraduras)</option>
                      <option value="Pintura, Estuco & Acabados">Pintura, Estuco & Acabados</option>
                      <option value="Techos & Impermeabilizaciones">Techos & Impermeabilizaciones (Goteras)</option>
                      <option value="Diagnóstico / Inspección Técnica">Diagnóstico / Inspección Técnica</option>
                      <option value="Garantía de Servicio Anterior">Reclamo de Garantía de Servicio</option>
                      <option value="PQR / Solicitud Especial">PQR / Solicitud Especial</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Nivel de Urgencia
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {(['Normal', 'Urgente', 'Emergencia'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setUrgencia(lvl)}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.2rem',
                            borderRadius: '8px',
                            border: urgencia === lvl ? '2px solid' : '1px solid rgba(226, 232, 240, 0.8)',
                            borderColor:
                              urgencia === lvl
                                ? lvl === 'Emergencia'
                                  ? '#ef4444'
                                  : lvl === 'Urgente'
                                  ? '#f59e0b'
                                  : '#10b981'
                                : 'rgba(226, 232, 240, 0.8)',
                            background:
                              urgencia === lvl
                                ? lvl === 'Emergencia'
                                  ? 'rgba(239, 68, 68, 0.12)'
                                  : lvl === 'Urgente'
                                  ? 'rgba(245, 158, 11, 0.12)'
                                  : 'rgba(16, 185, 129, 0.12)'
                                : '#ffffff',
                            color:
                              urgencia === lvl
                                ? lvl === 'Emergencia'
                                  ? '#dc2626'
                                  : lvl === 'Urgente'
                                  ? '#d97706'
                                  : '#059669'
                                : 'var(--text-muted)',
                            fontWeight: urgencia === lvl ? 800 : 500,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          {lvl === 'Emergencia' ? '🚨 Emergencia' : lvl === 'Urgente' ? '⚡ Urgente' : '🟢 Normal'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Horario Preferido para la Visita
                    </label>
                    <select
                      value={horarioPreferido}
                      onChange={(e) => setHorarioPreferido(e.target.value)}
                      className="select-field"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      <option value="Cualquier horario">Cualquier horario hábil</option>
                      <option value="Mañanas (8:00 AM - 12:00 PM)">Mañanas (8:00 AM - 12:00 PM)</option>
                      <option value="Tardes (1:00 PM - 5:00 PM)">Tardes (1:00 PM - 5:00 PM)</option>
                      <option value="Sábados en la mañana">Sábados en la mañana</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Descripción Detallada del Problema o Necesidad *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe con claridad la falla: por ejemplo, fuga de agua en el sifón del lavamanos principal, daño en cerradura de entrada, cortocircuito en habitación..."
                    value={reporte}
                    onChange={(e) => setReporte(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.85rem', lineHeight: 1.5 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Entre más detalles brindes, más rápido podremos despachar la cuadrilla y los materiales exactos.
                  </span>
                </div>
              </div>

              {/* Pie del Formulario y Botones */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={16} color="#10b981" />
                  <span>Se asignará número de radicado oficial con trazabilidad en vivo.</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={handleCerrarYReset}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      padding: '0.6rem 1.4rem',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    }}
                  >
                    {isSubmitting ? (
                      <span>Radicando petición...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Radicar Solicitud de Servicio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
