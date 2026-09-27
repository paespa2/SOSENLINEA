import React, { useState } from "react";
import { ModuleId, ModuleCategory } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import {
  LayoutDashboard,
  Database,
  FileSpreadsheet,
  Calculator,
  Key,
  Printer,
  History,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  FileCheck2,
  Receipt,
  Users2,
  Boxes,
  UserCheck,
  MapPin,
  Wrench,
  Calendar,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  CalendarDays,
  Star,
  PackageCheck,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Lock as LockIcon,
  X,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  badge?: number;
}

interface NavSection {
  title: string;
  category: ModuleCategory;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed = false,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { canAccessModule, currentUser, currentRole } = useAuth();
  const { reportes, novedades, cuentasCobro, llaves } = useData();

  // Badges calculados en vivo para el Menú Principal
  const pendingReportes = reportes.filter((r) => r.estado === "Cotizado" || r.estado === "Borrador" || r.estado === "En Progreso" || r.estado === "En Revisión").length;
  const openNovedades = novedades.filter((n) => n.estado === "Abierto" || n.estado === "En Proceso").length;
  const pendingCuentas = cuentasCobro.filter((c) => c.estado === "Pendiente").length;
  const llavesPrestadas = llaves.filter((k) => k.estado === "Prestada").length;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    principal: true, // Enfocados exclusivamente en Menú Principal según solicitud
    contable: false,
    maestros: false,
    informes: false,
    operaciones: false,
  });

  const toggleSection = (cat: string) => {
    setExpandedSections((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleItemClick = (modId: ModuleId) => {
    if (!canAccessModule(modId)) return;
    onSelectModule(modId);
    if (onCloseMobile) onCloseMobile();
  };

  const menuSections: NavSection[] = [
    {
      title: "1. MENÚ PRINCIPAL",
      category: "principal",
      items: [
        { id: "dashboard", label: "Panel Principal", icon: LayoutDashboard },
        { id: "reportes-ordenes", label: "Órdenes y Reportes", icon: FileSpreadsheet, badge: pendingReportes },
        { id: "cotizaciones", label: "Cotizaciones y Presupuestos", icon: Calculator },
        { id: "llaves", label: "Llaves (Gestión Activos)", icon: Key, badge: llavesPrestadas },
        { id: "impresiones", label: "Impresiones y Documentos", icon: Printer },
        { id: "auditoria", label: "Registro de Auditoría", icon: History },
        { id: "azure-sql-console", label: "Consola de Base de Datos", icon: Database },
      ],
    },
    {
      title: "2. MENÚ CONTABLE",
      category: "contable",
      items: [
        { id: "contable-ingresos", label: "C Ingreso (Recibos)", icon: TrendingUp },
        { id: "contable-egresos", label: "Control de Egresos", icon: TrendingDown },
        { id: "contable-cuentas-cobro", label: "Cuenta Cobro (Facturas)", icon: Receipt, badge: pendingCuentas },
        { id: "contable-nit", label: "Actualización NIT (DIAN)", icon: FileCheck2 },
        { id: "contable-actualizar", label: "Actualizar / Balances", icon: RefreshCw },
      ],
    },
    {
      title: "3. MENÚ MAESTROS",
      category: "maestros",
      items: [
        { id: "maestros-terceros", label: "Contratistas, Proveedores", icon: Users2 },
        { id: "maestros-materiales", label: "Materiales e Insumos", icon: Boxes },
        { id: "maestros-clientes", label: "Reg Clientes / Propietarios", icon: UserCheck },
        { id: "maestros-sectores", label: "Sectores y Rutas", icon: MapPin },
        { id: "maestros-herramientas", label: "Grupo Herramientas", icon: Wrench },
      ],
    },
    {
      title: "4. MENÚ INFORMES",
      category: "informes",
      items: [
        { id: "informes-agenda", label: "Informe x Agenda", icon: Calendar },
        { id: "informes-novedades", label: "Informe por Novedades", icon: AlertTriangle, badge: openNovedades },
        { id: "informes-general", label: "Informe General", icon: BarChart3 },
        { id: "informes-casos", label: "Informe Casos", icon: ClipboardList },
        { id: "informes-diario", label: "Informe Diario", icon: CalendarDays },
        { id: "informes-encuestas", label: "Encuestas de Servicio", icon: Star },
      ],
    },
    {
      title: "5. OPERACIONES CAMPO",
      category: "operaciones",
      items: [
        { id: "operaciones-herramientas", label: "Registro Herramientas", icon: Wrench },
        { id: "operaciones-materiales", label: "Entrega Materiales", icon: PackageCheck },
      ],
    },
  ];

  const sidebarContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: isCollapsed ? "1rem 0.4rem" : "1.25rem 0.75rem 2rem 0.75rem",
      }}
    >
      {/* Botón cerrar si es vista móvil */}
      {isOpenMobile && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", padding: "0 0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={18} color="#60a5fa" />
            <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#ffffff" }}>SOSENLINEA</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="btn btn-secondary btn-xs"
            style={{ padding: "0.3rem 0.5rem" }}
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Identificador de Usuario en la cabecera del Sidebar */}
      {!isCollapsed && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "0.65rem 0.75rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: currentRole === "admin" ? "#2563eb" : "#0d9488",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 800,
            }}
          >
            {currentUser?.name?.charAt(0) || "U"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentUser?.name || "Usuario"}
            </div>
            <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
              {currentRole === "admin" ? "Administrador Activo" : "Auxiliar Administrativo"}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Secciones y Menús */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {menuSections.map((section) => {
          const isPrincipal = section.category === "principal";
          const isExpanded = isCollapsed ? false : expandedSections[section.category];

          // En modo colapsado, mostramos los items directamente con tooltip
          if (isCollapsed) {
            return (
              <div key={section.category} style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {section.items.map((item) => {
                  const hasAccess = canAccessModule(item.id);
                  const isActive = activeModule === item.id;
                  const IconComponent = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      disabled={!hasAccess}
                      title={`${item.label} ${item.badge ? `(${item.badge})` : ""}`}
                      style={{
                        width: "100%",
                        height: "44px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "10px",
                        border: "none",
                        cursor: hasAccess ? "pointer" : "not-allowed",
                        position: "relative",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.15) 100%)"
                          : "transparent",
                        color: isActive ? "#60a5fa" : hasAccess ? "#cbd5e1" : "#475569",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <IconComponent size={20} />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#ef4444",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={section.category} style={{ marginBottom: isPrincipal ? "1rem" : "0.75rem" }}>
              {/* Encabezado de Sección */}
              <button
                type="button"
                onClick={() => toggleSection(section.category)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.45rem 0.65rem",
                  background: isPrincipal ? "rgba(59, 130, 246, 0.08)" : "transparent",
                  borderRadius: "6px",
                  border: isPrincipal ? "1px solid rgba(59, 130, 246, 0.2)" : "none",
                  cursor: "pointer",
                  color: isPrincipal ? "#93c5fd" : "#94a3b8",
                  fontSize: "0.725rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  transition: "all 0.15s",
                }}
              >
                <span>{section.title}</span>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {/* Items de Navegación */}
              {isExpanded && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", marginTop: "0.3rem" }}>
                  {section.items.map((item) => {
                    const hasAccess = canAccessModule(item.id);
                    const isActive = activeModule === item.id;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item.id)}
                        disabled={!hasAccess}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.55rem 0.75rem",
                          borderRadius: "8px",
                          border: "none",
                          fontSize: "0.815rem",
                          fontWeight: isActive ? 700 : 500,
                          textAlign: "left",
                          cursor: hasAccess ? "pointer" : "not-allowed",
                          transition: "all 0.15s ease",
                          background: isActive
                            ? "linear-gradient(90deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.1) 100%)"
                            : "transparent",
                          color: isActive
                            ? "#60a5fa"
                            : hasAccess
                            ? "#cbd5e1"
                            : "#475569",
                          borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", overflow: "hidden" }}>
                          <IconComponent
                            size={16}
                            style={{
                              flexShrink: 0,
                              color: isActive ? "#60a5fa" : hasAccess ? "#94a3b8" : "#475569",
                            }}
                          />
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.label}
                          </span>
                        </div>

                        {/* Badges o Candado si no tiene acceso */}
                        {!hasAccess ? (
                          <LockIcon size={12} style={{ color: "#475569" }} />
                        ) : item.badge !== undefined && item.badge > 0 ? (
                          <span
                            style={{
                              background: "#ef4444",
                              color: "#ffffff",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              borderRadius: "9999px",
                              padding: "0.1rem 0.45rem",
                              lineHeight: 1.2,
                            }}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón de contraer/expandir al pie del Sidebar */}
      {onToggleCollapse && (
        <div style={{ paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "space-between",
              padding: "0.5rem 0.75rem",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              color: "#94a3b8",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {!isCollapsed && <span>Contraer Menú</span>}
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Sidebar Desktop (normal o colapsado) */}
      <aside
        className={`sidebar no-print ${isCollapsed ? "sidebar-collapsed" : ""}`}
        style={{
          width: isCollapsed ? "72px" : "270px",
          height: "calc(100vh - 64px)",
          background: "var(--bg-sidebar)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          userSelect: "none",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          flexShrink: 0,
        }}
      >
        {sidebarContent}
      </aside>

      {/* 2. Drawer Móvil con Backdrop */}
      {isOpenMobile && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
            display: "flex",
          }}
        >
          <div
            className="sidebar-mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "285px",
              maxWidth: "85vw",
              height: "100vh",
              background: "var(--bg-sidebar)",
              boxShadow: "4px 0 24px rgba(0, 0, 0, 0.5)",
              overflowY: "auto",
              animation: "slideInLeft 0.25s ease-out both",
            }}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
