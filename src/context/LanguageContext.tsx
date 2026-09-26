import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "es" | "en";

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

const TRANSLATIONS: Translations = {
  // ── Header & Navigation ──────────────────────────────────────────────────
  brandSubtitle: {
    es: "Mantenimiento & Servicios · Medellín",
    en: "Property Maintenance & Repairs · Medellín",
  },
  navHome: {
    es: "Inicio",
    en: "Home",
  },
  navSolutions: {
    es: "Soluciones",
    en: "Solutions",
  },
  navServices: {
    es: "Servicios",
    en: "Services",
  },
  navHowItWorks: {
    es: "Cómo funciona",
    en: "How It Works",
  },
  navCoverage: {
    es: "Cobertura",
    en: "Coverage",
  },
  navEmergencies: {
    es: "Urgencias 24/7",
    en: "24/7 Emergencies",
  },
  navContact: {
    es: "Contacto",
    en: "Contact",
  },
  navRequestService: {
    es: "Solicitar Servicio",
    en: "Request Service",
  },
  navLogin: {
    es: "Iniciar Sesión",
    en: "Sign In",
  },
  navRegister: {
    es: "Registrarse",
    en: "Register",
  },

  // ── Hero Section ──────────────────────────────────────────────────────────
  heroBadge: {
    es: "Mantenimiento inmobiliario & corporativo · Medellín",
    en: "Property & Corporate Maintenance · Medellín",
  },
  heroTitle1: {
    es: "Mantenimiento inmobiliario, ",
    en: "Property maintenance, ",
  },
  heroTitleHighlight: {
    es: "gestionado de principio a fin.",
    en: "managed from start to finish.",
  },
  heroDesc: {
    es: "Centralizamos reparaciones, mantenimientos locativos y adecuaciones para inmobiliarias, empresas y propietarios en Medellín y Valle de Aburrá, con seguimiento en tiempo real, evidencia fotográfica y respaldo técnico durante todo el proceso.",
    en: "We centralize repairs, locative maintenance and staging for real estate agencies, businesses and homeowners in Medellín and Valle de Aburrá, with real-time tracking, photographic evidence and technical assurance throughout.",
  },
  heroCtaLogin: {
    es: "Ingresar al Sistema",
    en: "Sign In to Platform",
  },
  heroCtaRequest: {
    es: "Solicitar Mantenimiento",
    en: "Request Maintenance",
  },
  heroCtaEmergency: {
    es: "Llamar / WhatsApp Urgencias",
    en: "Call / Emergency WhatsApp",
  },

  // ── 4 Pilares de Confianza ───────────────────────────────────────────────
  pillarTracking: {
    es: "Seguimiento",
    en: "Live Tracking",
  },
  pillarTrackingDesc: {
    es: "De cada solicitud en vivo",
    en: "For every request in real time",
  },
  pillarEvidence: {
    es: "Evidencia",
    en: "Photo Evidence",
  },
  pillarEvidenceDesc: {
    es: "Fotos antes y después",
    en: "Before & after photos",
  },
  pillarStaff: {
    es: "Personal",
    en: "Certified Staff",
  },
  pillarStaffDesc: {
    es: "Calificado y verificado",
    en: "Vetted and insured",
  },
  pillarWarranty: {
    es: "Respaldo",
    en: "Full Warranty",
  },
  pillarWarrantyDesc: {
    es: "Garantía SOSENLINEA",
    en: "SOSENLINEA Guarantee",
  },

  // ── Card Simulación Seguimiento ───────────────────────────────────────────
  cardTrackingBadge: {
    es: "Solicitud en seguimiento",
    en: "Order in progress",
  },
  cardOrderTitle: {
    es: "Mantenimiento Hidrosanitario y Red Eléctrica",
    en: "Hydraulic & Electrical Network Maintenance",
  },
  cardStep1Title: {
    es: "Diagnóstico y cotización realizada",
    en: "Diagnosis & estimate completed",
  },
  cardStep1Sub: {
    es: "Registrado en el sistema centralizado",
    en: "Logged in centralized database",
  },
  cardStep2Title: {
    es: "Aprobación de la inmobiliaria",
    en: "Agency approval confirmed",
  },
  cardStep2Sub: {
    es: "Autorizado con acta de entrega de materiales",
    en: "Authorized with materials handover record",
  },
  cardStep3Title: {
    es: "Ejecución técnica en curso",
    en: "Technical execution in progress",
  },
  cardStep3Sub: {
    es: "Técnico en sitio cargando evidencia fotográfica",
    en: "On-site technician uploading photo evidence",
  },

  // ── Soluciones Section ────────────────────────────────────────────────────
  solutionsBadge: {
    es: "Soluciones Especializadas",
    en: "Specialized Solutions",
  },
  solutionsTitle: {
    es: "Diseñado para resolver los problemas reales de tu operación",
    en: "Engineered to solve the real challenges of your operation",
  },
  solutionsSubtitle: {
    es: "Atendemos los requerimientos de cada actor del ecosistema inmobiliario con procesos claros, tiempos estandarizados y trazabilidad.",
    en: "We serve every stakeholder in the real estate ecosystem with clear workflows, standardized times and accountability.",
  },
  solutionAgenciesTitle: {
    es: "Inmobiliarias",
    en: "Real Estate Agencies",
  },
  solutionAgenciesDesc: {
    es: "Mantenimiento y adecuaciones para propiedades en administración, reparaciones a inquilinos y alistamiento para entrega inmediata.",
    en: "Maintenance and staging for managed properties, tenant repairs and express turnarounds for immediate delivery.",
  },
  solutionOfficesTitle: {
    es: "Empresas & Oficinas",
    en: "Offices & Commercial",
  },
  solutionOfficesDesc: {
    es: "Soporte continuo en mantenimiento preventivo y correctivo para sedes corporativas, locales comerciales y bodegas.",
    en: "Continuous preventive and corrective maintenance support for corporate offices, retail stores and warehouses.",
  },
  solutionHomesTitle: {
    es: "Propietarios y Hogares",
    en: "Homeowners & Private",
  },
  solutionHomesDesc: {
    es: "Soluciones confiables para mantener tu patrimonio en excelentes condiciones, con cotizaciones claras y técnicos certificados.",
    en: "Dependable solutions to keep your property in top condition, with clear estimates and certified technicians.",
  },
  solutionAirbnbTitle: {
    es: "Rentas Cortas / Airbnb",
    en: "Short-Term Rentals / Airbnb",
  },
  solutionAirbnbDesc: {
    es: "Atención oportuna y alistamiento express para que tu propiedad siempre esté 5 estrellas para recibir huéspedes.",
    en: "Timely response and express staging so your rental property is always 5-star ready for incoming guests.",
  },
  solutionLearnMore: {
    es: "Conocer solución",
    en: "Explore solution",
  },

  // ── Servicios Section ─────────────────────────────────────────────────────
  servicesBadge: {
    es: "Portafolio Integral",
    en: "Full Service Catalog",
  },
  servicesTitle: {
    es: "Todo lo que tu inmueble necesita en un solo proveedor",
    en: "Everything your property needs from a single trusted provider",
  },
  servicesSubtitle: {
    es: "Técnicos especialistas en cada rama, coordinados bajo un solo centro de control y con estándares de calidad uniformes.",
    en: "Specialist technicians in each trade, coordinated under one centralized control center with unified quality standards.",
  },

  // ── Metodología / Cómo Funciona ───────────────────────────────────────────
  workflowBadge: {
    es: "Metodología Paso a Paso",
    en: "Step-by-Step Methodology",
  },
  workflowTitle: {
    es: "Cómo transformamos un problema en un reporte resuelto",
    en: "How we turn an issue into a resolved case with evidence",
  },
  workflowSubtitle: {
    es: "Sin llamadas perdidas, sin dudas sobre el costo y con soporte fotográfico en cada etapa del servicio.",
    en: "No missed calls, no surprises on pricing, and photographic documentation at each stage of the job.",
  },
  step1Title: {
    es: "Reporte y Radicación",
    en: "Report & Ticketing",
  },
  step1Desc: {
    es: "Ingreso inmediato de la solicitud en plataforma con categorización por tipo de falla y urgencia.",
    en: "Immediate logging of the request in our system with failure categorization and urgency tier.",
  },
  step2Title: {
    es: "Cotización y Aprobación",
    en: "Quotation & Approval",
  },
  step2Desc: {
    es: "Visita técnica o cotización preliminar transparente con desglose de mano de obra y materiales.",
    en: "On-site inspection or transparent preliminary quote with itemized labor and materials breakdown.",
  },
  step3Title: {
    es: "Ejecución",
    en: "Execution",
  },
  step3Desc: {
    es: "Supervisión de mano de obra y entrega de materiales con control estricto de inventario.",
    en: "Workforce supervision and materials delivery backed by strict inventory logging.",
  },
  step4Title: {
    es: "Evidencia",
    en: "Photo Evidence",
  },
  step4Desc: {
    es: "Documentación fotográfica de antes, durante y después con firma de satisfacción.",
    en: "High-resolution photographic record of before, during, and after with signed customer sign-off.",
  },
  step5Title: {
    es: "Cierre",
    en: "Closing & Warranty",
  },
  step5Desc: {
    es: "Liquidación contable automática, facturación transparente y garantía de servicio activa.",
    en: "Automated billing reconciliation, transparent invoicing, and active written service warranty.",
  },

  // ── Cifras y Cobertura ────────────────────────────────────────────────────
  statYears: {
    es: "+5",
    en: "+5",
  },
  statYearsLabel: {
    es: "Años de Trayectoria",
    en: "Years of Experience",
  },
  statYearsSub: {
    es: "Operación continua en Antioquia",
    en: "Continuous operation across Antioquia",
  },
  statJobs: {
    es: "+12.4K",
    en: "+12.4K",
  },
  statJobsLabel: {
    es: "Servicios Atendidos",
    en: "Completed Services",
  },
  statJobsSub: {
    es: "Mantenimientos y adecuaciones",
    en: "Maintenance and staging jobs",
  },
  statCoverage: {
    es: "100%",
    en: "100%",
  },
  statCoverageLabel: {
    es: "Área Metropolitana",
    en: "Metropolitan Area",
  },
  statCoverageSub: {
    es: "Medellín, Envigado, Sabaneta, Itagüí, Bello",
    en: "Medellín, Envigado, Sabaneta, Itagüí, Bello",
  },
  statSatisfaction: {
    es: "99.2%",
    en: "99.2%",
  },
  statSatisfactionLabel: {
    es: "Satisfacción de Clientes",
    en: "Customer Satisfaction",
  },
  statSatisfactionSub: {
    es: "Encuestas auditadas post-servicio",
    en: "Audited post-service customer surveys",
  },

  // ── Footer Section ────────────────────────────────────────────────────────
  footerBrandDesc: {
    es: "Solución integral para el mantenimiento, reparación y alistamiento de inmuebles en Medellín y municipios del Valle de Aburrá.",
    en: "Comprehensive solution for property maintenance, repair and staging across Medellín and Valle de Aburrá.",
  },
  footerPlatformStatus: {
    es: "● Plataforma Operativa en Línea",
    en: "● Operational Platform Online",
  },
  footerColQuickLinks: {
    es: "Accesos Rápidos",
    en: "Quick Links",
  },
  footerColClients: {
    es: "Área de Clientes",
    en: "Client & Staff Portal",
  },
  footerColContact: {
    es: "Contacto & Soporte",
    en: "Contact & Support",
  },
  footerLinkHome: {
    es: "Inicio",
    en: "Home",
  },
  footerLinkSolutions: {
    es: "Soluciones Inmobiliarias",
    en: "Property Solutions",
  },
  footerLinkServices: {
    es: "Catálogo de Servicios",
    en: "Services Catalog",
  },
  footerLinkHowItWorks: {
    es: "Metodología de Trabajo",
    en: "Work Methodology",
  },
  footerLinkLogin: {
    es: "Ingreso a Plataforma",
    en: "Platform Sign In",
  },
  footerLinkRegisterAgency: {
    es: "Registro de Inmobiliaria",
    en: "Agency Registration",
  },
  footerLinkRegisterProvider: {
    es: "Registro de Proveedor / Técnico",
    en: "Contractor & Tech Registration",
  },
  footerLinkRecoverPass: {
    es: "Recuperar Contraseña",
    en: "Password Recovery",
  },
  footerLocation: {
    es: "Medellín, Antioquia · Colombia",
    en: "Medellín, Antioquia · Colombia",
  },
  footerSchedule: {
    es: "Horario: Lunes a Sábado 7:30 AM - 6:00 PM",
    en: "Hours: Monday to Saturday 7:30 AM - 6:00 PM",
  },
  footerEmergencyLine: {
    es: "Línea de Urgencias 24/7",
    en: "24/7 Emergency Line",
  },
  footerRights: {
    es: "Todos los derechos reservados.",
    en: "All rights reserved.",
  },
  footerSslSecurity: {
    es: "Seguridad SSL 256-bit",
    en: "256-bit SSL Security",
  },
  footerTerms: {
    es: "Términos y Condiciones",
    en: "Terms & Conditions",
  },
  footerPrivacy: {
    es: "Tratamiento de Datos",
    en: "Data Privacy Policy",
  },
  footerSelectLanguageTitle: {
    es: "Idioma del Sitio Web",
    en: "Website Language",
  },
  footerSelectLanguageSub: {
    es: "Selecciona tu idioma de preferencia:",
    en: "Choose your preferred language:",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("sos_preferred_language") as Language;
      if (saved === "es" || saved === "en") return saved;
    } catch {
      // ignore
    }
    return "es";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("sos_preferred_language", lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string, fallback?: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][language]) {
      return TRANSLATIONS[key][language];
    }
    return fallback || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
