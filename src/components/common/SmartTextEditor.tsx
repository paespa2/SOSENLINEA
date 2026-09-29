import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Sparkles,
  FileText,
  AlertCircle,
  CheckCircle2,
  Type,
  ChevronDown
} from 'lucide-react';

interface SmartTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  required?: boolean;
  error?: string;
  hint?: string;
}

// Diccionario de corrección técnica y ortográfica para informes en Colombia
const REEMPLAZOS_ORTOGRAFICOS: [RegExp, string][] = [
  // Acentuación técnica esencial
  [/\binstalacion\b/gi, 'instalación'],
  [/\binstalaciones\b/gi, 'instalaciones'],
  [/\breparacion\b/gi, 'reparación'],
  [/\breparaciones\b/gi, 'reparaciones'],
  [/\bcotisacion\b/gi, 'cotización'],
  [/\bcotizacion\b/gi, 'cotización'],
  [/\bcotizaciones\b/gi, 'cotizaciones'],
  [/\btecnico\b/gi, 'técnico'],
  [/\btecnica\b/gi, 'técnica'],
  [/\btecnicos\b/gi, 'técnicos'],
  [/\belectrico\b/gi, 'eléctrico'],
  [/\belectrica\b/gi, 'eléctrica'],
  [/\belectricos\b/gi, 'eléctricos'],
  [/\btuberia\b/gi, 'tubería'],
  [/\btuberias\b/gi, 'tuberías'],
  [/\bbanio\b/gi, 'baño'],
  [/\bbano\b/gi, 'baño'],
  [/\bbanios\b/gi, 'baños'],
  [/\bgarantia\b/gi, 'garantía'],
  [/\bgarantias\b/gi, 'garantías'],
  [/\binspeccion\b/gi, 'inspección'],
  [/\binspecciones\b/gi, 'inspecciones'],
  [/\bdiagnostico\b/gi, 'diagnóstico'],
  [/\bsatisfaccion\b/gi, 'satisfacción'],
  [/\bautorizacion\b/gi, 'autorización'],
  [/\binformacion\b/gi, 'información'],
  [/\batencion\b/gi, 'atención'],
  [/\brevision\b/gi, 'revisión'],
  [/\bconexion\b/gi, 'conexión'],
  [/\bconexiones\b/gi, 'conexiones'],
  [/\bvalvula\b/gi, 'válvula'],
  [/\bvalvulas\b/gi, 'válvulas'],
  [/\bpresion\b/gi, 'presión'],
  [/\barea\b/gi, 'área'],
  [/\bareas\b/gi, 'áreas'],
  [/\bnumero\b/gi, 'número'],
  [/\btelefono\b/gi, 'teléfono'],
  [/\bdireccion\b/gi, 'dirección'],
  // Typos habituales
  [/\binmuelbe\b/gi, 'inmueble'],
  [/\binmueblee\b/gi, 'inmueble'],
  [/\btrabajador\b/gi, 'operario'],
  [/\bhacerle\b/gi, 'realizar'],
  [/\bdespues\b/gi, 'después'],
  [/\btambien\b/gi, 'también'],
  [/\bmas\b/gi, 'más'],
];

// Plantillas profesionales listas para usar en órdenes de trabajo
const PLANTILLAS_TECNICAS = [
  {
    titulo: '🔍 Inspección Inicial y Diagnóstico',
    texto: 'Se realiza inspección ocular y técnica detallada en el inmueble, identificando la necesidad de intervención prioritaria. Se evalúan daños existentes y se proyectan materiales requeridos.'
  },
  {
    titulo: '🛠️ Mantenimiento Preventivo General',
    texto: 'Se ejecuta protocolo de mantenimiento preventivo integral. Limpieza técnica, lubricación de componentes, ajuste de tornillería y verificación de correcto funcionamiento de los sistemas.'
  },
  {
    titulo: '💧 Plomería y Red Hidráulica',
    texto: 'Detección de filtración en tubería principal de suministro. Se procede al desmonte de accesorios defectuosos, reemplazo de empaquetaduras y sellado hermético con teflón de alta densidad.'
  },
  {
    titulo: '⚡ Red Eléctrica y Circuitos',
    texto: 'Revisión técnica de circuitos ramales, balanceo de cargas en tablero de distribución y reemplazo de breaker termomagnético averiado. Se comprueba continuidad y aislamiento seguro.'
  },
  {
    titulo: '🎨 Pintura, Estuco y Resane',
    texto: 'Preparación de superficies con lijado técnico, aplicación de sellador antihumedad, estuco plástico en fisuras y acabado final con dos capas de pintura tipo 1 lavable de alta durabilidad.'
  },
  {
    titulo: '🤝 Acta de Recibido a Satisfacción',
    texto: 'Trabajos culminados a cabalidad conforme al alcance convenido. El usuario/arrendatario verifica la operatividad de los arreglos y manifiesta su recibo a completa satisfacción.'
  }
];

export const SmartTextEditor: React.FC<SmartTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe la descripción u observaciones detalladas aquí...',
  label,
  rows = 4,
  required = false,
  error,
  hint
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Helper para insertar texto o envolver selección
  const wrapSelection = (before: string, after: string = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = value;
    const selected = current.substring(start, end);

    let replacement = '';
    if (selected.length > 0) {
      replacement = `${before}${selected}${after}`;
    } else {
      replacement = `${before}texto${after}`;
    }

    const nextVal = current.substring(0, start) + replacement + current.substring(end);
    onChange(nextVal);

    setTimeout(() => {
      el.focus();
      const cursorTarget = start + before.length + (selected.length > 0 ? selected.length : 5);
      el.setSelectionRange(cursorTarget, cursorTarget);
    }, 10);
  };

  const insertLinePrefix = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const current = value;

    // Buscar el inicio de la línea actual
    const lineStart = current.lastIndexOf('\n', start - 1) + 1;
    const nextVal = current.substring(0, lineStart) + prefix + current.substring(lineStart);
    onChange(nextVal);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 10);
  };

  // Motor de Autocorrección y Limpieza Gramatical
  const handleAutocorrect = () => {
    if (!value.trim()) return;

    let text = value;
    let cambiosContador = 0;

    // 1. Limpieza de espaciado redundante
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\s+([.,;:])/g, '$1');
    text = text.replace(/([.,;:])(?=[a-zA-ZáéíóúÁÉÍÓÚñÑ])/g, '$1 ');

    // 2. Diccionario de acentos y correcciones
    REEMPLAZOS_ORTOGRAFICOS.forEach(([regex, reemplazo]) => {
      const matches = text.match(regex);
      if (matches) {
        cambiosContador += matches.length;
        text = text.replace(regex, reemplazo);
      }
    });

    // 3. Capitalización de primera letra y tras punto
    text = text.replace(/(^|[.!?]\s+)([a-záéíóúñ])/g, (match, prefix, letter) => {
      cambiosContador++;
      return prefix + letter.toUpperCase();
    });

    onChange(text);

    setFeedbackMsg(`✨ Se aplicaron ${cambiosContador > 0 ? cambiosContador : 'varios'} ajustes ortográficos y de estilo.`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Capitalizar formato frase o mayúsculas
  const handleFormatCase = (mode: 'frase' | 'titulo' | 'mayus' | 'minus') => {
    let text = value;
    if (mode === 'frase') {
      text = text.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, p, l) => p + l.toUpperCase());
    } else if (mode === 'titulo') {
      text = text.toLowerCase().replace(/\b(\w)/g, (l) => l.toUpperCase());
    } else if (mode === 'mayus') {
      text = text.toUpperCase();
    } else if (mode === 'minus') {
      text = text.toLowerCase();
    }
    onChange(text);
  };

  // Aplicar plantilla
  const handleApplyTemplate = (plantillaTexto: string) => {
    if (value.trim()) {
      onChange(`${value.trim()}\n\n${plantillaTexto}`);
    } else {
      onChange(plantillaTexto);
    }
    setShowTemplates(false);
    setFeedbackMsg('📋 Plantilla técnica insertada con éxito.');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Métricas de texto
  const palabras = value.trim() ? value.trim().split(/\s+/).length : 0;
  const caracteres = value.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
          </label>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {palabras} palabras | {caracteres} caracteres
          </span>
        </div>
      )}

      {/* Caja contenedora del editor con borde ejecutivo */}
      <div
        style={{
          border: error ? '1px solid var(--danger)' : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          overflow: 'hidden',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Barra de herramientas superior */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.25rem',
            padding: '0.4rem 0.6rem',
            background: 'var(--neutral-50)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {/* Herramientas de formato */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => wrapSelection('**', '**')}
              title="Negrita"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 4,
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--neutral-600)',
                cursor: 'pointer',
              }}
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('*', '*')}
              title="Cursiva"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 4,
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--neutral-600)',
                cursor: 'pointer',
              }}
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('• ')}
              title="Lista con viñetas"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 4,
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--neutral-600)',
                cursor: 'pointer',
              }}
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('1. ')}
              title="Lista numerada"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 4,
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--neutral-600)',
                cursor: 'pointer',
              }}
            >
              <ListOrdered size={14} />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('### ')}
              title="Subtítulo técnico"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 4,
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--neutral-600)',
                cursor: 'pointer',
              }}
            >
              <Heading2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('⚠️ [URGENTE: ', ']')}
              title="Nota de Urgencia"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 4,
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--warning)',
                cursor: 'pointer',
              }}
            >
              <AlertCircle size={14} />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('✅ [CONFORME: ', ']')}
              title="Conforme / Aprobado"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 4,
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--success)',
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={14} />
            </button>

            <span style={{ width: 1, height: 16, background: 'var(--border-color)', margin: '0 0.2rem' }} />

            {/* Selector de Mayúsculas / Minúsculas */}
            <button
              type="button"
              onClick={() => handleFormatCase('frase')}
              title="Formato tipo frase"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: 4,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--neutral-700)',
                cursor: 'pointer',
              }}
            >
              <Type size={12} style={{ marginRight: 2 }} /> Frase
            </button>
          </div>

          {/* Acciones inteligentes (Autocorrector + Plantillas) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
            {/* Botón Desplegable de Plantillas */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 6,
                  border: '1px solid var(--border-color)',
                  background: showTemplates ? 'var(--primary-light)' : 'transparent',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                }}
                title="Insertar texto modelo o plantilla técnica"
              >
                <FileText size={13} />
                <span>Plantillas</span>
                <ChevronDown size={12} />
              </button>

              {showTemplates && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 50,
                    marginTop: '0.35rem',
                    width: '320px',
                    maxWidth: '90vw',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--neutral-500)', padding: '0.2rem 0.4rem' }}>
                    PLANTILLAS TÉCNICAS RÁPIDAS
                  </div>
                  {PLANTILLAS_TECNICAS.map((plantilla, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(plantilla.texto)}
                      style={{
                        textAlign: 'left',
                        padding: '0.45rem 0.6rem',
                        fontSize: '0.78rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.15rem',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--neutral-100)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <strong style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>{plantilla.titulo}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {plantilla.texto}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Botón de Autocorrección y Limpieza */}
            <button
              type="button"
              onClick={handleAutocorrect}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 9px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 6,
                border: 'none',
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
              }}
              title="Corregir ortografía, mayúsculas, puntuación y tildes técnicas"
            >
              <Sparkles size={13} />
              <span>Autocorregir</span>
            </button>
          </div>
        </div>

        {/* Notificación rápida de acción */}
        {feedbackMsg && (
          <div
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.75rem',
              background: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <CheckCircle2 size={13} />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Área de texto interactiva */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: 'none',
            outline: 'none',
            fontSize: '0.88rem',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            color: 'var(--text-main)',
            background: 'transparent',
            resize: 'vertical',
            minHeight: '90px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {hint && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>
      )}
    </div>
  );
};
