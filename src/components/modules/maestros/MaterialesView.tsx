import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { Material } from "../../../types";
import { formatCOP } from "../../../utils/formatters";
import { exportToCSV } from "../../../utils/exportUtils";
import { Modal } from "../../common/Modal";
import { StatusBadge } from "../../common/Badge";
import {
  Boxes,
  Plus,
  Search,
  Download,
  AlertTriangle,
  Layers,
  MapPin,
} from "lucide-react";

export const MaterialesView: React.FC = () => {
  const { materiales, addMaterial, updateMaterialStock } = useData();
  const { can } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todas");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    codigo: `MAT-0${materiales.length + 1}`,
    nombre: "",
    categoria: "Acabados",
    unidad: "Unidad",
    stockActual: 10,
    stockMinimo: 5,
    precioUnitario: 50000,
    ubicacion: "Almacén Central",
    estado: "Optimo" as "Optimo" | "Bajo Stock" | "Agotado",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    addMaterial(formData);
    setIsModalOpen(false);
  };

  const handleStockAdjust = (id: string, currentStock: number) => {
    const input = prompt(`Ajustar stock actual (Valor actual: ${currentStock}):`, String(currentStock));
    if (input !== null) {
      const nuevo = parseInt(input, 10);
      if (!isNaN(nuevo) && nuevo >= 0) {
        updateMaterialStock(id, nuevo);
      }
    }
  };

  const filtered = materiales.filter((m) => {
    const matchesSearch =
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategoria === "todas" || m.categoria === selectedCategoria;
    return matchesSearch && matchesCat;
  });

  const handleExport = () => {
    exportToCSV(filtered, "Inventario_Materiales_tblMateriales", [
      { key: "codigo", label: "Código" },
      { key: "nombre", label: "Nombre Material" },
      { key: "categoria", label: "Categoría" },
      { key: "unidad", label: "Unidad" },
      { key: "stockActual", label: "Stock Actual" },
      { key: "stockMinimo", label: "Stock Mínimo" },
      { key: "precioUnitario", label: "Precio Unitario" },
      { key: "ubicacion", label: "Ubicación Almacén" },
      { key: "estado", label: "Estado" },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Boxes size={26} color="var(--primary)" />
            Catálogo e Inventario de Materiales (tblMateriales)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Control de insumos, niveles de stock mínimo y alertas automáticas de abastecimiento.
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
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={16} />
              Nuevo Material
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "280px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
            <input
              type="text"
              placeholder="Buscar por código, nombre o almacén..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.1rem" }}
            />
          </div>

          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="select-field"
            style={{ width: "auto" }}
          >
            <option value="todas">Todas las Categorías</option>
            <option value="Acabados">Acabados</option>
            <option value="Pinturas">Pinturas</option>
            <option value="Plomería">Plomería</option>
            <option value="Eléctricos">Eléctricos</option>
            <option value="Obra Gris">Obra Gris</option>
          </select>
        </div>

        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
          {filtered.length} materiales en inventario
        </div>
      </div>

      {/* Tabla de Materiales */}
      <div className="table-card">
        <div className="table-responsive-wrapper">
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
          <thead>
            <tr>
              <th style={{ minWidth: "90px" }}>Código</th>
              <th style={{ minWidth: "220px" }}>Material / Insumo</th>
              <th style={{ minWidth: "110px" }}>Categoría</th>
              <th style={{ minWidth: "80px" }}>Unidad</th>
              <th style={{ minWidth: "95px" }}>Stock Actual</th>
              <th style={{ minWidth: "95px" }}>Stock Mínimo</th>
              <th style={{ minWidth: "125px" }}>Precio Unitario</th>
              <th style={{ minWidth: "120px" }}>Ubicación</th>
              <th style={{ minWidth: "90px" }}>Estado</th>
              <th className="table-actions-sticky" style={{ textAlign: "right", minWidth: "110px" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>
                  <span className="badge-order-id" style={{ cursor: "default" }}>{m.codigo}</span>
                </td>
                <td style={{ fontWeight: 700 }}>{m.nombre}</td>
                <td>
                  <span style={{ background: "var(--neutral-100)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>
                    {m.categoria}
                  </span>
                </td>
                <td>{m.unidad}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "0.95rem" }}>
                  {m.stockActual}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{m.stockMinimo}</td>
                <td className="currency-text">{formatCOP(m.precioUnitario)}</td>
                <td style={{ fontSize: "0.785rem", color: "var(--text-muted)" }}>{m.ubicacion}</td>
                <td>
                  <StatusBadge status={m.estado} size="sm" />
                </td>
                <td className="table-actions-sticky" style={{ textAlign: "right" }}>
                  {can("edit") && (
                    <button onClick={() => handleStockAdjust(m.id, m.stockActual)} className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                      Ajustar Stock
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Footer elegante para rematar la tarjeta sin cortes abruptos */}
        <div className="table-footer-bar">
          <span>
            Mostrando <strong>{filtered.length}</strong> de <strong>{materiales.length}</strong> materiales en catálogo
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            Inventario Sincronizado
          </span>
        </div>
      </div>

      {/* Modal Crear Material */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        badge="Catálogo"
        title="Crear Nuevo Material"
        subtitle="Alta de ítem en inventario, precios de referencia y umbral mínimo"
        maxWidth="600px"
        footer={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Guardar Material
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
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
              <label className="input-label">Nombre del Material *</label>
              <input
                type="text"
                placeholder="Ej: Pintura Epóxica Gris Galón"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="select-field"
              >
                <option value="Acabados">Acabados</option>
                <option value="Pinturas">Pinturas</option>
                <option value="Plomería">Plomería</option>
                <option value="Eléctricos">Eléctricos</option>
                <option value="Obra Gris">Obra Gris</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Unidad de Medida</label>
              <input
                type="text"
                placeholder="Ej: Galón, Bulto, Unidad"
                value={formData.unidad}
                onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
            <div className="input-group">
              <label className="input-label">Stock Inicial</label>
              <input
                type="number"
                value={formData.stockActual}
                onChange={(e) => setFormData({ ...formData, stockActual: Number(e.target.value) })}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Stock Mínimo</label>
              <input
                type="number"
                value={formData.stockMinimo}
                onChange={(e) => setFormData({ ...formData, stockMinimo: Number(e.target.value) })}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Precio Unitario (COP)</label>
              <input
                type="number"
                value={formData.precioUnitario}
                onChange={(e) => setFormData({ ...formData, precioUnitario: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Ubicación en Almacén</label>
            <input
              type="text"
              placeholder="Ej: Almacén Central - Estante B2"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              className="input-field"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
