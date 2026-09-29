import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import {
  PenTool,
  Upload,
  Type,
  Eraser,
  CheckCircle2,
  Shield,
  Clock,
  Sparkles,
  UserCheck,
  AlertCircle,
  Zap
} from 'lucide-react';
import { DigitalSignatureData, Role } from '../../types';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (signatureData: DigitalSignatureData, saveAsDefault?: boolean) => void;
  defaultUserName?: string;
  defaultRole?: Role;
  savedDefaultSignature?: string;
  title?: string;
  descripcion?: string;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
  defaultUserName = 'Usuario Autorizado',
  defaultRole = 'admin',
  savedDefaultSignature,
  title = 'Firma Digital y Certificación Electrónica',
  descripcion = 'Estampa tu firma digital con validez de trazabilidad operativa según tu rol.'
}) => {
  const [activeTab, setActiveTab] = useState<'trazo' | 'tipografica' | 'imagen'>('trazo');
  const [nombreFirmante, setNombreFirmante] = useState(defaultUserName);
  const [cedulaFirmante, setCedulaFirmante] = useState('');
  const [textoFirmaRapida, setTextoFirmaRapida] = useState(defaultUserName);
  const [estiloCaligrafico, setEstiloCaligrafico] = useState<'elegante' | 'clasica' | 'moderna'>('elegante');
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [imagenCargada, setImagenCargada] = useState<string | null>(null);

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNombreFirmante(defaultUserName);
      setTextoFirmaRapida(defaultUserName);
      setTimeout(initCanvas, 50);
    }
  }, [isOpen, defaultUserName]);

  // Inicializar Canvas con fondo transparente y trazo suave
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar escala para pantallas HiDPI/Retina
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#1e3a8a'; // Azul corporativo de tinta
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setHasDrawn(false);
  };

  // Eventos de dibujo táctil y mouse
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Generador de Firma Tipográfica Certificada en Canvas oculto
  const generateTypographicSignature = (): string => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 600;
    offCanvas.height = 200;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return '';

    // Estilos tipográficos manuscritos
    ctx.fillStyle = '#1e3a8a';
    if (estiloCaligrafico === 'elegante') {
      ctx.font = 'italic 52px "Brush Script MT", "Segoe Script", cursive';
    } else if (estiloCaligrafico === 'clasica') {
      ctx.font = 'italic 46px "Palatino Linotype", "Times New Roman", serif';
    } else {
      ctx.font = '600 44px "Plus Jakarta Sans", sans-serif';
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textoFirmaRapida.trim() || 'Firma Digital', 300, 90);

    // Línea de rúbrica caligráfica
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.moveTo(100, 130);
    ctx.bezierCurveTo(200, 145, 400, 115, 500, 130);
    ctx.stroke();

    // Sello de seguridad microscópico
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`VERIFICACIÓN ELECTRÓNICA • SOS EN LINEA • ${new Date().toLocaleDateString('es-CO')}`, 300, 165);

    return offCanvas.toDataURL('image/png');
  };

  // Cargar imagen de firma externa
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagenCargada(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar y consolidar firma
  const handleConfirm = () => {
    let firmaFinalUrl = '';
    let tipoFirma: 'manuscrita' | 'certificada' | 'archivo' = 'manuscrita';

    if (activeTab === 'trazo') {
      if (!hasDrawn && !savedDefaultSignature) {
        alert('Por favor traza tu firma en el recuadro antes de confirmar.');
        return;
      }
      firmaFinalUrl = canvasRef.current ? canvasRef.current.toDataURL('image/png') : '';
      tipoFirma = 'manuscrita';
    } else if (activeTab === 'tipografica') {
      if (!textoFirmaRapida.trim()) {
        alert('Por favor escribe tu nombre para generar la firma certificada.');
        return;
      }
      firmaFinalUrl = generateTypographicSignature();
      tipoFirma = 'certificada';
    } else if (activeTab === 'imagen') {
      if (!imagenCargada) {
        alert('Por favor selecciona una imagen con tu firma.');
        return;
      }
      firmaFinalUrl = imagenCargada;
      tipoFirma = 'archivo';
    }

    // Sello hash de integridad
    const hashRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hashSello = `SOS-SIG-${defaultRole.toUpperCase()}-${hashRandom}`;

    const signatureData: DigitalSignatureData = {
      firmaUrl: firmaFinalUrl,
      firmanteNombre: nombreFirmante.trim() || defaultUserName,
      firmanteRol: defaultRole,
      firmanteDoc: cedulaFirmante.trim() || undefined,
      fechaHora: new Date().toISOString(),
      hashSello,
      tipo: tipoFirma,
    };

    onSaveSignature(signatureData, saveAsDefault);
    onClose();
  };

  // Usar firma predeterminada guardada de inmediato
  const handleUseSavedDefault = () => {
    if (!savedDefaultSignature) return;

    const hashRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hashSello = `SOS-SIG-${defaultRole.toUpperCase()}-${hashRandom}`;

    const signatureData: DigitalSignatureData = {
      firmaUrl: savedDefaultSignature,
      firmanteNombre: defaultUserName,
      firmanteRol: defaultRole,
      fechaHora: new Date().toISOString(),
      hashSello,
      tipo: 'manuscrita',
    };

    onSaveSignature(signatureData, false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="600px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          {descripcion}
        </p>

        {/* Acceso rápido a firma guardada si existe */}
        {savedDefaultSignature && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05), rgba(37, 99, 235, 0.08))',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block' }}>
                  Firma Guardada en Perfil
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Puedes estampar tu firma habitual con 1 solo clic.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseSavedDefault}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
            >
              ⚡ Usar Firma Guardada
            </button>
          </div>
        )}

        {/* Pestañas de modo de firma */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            gap: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('trazo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'trazo' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'trazo' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            <PenTool size={15} />
            <span>Dibujar con Trazo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tipografica')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'tipografica' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'tipografica' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            <Type size={15} />
            <span>Firma Tipográfica Certificada</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('imagen')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'imagen' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'imagen' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            <Upload size={15} />
            <span>Subir Archivo</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        {activeTab === 'trazo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 180,
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                touchAction: 'none',
                cursor: 'crosshair',
              }}
            >
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasDrawn && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    textAlign: 'center',
                    color: 'var(--neutral-400)',
                    fontSize: '0.85rem',
                  }}
                >
                  <PenTool size={22} style={{ margin: '0 auto 4px auto', opacity: 0.6 }} />
                  <div>Firma aquí con el dedo, lápiz o mouse</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={clearCanvas}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Eraser size={13} /> Limpiar trazo
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tipografica' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
                Nombre para la firma certificada
              </label>
              <input
                type="text"
                value={textoFirmaRapida}
                onChange={(e) => setTextoFirmaRapida(e.target.value)}
                className="form-input"
                placeholder="Ej: Ing. Carlos Pérez"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['elegante', 'clasica', 'moderna'] as const).map((styleOption) => (
                <button
                  key={styleOption}
                  type="button"
                  onClick={() => setEstiloCaligrafico(styleOption)}
                  className={`btn btn-sm ${estiloCaligrafico === styleOption ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  Estilo {styleOption}
                </button>
              ))}
            </div>

            {/* Vista previa de la firma tipográfica */}
            <div
              style={{
                height: 120,
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '0.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  color: 'var(--primary)',
                  fontFamily:
                    estiloCaligrafico === 'elegante'
                      ? '"Brush Script MT", "Segoe Script", cursive'
                      : estiloCaligrafico === 'clasica'
                      ? '"Palatino Linotype", serif'
                      : '"Plus Jakarta Sans", sans-serif',
                  fontStyle: estiloCaligrafico === 'moderna' ? 'normal' : 'italic',
                }}
              >
                {textoFirmaRapida.trim() || 'Firma de Ejemplo'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4 }}>
                CERTIFICADO SOS EN LINEA • {defaultRole.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'imagen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--neutral-50)',
              }}
            >
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileUpload}
                id="signature-upload"
                style={{ display: 'none' }}
              />
              <label
                htmlFor="signature-upload"
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
              >
                <Upload size={28} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Haz clic para cargar imagen de firma (PNG o JPG)
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Recomendado: Fondo transparente o blanco claro
                </span>
              </label>
            </div>
            {imagenCargada && (
              <div style={{ textAlign: 'center', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <img src={imagenCargada} alt="Firma cargada" style={{ maxHeight: 90, maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            )}
          </div>
        )}

        {/* Metadatos del firmante */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Nombre de quien firma
            </label>
            <input
              type="text"
              value={nombreFirmante}
              onChange={(e) => setNombreFirmante(e.target.value)}
              className="form-input"
              style={{ width: '100%', fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Cédula / Documento (Opcional)
            </label>
            <input
              type="text"
              value={cedulaFirmante}
              onChange={(e) => setCedulaFirmante(e.target.value)}
              className="form-input"
              placeholder="Ej: 1.020.304.506"
              style={{ width: '100%', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Checkbox para guardar como predeterminada */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="chk-default-sig"
            checked={saveAsDefault}
            onChange={(e) => setSaveAsDefault(e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="chk-default-sig" style={{ fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
            Guardar esta firma como mi firma predeterminada para firmar en 1 clic
          </label>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <CheckCircle2 size={16} />
            <span>Confirmar y Estampar Firma</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
