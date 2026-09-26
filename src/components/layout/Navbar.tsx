import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
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
  const { currentUser, currentRole, permissions, changePassword } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [currPassword, setCurrPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmNextPassword, setConfirmNextPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);

  // Iniciales del nombre
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
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
        {/* Botón hamburguesa móvil */}
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
          title="Menú de Navegación"
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>

        {/* Botón colapsar / expandir sidebar para desktop */}
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
          title={isSidebarCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
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
              SOSENLINEA <span style={{ color: "#3b82f6", fontWeight: 500, fontSize: "0.75rem" }}>CLOUD</span>
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
              Sistema Sincronizado y Operativo
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{ flex: 1, maxWidth: "420px", margin: "0 2rem" }}>
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
            placeholder="Buscar por NIT, Orden, Inmueble, Contratista o Comprobante..."
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.85rem 0.5rem 2.25rem",
              fontSize: "0.825rem",
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
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>

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

        {/* Botón Cambiar Contraseña */}
        <button
          onClick={() => {
            setShowModal(true);
            setModalError("");
            setModalSuccess(false);
            setCurrPassword("");
            setNextPassword("");
            setConfirmNextPassword("");
          }}
          className="btn btn-secondary btn-sm"
          title="Cambiar mi contraseña"
          style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
        >
          <KeyRound size={13} />
          <span>Clave</span>
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="btn"
            title="Cerrar sesión"
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

      {/* ── Modal de Cambio de Contraseña ── */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => !modalLoading && setShowModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "420px",
              width: "100%",
              padding: "1.5rem",
              position: "relative",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(37, 99, 235, 0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <KeyRound size={18} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
                  Cambiar Contraseña
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.2rem" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Actualiza la clave de acceso para tu cuenta actual (<strong>{currentUser?.name}</strong>).
            </p>

            {modalError && (
              <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <AlertCircle size={15} />
                <span style={{ fontSize: "0.8rem" }}>{modalError}</span>
              </div>
            )}

            {modalSuccess ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <CheckCircle2 size={40} color="#10b981" style={{ margin: "0 auto 0.5rem auto" }} />
                <h4 style={{ fontWeight: 800, marginBottom: "0.25rem" }}>¡Contraseña Actualizada!</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  Tu contraseña ha sido cambiada correctamente en el sistema.
                </p>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%" }}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setModalError("");
                  if (nextPassword.length < 6) {
                    setModalError("La nueva contraseña debe tener mínimo 6 caracteres.");
                    return;
                  }
                  if (nextPassword !== confirmNextPassword) {
                    setModalError("Las nuevas contraseñas no coinciden.");
                    return;
                  }
                  setModalLoading(true);
                  try {
                    await changePassword(currPassword, nextPassword);
                    setModalSuccess(true);
                  } catch (err) {
                    setModalError(err instanceof Error ? err.message : "Error al cambiar contraseña.");
                  } finally {
                    setModalLoading(false);
                  }
                }}
                style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
              >
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Contraseña Actual</label>
                  <input
                    type={showPass ? "text" : "password"}
                    className="input-field"
                    style={{ width: "100%", marginTop: "0.25rem", padding: "0.45rem 0.65rem" }}
                    placeholder="Ingresa tu contraseña actual"
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Nueva Contraseña</label>
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.7rem", cursor: "pointer" }}
                    >
                      {showPass ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    className="input-field"
                    style={{ width: "100%", marginTop: "0.25rem", padding: "0.45rem 0.65rem" }}
                    placeholder="Mínimo 6 caracteres"
                    value={nextPassword}
                    onChange={(e) => setNextPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Confirmar Nueva Contraseña</label>
                  <input
                    type={showPass ? "text" : "password"}
                    className="input-field"
                    style={{ width: "100%", marginTop: "0.25rem", padding: "0.45rem 0.65rem" }}
                    placeholder="Repite la nueva contraseña"
                    value={confirmNextPassword}
                    onChange={(e) => setConfirmNextPassword(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary btn-sm"
                    disabled={modalLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={modalLoading || !currPassword || !nextPassword || !confirmNextPassword}
                  >
                    {modalLoading ? "Guardando…" : "Actualizar Contraseña"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
