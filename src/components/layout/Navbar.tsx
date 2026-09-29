import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserProfileModal } from "../common/UserProfileModal";
import {
  Database,
  Search,
  LogOut,
  Shield,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface NavbarProps {
  onSearchChange?: (val: string) => void;
  onLogout?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapseSidebar?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchChange,
  onLogout,
  isSidebarCollapsed = false,
  onToggleCollapseSidebar,
  onToggleMobileMenu,
}) => {
  const { currentUser, currentRole, permissions, effectiveRole, simulatedRole, setSimulatedRole } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Iniciales del nombre
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      {/* BARRA DEV PARA PAESPA: SIMULACION DE ROLES 2026-2027 */}
      {currentUser?.role === "desarrollador" && (
        <div style={{
          background: "#0f172a",
          color: "#f8fafc",
          borderBottom: "1px solid #7c3aed",
          padding: "0.35rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.75rem",
          fontWeight: 500,
          zIndex: 60,
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ height: "8px", width: "8px", borderRadius: "50%", background: "#a855f7", display: "inline-block", boxShadow: "0 0 6px #a855f7" }} />
            <strong style={{ color: "#c084fc", letterSpacing: "0.02em" }}>MODO AUDITORIA DEV (2026-2027)</strong>
            <span style={{ color: "#475569" }}>|</span>
            <span style={{ color: "#94a3b8" }}>Conectado: <strong style={{ color: "#34d399" }}>paespa</strong></span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "#cbd5e1" }}>Visualizar como:</span>
            <select
              value={simulatedRole || "desarrollador"}
              onChange={(e) => {
                const val = e.target.value;
                setSimulatedRole(val === "desarrollador" ? null : (val as any));
              }}
              style={{
                background: "#1e293b",
                border: "1px solid #475569",
                color: "#fff",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "0.75rem",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="desarrollador">Desarrollador (Control Total)</option>
              <option value="admin">Administrativo (Finanzas & Op)</option>
              <option value="auxiliar">Auxiliar (Almacen & Materiales)</option>
              <option value="usuario">Cliente (Aislamiento BOLA/IDOR)</option>
              <option value="campo">Tecnico de Campo</option>
            </select>

            <span style={{
              background: simulatedRole ? "#b45309" : "#6b21a8",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "0.7rem",
              textTransform: "uppercase"
            }}>
              Rol Activo: {effectiveRole}
            </span>
          </div>
        </div>
      )}
    <header
      className="no-print navbar-header"
      style={{
        height: "64px",
        background: "var(--bg-navbar)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.25rem",
        zIndex: 50,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Brand & Database Status & Toggle Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        {/* BotÃ³n hamburguesa mÃ³vil */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="btn btn-secondary btn-sm navbar-mobile-menu-btn"
          style={{
            padding: "0.45rem",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="MenÃº de NavegaciÃ³n"
          aria-label="Abrir menÃº"
        >
          <Menu size={18} />
        </button>

        {/* BotÃ³n colapsar / expandir sidebar para desktop */}
        <button
          type="button"
          onClick={onToggleCollapseSidebar}
          className="btn btn-secondary btn-sm navbar-collapse-btn"
          style={{
            padding: "0.45rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={isSidebarCollapsed ? "Expandir menÃº lateral" : "Contraer menÃº lateral"}
          aria-label="Alternar barra lateral"
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 2px 8px rgba(30, 58, 138, 0.3)",
              flexShrink: 0,
            }}
          >
            <Database size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em", color: "var(--primary)" }}>
              SOSENLINEA <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.75rem" }}>SUPABASE</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "inline-block",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
              🟢 Supabase Cloud Activo
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{ flex: 1, minWidth: "150px", maxWidth: "380px", margin: "0 0.85rem" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              color: "var(--neutral-400)",
            }}
          />
          <input
            type="text"
            placeholder="Buscar por NIT, Orden, Inmueble, Contratista..."
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.45rem 0.75rem 0.45rem 2.2rem",
              fontSize: "0.8rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              background: "var(--neutral-50)",
              outline: "none",
              color: "var(--text-main)",
            }}
          />
        </div>
      </div>

      {/* Right Controls: Rol + User + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexShrink: 0 }}>

        {/* Role Badge (read-only, viene del JWT) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "var(--neutral-50)",
            padding: "0.3rem 0.75rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
          }}
        >
          <Shield size={14} style={{ color: permissions.color }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: permissions.color }}>
            {permissions.label}
          </span>
        </div>

        {/* User Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            {initials}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.825rem", fontWeight: 700, color: "var(--text-main)" }}>
              {currentUser?.name}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              {currentRole}
            </span>
          </div>
        </div>

        {/* BotÃ³n Mi Perfil & Seguridad */}
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-secondary btn-sm"
          title="Ver y editar mi perfil, cargo o contraseÃ±a"
          style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
        >
          <KeyRound size={13} color="#0891b2" />
          <span>Mi Perfil</span>
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="btn"
            title="Cerrar sesiÃ³n"
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.4rem 0.85rem", fontSize: "0.8rem",
              color: "var(--danger)", border: "1px solid var(--danger-light)",
              background: "var(--danger-light)", borderRadius: "var(--radius-md)",
            }}
          >
            <LogOut size={14} />
            Salir
          </button>
        )}
      </div>

      {/* â”€â”€ Modal Completo de GestiÃ³n de Perfil de Usuario â”€â”€ */}
      <UserProfileModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </header>
    </>
  );
};

