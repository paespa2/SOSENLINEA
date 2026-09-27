import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { KeyItem } from "../../../types";
import { exportToCSV } from "../../../utils/exportUtils";
import { Modal } from "../../common/Modal";
import { StatusBadge } from "../../common/Badge";
import {
  Key,
  Plus,
  Search,
  Download,
  CheckCircle,
  ArrowRightLeft,
  Building,
  User,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const LlavesView: React.FC = () => {
  const { llaves, addLlave, updateLlavePrestamo, contractors } = useData();
  const { can } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<KeyItem | null>(null);
  const [selectedCustodio, setSelectedCustodio] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    codigo: `LLV-${Date.now().toString().slice(-3)}`,
    inmueble: "",
    direccion: "",
    propietario: "",
    estado: "Disponible" as "Disponible" | "Prestada" | "Extraviada",
    custodioActual: "Recepción de Llaves / Caja Fuerte",
    observaciones: "",
  });

  const handleOpenLend = (k: KeyItem) => {
    setSelectedKey(k);
    setSelectedCustodio(contractors[0]?.nombre || "");
    setIsLendModalOpen(true);
  };

  const handleConfirmLend = () => {
    if (!selectedKey || !selectedCustodio) return;
    updateLlavePrestamo(selectedKey.id, "Prestada", selectedCustodio);
    setIsLendModalOpen(false);
  };

  const handleReturn = (k: KeyItem) => {
    if (window.confirm(`¿Confirmar recepción de las llaves de "${k.inmueble}"?`)) {
      updateLlavePrestamo(k.id, "Disponible", "Recepción de Llaves / Caja Fuerte");
    }
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.inmueble || !formData.direccion) {
      alert("Indica el nombre del inmueble y la dirección.");
      return;
    }
    addLlave(formData);
    setIsCreateModalOpen(false);
  };

  const filtered = llaves.filter((k) => {
    const matchesSearch =
      k.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.inmueble.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (k.custodioActual && k.custodioActual.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEstado = selectedEstado === "todos" || k.estado === selectedEstado;
    return matchesSearch && matchesEstado;
  });

  const totalPrestadas = llaves.filter((k) => k.estado === "Prestada").length;

  const handleExport = () => {
    exportToCSV(filtered, "Custodia_Llaves_tblLlaves", [
      { key: "codigo", label: "Código Llave" },
      { key: "inmueble", label: "Inmueble / Referencia" },
      { key: "direccion", label: "Dirección" },
      { key: "propietario", label: "Propietario" },
      { key: "estado", label: "Estado" },
      { key: "custodioActual", label: "Custodio Actual" },
      { key: "fechaPrestamo", label: "Fecha y Hora Préstamo" },
      { key: "observaciones", label: "Observaciones" },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Key size={26} color="var(--primary)" />
            Control y Custodia de Llaves (tblLlaves)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Seguimiento de custodia de activos inmobiliarios, entrega a contratistas y registro de préstamos.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {can("export") && (
            <button onClick={handleExport} className="btn btn-secondary btn-sm">
              <Download size={15} />
              Exportar CSV
            </button>
          )}

          {can("create") && (
            <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={16} />
              Registrar Nueva Llave
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "280px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
            <input
              type="text"
              placeholder="Buscar por código, inmueble, dirección o custodio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.1rem" }}
            />
          </div>

          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="select-field"
            style={{ width: "auto" }}
          >
            <option value="todos">Todos los Estados ({llaves.length})</option>
            <option value="Disponible">Solo Disponibles</option>
            <option value="Prestada">Solo Prestadas</option>
            <option value="Extraviada">Extraviadas</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
            {totalPrestadas} de {llaves.length} llaves en préstamo
          </span>
        </div>
      </div>

      {/* Grid de Llaves */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {filtered.map((k) => (
          <div key={k.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <span className="badge-order-id" style={{ cursor: "default" }}>
                  {k.codigo}
                </span>
                <StatusBadge status={k.estado} size="sm" />
              </div>

              <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-main)", marginBottom: "0.25rem" }}>
                {k.inmueble}
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
                {k.direccion}
              </div>

              <div style={{ background: "var(--neutral-50)", padding: "0.75rem", borderRadius: "var(--radius-md)", fontSize: "0.785rem" }}>
                <div style={{ marginBottom: "0.25rem" }}>
                  <strong>Propietario:</strong> {k.propietario}
                </div>
                <div style={{ color: k.estado === "Prestada" ? "#b45309" : "var(--neutral-600)" }}>
                  <strong>Custodio:</strong> {k.custodioActual}
                </div>
                {k.fechaPrestamo && (
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Clock size={12} /> Préstamo: {k.fechaPrestamo}
                  </div>
                )}
              </div>

              {k.observaciones && (
                <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.6rem" }}>
                  {k.observaciones}
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              {k.estado === "Disponible" ? (
                can("edit") && (
                  <button onClick={() => handleOpenLend(k)} className="btn btn-primary btn-sm">
                    <ArrowRightLeft size={13} /> Prestar Llave
                  </button>
                )
              ) : k.estado === "Prestada" ? (
                can("edit") && (
                  <button onClick={() => handleReturn(k)} className="btn btn-success btn-sm">
                    <CheckCircle size={13} /> Devolver a Caja Fuerte
                  </button>
                )
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Prestar Llave */}
      {selectedKey && (
        <Modal
          isOpen={isLendModalOpen}
          onClose={() => setIsLendModalOpen(false)}
          badge={selectedKey.codigo}
          title="Prestar Llave Inmobiliaria"
          subtitle={`${selectedKey.inmueble} • ${selectedKey.direccion}`}
          maxWidth="500px"
          footer={
            <>
              <button onClick={() => setIsLendModalOpen(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleConfirmLend} className="btn btn-primary">
                Confirmar Entrega
              </button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "var(--neutral-50)", padding: "0.85rem", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Inmueble:</div>
              <div style={{ fontWeight: 800 }}>{selectedKey.inmueble}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{selectedKey.direccion}</div>
            </div>

            <div className="input-group">
              <label className="input-label">Seleccionar Responsable / Contratista Receptor *</label>
              <select
                value={selectedCustodio}
                onChange={(e) => setSelectedCustodio(e.target.value)}
                className="select-field"
              >
                {contractors.map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre} ({c.tipo})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Crear Nueva Llave */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        badge="Nueva"
        title="Registrar Llave Inmobiliaria"
        subtitle="Asignación y registro en el llavero maestro de custodia"
        maxWidth="580px"
        footer={
          <>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSaveCreate} className="btn btn-primary">
              Guardar Llave
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Código Único *</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Inmueble / Referencia *</label>
              <input
                type="text"
                placeholder="Ej: Apto 502 Ed. San Fernando Plaza"
                value={formData.inmueble}
                onChange={(e) => setFormData({ ...formData, inmueble: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Dirección Completa *</label>
            <input
              type="text"
              placeholder="Ej: Cra 43A # 18 Sur - 120"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Propietario del Inmueble</label>
            <input
              type="text"
              placeholder="Nombre del propietario o fiduciaria"
              value={formData.propietario}
              onChange={(e) => setFormData({ ...formData, propietario: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Observaciones (Juegos, llaves de seguridad, chips)</label>
            <input
              type="text"
              placeholder="Ej: 2 llaves de cerradura principal + 1 chip de acceso"
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
