import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { DataProvider } from "./context/DataContext";
import { ModuleId } from "./types";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { Breadcrumb } from "./components/layout/Breadcrumb";
import { LoginView } from "./components/auth/LoginView";
import { HomePage } from "./components/home/HomePage";

// Módulos
import { DashboardView } from "./components/modules/dashboard/DashboardView";
import { ReportesView } from "./components/modules/reportes/ReportesView";
import { CotizacionesView } from "./components/modules/cotizaciones/CotizacionesView";
import { LlavesView } from "./components/modules/operaciones/LlavesView";
import { ImpresionesView } from "./components/modules/impresiones/ImpresionesView";
import { AuditLogsView } from "./components/modules/auditoria/AuditLogsView";
import { DatabaseConsoleView } from "./components/modules/database/DatabaseConsoleView";

// Contabilidad
import { MovimientosView } from "./components/modules/contable/MovimientosView";
import { CuentasCobroView } from "./components/modules/contable/CuentasCobroView";
import { NitValidatorView } from "./components/modules/contable/NitValidatorView";
import { BalancesView } from "./components/modules/contable/BalancesView";

// Maestros
import { ContratistasView } from "./components/modules/maestros/ContratistasView";
import { MaterialesView } from "./components/modules/maestros/MaterialesView";
import { ClientesView } from "./components/modules/maestros/ClientesView";
import { SectoresView } from "./components/modules/maestros/SectoresView";
import { HerramientasView } from "./components/modules/operaciones/HerramientasView";

// Operaciones e Informes
import { EntregaMaterialesView } from "./components/modules/operaciones/EntregaMaterialesView";
import {
  InformeDiarioView,
  NovedadesView,
  EncuestasView,
} from "./components/modules/informes/InformesViews";

const MainAppContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");
  const [previousModule, setPreviousModule] = useState<ModuleId>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { canAccessModule, isAuthenticated, isLoading, logout } = useAuth();

  // Pantalla de carga mientras se restaura la sesión del token
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-main)", flexDirection: "column", gap: "1rem",
      }}>
        <span className="spinner" style={{ width: 36, height: 36, borderWidth: 4, borderTopColor: "var(--primary)", borderColor: "var(--neutral-200)" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Cargando sesión…</p>
      </div>
    );
  }

  // Mostrar Home Page con panel superior de login/registro si no está autenticado
  if (!isAuthenticated) {
    return <HomePage onEnterApp={() => setActiveModule("dashboard")} />;
  }

  const handleSelectModule = (mod: ModuleId) => {
    setPreviousModule(activeModule);
    setActiveModule(mod);
  };

  const handleNavigateHome = () => {
    setPreviousModule(activeModule);
    setActiveModule("dashboard");
  };

  const handleBack = () => {
    setActiveModule(previousModule || "dashboard");
  };

  // Renderizado dinámico de la vista activa según permisos y selección
  const renderActiveView = () => {
    if (!canAccessModule(activeModule)) {
      return (
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
          <h2 style={{ color: "var(--danger)", marginBottom: "0.5rem" }}>Acceso Restringido</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Tu rol actual no tiene privilegios para acceder al módulo seleccionado.
          </p>
          <button onClick={handleNavigateHome} className="btn btn-primary">
            Regresar al Panel Principal
          </button>
        </div>
      );
    }

    switch (activeModule) {
      case "dashboard":
        return <DashboardView onNavigate={handleSelectModule} />;

      // Principal
      case "reportes-ordenes":
      case "informes-casos":
      case "informes-agenda":
        return <ReportesView />;

      case "cotizaciones":
        return <CotizacionesView />;

      case "llaves":
        return <LlavesView />;

      case "impresiones":
        return <ImpresionesView />;

      case "auditoria":
        return <AuditLogsView />;

      case "azure-sql-console":
        return <DatabaseConsoleView />;

      // Contable
      case "contable-ingresos":
        return <MovimientosView initialType="Ingreso" />;

      case "contable-egresos":
        return <MovimientosView initialType="Egreso" />;

      case "contable-cuentas-cobro":
        return <CuentasCobroView />;

      case "contable-nit":
        return <NitValidatorView />;

      case "contable-actualizar":
      case "informes-general":
        return <BalancesView />;

      // Maestros
      case "maestros-terceros":
        return <ContratistasView />;

      case "maestros-materiales":
        return <MaterialesView />;

      case "maestros-clientes":
        return <ClientesView />;

      case "maestros-sectores":
        return <SectoresView />;

      case "maestros-herramientas":
      case "operaciones-herramientas":
        return <HerramientasView />;

      // Operaciones & Informes
      case "operaciones-materiales":
        return <EntregaMaterialesView />;

      case "informes-diario":
        return <InformeDiarioView />;

      case "informes-novedades":
        return <NovedadesView />;

      case "informes-encuestas":
        return <EncuestasView />;

      default:
        return <DashboardView onNavigate={handleSelectModule} />;
    }
  };

  return (
    <div className={`app-container ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      <Sidebar
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="main-content">
        <Navbar
          onLogout={logout}
          isSidebarCollapsed={sidebarCollapsed}
          onToggleCollapseSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="page-body">
          <Breadcrumb
            activeModule={activeModule}
            onNavigateHome={handleNavigateHome}
            onBack={activeModule !== "dashboard" ? handleBack : undefined}
          />
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <MainAppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
