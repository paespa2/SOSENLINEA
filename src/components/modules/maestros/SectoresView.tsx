import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { MapPin, Plus, Search } from "lucide-react";
import { Modal } from "../../common/Modal";

export const SectoresView: React.FC = () => {
  const { sectores, addSector } = useData();
  const { can } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    codigo: `SEC-0${sectores.length + 1}`,
    nombre: "",
    zona: "Sur-Oriente",
    ruta: "Ruta 1",
    responsable: "Ing. Pedro Páez",
    activo: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre) return;
    addSector(formData);
    setIsModalOpen(false);
  };

  const filtered = sectores.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.zona.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <MapPin size={26} color="var(--primary)" />
            Sectores y Rutas Operativas (tblSectores)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Zonas de cobertura geográfica, asignación de rutas y cuadrillas de mantenimiento.
          </p>
        </div>

        {can("create") && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            Nuevo Sector
          </button>
        )}
      </div>

      <div className="card" style={{ padding: "0.85rem 1.25rem" }}>
        <div style={{ position: "relative", maxWidth: "380px" }}>
          <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
          <input
            type="text"
            placeholder="Buscar sector, ruta o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2.1rem" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {filtered.map((sec) => (
          <div key={sec.id} className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)", fontSize: "0.8rem" }}>
                {sec.codigo}
              </span>
              <span
                style={{
                  background: sec.activo ? "rgba(5, 150, 105, 0.1)" : "rgba(220, 38, 38, 0.1)",
                  color: sec.activo ? "#059669" : "#dc2626",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "9999px",
                }}
              >
                {sec.activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.35rem" }}>{sec.nombre}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Zona: <strong>{sec.zona}</strong>
            </div>

            <div style={{ background: "var(--neutral-50)", padding: "0.65rem", borderRadius: "6px", fontSize: "0.785rem" }}>
              <div>Ruta: {sec.ruta || "No definida"}</div>
              <div>Líder de Zona: <strong>{sec.responsable}</strong></div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Sector"
        maxWidth="500px"
        footer={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Guardar Sector
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label">Código del Sector *</label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Nombre del Sector *</label>
            <input
              type="text"
              placeholder="Ej: Sabaneta / Aves María"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Zona</label>
              <input
                type="text"
                placeholder="Ej: Sur"
                value={formData.zona}
                onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Ruta Operativa</label>
              <input
                type="text"
                placeholder="Ej: Ruta Sur E1"
                value={formData.ruta}
                onChange={(e) => setFormData({ ...formData, ruta: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Responsable / Supervisor</label>
            <input
              type="text"
              value={formData.responsable}
              onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
              className="input-field"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
