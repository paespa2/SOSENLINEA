import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { Client, ClientType } from "../../../types";
import { formatCOP, formatDateCO } from "../../../utils/formatters";
import { exportToCSV } from "../../../utils/exportUtils";
import { Modal } from "../../common/Modal";
import { StatusBadge } from "../../common/Badge";
import {
  UserCheck,
  Plus,
  Search,
  Download,
  Building,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

export const ClientesView: React.FC = () => {
  const { clientes, addClient } = useData();
  const { can } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    tipo: "Arrendatario" as ClientType,
    nombre: "",
    documento: "",
    telefono: "",
    email: "",
    inmuebleReferencia: "",
    canonOValor: 2500000,
    fechaContrato: new Date().toISOString().slice(0, 10),
    estado: "Activo" as "Activo" | "Inactivo" | "En Mora",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.documento) return;
    addClient(formData);
    setIsModalOpen(false);
  };

  const filtered = clientes.filter((c) => {
    const matchesSearch =
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.documento.includes(searchTerm) ||
      c.inmuebleReferencia.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = selectedTipo === "todos" || c.tipo === selectedTipo;
    return matchesSearch && matchesTipo;
  });

  const handleExport = () => {
    exportToCSV(filtered, "Catalogo_Clientes_tblClientes", [
      { key: "documento", label: "NIT / C.C." },
      { key: "nombre", label: "Nombre Cliente" },
      { key: "tipo", label: "Tipo (Arrendatario/Propietario)" },
      { key: "telefono", label: "Teléfono" },
      { key: "email", label: "Email" },
      { key: "inmuebleReferencia", label: "Inmueble Referencia" },
      { key: "canonOValor", label: "Canon / Valor (COP)" },
      { key: "fechaContrato", label: "Fecha Contrato" },
      { key: "estado", label: "Estado" },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <UserCheck size={26} color="var(--primary)" />
            Registro de Clientes, Arrendatarios y Propietarios (tblClientes)
          </h1>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Directorio de contratantes, inquilinos y propietarios administrados por el sistema.
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
              Nuevo Cliente
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
              placeholder="Buscar por documento, nombre o inmueble..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.1rem" }}
            />
          </div>

          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="select-field"
            style={{ width: "auto" }}
          >
            <option value="todos">Todos los Clientes ({clientes.length})</option>
            <option value="Arrendatario">Solo Arrendatarios</option>
            <option value="Propietario">Solo Propietarios</option>
          </select>
        </div>

        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
          {filtered.length} clientes registrados
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Documento / NIT</th>
              <th>Nombre Completo</th>
              <th>Tipo</th>
              <th>Contacto</th>
              <th>Inmueble / Referencia</th>
              <th>Canon / Valor Contrato</th>
              <th>Fecha Contrato</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cli) => (
              <tr key={cli.id}>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>{cli.documento}</td>
                <td style={{ fontWeight: 700 }}>{cli.nombre}</td>
                <td>
                  <span
                    style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: cli.tipo === "Propietario" ? "rgba(5, 150, 105, 0.1)" : "rgba(37, 99, 235, 0.1)",
                      color: cli.tipo === "Propietario" ? "#047857" : "#1d4ed8",
                    }}
                  >
                    {cli.tipo}
                  </span>
                </td>
                <td style={{ fontSize: "0.8rem" }}>
                  <div>{cli.telefono}</div>
                  <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>{cli.email}</div>
                </td>
                <td style={{ fontSize: "0.85rem", fontWeight: 500 }}>{cli.inmuebleReferencia}</td>
                <td className="currency-text" style={{ fontWeight: 700 }}>{formatCOP(cli.canonOValor)}</td>
                <td style={{ fontSize: "0.785rem" }}>{formatDateCO(cli.fechaContrato)}</td>
                <td>
                  <StatusBadge status={cli.estado} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear Cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Cliente / Inmueble"
        maxWidth="600px"
        footer={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Guardar Cliente
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Tipo de Cliente *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as ClientType })}
                className="select-field"
              >
                <option value="Arrendatario">Arrendatario</option>
                <option value="Propietario">Propietario</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Cédula o NIT *</label>
              <input
                type="text"
                placeholder="Ej: 900123456-1 o 71234567"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Nombre Completo o Razón Social *</label>
            <input
              type="text"
              placeholder="Ej: Inversiones Santa María"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Teléfono</label>
              <input
                type="text"
                placeholder="Ej: (604) 321-4567"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Correo Electrónico</label>
              <input
                type="email"
                placeholder="cliente@dominio.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Inmueble / Referencia</label>
            <input
              type="text"
              placeholder="Ej: Edificio San Fernando Plaza Of. 801"
              value={formData.inmuebleReferencia}
              onChange={(e) => setFormData({ ...formData, inmuebleReferencia: e.target.value })}
              className="input-field"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Canon Mensual o Valor (COP)</label>
              <input
                type="number"
                value={formData.canonOValor}
                onChange={(e) => setFormData({ ...formData, canonOValor: Number(e.target.value) })}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Fecha de Contrato</label>
              <input
                type="date"
                value={formData.fechaContrato}
                onChange={(e) => setFormData({ ...formData, fechaContrato: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
