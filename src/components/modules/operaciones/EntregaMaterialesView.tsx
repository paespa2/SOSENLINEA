import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { formatDateCO } from "../../../utils/formatters";
import { exportToCSV, triggerPrint } from "../../../utils/exportUtils";
import { PackageCheck, Plus, Search, Download, Printer } from "lucide-react";
import { Modal } from "../../common/Modal";

export const EntregaMaterialesView: React.FC = () => {
  const { entregasMateriales, addEntregaMaterial, materiales, reportes } = useData();
  const { can } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    materialNombre: materiales[0]?.nombre || "",
    cantidad: 1,
    unidad: materiales[0]?.unidad || "Unidad",
    receptorNombre: "",
    receptorCargo: "Contratista Encargado",
    ordenTrabajo: reportes[0] ? `#${reportes[0].idRegistro} - ${reportes[0].direccion}` : "General",
    entregadoPor: "Almacenista Pedro Páez",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receptorNombre || formData.cantidad <= 0) return;
    addEntregaMaterial(formData);
    setIsModalOpen(false);
  };

  const filtered = entregasMateriales.filter(
    (e) =>
      e.materialNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.receptorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.ordenTrabajo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    exportToCSV(filtered, "Entregas_Materiales_tblEntregaMateriales", [
      { key: "fecha", label: "Fecha" },
      { key: "ordenTrabajo", label: "Orden de Trabajo" },
      { key: "materialNombre", label: "Material Entregado" },
      { key: "cantidad", label: "Cantidad" },
      { key: "unidad", label: "Unidad" },
      { key: "receptorNombre", label: "Receptor" },
      { key: "receptorCargo", label: "Cargo Receptor" },
      { key: "entregadoPor", label: "Entregado Por" },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <PackageCheck size={26} color="var(--primary)" />
            Entrega de Materiales en Obra (tblEntregaMateriales)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Control y actas de salida de materiales de almacén hacia órdenes de trabajo y contratistas.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          {can("export") && (
            <button onClick={handleExport} className="btn btn-secondary btn-sm">
              <Download size={15} /> Exportar CSV
            </button>
          )}
          {can("create") && (
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Registrar Entrega
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: "0.85rem 1.25rem" }}>
        <div style={{ position: "relative", maxWidth: "380px" }}>
          <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
          <input
            type="text"
            placeholder="Buscar por material, receptor u orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2.1rem" }}
          />
        </div>
      </div>

      <div className="table-responsive-wrapper card" style={{ padding: 0 }}>
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
          <thead>
            <tr>
              <th style={{ minWidth: "110px" }}>Fecha</th>
              <th style={{ minWidth: "140px" }}>Orden de Trabajo</th>
              <th style={{ minWidth: "200px" }}>Material Insumo</th>
              <th style={{ minWidth: "110px" }}>Cantidad</th>
              <th style={{ minWidth: "160px" }}>Receptor (Firma)</th>
              <th style={{ minWidth: "120px" }}>Cargo</th>
              <th style={{ minWidth: "140px" }}>Despachado Por</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{formatDateCO(item.fecha)}</td>
                <td style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary)" }}>{item.ordenTrabajo}</td>
                <td style={{ fontWeight: 600 }}>{item.materialNombre}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800 }}>
                  {item.cantidad} {item.unidad}
                </td>
                <td style={{ fontWeight: 600 }}>{item.receptorNombre}</td>
                <td style={{ fontSize: "0.785rem", color: "var(--text-muted)" }}>{item.receptorCargo}</td>
                <td style={{ fontSize: "0.785rem" }}>{item.entregadoPor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar Entrega */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Salida / Entrega de Material"
        maxWidth="600px"
        footer={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Guardar Entrega
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label">Orden de Trabajo Destino</label>
            <select
              value={formData.ordenTrabajo}
              onChange={(e) => setFormData({ ...formData, ordenTrabajo: e.target.value })}
              className="select-field"
            >
              {reportes.map((r) => (
                <option key={r.idRegistro} value={`#${r.idRegistro} - ${r.direccion}`}>
                  #{r.idRegistro} - {r.direccion} ({r.clienteNombre})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Material a Despachar</label>
              <select
                value={formData.materialNombre}
                onChange={(e) => {
                  const m = materiales.find((mat) => mat.nombre === e.target.value);
                  setFormData({
                    ...formData,
                    materialNombre: e.target.value,
                    unidad: m ? m.unidad : formData.unidad,
                  });
                }}
                className="select-field"
              >
                {materiales.map((m) => (
                  <option key={m.id} value={m.nombre}>
                    {m.nombre} (Stock: {m.stockActual} {m.unidad})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Cantidad a Entregar</label>
              <input
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Nombre de Quien Recibe en Obra *</label>
              <input
                type="text"
                placeholder="Nombre del técnico o contratista"
                value={formData.receptorNombre}
                onChange={(e) => setFormData({ ...formData, receptorNombre: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Cargo</label>
              <input
                type="text"
                value={formData.receptorCargo}
                onChange={(e) => setFormData({ ...formData, receptorCargo: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
