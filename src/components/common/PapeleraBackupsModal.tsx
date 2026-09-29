import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { PapeleraItem } from "../../types";
import {
  Archive,
  RotateCcw,
  Trash2,
  X,
  Calendar,
  User,
  ShieldCheck,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface PapeleraBackupsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PapeleraBackupsModal: React.FC<PapeleraBackupsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { papelera, restoreFromPapelera, clearPapelera } = useData();
  const [restoredMsg, setRestoredMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRestore = (item: PapeleraItem) => {
    restoreFromPapelera(item.id);
    setRestoredMsg(`¡Registro "${item.titulo}" restaurado con éxito!`);
    setTimeout(() => setRestoredMsg(null), 3000);
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(papelera, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SOS_Seguridad_Papelera_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
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
          maxWidth: "720px",
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
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
                background: "rgba(16, 185, 129, 0.2)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Archive size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                Papelera de Seguridad & Copias de Respaldo
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", opacity: 0.8 }}>
                Protección contra eliminación accidental — {papelera.length} registros respaldados
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {papelera.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: "0.75rem",
                  padding: "0.35rem 0.65rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                }}
                title="Descargar copia de seguridad JSON"
              >
                <Download size={13} /> Exportar Backup JSON
              </button>
            )}
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
        </div>

        {/* Notificación de restauración */}
        {restoredMsg && (
          <div
            style={{
              background: "#d1fae5",
              color: "#065f46",
              padding: "0.65rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderBottom: "1px solid #a7f3d0",
            }}
          >
            <CheckCircle size={16} /> {restoredMsg}
          </div>
        )}

        {/* Lista de Registros Respaldados */}
        <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 }}>
          {papelera.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                color: "var(--text-muted, #64748b)",
              }}
            >
              <Archive size={42} style={{ opacity: 0.35, marginBottom: "0.75rem" }} />
              <h4 style={{ margin: "0 0 0.35rem 0", color: "var(--text-main, #0f172a)" }}>
                La papelera de seguridad está vacía
              </h4>
              <p style={{ margin: 0, fontSize: "0.85rem" }}>
                Todos tus registros activos están protegidos y persistidos íntegramente.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {papelera.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "var(--bg-main, #f8fafc)",
                    border: "1px solid var(--border-color, #e2e8f0)",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "999px",
                          background: "#fee2e2",
                          color: "#991b1b",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.entidad}
                      </span>
                      <strong style={{ fontSize: "0.95rem", color: "var(--text-main, #0f172a)" }}>
                        {item.titulo}
                      </strong>
                    </div>

                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted, #64748b)", marginBottom: "0.4rem" }}>
                      {item.resumen}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted, #64748b)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Calendar size={12} /> {item.fechaEliminacion}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <User size={12} /> Por: {item.eliminadoPor}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#2563eb", fontWeight: 600 }}>
                        <ShieldCheck size={12} /> OTP: {item.otpVerificado}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => handleRestore(item)}
                      className="btn btn-primary btn-sm"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.8rem",
                        padding: "0.45rem 0.85rem",
                        background: "#059669",
                      }}
                      title="Restaurar este registro y devolverlo al listado activo"
                    >
                      <RotateCcw size={14} /> Restaurar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.9rem 1.5rem",
            background: "var(--bg-main, #f8fafc)",
            borderTop: "1px solid var(--border-color, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {papelera.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Seguro que deseas purgar la papelera? Los respaldos locales serán eliminados.")) {
                  clearPapelera();
                }
              }}
              style={{
                background: "none",
                border: "none",
                color: "#dc2626",
                fontSize: "0.78rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Trash2 size={13} /> Vaciar Papelera
            </button>
          )}
          <div style={{ marginLeft: "auto" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
