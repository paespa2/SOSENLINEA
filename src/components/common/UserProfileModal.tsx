import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "./Modal";
import { DigitalSignatureModal } from "./DigitalSignatureModal";
import { DigitalSignatureData } from "../../types";
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Briefcase,
  Lock,
  Layers,
  Sparkles,
  Server,
  LogOut,
  Clock,
  PenTool,
  Trash2,
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentRole, permissions, updateProfile, changePassword, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"perfil" | "firma" | "seguridad" | "arquitectura">("perfil");
  const [showSigModal, setShowSigModal] = useState(false);

  // Formulario Perfil
  const [nombre, setNombre] = useState(currentUser?.name || "");
  const [cargo, setCargo] = useState(currentUser?.cargo || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [telefono, setTelefono] = useState(currentUser?.telefono || "300 456 7890");
  const [perfilLoading, setPerfilLoading] = useState(false);
  const [perfilMsg, setPerfilMsg] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  // Formulario Contraseña
  const [currPassword, setCurrPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmNextPassword, setConfirmNextPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setNombre(currentUser.name || "");
      setCargo(currentUser.cargo || "");
      setEmail(currentUser.email || "");
      setTelefono(currentUser.telefono || "300 456 7890");
    }
  }, [currentUser]);

  // Cálculo de fuerza de contraseña
  const passwordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 5
  };

  const strength = passwordStrength(nextPassword);

    const handleSaveSignature = async (sigData: DigitalSignatureData) => {
    await updateProfile({
      name: currentUser?.name || '',
      firmaDigital: sigData.firmaUrl,
    });
    setPerfilMsg({ tipo: 'success', texto: 'Firma digital registrada y vinculada a tu perfil exitosamente.' });
    setTimeout(() => setPerfilMsg(null), 3500);
  };

  const handleClearSignature = async () => {
    if (window.confirm('¿Deseas eliminar tu firma digital guardada de este dispositivo?')) {
      await updateProfile({
        name: currentUser?.name || '',
        firmaDigital: '',
      });
      setPerfilMsg({ tipo: 'success', texto: 'Firma digital eliminada.' });
      setTimeout(() => setPerfilMsg(null), 3000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPerfilLoading(true);
    setPerfilMsg(null);
    try {
      const res = await updateProfile({
        name: nombre,
        cargo,
        email,
        telefono,
      });
      setPerfilMsg({ tipo: "success", texto: res.message });
      setTimeout(() => setPerfilMsg(null), 3500);
    } catch (err) {
      setPerfilMsg({ tipo: "error", texto: err instanceof Error ? err.message : "Error al guardar perfil." });
    } finally {
      setPerfilLoading(false);
    }
  };

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg(null);

    if (nextPassword.length < 6) {
      setPassMsg({ tipo: "error", texto: "La nueva contraseña debe tener mínimo 6 caracteres." });
      setPassLoading(false);
      return;
    }
    if (nextPassword !== confirmNextPassword) {
      setPassMsg({ tipo: "error", texto: "Las contraseñas nuevas no coinciden." });
      setPassLoading(false);
      return;
    }

    try {
      await changePassword(currPassword, nextPassword);
      setPassMsg({ tipo: "success", texto: "¡Contraseña actualizada exitosamente!" });
      setCurrPassword("");
      setNextPassword("");
      setConfirmNextPassword("");
      setTimeout(() => setPassMsg(null), 4000);
    } catch (err) {
      setPassMsg({ tipo: "error", texto: err instanceof Error ? err.message : "Error al cambiar contraseña." });
    } finally {
      setPassLoading(false);
    }
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SO";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      badge={currentRole.toUpperCase()}
      title="Perfil de Usuario"
      subtitle="Credenciales, firma digital y preferencias del sistema"
      maxWidth="620px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Cabecera del Usuario con Avatar y Sello Digital */}
        <div
          style={{
            padding: "1rem",
            background: "linear-gradient(135deg, rgba(30,58,138,0.08) 0%, rgba(8,145,178,0.08) 100%)",
            border: "1px solid rgba(8,145,178,0.25)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "1.1rem",
                boxShadow: "0 4px 12px rgba(30,58,138,0.25)",
              }}
            >
              {initials}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-main)" }}>
                {currentUser?.name || "Usuario del Sistema"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>{currentUser?.cargo || "Personal Autorizado"}</span>
                <span>•</span>
                <span
                  style={{
                    background: currentRole === "admin" ? "#1e3a8a" : "#0891b2",
                    color: "#fff",
                    padding: "0.1rem 0.45rem",
                    borderRadius: "4px",
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    textTransform: "uppercase",
                  }}
                >
                  Rol: {currentRole}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Sello Digital Activo:</div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "#0891b2",
                fontWeight: 800,
                background: "rgba(8,145,178,0.1)",
                padding: "0.15rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid rgba(8,145,178,0.25)",
                marginTop: "0.15rem",
              }}
            >
              {currentUser?.selloDigital || "SOS-SIG-SESSION"}
            </div>
          </div>
        </div>

        {/* Selector de Pestañas */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setActiveTab("perfil")}
            style={{
              padding: "0.5rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: activeTab === "perfil" ? 800 : 600,
              color: activeTab === "perfil" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === "perfil" ? "2px solid var(--primary)" : "2px solid transparent",
              background: "transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <User size={14} />
            Datos Personales
          </button>

                    <button
            type="button"
            onClick={() => setActiveTab("firma")}
            style={{
              padding: "0.5rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: activeTab === "firma" ? 800 : 600,
              color: activeTab === "firma" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === "firma" ? "2px solid var(--primary)" : "2px solid transparent",
              background: "transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <PenTool size={14} />
            <span>Firma Digital</span>
            {currentUser?.firmaDigital && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("seguridad")}
            style={{
              padding: "0.5rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: activeTab === "seguridad" ? 800 : 600,
              color: activeTab === "seguridad" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === "seguridad" ? "2px solid var(--primary)" : "2px solid transparent",
              background: "transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <KeyRound size={14} />
            Cambiar Contraseña
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("arquitectura")}
            style={{
              padding: "0.5rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: activeTab === "arquitectura" ? 800 : 600,
              color: activeTab === "arquitectura" ? "#0891b2" : "var(--text-muted)",
              borderBottom: activeTab === "arquitectura" ? "2px solid #0891b2" : "2px solid transparent",
              background: "transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <Server size={14} />
            Seguridad & 2 Bases de Datos
          </button>
        </div>

        {/* TAB 1: DATOS PERSONALES */}
        {activeTab === "perfil" && (
          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {perfilMsg && (
              <div
                style={{
                  padding: "0.6rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: perfilMsg.tipo === "success" ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
                  color: perfilMsg.tipo === "success" ? "#16a34a" : "#dc2626",
                  border: perfilMsg.tipo === "success" ? "1px solid rgba(22,163,74,0.3)" : "1px solid rgba(220,38,38,0.3)",
                }}
              >
                {perfilMsg.tipo === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{perfilMsg.texto}</span>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: "0.75rem" }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field"
                  style={{ fontSize: "0.825rem" }}
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: "0.75rem" }}>
                  Cargo / Rol Operativo
                </label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ej. Coordinador de Operaciones"
                  className="input-field"
                  style={{ fontSize: "0.825rem" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: "0.75rem" }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ fontSize: "0.825rem" }}
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: "0.75rem" }}>
                  Teléfono / WhatsApp Corporativo
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="input-field"
                  style={{ fontSize: "0.825rem" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={perfilLoading || !nombre.trim()}
                className="btn btn-primary btn-sm"
                style={{ background: "#1e3a8a" }}
              >
                {perfilLoading ? "Guardando..." : "Guardar Cambios de Perfil"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CAMBIAR CONTRASEÑA */}
        {activeTab === "seguridad" && (
          <form onSubmit={handleChangePass} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {passMsg && (
              <div
                style={{
                  padding: "0.6rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: passMsg.tipo === "success" ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
                  color: passMsg.tipo === "success" ? "#16a34a" : "#dc2626",
                  border: passMsg.tipo === "success" ? "1px solid rgba(22,163,74,0.3)" : "1px solid rgba(220,38,38,0.3)",
                }}
              >
                {passMsg.tipo === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{passMsg.texto}</span>
              </div>
            )}

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label" style={{ fontSize: "0.75rem" }}>
                Contraseña Actual *
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={currPassword}
                onChange={(e) => setCurrPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                className="input-field"
                style={{ fontSize: "0.825rem" }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="input-group" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="input-label" style={{ fontSize: "0.75rem" }}>
                    Nueva Contraseña *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ background: "none", border: "none", color: "#0891b2", fontSize: "0.7rem", cursor: "pointer" }}
                  >
                    {showPass ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={nextPassword}
                  onChange={(e) => setNextPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="input-field"
                  style={{ fontSize: "0.825rem" }}
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: "0.75rem" }}>
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmNextPassword}
                  onChange={(e) => setConfirmNextPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="input-field"
                  style={{ fontSize: "0.825rem" }}
                  required
                />
              </div>
            </div>

            {/* Medidor visual de seguridad */}
            {nextPassword && (
              <div style={{ padding: "0.5rem 0.75rem", background: "var(--neutral-50)", borderRadius: "6px", border: "1px solid var(--neutral-200)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                  <span>Seguridad de la clave:</span>
                  <span style={{ color: strength <= 2 ? "#dc2626" : strength <= 3 ? "#d97706" : "#16a34a" }}>
                    {strength <= 2 ? "Débil" : strength <= 3 ? "Aceptable" : "Excelente y Robusta"}
                  </span>
                </div>
                <div style={{ height: "4px", background: "var(--neutral-200)", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(strength / 5) * 100}%`,
                      background: strength <= 2 ? "#dc2626" : strength <= 3 ? "#d97706" : "#16a34a",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={passLoading || !currPassword || !nextPassword || !confirmNextPassword}
                className="btn btn-primary btn-sm"
                style={{ background: "#0891b2" }}
              >
                {passLoading ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ARQUITECTURA DE 2 BASES DE DATOS & SEGURIDAD */}
        {activeTab === "arquitectura" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8rem", color: "var(--text-main)" }}>
            <div
              style={{
                padding: "0.85rem",
                background: "rgba(8,145,178,0.06)",
                border: "1px solid rgba(8,145,178,0.25)",
                borderRadius: "8px",
              }}
            >
              <div style={{ fontWeight: 800, color: "#0891b2", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem" }}>
                <Shield size={16} />
                Aislamiento de Seguridad: 2 Bases de Datos Separadas
              </div>
              <p style={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.4, margin: 0 }}>
                Para blindar la información empresarial de SOSENLINEA y permitir revocar accesos en tiempo real sin riesgo de fuga o pérdida de expedientes, el sistema opera con dos capas independientes:
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div style={{ padding: "0.75rem", background: "var(--neutral-50)", borderRadius: "6px", border: "1px solid var(--neutral-200)" }}>
                <div style={{ fontWeight: 800, fontSize: "0.8rem", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.25rem" }}>
                  <Server size={14} />
                  BD 1: Operativa Empresarial
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Aloja reportes locativos, sub-cotizaciones, agenda de cuadrillas, inventarios, llaves y contabilidad. Cero claves guardadas aquí.
                </div>
              </div>

              <div style={{ padding: "0.75rem", background: "var(--neutral-50)", borderRadius: "6px", border: "1px solid var(--neutral-200)" }}>
                <div style={{ fontWeight: 800, fontSize: "0.8rem", color: "#0891b2", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.25rem" }}>
                  <Lock size={14} />
                  BD 2: Identidad & Accesos (Auth)
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Aloja hashes criptográficos, tokens JWT y revocación de sesiones. Si un usuario es desactivado, su acceso se corta al instante.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--neutral-200)", paddingTop: "0.75rem" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Sesión iniciada como: <strong>{currentUser?.name}</strong>
              </span>

              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="btn btn-secondary btn-sm"
                style={{ color: "#dc2626", borderColor: "rgba(220,38,38,0.3)", display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <LogOut size={13} />
                Cerrar Sesión Activa
              </button>
            </div>
          </div>
        )}
      </div>
    
      {showSigModal && (
        <DigitalSignatureModal
          isOpen={showSigModal}
          onClose={() => setShowSigModal(false)}
          onSaveSignature={handleSaveSignature}
          defaultUserName={currentUser?.name || ''}
          defaultRole={currentRole}
          savedDefaultSignature={currentUser?.firmaDigital}
        />
      )}

    </Modal>
  );
};
