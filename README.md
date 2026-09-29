# 🚀 SOSENLINEA — Sistema Operativo y ERP Web para Mantenimiento Inmobiliario

Plataforma empresarial de gestión operativa, financiera y administrativa para el sector inmobiliario y de mantenimiento en Colombia. Desarrollada con arquitectura de alta disponibilidad en **React 18 + TypeScript + Vite + Supabase Cloud (PostgreSQL 17) + Vercel CI/CD**.

* **Sitio en Producción:** [https://sosenlinea.vercel.app](https://sosenlinea.vercel.app)
* **Base de Datos:** PostgreSQL 17 en Supabase Cloud (`us-east-1`)
* **Repositorio Oficial:** [GitHub - paespa2/SOSENLINEA](https://github.com/paespa2/SOSENLINEA.git)

---

## 🏛️ Módulos Operativos Implementados

1. **Órdenes de Trabajo y Reportes (`tblReportes`):**
   * Trazabilidad completa con **29 estados operativos**.
   * Firma electrónica táctil con sellado de tiempo.
   * Geolocalización, rutas de transporte público y asignación de cuadrillas.
   * Barra de avance porcentual en vivo (0% - 100%).
2. **Presupuestos y Cotizador AIU:**
   * Desglose automático en Mano de Obra, Materiales y Transporte.
   * Cálculo de AIU, margen comercial e impuestos para exportación a PDF o impresión.
3. **Portal Autónomo de Clientes (PQR):**
   * Radicación web de solicitudes con generación de radicado instantáneo.
   * Llamado a la acción directo con chat de WhatsApp a un clic para atención inmediata.
4. **Almacén e Inventario de Materiales:**
   * Control de stock actual, alertas de stock mínimo y precios unitarios.
5. **Custodia de Llaves de Inmuebles:**
   * Control de préstamos, custodios y estados de disponibilidad o extravío.
6. **Cuentas de Cobro y Pagos a Contratistas:**
   * Liquidación con retenciones de ley y cuentas bancarias registradas.
7. **Seguridad Bancaria con Código OTP:**
   * Ningún registro se elimina sin un **código de seguridad de 6 dígitos** enviado al correo del administrador.
8. **Papelera de Respaldo & Restauración en 1 Clic:**
   * Copia de seguridad automática antes de cualquier borrado y exportación en JSON.
9. **Formateo de Moneda Colombiana (COP):**
   * Separación estricta de miles con punto (`.`) y decimales con coma (`,`).

---

## 🛠️ Tecnologías y Stack Técnico

* **Frontend:** React 18, TypeScript, Vite, Vanilla CSS con variables de diseño (Design Tokens).
* **Backend & Base de Datos:** PostgreSQL 17 en Supabase Cloud con Row-Level Security (RLS).
* **Protocolo Agéntico:** Supabase MCP (Model Context Protocol) para automatización por IA.
* **Hosting & CI/CD:** Vercel Edge Network con despliegue continuo desde GitHub.
* **Iconografía:** Lucide React.

---

## 🚀 Comandos Rápidos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor local de desarrollo
npm run dev

# Compilar para producción (Type check + Vite build)
npm run build

# Previsualizar bundle de producción
npm run preview
```

---

## 📜 Documentación Complementaria

* [**Resumen Ejecutivo & Auditoría Maestra**](./RESUMEN_EJECUTIVO_BD.md): Estado detallado de la migración de 94 tablas a Supabase y propuesta económica.
* [**Análisis Técnico de Base de Datos**](./ANALISIS_BD_AZURE_COMPLETO.md): Historial de consolidación de tablas y diccionario de datos.
