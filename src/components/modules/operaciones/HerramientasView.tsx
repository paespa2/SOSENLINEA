import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { Herramienta } from "../../../types";
import { Wrench, Plus, Search, CheckCircle, ArrowRightLeft } from "lucide-react";
import { Modal } from "../../common/Modal";
import { StatusBadge } from "../../common/Badge";

export const HerramientasView: React.FC = () => {
  const { herramientas, addHerramienta, updateHerramientaEstado, contractors } = useData();
  const { can } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHer, setSelectedHer] = useState<Herramienta | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTech, setAssignTech] = useState(contractors[0]?.nombre || "");

  const [formData, setFormData] = useState({
    codigo: `HER-0${herramientas.length + 1}`,
    nombre: "",
    grupo: "Herramienta Eléctrica",
    estado: "Disponible" as Herramienta["estado"],
    responsableActual: "Almacén Central",
    observaciones: "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre) return;
    addHerramienta(formData);
    setIsModalOpen(false);
  };

  const handleOpenAssign = (h: Herramienta) => {
    setSelectedHer(h);
    setAssignTech(contractors[0]?.nombre || "");
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedHer || !assignTech) return;
    updateHerramientaEstado(selectedHer.id, "En Uso", assignTech);
    setIsAssignModalOpen(false);
  };

  const handleReturnToStore = (h: Herramienta) => {
    if (window.confirm(`¿Devolver la herramienta "${h.nombre}" al Almacén Central?`)) {
      updateHerramientaEstado(h.id, "Disponible", "Almacén Central");
    }
  };

  const filtered = herramientas.filter(
    (h) =>
      h.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.grupo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.responsableActual && h.responsableActual.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Wrench size={26} color="var(--primary)" />
            Registro y Control de Herramientas (tblHerramientas)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Custodia de equipos, asignación a técnicos y control de mantenimiento de activos de trabajo.
          </p>
        </div>

        {can("create") && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            Nueva Herramienta
          </button>
        )}
      </div>

      <div className="card" style={{ padding: "0.85rem 1.25rem" }}>
        <div style={{ position: "relative", maxWidth: "380px" }}>
          <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
          <input
            type="text"
            placeholder="Buscar herramienta, código o técnico responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2.1rem" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
        {filtered.map((h) => (
          <div key={h.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--primary)", fontSize: "0.8rem" }}>
                  {h.codigo}
                </span>
                <StatusBadge status={h.estado} size="sm" />
              </div>

              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-main)", marginBottom: "0.25rem" }}>
                {h.nombre}
              </div>

              <div style={{ fontSize: "0.785rem", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
                Grupo: <strong>{h.grupo}</strong>
              </div>

              <div style={{ background: "var(--neutral-50)", padding: "0.75rem", borderRadius: "var(--radius-md)", fontSize: "0.785rem" }}>
                <div>Responsable: <strong>{h.responsableActual || "Almacén"}</strong></div>
                {h.fechaAsignacion && (
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Asignado: {h.fechaAsignacion}
                  </div>
                )}
                {h.observaciones && (
                  <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                    {h.observaciones}
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              {h.estado === "Disponible" && can("edit") && (
                <button onClick={() => handleOpenAssign(h)} className="btn btn-primary btn-sm">
                  <ArrowRightLeft size={13} /> Asignar a Técnico
                </button>
              )}
              {h.estado === "En Uso" && can("edit") && (
                <button onClick={() => handleReturnToStore(h)} className="btn btn-success btn-sm">
                  <CheckCircle size={13} /> Devolver a Almacén
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Asignar */}
      {selectedHer && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Asignar Herramienta: ${selectedHer.nombre}`}
          maxWidth="500px"
          footer={
            <>
              <button onClick={() => setIsAssignModalOpen(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleConfirmAssign} className="btn btn-primary">
                Confirmar Asignación
              </button>
            </>
          }
        >
          <div className="input-group">
            <label className="input-label">Seleccionar Técnico o Contratista Responsable</label>
            <select
              value={assignTech}
              onChange={(e) => setAssignTech(e.target.value)}
              className="select-field"
            >
              {contractors.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre} ({c.tipo})
                </option>
              ))}
            </select>
          </div>
        </Modal>
      )}

      {/* Modal Crear Herramienta */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nueva Herramienta"
        maxWidth="550px"
        footer={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Guardar Herramienta
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Código *</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Nombre de la Herramienta *</label>
              <input
                type="text"
                placeholder="Ej: Taladro Percutor DeWalt 20V"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Grupo / Categoría</label>
            <input
              type="text"
              placeholder="Ej: Herramienta Eléctrica Pesada"
              value={formData.grupo}
              onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Observaciones (Marca, serie, accesorios)</label>
            <input
              type="text"
              placeholder="Ej: Serie DWT-998822 con 2 baterías"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="input-field"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
