import React from "react";
import { ModuleId } from "../../types";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";

interface BreadcrumbProps {
  activeModule: ModuleId;
  onNavigateHome: () => void;
  onBack?: () => void;
}

const MODULE_TITLES: Record<ModuleId, { section: string; title: string }> = {
  dashboard: { section: "Principal", title: "Panel Principal & KPIs" },
  "reportes-ordenes": { section: "Principal", title: "Órdenes de Trabajo y Reportes" },
  cotizaciones: { section: "Principal", title: "Cotizaciones & Presupuestos" },
  llaves: { section: "Principal", title: "Custodia y Gestión de Llaves" },
  impresiones: { section: "Principal", title: "Centro de Impresiones & Documentos" },
  auditoria: { section: "Principal", title: "Trazabilidad y Auditoría" },
  "azure-sql-console": { section: "Base de Datos", title: "Consola de Base de Datos" },
  "contable-ingresos": { section: "Contabilidad", title: "Cuentas de Ingreso & Recibos" },
  "contable-egresos": { section: "Contabilidad", title: "Cuentas de Egreso" },
  "contable-cuentas-cobro": { section: "Contabilidad", title: "Cuentas de Cobro & Facturas" },
  "contable-nit": { section: "Contabilidad", title: "Validador NIT & Dígito de Verificación (DIAN)" },
  "contable-actualizar": { section: "Contabilidad", title: "Sincronización y Balances" },
  "maestros-terceros": { section: "Maestros", title: "Contratistas, Proveedores y Terceros" },
  "maestros-materiales": { section: "Maestros", title: "Catálogo de Materiales e Insumos" },
  "maestros-clientes": { section: "Maestros", title: "Registro de Clientes y Arrendatarios" },
  "maestros-sectores": { section: "Maestros", title: "Sectores y Rutas de Operación" },
  "maestros-herramientas": { section: "Maestros", title: "Catálogo y Grupos de Herramientas" },
  "informes-agenda": { section: "Informes", title: "Informe por Agenda" },
  "informes-novedades": { section: "Informes", title: "Informe por Novedades & Alertas" },
  "informes-general": { section: "Informes", title: "Informe General Consolidado" },
  "informes-casos": { section: "Informes", title: "Informe de Casos" },
  "informes-diario": { section: "Informes", title: "Informe Diario de Operaciones" },
  "informes-encuestas": { section: "Informes", title: "Encuestas de Satisfacción" },
  "operaciones-herramientas": { section: "Campo", title: "Asignación y Préstamo de Herramientas" },
  "operaciones-materiales": { section: "Campo", title: "Entrega de Materiales en Obra" },
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ activeModule, onNavigateHome, onBack }) => {
  const current = MODULE_TITLES[activeModule] || { section: "Módulo", title: activeModule };

  return (
    <div
      className="no-print"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: "1.25rem",
        marginBottom: "1.25rem",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <button
          onClick={onNavigateHome}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontWeight: 600,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
        >
          <Home size={15} />
          <span>Inicio</span>
        </button>

        <ChevronRight size={14} color="var(--neutral-400)" />
        <span style={{ fontWeight: 600, color: "var(--neutral-500)" }}>{current.section}</span>
        <ChevronRight size={14} color="var(--neutral-400)" />
        <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{current.title}</span>
      </div>

      {activeModule !== "dashboard" && onBack && (
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Volver al Menú</span>
        </button>
      )}
    </div>
  );
};
