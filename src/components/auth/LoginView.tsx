import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LogIn,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  KeyRound,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock as LockIcon,
  UserPlus,
  Phone,
  Building2,
  Check,
  Globe,
  UserCheck
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export const LoginView: React.FC = () => {
  const { login, loginError, isLoading, registerUser, forgotPassword, verifyOtp, resetPassword } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Modo principal de pantalla
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login State
  const [username, setUsername] = useState(() => localStorage.getItem("sos_remember_user") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  // Register State (Perfiles de Clientes & Verificación de Información)
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regConfirmEmail, setRegConfirmEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regProfileType, setRegProfileType] = useState<"inmobiliaria" | "empresa" | "propietario" | "arrendatario" | "tecnico">("inmobiliaria");
  const [regIsCompany, setRegIsCompany] = useState(true);
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regCompanyNit, setRegCompanyNit] = useState("");
  const [regPropertyAddress, setRegPropertyAddress] = useState("");
  const [regPropertyType, setRegPropertyType] = useState("Apartamento");
  const [regSpecialty, setRegSpecialty] = useState("Plomería y Redes Hidrosanitarias");
  const [regHasArl, setRegHasArl] = useState(true);
  const [regConfirmCheck, setRegConfirmCheck] = useState(true);
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regTerms, setRegTerms] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Recovery / OTP Flow State
  const [recoveryMode, setRecoveryMode] = useState<"login" | "otp-request" | "otp-verify" | "otp-reset" | "otp-success">("login");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [devOtpNotification, setDevOtpNotification] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");

  // ── Manejador de Login ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!username.trim() || !password) {
      setLocalError("Por favor ingresa usuario o correo corporativo y contraseña.");
      return;
    }
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      if (rememberMe) {
        localStorage.setItem("sos_remember_user", username.trim());
      } else {
        localStorage.removeItem("sos_remember_user");
      }
    } catch {
      // Error manejado en AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  // ── Manejador de Registro de Cliente y Verificación de Información ─────────────
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim() || !regEmail.trim() || !regConfirmEmail.trim() || !regPhone.trim() || !regPassword) {
      setRegError("Todos los campos con asterisco (*) son obligatorios.");
      return;
    }

    if (regEmail.trim().toLowerCase() !== regConfirmEmail.trim().toLowerCase()) {
      setRegError("Los correos electrónicos no coinciden. Por favor confirma tu correo.");
      return;
    }

    if ((regProfileType === "inmobiliaria" || regProfileType === "empresa" || regIsCompany) && !regCompanyName.trim()) {
      setRegError("Por favor ingresa la razón social o nombre de la inmobiliaria o empresa.");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Las contraseñas no coinciden. Por favor verifica.");
      return;
    }

    if (!regTerms) {
      setRegError("Debes aceptar los términos y condiciones de tratamiento de datos.");
      return;
    }

    setRegSubmitting(true);
    try {
      await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        company: regCompanyName.trim() || (regIsCompany ? "Entidad Corporativa" : undefined),
        profileType: regProfileType,
        isCompany: regIsCompany,
        companyNit: regCompanyNit.trim(),
        propertyAddress: regPropertyAddress.trim(),
        specialty: regSpecialty,
        hasArl: regHasArl,
        password: regPassword,
      });
      setRegSuccess(true);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Error al procesar el registro");
    } finally {
      setRegSubmitting(false);
    }
  };

  // ── Paso 1: Solicitar OTP ────────────────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    if (!recoveryInput.trim()) {
      setRecoveryError("Ingresa tu nombre de usuario o correo electrónico.");
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await forgotPassword(recoveryInput.trim());
      setMaskedEmail(res.maskedEmail || recoveryInput.trim());
      if (res.devOtp) {
        setDevOtpNotification(res.devOtp);
      }
      setRecoveryMode("otp-verify");
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : "Error al solicitar código OTP");
    } finally {
      setRecoveryLoading(false);
    }
  };

  // ── Paso 2: Verificar OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    if (otpCode.trim().length !== 6) {
      setRecoveryError("El código OTP debe tener exactamente 6 dígitos.");
      return;
    }

    setRecoveryLoading(true);
    try {
      await verifyOtp(recoveryInput.trim(), otpCode.trim());
      setRecoveryMode("otp-reset");
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : "Código OTP incorrecto");
    } finally {
      setRecoveryLoading(false);
    }
  };

  // ── Paso 3: Restablecer Contraseña ──────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");

    if (newPassword.length < 6) {
      setRecoveryError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError("Las contraseñas no coinciden. Verifica e intenta de nuevo.");
      return;
    }

    setRecoveryLoading(true);
    try {
      await resetPassword(recoveryInput.trim(), otpCode.trim(), newPassword);
      setRecoveryMode("otp-success");
      setUsername(recoveryInput.trim());
      setPassword(newPassword);
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const displayError = localError || loginError;

  return (
    <div className="login-container">
      {/* Fondo decorativo con gradiente */}
      <div className="login-bg" />

      <div
        className="login-card"
        style={{
          maxWidth: recoveryMode === "login" && activeTab === "register" ? "540px" : "460px",
          width: "100%",
          transition: "all 0.3s ease",
        }}
      >
        {/* Header con Logo */}
        <div className="login-header" style={{ marginBottom: "1.25rem" }}>
          <div className="login-logo">
            <Shield size={32} />
          </div>
          <h1 className="login-title" style={{ letterSpacing: "-0.01em" }}>
            SOSENLINEA
          </h1>
          <p className="login-subtitle">
            {recoveryMode === "login"
              ? "Plataforma Integral de Mantenimiento y Operaciones"
              : "Centro de Recuperación de Seguridad OTP"}
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* PESTAÑAS LOGIN / REGISTRO (Solo cuando no estamos en flujo OTP)    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {recoveryMode === "login" && (
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.06)",
              borderRadius: "10px",
              padding: "4px",
              marginBottom: "1.25rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setRegSuccess(false);
              }}
              style={{
                flex: 1,
                padding: "0.55rem",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "login" ? "var(--primary)" : "transparent",
                color: activeTab === "login" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45rem",
                transition: "all 0.2s ease",
              }}
            >
              <LogIn size={15} /> Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setLocalError("");
              }}
              style={{
                flex: 1,
                padding: "0.55rem",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "register" ? "var(--primary)" : "transparent",
                color: activeTab === "register" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45rem",
                transition: "all 0.2s ease",
              }}
            >
              <UserPlus size={15} /> Registrarse
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* VISTA 1: FORMULARIO PRINCIPAL DE LOGIN                              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {recoveryMode === "login" && activeTab === "login" && (
          <>
            {/* Mensaje de Error */}
            {displayError && (
              <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <AlertCircle size={16} />
                <span>{displayError}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-username">
                  Usuario o Correo Corporativo
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-username"
                    type="text"
                    className="form-control"
                    placeholder="ej. usuario@sosenlinea.com o nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    autoFocus
                    disabled={submitting || isLoading}
                    style={{ paddingLeft: "2.3rem" }}
                  />
                  <Mail
                    size={16}
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255, 255, 255, 0.4)",
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMode("otp-request");
                      setRecoveryInput(username || "admin");
                      setRecoveryError("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ¿Olvidaste tu clave?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Tu clave de acceso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={submitting || isLoading}
                    style={{ paddingLeft: "2.3rem", paddingRight: "2.5rem" }}
                  />
                  <KeyRound
                    size={16}
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255, 255, 255, 0.4)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(255, 255, 255, 0.5)",
                      padding: 0,
                    }}
                    title={showPassword ? "Ocultar" : "Mostrar"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Recordar usuario y SSL badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.25rem 0 0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.7)", cursor: "pointer", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: "var(--primary)", cursor: "pointer" }}
                  />
                  Recordar usuario en este equipo
                </label>
                <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.4)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <LockIcon size={12} /> SSL 256-bit
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem", fontSize: "0.92rem", fontWeight: 700 }}
                disabled={submitting || isLoading}
              >
                {submitting ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Iniciando sesión…
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Ingresar a la Plataforma
                  </>
                )}
              </button>
            </form>

            {/* Garantía de Seguridad Corporativa Profesional (Sin botones demo) */}
            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Shield size={16} color="var(--accent)" />
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#ffffff" }}>
                    Entorno Autorizado SOSENLINEA
                  </span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.55)", margin: 0, lineHeight: 1.45 }}>
                  Acceso exclusivo para colaboradores y personal autorizado de SOSENLINEA. Sesión protegida mediante cifrado SSL 256-bit y registro de auditoría.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* VISTA 2: FORMULARIO DE REGISTRO PROFESIONAL                         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {recoveryMode === "login" && activeTab === "register" && (
          <div>
            {regSuccess ? (
              <div style={{ textAlign: "center", padding: "1.25rem 0.25rem" }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    boxShadow: "0 0 16px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <CheckCircle2 size={34} />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.35rem" }}>
                  ¡Perfil Registrado y Verificado!
                </h3>
                <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.65)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                  Tu cuenta de cliente para <strong>{regName}</strong> ha sido creada exitosamente en SOSENLINEA.
                </p>

                {/* Resumen de Información Verificada */}
                <div
                  style={{
                    textAlign: "left",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 10,
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    fontSize: "0.825rem",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#ffffff", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <UserCheck size={16} color="var(--primary)" />
                    Resumen de Verificación del Usuario
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", color: "rgba(255, 255, 255, 0.85)" }}>
                    <div>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)", display: "block", fontSize: "0.75rem" }}>Perfil Asignado:</span>
                      <strong style={{ color: "#38bdf8" }}>
                        {regProfileType === "inmobiliaria" && "🏢 Inmobiliaria"}
                        {regProfileType === "empresa" && "🏬 Empresa / Sede Corporativa"}
                        {regProfileType === "propietario" && "🏠 Propietario de Inmueble"}
                        {regProfileType === "arrendatario" && "🔑 Arrendatario / Inquilino"}
                        {regProfileType === "tecnico" && "🛠️ Técnico / Maestro de Obra"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)", display: "block", fontSize: "0.75rem" }}>Correo Confirmado:</span>
                      <span style={{ wordBreak: "break-all", fontWeight: 600 }}>{regEmail}</span>
                    </div>
                    <div>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)", display: "block", fontSize: "0.75rem" }}>Teléfono / WhatsApp:</span>
                      <span>{regPhone}</span>
                    </div>
                    <div>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)", display: "block", fontSize: "0.75rem" }}>Verificación Técnica / Legal:</span>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>✓ Datos validados</span>
                    </div>
                  </div>

                  {(regProfileType === "inmobiliaria" || regProfileType === "empresa") && regCompanyName && (
                    <div style={{ marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px dashed rgba(255, 255, 255, 0.12)" }}>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.75rem" }}>Razón Social / NIT: </span>
                      <strong style={{ color: "#ffffff" }}>{regCompanyName}</strong> {regCompanyNit ? `(NIT: ${regCompanyNit})` : ""}
                    </div>
                  )}

                  {(regProfileType === "propietario" || regProfileType === "arrendatario") && regPropertyAddress && (
                    <div style={{ marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px dashed rgba(255, 255, 255, 0.12)" }}>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.75rem" }}>Inmueble Asociado: </span>
                      <strong style={{ color: "#ffffff" }}>{regPropertyAddress}</strong> ({regPropertyType})
                    </div>
                  )}

                  {regProfileType === "tecnico" && (
                    <div style={{ marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px dashed rgba(255, 255, 255, 0.12)" }}>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.75rem" }}>Especialidad Operativa: </span>
                      <strong style={{ color: "#ffffff" }}>{regSpecialty}</strong> {regHasArl ? "• ARL Activa" : ""}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUsername(regEmail || regName);
                    setPassword(regPassword);
                    setActiveTab("login");
                    setRegSuccess(false);
                  }}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.75rem", fontWeight: 700, display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                >
                  <LogIn size={16} />
                  Ir a Iniciar Sesión Ahora
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="login-form">
                {regError && (
                  <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.8rem" }}>
                    <AlertCircle size={16} />
                    <span>{regError}</span>
                  </div>
                )}

                {/* Fila 1: Nombre y Teléfono */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                    <label className="form-label" htmlFor="reg-name" style={{ fontSize: "0.78rem" }}>
                      Nombre Completo *
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      className="form-control"
                      placeholder="Ej. Juan Pérez"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                    <label className="form-label" htmlFor="reg-phone" style={{ fontSize: "0.78rem" }}>
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      className="form-control"
                      placeholder="300 123 4567"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Fila 2: Correo y Confirmación de Correo */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                    <label className="form-label" htmlFor="reg-email" style={{ fontSize: "0.78rem" }}>
                      Correo Electrónico *
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      className="form-control"
                      placeholder="nombre@correo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="form-label" htmlFor="reg-confirm-email" style={{ fontSize: "0.78rem" }}>
                        Confirmar Correo *
                      </label>
                      {regConfirmEmail && regEmail && (
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: regEmail.trim().toLowerCase() === regConfirmEmail.trim().toLowerCase() ? "#34d399" : "#f87171"
                        }}>
                          {regEmail.trim().toLowerCase() === regConfirmEmail.trim().toLowerCase() ? "✓ Coincide" : "✗ No coincide"}
                        </span>
                      )}
                    </div>
                    <input
                      id="reg-confirm-email"
                      type="email"
                      className="form-control"
                      placeholder="Repite tu correo"
                      value={regConfirmEmail}
                      onChange={(e) => setRegConfirmEmail(e.target.value)}
                      required
                      style={{
                        borderColor: regConfirmEmail && regEmail
                          ? regEmail.trim().toLowerCase() === regConfirmEmail.trim().toLowerCase() ? "#10b981" : "#ef4444"
                          : undefined
                      }}
                    />
                  </div>
                </div>

                {/* Fila 3: Selección de Perfil de Usuario para Clientes */}
                <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                  <label className="form-label" htmlFor="reg-profile-type" style={{ fontSize: "0.78rem" }}>
                    Perfil de Usuario (Rol de Cliente) *
                  </label>
                  <select
                    id="reg-profile-type"
                    className="form-control"
                    value={regProfileType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setRegProfileType(val);
                      if (val === "inmobiliaria" || val === "empresa") {
                        setRegIsCompany(true);
                      } else {
                        setRegIsCompany(false);
                      }
                    }}
                    style={{ height: "38px" }}
                  >
                    <option value="inmobiliaria">🏢 Inmobiliaria / Administrador de Inmuebles</option>
                    <option value="empresa">🏬 Empresa / Sede Corporativa</option>
                    <option value="arrendatario">🔑 Arrendatario / Inquilino</option>
                    <option value="propietario">🏠 Propietario de Inmueble</option>
                    <option value="tecnico">🛠️ Técnico / Maestro de Obra / Contratista</option>
                  </select>
                </div>

                {/* 📋 CHECKLIST DINÁMICO DE VERIFICACIÓN DE INFORMACIÓN SEGÚN EL PERFIL */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 8,
                    padding: "0.75rem",
                    margin: "0.5rem 0 0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--primary)" }}>
                      📋 Checklist de Verificación de Información
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.5)" }}>
                      Campos según perfil
                    </span>
                  </div>

                  {/* Caso 1: Inmobiliaria o Empresa */}
                  {(regProfileType === "inmobiliaria" || regProfileType === "empresa") && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.75rem" }}>
                        <input
                          type="checkbox"
                          id="login-reg-is-company"
                          checked={regIsCompany}
                          onChange={(e) => setRegIsCompany(e.target.checked)}
                          style={{ accentColor: "var(--primary)" }}
                        />
                        <label htmlFor="login-reg-is-company" style={{ cursor: "pointer", color: "rgba(255, 255, 255, 0.85)" }}>
                          Es empresa o persona jurídica constituida
                        </label>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.72rem" }}>
                            Razón Social o Inmobiliaria *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ej. Inmobiliaria Medellín"
                            value={regCompanyName}
                            onChange={(e) => setRegCompanyName(e.target.value)}
                            required
                            style={{ padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.72rem" }}>
                            NIT o RUT (Con DV)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ej. 900.123.456-7"
                            value={regCompanyNit}
                            onChange={(e) => setRegCompanyNit(e.target.value)}
                            style={{ padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Caso 2: Arrendatario o Propietario */}
                  {(regProfileType === "arrendatario" || regProfileType === "propietario") && (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.72rem" }}>
                            Dirección o Conjunto del Inmueble *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ej. Cl 10 # 40-20 Apto 402"
                            value={regPropertyAddress}
                            onChange={(e) => setRegPropertyAddress(e.target.value)}
                            required
                            style={{ padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.72rem" }}>
                            Tipo de Inmueble
                          </label>
                          <select
                            className="form-control"
                            value={regPropertyType}
                            onChange={(e) => setRegPropertyType(e.target.value)}
                            style={{ padding: "0.4rem 0.6rem", fontSize: "0.78rem", height: "34px" }}
                          >
                            <option value="Apartamento">Apartamento</option>
                            <option value="Casa Residencial">Casa Residencial</option>
                            <option value="Local Comercial">Local Comercial</option>
                            <option value="Bodega / Oficina">Bodega / Oficina</option>
                          </select>
                        </div>
                      </div>

                      <label style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", fontSize: "0.73rem", color: "rgba(255, 255, 255, 0.75)", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={regConfirmCheck}
                          onChange={(e) => setRegConfirmCheck(e.target.checked)}
                          style={{ marginTop: "2px", accentColor: "var(--primary)" }}
                        />
                        <span>
                          {regProfileType === "arrendatario"
                            ? "Confirmo que soy arrendatario actual y cuento con autorización para solicitud de reparaciones."
                            : "Confirmo que soy el propietario legal o administrador directo del inmueble registrado."}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Caso 3: Técnico / Maestro de Obra */}
                  {regProfileType === "tecnico" && (
                    <div>
                      <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                        <label className="form-label" style={{ fontSize: "0.72rem" }}>
                          Especialidad Técnica Principal *
                        </label>
                        <select
                          className="form-control"
                          value={regSpecialty}
                          onChange={(e) => setRegSpecialty(e.target.value)}
                          style={{ padding: "0.4rem 0.6rem", fontSize: "0.78rem", height: "34px" }}
                        >
                          <option value="Plomería y Redes Hidrosanitarias">Plomería y Redes Hidrosanitarias</option>
                          <option value="Electricidad e Iluminación">Electricidad e Iluminación</option>
                          <option value="Pintura y Acabados Arquitectónicos">Pintura y Acabados Arquitectónicos</option>
                          <option value="Obra Blanca / Drywall / Estuco">Obra Blanca / Drywall / Estuco</option>
                          <option value="Cerrajería y Seguridad">Cerrajería y Seguridad</option>
                          <option value="Cubiertas, Techos e Impermeabilización">Cubiertas, Techos e Impermeabilización</option>
                          <option value="Mantenimiento Locativo General">Mantenimiento Locativo General</option>
                        </select>
                      </div>

                      <label style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", fontSize: "0.73rem", color: "rgba(255, 255, 255, 0.75)", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={regHasArl}
                          onChange={(e) => setRegHasArl(e.target.checked)}
                          style={{ marginTop: "2px", accentColor: "var(--primary)" }}
                        />
                        <span>
                          Cuento con afiliación y pago de seguridad social vigente (ARL y EPS) para ingreso a predios.
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Fila 4: Contraseñas */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                    <label className="form-label" htmlFor="reg-password" style={{ fontSize: "0.78rem" }}>
                      Contraseña *
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      className="form-control"
                      placeholder="Mínimo 6 carácteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                    <label className="form-label" htmlFor="reg-confirm" style={{ fontSize: "0.78rem" }}>
                      Confirmar Contraseña *
                    </label>
                    <input
                      id="reg-confirm"
                      type="password"
                      className="form-control"
                      placeholder="Repite la clave"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Términos y Tratamiento de Datos */}
                <div style={{ margin: "0.25rem 0 0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.65)", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={regTerms}
                      onChange={(e) => setRegTerms(e.target.checked)}
                      style={{ marginTop: "2px", accentColor: "var(--primary)" }}
                    />
                    <span>
                      Acepto el tratamiento de datos personales y términos de servicio del sistema SOSENLINEA.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.7rem", fontWeight: 700 }}
                  disabled={regSubmitting}
                >
                  {regSubmitting ? (
                    <>
                      <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Registrando Cuenta…
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Crear Cuenta y Solicitar Acceso
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* VISTA 3: PASO 1 - SOLICITAR CÓDIGO OTP                             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {recoveryMode === "otp-request" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <button
                type="button"
                onClick={() => setRecoveryMode("login")}
                className="btn btn-secondary btn-xs"
                style={{ padding: "0.3rem 0.5rem" }}
              >
                <ArrowLeft size={14} /> Volver
              </button>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                Recuperación con Código OTP
              </h2>
            </div>

            <p style={{ fontSize: "0.825rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "1.25rem", lineHeight: 1.45 }}>
              Ingresa tu nombre de usuario o correo corporativo registrado. Te enviaremos un código de seguridad OTP de 6 dígitos válido por 10 minutos.
            </p>

            {recoveryError && (
              <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <AlertCircle size={16} />
                <span>{recoveryError}</span>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="recovery-input">Usuario o Correo Registrado</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="recovery-input"
                    type="text"
                    className="form-control"
                    placeholder="ej. admin o admin@sosenlinea.com"
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    autoFocus
                    disabled={recoveryLoading}
                    style={{ paddingLeft: "2.25rem" }}
                  />
                  <Mail
                    size={16}
                    style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.4)" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.5rem", padding: "0.65rem" }}
                disabled={recoveryLoading}
              >
                {recoveryLoading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Generando Código OTP…
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Enviar Código OTP al Correo
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* VISTA 4: PASO 2 - VERIFICAR CÓDIGO OTP                             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {recoveryMode === "otp-verify" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <button
                type="button"
                onClick={() => setRecoveryMode("otp-request")}
                className="btn btn-secondary btn-xs"
                style={{ padding: "0.3rem 0.5rem" }}
              >
                <ArrowLeft size={14} /> Corregir Correo
              </button>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                Verificar Código OTP
              </h2>
            </div>

            <p style={{ fontSize: "0.825rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "0.75rem" }}>
              Hemos enviado un código de 6 dígitos a: <strong style={{ color: "#ffffff" }}>{maskedEmail}</strong>
            </p>

            {/* Banner de Ayuda / Simulación OTP */}
            {devOtpNotification && (
              <div
                style={{
                  background: "rgba(59, 130, 246, 0.12)",
                  border: "1px dashed var(--accent)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "var(--accent)" }}>
                  <div><strong>Código de Verificación OTP:</strong></div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 900, fontFamily: "var(--font-mono)", letterSpacing: "3px" }}>
                    {devOtpNotification}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(devOtpNotification)}
                  className="btn btn-primary btn-xs"
                >
                  Copiar Código
                </button>
              </div>
            )}

            {recoveryError && (
              <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <AlertCircle size={16} />
                <span>{recoveryError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="otp-input">Código de Seguridad (6 Dígitos)</label>
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  className="form-control"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  disabled={recoveryLoading}
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    letterSpacing: "6px",
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Clock size={13} /> Válido por 10 minutos
                </span>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer", padding: 0 }}
                >
                  Reenviar código
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.75rem", padding: "0.65rem" }}
                disabled={recoveryLoading || otpCode.length !== 6}
              >
                {recoveryLoading ? "Validando…" : "Validar Código OTP"}
              </button>
            </form>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* VISTA 5: PASO 3 - ESTABLECER NUEVA CONTRASEÑA                       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {recoveryMode === "otp-reset" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem", color: "#ffffff" }}>
                <KeyRound size={18} color="var(--accent)" />
                Establecer Nueva Contraseña
              </h2>
            </div>

            <p style={{ fontSize: "0.825rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "1.25rem" }}>
              Código OTP verificado con éxito. Ingresa tu nueva clave de acceso para <strong style={{ color: "#ffffff" }}>{recoveryInput}</strong>.
            </p>

            {recoveryError && (
              <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <AlertCircle size={16} />
                <span>{recoveryError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">Nueva Contraseña</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                    disabled={recoveryLoading}
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(255, 255, 255, 0.4)",
                      padding: 0,
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirmar Nueva Contraseña</label>
                <input
                  id="confirm-password"
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={recoveryLoading}
                />
              </div>

              {/* Indicador de seguridad */}
              <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.5)", marginBottom: "0.5rem" }}>
                {newPassword.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: newPassword.length >= 8 ? "#10b981" : newPassword.length >= 6 ? "#f59e0b" : "#ef4444" }} />
                    <span style={{ fontWeight: 700, color: newPassword.length >= 8 ? "#10b981" : newPassword.length >= 6 ? "#f59e0b" : "#ef4444" }}>
                      {newPassword.length >= 8 ? "Segura" : newPassword.length >= 6 ? "Aceptable" : "Muy Corta"}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.5rem", padding: "0.65rem" }}
                disabled={recoveryLoading || !newPassword || !confirmPassword}
              >
                {recoveryLoading ? "Actualizando contraseña…" : "Guardar Nueva Contraseña"}
              </button>
            </form>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* VISTA 6: PASO 4 - ÉXITO CONFIRMADO                                  */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {recoveryMode === "otp-success" && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto",
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.5rem" }}>
              ¡Contraseña Actualizada!
            </h2>
            <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.65)", marginBottom: "1.5rem" }}>
              Tu clave ha sido restablecida exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
            </p>

            <button
              type="button"
              onClick={() => {
                setRecoveryMode("login");
                setActiveTab("login");
              }}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.65rem" }}
            >
              <LogIn size={16} />
              Ir a Iniciar Sesión Ahora
            </button>
          </div>
        )}

        {/* Selector de Idioma en Pie del Login */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <Globe size={14} color="rgba(255, 255, 255, 0.45)" />
          <button
            type="button"
            onClick={() => setLanguage("es")}
            style={{
              background: language === "es" ? "var(--primary)" : "transparent",
              color: language === "es" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "4px",
              padding: "0.2rem 0.55rem",
              fontSize: "0.72rem",
              cursor: "pointer",
              fontWeight: language === "es" ? 800 : 500,
            }}
          >
            🇪🇸 Español
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            style={{
              background: language === "en" ? "var(--primary)" : "transparent",
              color: language === "en" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "4px",
              padding: "0.2rem 0.55rem",
              fontSize: "0.72rem",
              cursor: "pointer",
              fontWeight: language === "en" ? 800 : 500,
            }}
          >
            🇺🇸 English
          </button>
        </div>

        {/* Footer */}
        <p className="login-footer" style={{ marginTop: "1rem" }}>
          SOSENLINEA Cloud • Conexión Cifrada SSL 256-bit
        </p>
      </div>
    </div>
  );
};
