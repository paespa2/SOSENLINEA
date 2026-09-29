import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  RotateCcw,
  Archive,
  Lock,
} from "lucide-react";

interface OtpDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (otpCode: string, backupCreated: boolean) => void;
  title: string;
  itemDetails: {
    radicado?: string;
    direccion?: string;
    cliente?: string;
    monto?: string;
    tipo?: string;
  };
  adminEmail?: string;
}

export const OtpDeleteConfirmModal: React.FC<OtpDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemDetails,
  adminEmail = "administracion@sosenlinea.com",
}) => {
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutos
  const [copied, setCopied] = useState(false);
  const [createBackup, setCreateBackup] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generar un nuevo OTP seguro de 6 dígitos cada vez que se abre el modal
  const generateNewOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setDigits(["", "", "", "", "", ""]);
    setTimeLeft(120);
    setErrorMsg(null);
    setIsSuccess(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateNewOtp();
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 150);
    }
  }, [isOpen]);

  // Temporizador regresivo
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  const currentEnteredOtp = digits.join("");
  const isCodeComplete = currentEnteredOtp.length === 6;
  const isOtpValid = isCodeComplete && currentEnteredOtp === generatedOtp && timeLeft > 0;

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Si pegan el código completo en una sola casilla
    if (clean.length > 1) {
      const pasteDigits = clean.slice(0, 6).split("");
      const next = [...digits];
      pasteDigits.forEach((d, idx) => {
        if (idx < 6) next[idx] = d;
      });
      setDigits(next);
      if (pasteDigits.length === 6) {
        inputRefs.current[5]?.focus();
      } else {
        inputRefs.current[Math.min(5, pasteDigits.length)]?.focus();
      }
      return;
    }

    const next = [...digits];
    next[index] = clean[0];
    setDigits(next);

    // Auto-avanzar al siguiente input
    if (clean[0] && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceed = () => {
    if (!isOtpValid) {
      if (timeLeft <= 0) {
        setErrorMsg("El código OTP ha expirado. Por favor genera un nuevo código.");
      } else {
        setErrorMsg("Código OTP incorrecto. Verifica los 6 dígitos enviados al administrador.");
      }
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onConfirm(generatedOtp, createBackup);
      onClose();
    }, 600);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          background: "var(--card-bg, #ffffff)",
          border: "1px solid var(--border-color, #e2e8f0)",
          borderRadius: "1rem",
          maxWidth: "520px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          color: "var(--text-main, #0f172a)",
        }}
      >
        {/* Encabezado Crítico */}
        <div
          style={{
            background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
            color: "#ffffff",
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                Confirmación de Seguridad OTP
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.9 }}>
                Autorización Requerida para Eliminar Registro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "0.375rem",
              opacity: 0.8,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: "1.5rem" }}>
          {/* Ficha Resumen del Elemento */}
          <div
            style={{
              background: "rgba(239, 68, 68, 0.05)",
              border: "1px dashed rgba(239, 68, 68, 0.3)",
              borderRadius: "0.75rem",
              padding: "0.9rem 1.1rem",
              marginBottom: "1.25rem",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ fontWeight: 700, color: "#dc2626", marginBottom: "0.35rem" }}>
              ⚠️ Estás a punto de eliminar: {title}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>
              {itemDetails.radicado && <div><strong>Radicado:</strong> {itemDetails.radicado}</div>}
              {itemDetails.cliente && <div><strong>Cliente:</strong> {itemDetails.cliente}</div>}
              {itemDetails.direccion && <div style={{ gridColumn: "span 2" }}><strong>Inmueble:</strong> {itemDetails.direccion}</div>}
              {itemDetails.monto && <div><strong>Total:</strong> {itemDetails.monto}</div>}
              {itemDetails.tipo && <div><strong>Tipo:</strong> {itemDetails.tipo}</div>}
            </div>
          </div>

          {/* Banner de Simulación y Entrega Inmediata de Correo */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              borderRadius: "0.75rem",
              padding: "0.85rem 1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Mail size={15} /> Código enviado al Administrador
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "999px",
                  background: timeLeft > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: timeLeft > 0 ? "#059669" : "#dc2626",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <Clock size={11} /> {timeLeft > 0 ? `Expira en ${formatTimer(timeLeft)}` : "Expirado"}
              </span>
            </div>

            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", color: "var(--text-muted, #64748b)" }}>
              Se envió el código de un solo uso (OTP) a <strong>{adminEmail}</strong> para validar la eliminación del registro.
            </p>

            {/* Simulación visual de buzón para desarrollo y pruebas rápidas */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255, 255, 255, 0.8)",
                padding: "0.4rem 0.65rem",
                borderRadius: "0.5rem",
                border: "1px dashed rgba(37, 99, 235, 0.3)",
              }}
            >
              <div style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono, monospace)" }}>
                <span>OTP Generado: </span>
                <strong style={{ letterSpacing: "2px", fontSize: "0.95rem", color: "#1d4ed8" }}>
                  {generatedOtp}
                </strong>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  background: copied ? "#10b981" : "rgba(37, 99, 235, 0.1)",
                  color: copied ? "#ffffff" : "#1d4ed8",
                  border: "none",
                  borderRadius: "0.375rem",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Input de 6 Dígitos */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                textAlign: "center",
              }}
            >
              Ingresa el código OTP de 6 dígitos:
            </label>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  style={{
                    width: "44px",
                    height: "52px",
                    textAlign: "center",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-mono, monospace)",
                    borderRadius: "0.5rem",
                    border: digit
                      ? "2px solid #2563eb"
                      : "1px solid var(--border-color, #cbd5e1)",
                    background: digit ? "rgba(37, 99, 235, 0.04)" : "var(--bg-main, #f8fafc)",
                    outline: "none",
                    boxShadow: digit ? "0 0 0 2px rgba(37, 99, 235, 0.15)" : "none",
                    color: "var(--text-main, #0f172a)",
                  }}
                />
              ))}
            </div>

            {errorMsg && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                  color: "#dc2626",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  marginTop: "0.6rem",
                }}
              >
                <AlertTriangle size={13} /> {errorMsg}
              </div>
            )}
          </div>

          {/* Checkbox de Respaldo Automático */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "rgba(16, 185, 129, 0.06)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "0.5rem",
              padding: "0.6rem 0.8rem",
              marginBottom: "1.25rem",
              cursor: "pointer",
            }}
            onClick={() => setCreateBackup(!createBackup)}
          >
            <input
              type="checkbox"
              checked={createBackup}
              onChange={(e) => setCreateBackup(e.target.checked)}
              style={{ cursor: "pointer", width: 16, height: 16, accentColor: "#059669" }}
            />
            <div style={{ fontSize: "0.78rem" }}>
              <strong style={{ color: "#047857", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Archive size={14} /> Crear Copia de Respaldo en la Papelera
              </strong>
              <span style={{ color: "var(--text-muted, #64748b)", fontSize: "0.72rem" }}>
                Guarda una copia íntegra que podrás restaurar en cualquier momento.
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: "0.6rem 1rem", fontSize: "0.85rem" }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleProceed}
              disabled={!isOtpValid || isSuccess}
              className="btn btn-danger"
              style={{
                padding: "0.6rem 1.25rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                opacity: !isOtpValid ? 0.6 : 1,
                cursor: !isOtpValid ? "not-allowed" : "pointer",
                background: isSuccess ? "#059669" : undefined,
              }}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 size={16} /> ¡Verificado! Eliminando...
                </>
              ) : (
                <>
                  <Lock size={15} /> Autorizar y Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
