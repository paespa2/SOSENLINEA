import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Wrench,
  Shield,
  Clock,
  CheckCircle2,
  Camera,
  UserCheck,
  Building2,
  Briefcase,
  Home,
  BedDouble,
  Droplets,
  Zap,
  Paintbrush,
  Hammer,
  FileText,
  Phone,
  MessageCircle,
  ArrowRight,
  LogIn,
  UserPlus,
  X,
  Menu,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Mail,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Award,
  Send,
  ArrowUp,
  Lock as LockIcon,
  Globe
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "./HomePage.css";

interface HomePageProps {
  onEnterApp?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onEnterApp }) => {
  const { language, setLanguage, t } = useLanguage();
  const {
    login,
    loginError,
    isLoading,
    registerUser,
    forgotPassword,
    verifyOtp,
    resetPassword
  } = useAuth();

  // Estados de navegación y modal
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register" | "otp-request" | "otp-verify" | "otp-reset" | "otp-success">("login");
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Escuchar scroll para Scrollspy y botón Volver Arriba
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      const sections = ["hero", "soluciones", "servicios", "como-funciona", "cobertura"];
      const header = document.querySelector(".home-header") as HTMLElement;
      const headerHeight = header ? header.offsetHeight : 76;
      const scrollPosition = window.scrollY + headerHeight + 50;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionId);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bloqueo de scroll cuando el modal o drawer están abiertos, y control de tecla ESC
  useEffect(() => {
    if (authModalOpen || mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAuthModalOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [authModalOpen, mobileMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Estado del Login
  const [username, setUsername] = useState(() => localStorage.getItem("sos_remember_user") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localLoginError, setLocalLoginError] = useState("");

  // Estado de Registro Profesional (Validación y Perfiles de Clientes)
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

  // Estado de Recuperación OTP
  const [recoveryInput, setRecoveryInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [devOtpNotification, setDevOtpNotification] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");

  // Manejador de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoginError("");
    if (!username.trim() || !password) {
      setLocalLoginError("Por favor ingresa tu usuario o correo y contraseña.");
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
      setAuthModalOpen(false);
      if (onEnterApp) onEnterApp();
    } catch {
      // El error lo maneja AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  // Manejador de Registro de Usuario y Verificación de Información
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim() || !regEmail.trim() || !regConfirmEmail.trim() || !regPhone.trim() || !regPassword) {
      setRegError("Todos los campos con asterisco (*) son obligatorios.");
      return;
    }

    if (regEmail.trim().toLowerCase() !== regConfirmEmail.trim().toLowerCase()) {
      setRegError("Los correos electrónicos ingresados no coinciden. Por favor confirma tu correo.");
      return;
    }

    if ((regProfileType === "inmobiliaria" || regProfileType === "empresa" || regIsCompany) && !regCompanyName.trim()) {
      setRegError("Por favor ingresa el nombre de la empresa o inmobiliaria.");
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
      setRegError("Debes aceptar el tratamiento de datos y los términos de servicio.");
      return;
    }

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
      setRegError(err instanceof Error ? err.message : "Error al registrar usuario");
    }
  };

  // Paso 1: Solicitar OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    if (!recoveryInput.trim()) {
      setRecoveryError("Ingresa tu usuario o correo electrónico.");
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await forgotPassword(recoveryInput.trim());
      setMaskedEmail(res.maskedEmail || recoveryInput.trim());
      if (res.devOtp) setDevOtpNotification(res.devOtp);
      setAuthTab("otp-verify");
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : "Error al solicitar código OTP");
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Paso 2: Verificar OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    if (otpCode.trim().length !== 6) {
      setRecoveryError("El código OTP debe ser de 6 dígitos.");
      return;
    }

    setRecoveryLoading(true);
    try {
      await verifyOtp(recoveryInput.trim(), otpCode.trim());
      setAuthTab("otp-reset");
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : "Código OTP no válido");
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Paso 3: Restablecer Contraseña
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    if (newPassword.length < 6) {
      setRecoveryError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setRecoveryError("Las contraseñas no coinciden.");
      return;
    }

    setRecoveryLoading(true);
    try {
      await resetPassword(recoveryInput.trim(), otpCode.trim(), newPassword);
      setAuthTab("otp-success");
      setUsername(recoveryInput.trim());
      setPassword(newPassword);
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const openAuthWithTab = (tab: "login" | "register") => {
    setAuthTab(tab);
    setLocalLoginError("");
    setRegError("");
    setRegSuccess(false);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const header = document.querySelector(".home-header") as HTMLElement;
      const headerHeight = header ? header.offsetHeight : 76;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - (headerHeight + 16);

      window.scrollTo({
        top: offsetPosition > 0 ? offsetPosition : 0,
        behavior: "smooth"
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="home-page">
      {/* ─────────────────────────────────────────────────────────────────
          PANEL SUPERIOR / HEADER STICKY (Inspirado en Soluman.co)
      ───────────────────────────────────────────────────────────────── */}
      <header className="home-header">
        <div className="home-header-container">
          {/* Logo / Marca */}
          <div className="home-brand" onClick={() => scrollToSection("hero")}>
            <div className="home-brand-logo">
              <Wrench size={22} />
            </div>
            <div className="home-brand-text">
              <div className="home-brand-title">
                SOS<span>ENLINEA</span>
              </div>
              <div className="home-brand-subtitle">
                {t("brandSubtitle", "Mantenimiento & Servicios · Medellín")}
              </div>
            </div>
          </div>

          {/* Navegación Desktop */}
          <nav>
            <ul className="home-nav-links">
              <li>
                <a
                  href="#hero"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("hero");
                  }}
                  className={`home-nav-link ${activeSection === "hero" ? "active" : ""}`}
                >
                  {t("navHome", "Inicio")}
                </a>
              </li>
              <li>
                <a
                  href="#soluciones"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("soluciones");
                  }}
                  className={`home-nav-link ${activeSection === "soluciones" ? "active" : ""}`}
                >
                  {t("navSolutions", "Soluciones")}
                </a>
              </li>
              <li>
                <a
                  href="#servicios"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("servicios");
                  }}
                  className={`home-nav-link ${activeSection === "servicios" ? "active" : ""}`}
                >
                  {t("navServices", "Servicios")}
                </a>
              </li>
              <li>
                <a
                  href="#como-funciona"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("como-funciona");
                  }}
                  className={`home-nav-link ${activeSection === "como-funciona" ? "active" : ""}`}
                >
                  {t("navHowItWorks", "Cómo funciona")}
                </a>
              </li>
              <li>
                <a
                  href="#cobertura"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("cobertura");
                  }}
                  className={`home-nav-link ${activeSection === "cobertura" ? "active" : ""}`}
                >
                  {t("navCoverage", "Cobertura")}
                </a>
              </li>
            </ul>
          </nav>

          {/* Panel de Acciones Superior: Selector Idioma, Login & Registro */}
          <div className="home-header-actions">
            {/* Selector Rápido de Idioma en Cabecera */}
            <div className="home-lang-toggle" title="Cambiar Idioma / Change Language">
              <button
                type="button"
                className={`home-lang-btn ${language === "es" ? "active" : ""}`}
                onClick={() => setLanguage("es")}
                aria-label="Español"
              >
                ES
              </button>
              <button
                type="button"
                className={`home-lang-btn ${language === "en" ? "active" : ""}`}
                onClick={() => setLanguage("en")}
                aria-label="English"
              >
                EN
              </button>
            </div>

            <a
              href="https://wa.me/573000000000?text=Hola,%20quisiera%20solicitar%20un%20servicio%20de%20mantenimiento"
              target="_blank"
              rel="noopener noreferrer"
              className="home-btn-service-top"
              title="Contacto directo por WhatsApp"
            >
              <Phone size={14} />
              <span>{t("navRequestService", "Solicitar Servicio")}</span>
            </a>

            {/* Botón Iniciar Sesión en el panel superior */}
            <button
              type="button"
              onClick={() => openAuthWithTab("login")}
              className="home-btn-login"
              id="btn-header-login"
            >
              <LogIn size={15} />
              <span>{t("navLogin", "Iniciar Sesión")}</span>
            </button>

            {/* Botón Registro de Usuario en el panel superior */}
            <button
              type="button"
              onClick={() => openAuthWithTab("register")}
              className="home-btn-register"
              id="btn-header-register"
            >
              <UserPlus size={15} />
              <span>{t("navRegister", "Registrarse")}</span>
            </button>

            {/* Toggle Menú Móvil */}
            <button
              type="button"
              className="home-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Drawer Móvil Fullscreen con Backdrop Blur */}
        {mobileMenuOpen && (
          <>
            <div
              className="home-mobile-drawer-backdrop"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="home-mobile-drawer-content" role="dialog" aria-modal="true">
              <div className="home-drawer-header">
                <div className="home-brand" onClick={() => scrollToSection("hero")}>
                  <div className="home-brand-logo" style={{ width: 34, height: 34 }}>
                    <Wrench size={18} />
                  </div>
                  <div className="home-brand-title" style={{ fontSize: "1.1rem" }}>
                    SOS<span>ENLINEA</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="auth-modal-close"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="home-drawer-nav">
                <a
                  href="#hero"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("hero");
                  }}
                  className={`home-drawer-link ${activeSection === "hero" ? "active" : ""}`}
                >
                  <Home size={18} />
                  <span>Inicio</span>
                </a>

                <a
                  href="#soluciones"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("soluciones");
                  }}
                  className={`home-drawer-link ${activeSection === "soluciones" ? "active" : ""}`}
                >
                  <Building2 size={18} />
                  <span>Soluciones Inmobiliarias</span>
                </a>

                <a
                  href="#servicios"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("servicios");
                  }}
                  className={`home-drawer-link ${activeSection === "servicios" ? "active" : ""}`}
                >
                  <Wrench size={18} />
                  <span>Servicios Especializados</span>
                </a>

                <a
                  href="#como-funciona"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("como-funciona");
                  }}
                  className={`home-drawer-link ${activeSection === "como-funciona" ? "active" : ""}`}
                >
                  <FileText size={18} />
                  <span>Cómo funciona (5 Pasos)</span>
                </a>

                <a
                  href="#cobertura"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("cobertura");
                  }}
                  className={`home-drawer-link ${activeSection === "cobertura" ? "active" : ""}`}
                >
                  <MapPin size={18} />
                  <span>Cobertura & Cifras</span>
                </a>
              </div>

              <div className="home-drawer-footer">
                <button
                  type="button"
                  onClick={() => openAuthWithTab("login")}
                  className="home-btn-login"
                  style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                >
                  <LogIn size={16} />
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => openAuthWithTab("register")}
                  className="home-btn-register"
                  style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                >
                  <UserPlus size={16} />
                  Crear Cuenta / Registrarse
                </button>
                <a
                  href="https://wa.me/573000000000?text=Hola%20SOSENLINEA,%20deseo%20información"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-btn-service-top"
                  style={{ display: "flex", width: "100%", justifyContent: "center", padding: "0.65rem" }}
                >
                  <Phone size={15} />
                  <span>Llamar / WhatsApp Urgencias</span>
                </a>
              </div>
            </div>
          </>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────────
          HERO SECTION (Diseño Soluman.co)
      ───────────────────────────────────────────────────────────────── */}
      <section className="home-hero" id="hero">
        <div className="home-hero-glow" />
        <div className="home-hero-glow-left" />

        <div className="home-hero-container">
          {/* Lado Izquierdo: Titular, Propuesta de Valor & CTAs */}
          <div>
            <div className="home-hero-badge">
              <span className="home-badge-dot" />
              {t("heroBadge", "Mantenimiento inmobiliario & corporativo · Medellín")}
            </div>

            <h1 className="home-hero-title">
              {t("heroTitle1", "Mantenimiento inmobiliario, ")}{" "}
              <span className="home-hero-title-highlight">
                {t("heroTitleHighlight", "gestionado de principio a fin.")}
              </span>
            </h1>

            <p className="home-hero-description">
              {t(
                "heroDesc",
                "Centralizamos reparaciones, mantenimientos locativos y adecuaciones para inmobiliarias, empresas y propietarios en Medellín y Valle de Aburrá, con seguimiento en tiempo real, evidencia fotográfica y respaldo técnico durante todo el proceso."
              )}
            </p>

            <div className="home-hero-actions">
              <button
                type="button"
                onClick={() => openAuthWithTab("login")}
                className="home-btn-primary-hero"
              >
                <LogIn size={18} />
                {t("heroCtaLogin", "Ingresar al Sistema")}
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => openAuthWithTab("register")}
                className="home-btn-secondary-hero"
              >
                <UserPlus size={18} />
                Crear Cuenta / Registrarse
              </button>
            </div>

            {/* 4 Pilares de Confianza idénticos a Soluman */}
            <div className="home-hero-pillars">
              <div className="home-pillar-item">
                <div className="home-pillar-icon">
                  <FileText size={20} />
                </div>
                <div className="home-pillar-text">{t("pillarTracking", "Seguimiento")}</div>
                <div className="home-pillar-desc">{t("pillarTrackingDesc", "De cada solicitud en vivo")}</div>
              </div>

              <div className="home-pillar-item">
                <div className="home-pillar-icon">
                  <Camera size={20} />
                </div>
                <div className="home-pillar-text">{t("pillarEvidence", "Evidencia")}</div>
                <div className="home-pillar-desc">{t("pillarEvidenceDesc", "Fotos antes y después")}</div>
              </div>

              <div className="home-pillar-item">
                <div className="home-pillar-icon">
                  <UserCheck size={20} />
                </div>
                <div className="home-pillar-text">{t("pillarStaff", "Personal")}</div>
                <div className="home-pillar-desc">{t("pillarStaffDesc", "Calificado y verificado")}</div>
              </div>

              <div className="home-pillar-item">
                <div className="home-pillar-icon">
                  <Shield size={20} />
                </div>
                <div className="home-pillar-text">{t("pillarWarranty", "Respaldo")}</div>
                <div className="home-pillar-desc">{t("pillarWarrantyDesc", "Garantía SOSENLINEA")}</div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Simulación Dinámica de Seguimiento de Solicitud */}
          <div className="home-hero-visual">
            <div className="home-hero-card-main">
              <div className="home-card-header-badge">
                <div className="home-status-tag">
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#16a34a",
                    }}
                  />
                  Solicitud en seguimiento
                </div>
                <span className="home-order-number">ORD-2026-0842</span>
              </div>

              <div className="home-card-order-title">
                Mantenimiento Hidrosanitario y Red Eléctrica
              </div>
              <div className="home-card-order-meta">
                <MapPin size={14} /> Inmueble Cl. 10A #34-20, El Poblado ·
                Inmobiliaria Rentas & Hogar
              </div>

              <div className="home-card-timeline">
                <div className="home-timeline-step completed">
                  <div className="home-timeline-dot">
                    <CheckCircle2 size={12} />
                  </div>
                  <div className="home-timeline-title">
                    Diagnóstico y cotización realizada
                  </div>
                  <div className="home-timeline-sub">
                    Registrado en el sistema centralizado
                  </div>
                </div>

                <div className="home-timeline-step completed">
                  <div className="home-timeline-dot">
                    <CheckCircle2 size={12} />
                  </div>
                  <div className="home-timeline-title">
                    Aprobación de la inmobiliaria
                  </div>
                  <div className="home-timeline-sub">
                    Autorizado con acta de entrega de materiales
                  </div>
                </div>

                <div className="home-timeline-step active">
                  <div className="home-timeline-dot">
                    <Clock size={12} color="#ffffff" />
                  </div>
                  <div className="home-timeline-title">
                    Ejecución técnica en curso
                  </div>
                  <div className="home-timeline-sub">
                    Técnico en sitio cargando evidencia fotográfica
                  </div>
                </div>

                <div className="home-timeline-step">
                  <div className="home-timeline-dot" />
                  <div className="home-timeline-title" style={{ color: "#94a3b8" }}>
                    Cierre y liquidación contable
                  </div>
                  <div className="home-timeline-sub">
                    Generación automática de cuenta de cobro y garantía
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta flotante con Técnico Verificado */}
            <div className="home-floating-tech-card">
              <div className="home-tech-avatar">
                <Award size={20} />
              </div>
              <div>
                <div className="home-tech-info-name">
                  Carlos M. Duque · Técnico Certificado
                </div>
                <div className="home-tech-info-role">
                  ARL Vigente • Plomería y Redes • 4.9 ★ (140+ servicios)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECCIÓN: EL RETO HOY VS CON NUESTRA SOLUCIÓN
      ───────────────────────────────────────────────────────────────── */}
      <section className="home-comparison-section" id="ventajas">
        <div className="home-section-container">
          <div className="home-section-header">
            <div className="home-section-eyebrow">Gestión Moderna</div>
            <h2 className="home-section-title">
              Gestionar múltiples proveedores consume{" "}
              <span>tiempo y control.</span>
            </h2>
            <p className="home-section-subtitle">
              La comunicación fragmentada, los procesos manuales y la falta de
              trazabilidad generan demoras y sobrecostos. Con nuestra plataforma
              unificas toda la operación.
            </p>
          </div>

          <div className="home-comparison-grid">
            {/* Caja Negativa: Modelo Tradicional */}
            <div className="home-comparison-box negative">
              <div className="home-box-tag">❌ Gestión Tradicional / Dispersa</div>
              <div className="home-box-title">Procesos fragmentados y demoras</div>

              <div className="home-box-items">
                <div className="home-box-item">
                  <div className="home-box-item-icon">✕</div>
                  <div>
                    <div className="home-box-item-title">Múltiples chats y llamadas</div>
                    <div className="home-box-item-desc">
                      Conversaciones perdidas en WhatsApp entre propietarios,
                      inquilinos y técnicos sin auditoría.
                    </div>
                  </div>
                </div>

                <div className="home-box-item">
                  <div className="home-box-item-icon">✕</div>
                  <div>
                    <div className="home-box-item-title">Retrasos en autorizaciones</div>
                    <div className="home-box-item-desc">
                      Cotizaciones que tardan días en aprobarse y detienen la
                      habitabilidad del inmueble.
                    </div>
                  </div>
                </div>

                <div className="home-box-item">
                  <div className="home-box-item-icon">✕</div>
                  <div>
                    <div className="home-box-item-title">Información y cuentas dispersas</div>
                    <div className="home-box-item-desc">
                      Recibos de materiales extraviados, falta de registro antes/después
                      y dificultades contables.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Caja Positiva: Con Nuestra Solución */}
            <div className="home-comparison-box positive">
              <div className="home-box-tag">✨ Con SOSENLINEA</div>
              <div className="home-box-title">Un solo aliado centralizado y digital</div>

              <div className="home-box-items">
                <div className="home-box-item">
                  <div className="home-box-item-icon">✓</div>
                  <div>
                    <div className="home-box-item-title">Un único canal centralizado</div>
                    <div className="home-box-item-desc">
                      Todas las órdenes, solicitudes y cotizaciones organizadas en un
                      solo panel en tiempo real.
                    </div>
                  </div>
                </div>

                <div className="home-box-item">
                  <div className="home-box-item-icon">✓</div>
                  <div>
                    <div className="home-box-item-title">Trazabilidad con evidencia fotográfica</div>
                    <div className="home-box-item-desc">
                      Fotos de diagnóstico y finalización con firma digital para respaldo
                      del inquilino y propietario.
                    </div>
                  </div>
                </div>

                <div className="home-box-item">
                  <div className="home-box-item-icon">✓</div>
                  <div>
                    <div className="home-box-item-title">Liquidación contable transparente</div>
                    <div className="home-box-item-desc">
                      Cuentas de cobro automáticas, control de entregas de materiales y
                      reportes y seguimiento en tiempo real.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECCIÓN: SOLUCIONES SEGÚN TU TIPO DE OPERACIÓN
      ───────────────────────────────────────────────────────────────── */}
      <section className="home-solutions-section" id="soluciones">
        <div className="home-section-container">
          <div className="home-section-header">
            <div className="home-section-eyebrow">Nuestras Soluciones</div>
            <h2 className="home-section-title">
              Soluciones según tu <span>tipo de operación</span>
            </h2>
            <p className="home-section-subtitle">
              Adaptamos el flujo y las prioridades de trabajo a las necesidades
              específicas de cada cliente y sector.
            </p>
          </div>

          <div className="home-solutions-grid">
            {/* Inmobiliarias */}
            <div className="home-solution-card" onClick={() => openAuthWithTab("register")}>
              <div>
                <div className="home-solution-icon-wrap">
                  <Building2 size={24} />
                </div>
                <div className="home-solution-title">Inmobiliarias</div>
                <div className="home-solution-desc">
                  Mantenimiento y adecuaciones para propiedades en administración,
                  reparaciones a inquilinos y alistamiento para entrega inmediata.
                </div>
              </div>
              <div className="home-solution-link">
                Conocer solución <ArrowRight size={14} />
              </div>
            </div>

            {/* Empresas */}
            <div className="home-solution-card" onClick={() => openAuthWithTab("register")}>
              <div>
                <div className="home-solution-icon-wrap">
                  <Briefcase size={24} />
                </div>
                <div className="home-solution-title">Empresas & Oficinas</div>
                <div className="home-solution-desc">
                  Soporte continuo en mantenimiento preventivo y correctivo para
                  sedes corporativas, locales comerciales y bodegas.
                </div>
              </div>
              <div className="home-solution-link">
                Conocer solución <ArrowRight size={14} />
              </div>
            </div>

            {/* Propietarios y Hogares */}
            <div className="home-solution-card" onClick={() => openAuthWithTab("register")}>
              <div>
                <div className="home-solution-icon-wrap">
                  <Home size={24} />
                </div>
                <div className="home-solution-title">Propietarios y Hogares</div>
                <div className="home-solution-desc">
                  Soluciones confiables para mantener tu patrimonio en excelentes
                  condiciones, con cotizaciones claras y técnicos certificados.
                </div>
              </div>
              <div className="home-solution-link">
                Conocer solución <ArrowRight size={14} />
              </div>
            </div>

            {/* Rentas Cortas / Airbnb */}
            <div className="home-solution-card" onClick={() => openAuthWithTab("register")}>
              <div>
                <div className="home-solution-icon-wrap">
                  <BedDouble size={24} />
                </div>
                <div className="home-solution-title">Rentas Cortas / Airbnb</div>
                <div className="home-solution-desc">
                  Atención oportuna y alistamiento express para que tu propiedad
                  siempre esté 5 estrellas para recibir huéspedes.
                </div>
              </div>
              <div className="home-solution-link">
                Conocer solución <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECCIÓN: NUESTROS SERVICIOS ESPECIALIZADOS
      ───────────────────────────────────────────────────────────────── */}
      <section className="home-services-section" id="servicios">
        <div className="home-section-container">
          <div className="home-section-header">
            <div className="home-section-eyebrow">Cobertura Técnica</div>
            <h2 className="home-section-title">
              Servicios para mantener, <span>reparar y alistar inmuebles</span>
            </h2>
            <p className="home-section-subtitle">
              Personal calificado y herramientas profesionales para garantizar
              durabilidad y acabados impecables en cada trabajo.
            </p>
          </div>

          <div className="home-services-grid">
            {/* 1. Mantenimiento Locativo */}
            <div className="home-service-card">
              <div className="home-service-header">
                <div className="home-pillar-icon" style={{ width: 38, height: 38 }}>
                  <Wrench size={18} />
                </div>
                <span className="home-service-badge">Integral</span>
              </div>
              <div className="home-service-name">Mantenimiento Locativo</div>
              <div className="home-service-text">
                Conservación preventiva de techos, pisos, muros, cerraduras y
                adecuaciones generales en inmuebles.
              </div>
              <div className="home-service-tags">
                <span className="home-service-tag">Techos & Drywall</span>
                <span className="home-service-tag">Cerrajería</span>
                <span className="home-service-tag">Alistamiento</span>
              </div>
            </div>

            {/* 2. Plomería */}
            <div className="home-service-card">
              <div className="home-service-header">
                <div className="home-pillar-icon" style={{ width: 38, height: 38 }}>
                  <Droplets size={18} />
                </div>
                <span className="home-service-badge">Hidráulico</span>
              </div>
              <div className="home-service-name">Plomería y Redes Hidráulicas</div>
              <div className="home-service-text">
                Detección de fugas, reparación de griferías, sanitarios, bombas de
                presión y redes de aguas residuales.
              </div>
              <div className="home-service-tags">
                <span className="home-service-tag">Fugas & Filtraciones</span>
                <span className="home-service-tag">Griferías</span>
                <span className="home-service-tag">Destapes</span>
              </div>
            </div>

            {/* 3. Electricidad */}
            <div className="home-service-card">
              <div className="home-service-header">
                <div className="home-pillar-icon" style={{ width: 38, height: 38 }}>
                  <Zap size={18} />
                </div>
                <span className="home-service-badge">Certificado RETIE</span>
              </div>
              <div className="home-service-name">Electricidad y Redes</div>
              <div className="home-service-text">
                Instalación y modernización de circuitos, tableros eléctricos,
                iluminación LED, tomacorrientes y redes certificadas.
              </div>
              <div className="home-service-tags">
                <span className="home-service-tag">Tableros</span>
                <span className="home-service-tag">Iluminación</span>
                <span className="home-service-tag">Cortocircuitos</span>
              </div>
            </div>

            {/* 4. Pintura */}
            <div className="home-service-card">
              <div className="home-service-header">
                <div className="home-pillar-icon" style={{ width: 38, height: 38 }}>
                  <Paintbrush size={18} />
                </div>
                <span className="home-service-badge">Acabados</span>
              </div>
              <div className="home-service-name">Pintura y Enlucimiento</div>
              <div className="home-service-text">
                Pintura de interiores y exteriores con preparación de superficies,
                estuco, lijado y materiales de alta lavabilidad.
              </div>
              <div className="home-service-tags">
                <span className="home-service-tag">Interiores</span>
                <span className="home-service-tag">Fachadas</span>
                <span className="home-service-tag">Impermeabilización</span>
              </div>
            </div>

            {/* 5. Carpintería */}
            <div className="home-service-card">
              <div className="home-service-header">
                <div className="home-pillar-icon" style={{ width: 38, height: 38 }}>
                  <Hammer size={18} />
                </div>
                <span className="home-service-badge">Madera & Metal</span>
              </div>
              <div className="home-service-name">Carpintería y Cerrajería</div>
              <div className="home-service-text">
                Ajuste y restauración de puertas, closets, muebles de cocina,
                cerraduras de seguridad y bisagras.
              </div>
              <div className="home-service-tags">
                <span className="home-service-tag">Closets & Cocinas</span>
                <span className="home-service-tag">Puertas</span>
                <span className="home-service-tag">Chapas de seguridad</span>
              </div>
            </div>

            {/* 6. Aseo y Entrega */}
            <div className="home-service-card">
              <div className="home-service-header">
                <div className="home-pillar-icon" style={{ width: 38, height: 38 }}>
                  <Sparkles size={18} />
                </div>
                <span className="home-service-badge">Finalización</span>
              </div>
              <div className="home-service-name">Aseo Profundo y Entrega</div>
              <div className="home-service-text">
                Limpieza detallada post-obra o desocupación de inmueble, dejando
                cada espacio listo para el nuevo arrendatario.
              </div>
              <div className="home-service-tags">
                <span className="home-service-tag">Post-construcción</span>
                <span className="home-service-tag">Vidrios</span>
                <span className="home-service-tag">Desinfección</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECCIÓN: CÓMO FUNCIONA (FLUJO EN 5 PASOS)
      ───────────────────────────────────────────────────────────────── */}
      <section className="home-how-section" id="como-funciona">
        <div className="home-how-container">
          <div className="home-section-header">
            <div className="home-section-eyebrow" style={{ color: "#93c5fd" }}>
              Flujo Transparente
            </div>
            <h2 className="home-section-title">
              ¿Cómo funciona nuestra <span>gestión centralizada?</span>
            </h2>
            <p className="home-section-subtitle">
              De la solicitud inicial a la entrega auditada, cada orden sigue un
              proceso estructurado y controlado.
            </p>
          </div>

          <div className="home-steps-grid">
            <div className="home-step-card">
              <span className="home-step-num">Paso 01</span>
              <div className="home-step-icon">
                <FileText size={20} />
              </div>
              <div className="home-step-title">Solicitud</div>
              <div className="home-step-desc">
                Se registra el requerimiento por portal web o WhatsApp con datos
                del inmueble e incidencia.
              </div>
            </div>

            <div className="home-step-card">
              <span className="home-step-num">Paso 02</span>
              <div className="home-step-icon">
                <UserCheck size={20} />
              </div>
              <div className="home-step-title">Asignación</div>
              <div className="home-step-desc">
                Coordinamos al técnico idóneo con diagnóstico oportuno y
                autorización de la inmobiliaria o cliente.
              </div>
            </div>

            <div className="home-step-card">
              <span className="home-step-num">Paso 03</span>
              <div className="home-step-icon">
                <Wrench size={20} />
              </div>
              <div className="home-step-title">Ejecución</div>
              <div className="home-step-desc">
                Supervisión de mano de obra y entrega de materiales con control
                estricto de inventario.
              </div>
            </div>

            <div className="home-step-card">
              <span className="home-step-num">Paso 04</span>
              <div className="home-step-icon">
                <Camera size={20} />
              </div>
              <div className="home-step-title">Evidencia</div>
              <div className="home-step-desc">
                Documentación fotográfica de antes, durante y después con firma de
                satisfacción.
              </div>
            </div>

            <div className="home-step-card">
              <span className="home-step-num">Paso 05</span>
              <div className="home-step-icon">
                <CheckCircle2 size={20} />
              </div>
              <div className="home-step-title">Cierre</div>
              <div className="home-step-desc">
                Liquidación contable automática, facturación transparente y
                garantía de servicio activa.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECCIÓN: CIFRAS DE CONFIANZA & COBERTURA
      ───────────────────────────────────────────────────────────────── */}
      <section className="home-stats-section" id="cobertura">
        <div className="home-stats-grid">
          <div className="home-stat-item">
            <div className="home-stat-number">+5</div>
            <div className="home-stat-label">Años de Trayectoria</div>
            <div className="home-stat-sub">Operación continua en Antioquia</div>
          </div>

          <div className="home-stat-item">
            <div className="home-stat-number">+12.4K</div>
            <div className="home-stat-label">Servicios Atendidos</div>
            <div className="home-stat-sub">Mantenimientos y adecuaciones</div>
          </div>

          <div className="home-stat-item">
            <div className="home-stat-number">100%</div>
            <div className="home-stat-label">Área Metropolitana</div>
            <div className="home-stat-sub">Medellín, Envigado, Sabaneta, Itagüí, Bello</div>
          </div>

          <div className="home-stat-item">
            <div className="home-stat-number">99.2%</div>
            <div className="home-stat-label">Satisfacción de Clientes</div>
            <div className="home-stat-sub">Encuestas auditadas post-servicio</div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          FOOTER COMPLETO
      ───────────────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────
          FOOTER COMPLETO CON SELECTOR DE IDIOMAS
      ───────────────────────────────────────────────────────────────── */}
      <footer className="home-footer">
        <div className="home-footer-grid">
          <div>
            <div className="home-footer-brand-title">
              SOSENLINEA
            </div>
            <p className="home-footer-desc">
              {t(
                "footerBrandDesc",
                "Solución integral para el mantenimiento, reparación y alistamiento de inmuebles en Medellín y municipios del Valle de Aburrá."
              )}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span className="home-status-tag" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                {t("footerPlatformStatus", "● Plataforma Operativa en Línea")}
              </span>
            </div>
          </div>

          <div>
            <div className="home-footer-col-title">{t("footerColQuickLinks", "Accesos Rápidos")}</div>
            <ul className="home-footer-links">
              <li>
                <span className="home-footer-link" onClick={() => scrollToSection("hero")}>
                  {t("footerLinkHome", "Inicio")}
                </span>
              </li>
              <li>
                <span className="home-footer-link" onClick={() => scrollToSection("soluciones")}>
                  {t("footerLinkSolutions", "Soluciones Inmobiliarias")}
                </span>
              </li>
              <li>
                <span className="home-footer-link" onClick={() => scrollToSection("servicios")}>
                  {t("footerLinkServices", "Catálogo de Servicios")}
                </span>
              </li>
              <li>
                <span className="home-footer-link" onClick={() => scrollToSection("como-funciona")}>
                  {t("footerLinkHowItWorks", "Metodología de Trabajo")}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <div className="home-footer-col-title">{t("footerColClients", "Área de Clientes")}</div>
            <ul className="home-footer-links">
              <li>
                <span className="home-footer-link" onClick={() => openAuthWithTab("login")}>
                  {t("footerLinkLogin", "Ingreso a Plataforma")}
                </span>
              </li>
              <li>
                <span className="home-footer-link" onClick={() => openAuthWithTab("register")}>
                  {t("footerLinkRegisterAgency", "Registro de Inmobiliaria")}
                </span>
              </li>
              <li>
                <span className="home-footer-link" onClick={() => openAuthWithTab("register")}>
                  {t("footerLinkRegisterProvider", "Registro de Proveedor / Técnico")}
                </span>
              </li>
              <li>
                <span
                  className="home-footer-link"
                  onClick={() => {
                    setAuthTab("otp-request");
                    setAuthModalOpen(true);
                  }}
                >
                  {t("footerLinkRecoverPass", "Recuperar Contraseña")}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <div className="home-footer-col-title">{t("footerColContact", "Contacto & Soporte")}</div>
            <ul className="home-footer-links">
              <li>{t("footerLocation", "Medellín, Antioquia · Colombia")}</li>
              <li>{t("footerSchedule", "Horario: Lunes a Sábado 7:30 AM - 6:00 PM")}</li>
              <li>{t("footerEmergencyLine", "Línea de Urgencias 24/7")}</li>
              <li>soporte@sosenlinea.com</li>
            </ul>
          </div>
        </div>

        {/* ── SELECTOR DE IDIOMAS EN EL PIE DE PÁGINA ──────────────────────── */}
        <div className="home-footer-lang-container">
          <div className="home-footer-lang-info">
            <Globe size={20} color="#60a5fa" />
            <div>
              <div className="home-footer-lang-heading">
                {t("footerSelectLanguageTitle", "Idioma del Sitio Web")}
              </div>
              <div className="home-footer-lang-sub">
                {t("footerSelectLanguageSub", "Selecciona tu idioma de preferencia:")}
              </div>
            </div>
          </div>

          <div className="home-footer-lang-switch">
            <button
              type="button"
              className={`home-footer-lang-option ${language === "es" ? "selected" : ""}`}
              onClick={() => setLanguage("es")}
              id="footer-lang-es"
            >
              <span className="home-flag-icon">🇪🇸</span>
              <span className="home-lang-name">Español</span>
              {language === "es" && <span className="home-lang-badge">Activo</span>}
            </button>

            <button
              type="button"
              className={`home-footer-lang-option ${language === "en" ? "selected" : ""}`}
              onClick={() => setLanguage("en")}
              id="footer-lang-en"
            >
              <span className="home-flag-icon">🇺🇸</span>
              <span className="home-lang-name">English</span>
              {language === "en" && <span className="home-lang-badge">Active</span>}
            </button>
          </div>
        </div>

        <div className="home-footer-bottom">
          <div>© {new Date().getFullYear()} SOSENLINEA. {t("footerRights", "Todos los derechos reservados.")}</div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <span>{t("footerSslSecurity", "Seguridad SSL 256-bit")}</span>
            <span>{t("footerTerms", "Términos y Condiciones")}</span>
            <span>{t("footerPrivacy", "Tratamiento de Datos")}</span>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────────
          BARRA DE NAVEGACIÓN INFERIOR PARA MÓVILES (BOTTOM NAV)
      ───────────────────────────────────────────────────────────────── */}
      <nav className="home-mobile-bottom-bar" aria-label="Navegación móvil inferior">
        <button
          type="button"
          className={`home-bottom-nav-item ${activeSection === "hero" ? "active" : ""}`}
          onClick={() => scrollToSection("hero")}
        >
          <div className="home-bottom-nav-icon"><Home size={20} /></div>
          <span>Inicio</span>
        </button>

        <button
          type="button"
          className={`home-bottom-nav-item ${activeSection === "soluciones" ? "active" : ""}`}
          onClick={() => scrollToSection("soluciones")}
        >
          <div className="home-bottom-nav-icon"><Building2 size={20} /></div>
          <span>Soluciones</span>
        </button>

        <button
          type="button"
          className={`home-bottom-nav-item ${activeSection === "servicios" ? "active" : ""}`}
          onClick={() => scrollToSection("servicios")}
        >
          <div className="home-bottom-nav-icon"><Wrench size={20} /></div>
          <span>Servicios</span>
        </button>

        <a
          href="https://wa.me/573000000000?text=Hola%20SOSENLINEA,%20deseo%20solicitar%20un%20servicio"
          target="_blank"
          rel="noopener noreferrer"
          className="home-bottom-nav-item"
        >
          <div className="home-bottom-nav-icon" style={{ color: "#25d366" }}><MessageCircle size={20} /></div>
          <span style={{ color: "#16a34a" }}>WhatsApp</span>
        </a>

        <button
          type="button"
          className="home-bottom-nav-item"
          onClick={() => openAuthWithTab("login")}
        >
          <div className="home-bottom-nav-icon" style={{ color: "var(--home-blue)" }}><LogIn size={20} /></div>
          <span>Ingresar</span>
        </button>
      </nav>

      {/* Botón Flotante de WhatsApp para Atención Inmediata */}
      <a
        href="https://wa.me/573000000000?text=Hola%20SOSENLINEA,%20quisiera%20solicitar%20un%20servicio%20de%20mantenimiento"
        target="_blank"
        rel="noopener noreferrer"
        className="home-floating-whatsapp"
        title="Contactar a SOSENLINEA por WhatsApp"
      >
        <MessageCircle size={20} />
        <span>Atención en Línea</span>
      </a>

      {/* Botón Volver Arriba */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="home-btn-scroll-top"
          title="Volver al inicio"
          aria-label="Volver arriba"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          MODAL / PANEL SUPERIOR DE AUTENTICACIÓN (LOGIN & REGISTRO)
      ───────────────────────────────────────────────────────────────── */}
      {authModalOpen && (
        <div
          className="auth-modal-overlay"
          onClick={() => !submitting && !recoveryLoading && setAuthModalOpen(false)}
        >
          <div
            className="auth-modal-card"
            onClick={(e) => e.stopPropagation()}
            id="auth-modal-card"
          >
            {/* Cabecera del Modal */}
            <div className="auth-modal-header">
              <div className="auth-modal-brand">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #0048b8, #2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <Shield size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--home-navy)" }}>
                    Portal Corporativo SOSENLINEA
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--home-muted)" }}>
                    Acceso Centralizado a la Plataforma
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="auth-modal-close"
                onClick={() => setAuthModalOpen(false)}
                title="Cerrar ventana"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pestañas de Cambio: Iniciar Sesión vs Registro */}
            {(authTab === "login" || authTab === "register") && (
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab-btn ${authTab === "login" ? "active" : ""}`}
                  onClick={() => {
                    setAuthTab("login");
                    setLocalLoginError("");
                  }}
                  id="tab-btn-login"
                >
                  <LogIn size={15} />
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${authTab === "register" ? "active" : ""}`}
                  onClick={() => {
                    setAuthTab("register");
                    setRegError("");
                    setRegSuccess(false);
                  }}
                  id="tab-btn-register"
                >
                  <UserPlus size={15} />
                  Registrarse / Acceso
                </button>
              </div>
            )}

            {/* Contenido del Modal según pestaña */}
            <div className="auth-modal-body">
              {/* ─────────────────────────────────────────────────────────────
                  TAB 1: INICIAR SESIÓN
              ───────────────────────────────────────────────────────────── */}
              {authTab === "login" && (
                <div>
                  {(localLoginError || loginError) && (
                    <div
                      className="alert alert-danger"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.65rem 0.85rem",
                        marginBottom: "1rem",
                        fontSize: "0.825rem",
                        borderRadius: 8,
                        background: "#fee2e2",
                        color: "#991b1b",
                        border: "1px solid #fecaca",
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>{localLoginError || loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit}>
                    <div className="auth-form-group">
                      <label className="auth-form-label" htmlFor="modal-login-user">
                        Usuario o Correo Registrado
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          id="modal-login-user"
                          type="text"
                          className="auth-input with-left-icon"
                          placeholder="ej. usuario@sosenlinea.com o nombre de usuario"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          autoFocus
                          disabled={submitting || isLoading}
                        />
                        <Mail size={16} className="auth-input-left-icon" />
                      </div>
                    </div>

                    <div className="auth-form-group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                        <label className="auth-form-label" htmlFor="modal-login-pass" style={{ margin: 0 }}>
                          Contraseña
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab("otp-request");
                            setRecoveryInput(username || "admin");
                            setRecoveryError("");
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--home-blue)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>

                      <div className="auth-input-wrapper">
                        <input
                          id="modal-login-pass"
                          type={showPassword ? "text" : "password"}
                          className="auth-input with-left-icon"
                          placeholder="Tu clave de acceso"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={submitting || isLoading}
                          style={{ paddingRight: "2.5rem" }}
                        />
                        <KeyRound size={16} className="auth-input-left-icon" />
                        <button
                          type="button"
                          className="auth-toggle-pass"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? "Ocultar" : "Mostrar"}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Recordar sesión y sello de seguridad */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.6rem 0 1rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", color: "var(--home-navy-soft)", cursor: "pointer", userSelect: "none" }}>
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          style={{ accentColor: "var(--home-blue)", cursor: "pointer" }}
                        />
                        Recordar usuario en este equipo
                      </label>
                      <span style={{ fontSize: "0.72rem", color: "var(--home-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <LockIcon size={12} /> Cifrado 256-bit
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="auth-submit-btn"
                      disabled={submitting || isLoading}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                          Autenticando…
                        </>
                      ) : (
                        <>
                          <LogIn size={16} />
                          Ingresar a la Plataforma
                        </>
                      )}
                    </button>
                  </form>

                  {/* Garantía de Seguridad Corporativa Profesional */}
                  <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--home-border)" }}>
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: "0.85rem 1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Shield size={16} color="var(--home-blue)" />
                        <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--home-navy)" }}>
                          Acceso Autorizado SOSENLINEA Cloud
                        </span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--home-muted)", margin: 0, lineHeight: 1.45 }}>
                        Acceso exclusivo para personal y colaboradores autorizados. Sistema protegido con cifrado SSL de extremo a extremo y auditoría activa de sesiones.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 2: REGISTRO DE USUARIO / SOLICITUD DE ACCESO
              ───────────────────────────────────────────────────────────── */}
              {authTab === "register" && (
                <div>
                  {regSuccess ? (
                    <div style={{ textAlign: "center", padding: "1.25rem 0.5rem" }}>
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: "50%",
                          background: "#dcfce7",
                          color: "#16a34a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 1rem",
                          boxShadow: "0 4px 14px rgba(22, 163, 74, 0.2)",
                        }}
                      >
                        <CheckCircle2 size={34} />
                      </div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--home-navy)", marginBottom: "0.35rem" }}>
                        ¡Perfil Registrado y Verificado!
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--home-muted)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                        Tu cuenta de cliente para <strong>{regName}</strong> ha sido creada exitosamente en el sistema SOSENLINEA.
                      </p>

                      {/* Resumen de Información Verificada */}
                      <div
                        style={{
                          textAlign: "left",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: "1rem",
                          marginBottom: "1.5rem",
                          fontSize: "0.825rem",
                        }}
                      >
                        <div style={{ fontWeight: 700, color: "var(--home-navy)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <UserCheck size={16} color="var(--home-blue)" />
                          Resumen de Verificación del Usuario
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", color: "#334155" }}>
                          <div>
                            <span style={{ color: "var(--home-muted)", display: "block", fontSize: "0.75rem" }}>Perfil Asignado:</span>
                            <strong style={{ textTransform: "capitalize" }}>
                              {regProfileType === "inmobiliaria" && "🏢 Inmobiliaria"}
                              {regProfileType === "empresa" && "🏬 Empresa / Sede Corporativa"}
                              {regProfileType === "propietario" && "🏠 Propietario de Inmueble"}
                              {regProfileType === "arrendatario" && "🔑 Arrendatario / Inquilino"}
                              {regProfileType === "tecnico" && "🛠️ Técnico / Maestro de Obra"}
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: "var(--home-muted)", display: "block", fontSize: "0.75rem" }}>Correo Confirmado:</span>
                            <span style={{ wordBreak: "break-all", fontWeight: 600 }}>{regEmail}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--home-muted)", display: "block", fontSize: "0.75rem" }}>Teléfono / WhatsApp:</span>
                            <span>{regPhone}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--home-muted)", display: "block", fontSize: "0.75rem" }}>Verificación Técnica / Legal:</span>
                            <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ Datos validados</span>
                          </div>
                        </div>

                        {(regProfileType === "inmobiliaria" || regProfileType === "empresa") && regCompanyName && (
                          <div style={{ marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px dashed #cbd5e1" }}>
                            <span style={{ color: "var(--home-muted)", fontSize: "0.75rem" }}>Razón Social / NIT: </span>
                            <strong>{regCompanyName}</strong> {regCompanyNit ? `(NIT: ${regCompanyNit})` : ""}
                          </div>
                        )}

                        {(regProfileType === "propietario" || regProfileType === "arrendatario") && regPropertyAddress && (
                          <div style={{ marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px dashed #cbd5e1" }}>
                            <span style={{ color: "var(--home-muted)", fontSize: "0.75rem" }}>Ubicación Inmueble: </span>
                            <strong>{regPropertyAddress}</strong> ({regPropertyType})
                          </div>
                        )}

                        {regProfileType === "tecnico" && (
                          <div style={{ marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px dashed #cbd5e1" }}>
                            <span style={{ color: "var(--home-muted)", fontSize: "0.75rem" }}>Especialidad Operativa: </span>
                            <strong>{regSpecialty}</strong> {regHasArl ? "• ARL Activa" : ""}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUsername(regEmail || regName);
                          setPassword(regPassword);
                          setAuthTab("login");
                          setRegSuccess(false);
                        }}
                        className="auth-submit-btn"
                        style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                      >
                        <LogIn size={16} />
                        Ir a Iniciar Sesión Ahora
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegisterSubmit}>
                      {regError && (
                        <div
                          className="alert alert-danger"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.65rem 0.85rem",
                            marginBottom: "1rem",
                            fontSize: "0.825rem",
                            borderRadius: 8,
                            background: "#fee2e2",
                            color: "#991b1b",
                            border: "1px solid #fecaca",
                          }}
                        >
                          <AlertCircle size={16} />
                          <span>{regError}</span>
                        </div>
                      )}

                      {/* Fila 1: Nombre y Teléfono */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div className="auth-form-group">
                          <label className="auth-form-label" htmlFor="reg-name">
                            Nombre Completo *
                          </label>
                          <input
                            id="reg-name"
                            type="text"
                            className="auth-input"
                            placeholder="Ej. Juan Pérez"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="auth-form-group">
                          <label className="auth-form-label" htmlFor="reg-phone">
                            Teléfono / WhatsApp *
                          </label>
                          <input
                            id="reg-phone"
                            type="tel"
                            className="auth-input"
                            placeholder="Ej. 300 123 4567"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Fila 2: Correo y Confirmación de Correo */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div className="auth-form-group">
                          <label className="auth-form-label" htmlFor="reg-email">
                            Correo Electrónico *
                          </label>
                          <input
                            id="reg-email"
                            type="email"
                            className="auth-input"
                            placeholder="nombre@correo.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                          />
                        </div>

                        <div className="auth-form-group">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label className="auth-form-label" htmlFor="reg-confirm-email">
                              Confirmar Correo *
                            </label>
                            {regConfirmEmail && regEmail && (
                              <span style={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: regEmail.trim().toLowerCase() === regConfirmEmail.trim().toLowerCase() ? "#16a34a" : "#dc2626"
                              }}>
                                {regEmail.trim().toLowerCase() === regConfirmEmail.trim().toLowerCase() ? "✓ Coincide" : "✗ No coincide"}
                              </span>
                            )}
                          </div>
                          <input
                            id="reg-confirm-email"
                            type="email"
                            className="auth-input"
                            placeholder="Repite tu correo"
                            value={regConfirmEmail}
                            onChange={(e) => setRegConfirmEmail(e.target.value)}
                            required
                            style={{
                              borderColor: regConfirmEmail && regEmail
                                ? regEmail.trim().toLowerCase() === regConfirmEmail.trim().toLowerCase() ? "#86efac" : "#fca5a5"
                                : undefined
                            }}
                          />
                        </div>
                      </div>

                      {/* Fila 3: Selección de Perfil de Usuario para Clientes */}
                      <div className="auth-form-group" style={{ marginTop: "0.25rem" }}>
                        <label className="auth-form-label" htmlFor="reg-profile-type">
                          Perfil de Usuario (Rol de Cliente) *
                        </label>
                        <select
                          id="reg-profile-type"
                          className="auth-input"
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
                          style={{ height: "40px", fontWeight: 600 }}
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
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "0.85rem",
                          margin: "0.75rem 0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--home-blue)" }}>
                            📋 Checklist de Verificación de Información
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "var(--home-muted)" }}>
                            Validación según perfil
                          </span>
                        </div>

                        {/* Caso 1: Inmobiliaria o Empresa */}
                        {(regProfileType === "inmobiliaria" || regProfileType === "empresa") && (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.65rem", fontSize: "0.78rem" }}>
                              <input
                                type="checkbox"
                                id="reg-is-company-check"
                                checked={regIsCompany}
                                onChange={(e) => setRegIsCompany(e.target.checked)}
                              />
                              <label htmlFor="reg-is-company-check" style={{ cursor: "pointer", fontWeight: 600, color: "#334155" }}>
                                Es empresa o persona jurídica legalmente constituida
                              </label>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                              <div className="auth-form-group" style={{ marginBottom: 0 }}>
                                <label className="auth-form-label" style={{ fontSize: "0.75rem" }}>
                                  Razón Social o Inmobiliaria *
                                </label>
                                <input
                                  type="text"
                                  className="auth-input"
                                  placeholder="Ej. Inmobiliaria Medellín S.A.S."
                                  value={regCompanyName}
                                  onChange={(e) => setRegCompanyName(e.target.value)}
                                  required
                                  style={{ padding: "0.45rem 0.65rem", fontSize: "0.8rem" }}
                                />
                              </div>

                              <div className="auth-form-group" style={{ marginBottom: 0 }}>
                                <label className="auth-form-label" style={{ fontSize: "0.75rem" }}>
                                  NIT o RUT (Con DV)
                                </label>
                                <input
                                  type="text"
                                  className="auth-input"
                                  placeholder="Ej. 900.123.456-7"
                                  value={regCompanyNit}
                                  onChange={(e) => setRegCompanyNit(e.target.value)}
                                  style={{ padding: "0.45rem 0.65rem", fontSize: "0.8rem" }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Caso 2: Arrendatario o Propietario */}
                        {(regProfileType === "arrendatario" || regProfileType === "propietario") && (
                          <div>
                            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "0.65rem", marginBottom: "0.65rem" }}>
                              <div className="auth-form-group" style={{ marginBottom: 0 }}>
                                <label className="auth-form-label" style={{ fontSize: "0.75rem" }}>
                                  Dirección o Conjunto del Inmueble *
                                </label>
                                <input
                                  type="text"
                                  className="auth-input"
                                  placeholder="Ej. Cl 10 # 40-20 Apto 402"
                                  value={regPropertyAddress}
                                  onChange={(e) => setRegPropertyAddress(e.target.value)}
                                  required
                                  style={{ padding: "0.45rem 0.65rem", fontSize: "0.8rem" }}
                                />
                              </div>

                              <div className="auth-form-group" style={{ marginBottom: 0 }}>
                                <label className="auth-form-label" style={{ fontSize: "0.75rem" }}>
                                  Tipo de Inmueble
                                </label>
                                <select
                                  className="auth-input"
                                  value={regPropertyType}
                                  onChange={(e) => setRegPropertyType(e.target.value)}
                                  style={{ padding: "0.45rem 0.65rem", fontSize: "0.8rem", height: "35px" }}
                                >
                                  <option value="Apartamento">Apartamento</option>
                                  <option value="Casa Residencial">Casa Residencial</option>
                                  <option value="Local Comercial">Local Comercial</option>
                                  <option value="Bodega / Oficina">Bodega / Oficina</option>
                                </select>
                              </div>
                            </div>

                            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", fontSize: "0.75rem", color: "#334155", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={regConfirmCheck}
                                onChange={(e) => setRegConfirmCheck(e.target.checked)}
                                style={{ marginTop: "2px" }}
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
                            <div className="auth-form-group" style={{ marginBottom: "0.65rem" }}>
                              <label className="auth-form-label" style={{ fontSize: "0.75rem" }}>
                                Especialidad Técnica Principal *
                              </label>
                              <select
                                className="auth-input"
                                value={regSpecialty}
                                onChange={(e) => setRegSpecialty(e.target.value)}
                                style={{ padding: "0.45rem 0.65rem", fontSize: "0.8rem", height: "35px" }}
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

                            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", fontSize: "0.75rem", color: "#334155", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={regHasArl}
                                onChange={(e) => setRegHasArl(e.target.checked)}
                                style={{ marginTop: "2px" }}
                              />
                              <span>
                                Cuento con afiliación y pago de seguridad social vigente (ARL y EPS) para ingreso a predios.
                              </span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Fila 4: Contraseñas */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div className="auth-form-group">
                          <label className="auth-form-label" htmlFor="reg-password">
                            Contraseña *
                          </label>
                          <input
                            id="reg-password"
                            type="password"
                            className="auth-input"
                            placeholder="Mínimo 6 caracteres"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                          />
                        </div>

                        <div className="auth-form-group">
                          <label className="auth-form-label" htmlFor="reg-confirm">
                            Confirmar Contraseña *
                          </label>
                          <input
                            id="reg-confirm"
                            type="password"
                            className="auth-input"
                            placeholder="Repite la contraseña"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Términos y Tratamiento de Datos */}
                      <div style={{ margin: "0.5rem 0 1rem" }}>
                        <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.75rem", color: "var(--home-muted)", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={regTerms}
                            onChange={(e) => setRegTerms(e.target.checked)}
                            style={{ marginTop: "2px" }}
                          />
                          <span>
                            Acepto el tratamiento de datos personales y los términos de servicio para la gestión de solicitudes y mantenimiento.
                          </span>
                        </label>
                      </div>

                      <button type="submit" className="auth-submit-btn">
                        <UserPlus size={16} />
                        Crear Cuenta y Solicitar Acceso
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 3: RECUPERACIÓN OTP (PASO 1, 2, 3)
              ───────────────────────────────────────────────────────────── */}
              {authTab === "otp-request" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <button
                      type="button"
                      onClick={() => setAuthTab("login")}
                      style={{ background: "none", border: "none", color: "var(--home-blue)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}
                    >
                      ← Volver al login
                    </button>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--home-navy)", marginBottom: "0.4rem" }}>
                    Recuperación de Contraseña con OTP
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--home-muted)", marginBottom: "1rem" }}>
                    Ingresa tu usuario o correo electrónico registrado. Te enviaremos un código de seguridad OTP de 6 dígitos.
                  </p>

                  {recoveryError && (
                    <div style={{ padding: "0.5rem", background: "#fee2e2", color: "#991b1b", fontSize: "0.8rem", borderRadius: 8, marginBottom: "0.75rem" }}>
                      {recoveryError}
                    </div>
                  )}

                  <form onSubmit={handleRequestOtp}>
                    <div className="auth-form-group">
                      <label className="auth-form-label" htmlFor="otp-req-user">
                        Usuario o Correo Registrado
                      </label>
                      <input
                        id="otp-req-user"
                        type="text"
                        className="auth-input"
                        placeholder="ej. admin o admin@sosenlinea.co"
                        value={recoveryInput}
                        onChange={(e) => setRecoveryInput(e.target.value)}
                        autoFocus
                        disabled={recoveryLoading}
                      />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={recoveryLoading}>
                      {recoveryLoading ? "Generando OTP..." : "Enviar Código OTP"}
                    </button>
                  </form>
                </div>
              )}

              {authTab === "otp-verify" && (
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--home-navy)", marginBottom: "0.4rem" }}>
                    Verificar Código OTP
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--home-muted)", marginBottom: "0.75rem" }}>
                    Código enviado a: <strong>{maskedEmail}</strong>
                  </p>

                  {devOtpNotification && (
                    <div
                      style={{
                        background: "rgba(0, 72, 184, 0.08)",
                        border: "1px dashed var(--home-blue)",
                        borderRadius: 8,
                        padding: "0.6rem",
                        marginBottom: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: "var(--home-blue)" }}>
                        Código de prueba: <strong>{devOtpNotification}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtpNotification)}
                        style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: 6, background: "var(--home-blue)", color: "#fff", border: "none", cursor: "pointer" }}
                      >
                        Copiar
                      </button>
                    </div>
                  )}

                  {recoveryError && (
                    <div style={{ padding: "0.5rem", background: "#fee2e2", color: "#991b1b", fontSize: "0.8rem", borderRadius: 8, marginBottom: "0.75rem" }}>
                      {recoveryError}
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp}>
                    <div className="auth-form-group">
                      <label className="auth-form-label" htmlFor="otp-input-code">
                        Ingresa el Código de 6 Dígitos
                      </label>
                      <input
                        id="otp-input-code"
                        type="text"
                        maxLength={6}
                        className="auth-input"
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        style={{ textAlign: "center", fontSize: "1.3rem", letterSpacing: "5px", fontWeight: 800, fontFamily: "var(--font-mono)" }}
                        autoFocus
                        disabled={recoveryLoading}
                      />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={recoveryLoading || otpCode.length !== 6}>
                      {recoveryLoading ? "Validando..." : "Validar Código OTP"}
                    </button>
                  </form>
                </div>
              )}

              {authTab === "otp-reset" && (
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--home-navy)", marginBottom: "0.4rem" }}>
                    Establecer Nueva Contraseña
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--home-muted)", marginBottom: "1rem" }}>
                    OTP confirmado. Ingresa tu nueva contraseña para <strong>{recoveryInput}</strong>.
                  </p>

                  {recoveryError && (
                    <div style={{ padding: "0.5rem", background: "#fee2e2", color: "#991b1b", fontSize: "0.8rem", borderRadius: 8, marginBottom: "0.75rem" }}>
                      {recoveryError}
                    </div>
                  )}

                  <form onSubmit={handleResetPassword}>
                    <div className="auth-form-group">
                      <label className="auth-form-label" htmlFor="new-pass-field">
                        Nueva Contraseña
                      </label>
                      <input
                        id="new-pass-field"
                        type="password"
                        className="auth-input"
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoFocus
                        disabled={recoveryLoading}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label" htmlFor="confirm-pass-field">
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        id="confirm-pass-field"
                        type="password"
                        className="auth-input"
                        placeholder="Repite la contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={recoveryLoading}
                      />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={recoveryLoading || !newPassword}>
                      {recoveryLoading ? "Guardando..." : "Guardar Nueva Contraseña"}
                    </button>
                  </form>
                </div>
              )}

              {authTab === "otp-success" && (
                <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <CheckCircle2 size={44} color="#16a34a" style={{ margin: "0 auto 0.5rem" }} />
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--home-navy)", marginBottom: "0.4rem" }}>
                    ¡Contraseña Actualizada!
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--home-muted)", marginBottom: "1rem" }}>
                    Tu nueva clave se encuentra activa en el sistema.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthTab("login")}
                    className="auth-submit-btn"
                  >
                    Iniciar Sesión Ahora
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
