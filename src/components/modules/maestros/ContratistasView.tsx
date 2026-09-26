import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { Contractor, ThirdPartyType } from "../../../types";
import { calculateDianDV, formatDianNit } from "../../../utils/dianNit";
import { exportToCSV } from "../../../utils/exportUtils";
import { Modal } from "../../common/Modal";
import { StatusBadge } from "../../common/Badge";
import {
  Users2,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export const ContratistasView: React.FC = () => {
  const { contractors, addContractor, updateContractor, deleteContractor } = useData();
  const { can } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "Contratista" as ThirdPartyType,
    nit: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "Medellín",
    sector: "El Poblado",
    contacto: "",
    banco: "Bancolombia",
    tipoCta: "Corriente" as "Corriente" | "Ahorros",
    numeroCta: "",
    activo: true,
    especialidad: "",
    productoServicio: "",
  });

  // Cálculo en vivo del DV DIAN
  const calculatedDV = calculateDianDV(formData.nit);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      nombre: "",
      tipo: "Contratista",
      nit: "",
      email: "",
      telefono: "",
      direccion: "",
      ciudad: "Medellín",
      sector: "El Poblado",
      contacto: "",
      banco: "Bancolombia",
      tipoCta: "Corriente",
      numeroCta: "",
      activo: true,
      especialidad: "",
      productoServicio: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Contractor) => {
    setEditingId(c.id);
    setFormData({
      nombre: c.nombre,
      tipo: c.tipo,
      nit: c.nit,
      email: c.email,
      telefono: c.telefono,
      direccion: c.direccion,
      ciudad: c.ciudad,
      sector: c.sector,
      contacto: c.contacto || "",
      banco: c.banco || "Bancolombia",
      tipoCta: c.tipoCta || "Corriente",
      numeroCta: c.numeroCta || "",
      activo: c.activo,
      especialidad: c.especialidad || "",
      productoServicio: c.productoServicio || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.nit.trim()) {
      alert("Por favor diligencia el Nombre y el NIT.");
      return;
    }

    if (editingId) {
      updateContractor(editingId, {
        ...formData,
        dv: calculatedDV,
      });
    } else {
      addContractor({
        ...formData,
        dv: calculatedDV,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a "${nombre}"? Esta acción se registrará en la auditoría.`)) {
      deleteContractor(id);
    }
  };

  // Filtrado de contratistas
  const filtered = contractors.filter((c) => {
    const matchesSearch =
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nit.includes(searchTerm) ||
      c.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.especialidad && c.especialidad.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === "todos" || c.tipo === selectedType;
    return matchesSearch && matchesType;
  });

  const handleExport = () => {
    exportToCSV(filtered, "Catalogo_Contratistas_tblContratistas", [
      { key: "id", label: "ID" },
      { key: "nit", label: "NIT" },
      { key: "dv", label: "DV" },
      { key: "nombre", label: "Nombre / Razón Social" },
      { key: "tipo", label: "Tipo" },
      { key: "telefono", label: "Teléfono" },
      { key: "email", label: "Email" },
      { key: "direccion", label: "Dirección" },
      { key: "ciudad", label: "Ciudad" },
      { key: "banco", label: "Banco" },
      { key: "numeroCta", label: "No. Cuenta" },
      { key: "fechaRegistro", label: "Fecha Registro" },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header del Módulo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Users2 size={26} color="var(--primary)" />
            Contratistas, Proveedores y Terceros
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Catálogo maestro migrado desde <code style={{ fontWeight: 700 }}>tblContratistas</code> con validación oficial DIAN y trazabilidad.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {can("export") && (
            <button onClick={handleExport} className="btn btn-secondary btn-sm">
              <Download size={15} />
              Exportar CSV / Excel
            </button>
          )}

          {can("create") && (
            <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
              <Plus size={16} />
              Nuevo Tercero
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "280px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-400)" }} />
            <input
              type="text"
              placeholder="Buscar por NIT, Nombre, Ciudad o Especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.2rem" }}
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="select-field"
            style={{ width: "auto" }}
          >
            <option value="todos">Todos los Tipos ({contractors.length})</option>
            <option value="Contratista">Solo Contratistas</option>
            <option value="Proveedor">Solo Proveedores</option>
            <option value="Tercero">Solo Terceros</option>
          </select>
        </div>

        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
          Mostrando {filtered.length} de {contractors.length} registros
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>NIT (DIAN)</th>
              <th>Nombre / Razón Social</th>
              <th>Tipo</th>
              <th>Contacto & Ubicación</th>
              <th>Datos Bancarios</th>
              <th>Estado</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No se encontraron contratistas o proveedores con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 800, fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--primary)" }}>
                      {formatDianNit(c.nit, c.dv)}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>DV: {c.dv} (Válido)</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{c.nombre}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {c.especialidad || c.productoServicio || c.categoria || "Servicios generales"}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background:
                          c.tipo === "Contratista"
                            ? "rgba(37, 99, 235, 0.1)"
                            : c.tipo === "Proveedor"
                            ? "rgba(5, 150, 105, 0.1)"
                            : "rgba(217, 119, 6, 0.1)",
                        color:
                          c.tipo === "Contratista"
                            ? "#1d4ed8"
                            : c.tipo === "Proveedor"
                            ? "#047857"
                            : "#b45309",
                      }}
                    >
                      {c.tipo}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.775rem" }}>
                      <Phone size={13} color="var(--neutral-400)" /> {c.telefono}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      <MapPin size={13} color="var(--neutral-400)" /> {c.direccion}, {c.ciudad}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.775rem", fontWeight: 600 }}>{c.banco || "Bancolombia"}</div>
                    <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {c.tipoCta} {c.numeroCta || "Sin registrar"}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={c.activo ? "Activo" : "Inactivo"} size="sm" />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                      {can("edit") && (
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="btn btn-secondary btn-sm"
                          title="Editar Tercero"
                          style={{ padding: "0.3rem 0.5rem" }}
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      {can("delete") && (
                        <button
                          onClick={() => handleDelete(c.id, c.nombre)}
                          className="btn btn-danger btn-sm"
                          title="Eliminar Tercero"
                          style={{ padding: "0.3rem 0.5rem" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar Tercero */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Editar Información de Tercero" : "Registrar Nuevo Contratista o Proveedor"}
        maxWidth="680px"
        footer={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              {editingId ? "Guardar Cambios" : "Crear Tercero"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Tipo y NIT con cálculo DIAN en vivo */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Tipo de Tercero *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as ThirdPartyType })}
                className="select-field"
              >
                <option value="Contratista">Contratista</option>
                <option value="Proveedor">Proveedor</option>
                <option value="Tercero">Tercero</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Número de NIT o Cédula *</label>
              <input
                type="text"
                placeholder="Ej: 900456123"
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value.replace(/\D/g, "") })}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Dígito (DV) DIAN</label>
              <div
                style={{
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: calculatedDV ? "rgba(5, 150, 105, 0.1)" : "var(--neutral-100)",
                  color: calculatedDV ? "#059669" : "var(--neutral-400)",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {calculatedDV !== "" ? calculatedDV : "-"}
              </div>
            </div>
          </div>

          {/* Nombre / Razón Social */}
          <div className="input-group">
            <label className="input-label">Nombre Completo o Razón Social *</label>
            <input
              type="text"
              placeholder="Ej: ESTRUCTURAS Y CONSTRUCCIONES S.A.S."
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {/* Contacto & Teléfono */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Teléfono / Celular</label>
              <input
                type="text"
                placeholder="Ej: (604) 444-1234"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Correo Electrónico</label>
              <input
                type="email"
                placeholder="correo@empresa.com.co"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Dirección y Ciudad */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Dirección</label>
              <input
                type="text"
                placeholder="Ej: Cra 43A # 14-25"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Ciudad</label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Datos Bancarios */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.25rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
              Información Bancaria para Dispersión
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.5fr", gap: "0.75rem", marginTop: "0.5rem" }}>
              <div className="input-group">
                <label className="input-label">Entidad Bancaria</label>
                <select
                  value={formData.banco}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  className="select-field"
                >
                  <option value="Bancolombia">Bancolombia</option>
                  <option value="Banco de Bogotá">Banco de Bogotá</option>
                  <option value="Banco Davivienda">Banco Davivienda</option>
                  <option value="Banco BBVA">Banco BBVA</option>
                  <option value="Banco de Occidente">Banco de Occidente</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Tipo Cuenta</label>
                <select
                  value={formData.tipoCta}
                  onChange={(e) => setFormData({ ...formData, tipoCta: e.target.value as "Corriente" | "Ahorros" })}
                  className="select-field"
                >
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Número de Cuenta</label>
                <input
                  type="text"
                  placeholder="Ej: 031-987654-12"
                  value={formData.numeroCta}
                  onChange={(e) => setFormData({ ...formData, numeroCta: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
