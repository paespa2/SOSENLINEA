# 🛠️ SOSENLINEA — Sistema Operativo y ERP Web para Mantenimiento Inmobiliario (2026)

Plataforma empresarial de gestión operativa, financiera y administrativa para el sector inmobiliario y de mantenimiento locativo en Colombia. Desarrollada con arquitectura de alta disponibilidad sobre **React 19 + TypeScript + Vite + Supabase Cloud (PostgreSQL 17.6) + Vercel CI/CD**.

* **Sitio en Producción:** [https://sosenlinea.vercel.app](https://sosenlinea.vercel.app)
* **Base de Datos:** PostgreSQL 17.6 en Supabase Cloud (`us-east-1`, Ref: `hgywidapnfslfsjfuxdi`)
* **Repositorio Oficial:** [GitHub - paespa2/SOSENLINEA](https://github.com/paespa2/SOSENLINEA.git)
* **Documentación Ejecutiva & Cotización:** [RESUMEN_EJECUTIVO_BD.md](./RESUMEN_EJECUTIVO_BD.md)

---

## 🚀 Módulos y Capacidades Implementadas al 100%

1. **✨ Asistente de Redacción & Autocorrector Ortográfico Técnico (`SmartTextEditor`):**
   * Corrector inteligente en español colombiano para términos técnicos y periciales (instalación, técnico, eléctrico, tuberías, cotización, garantías, reparaciones).
   * Normalización automática de puntuación, espaciado y mayúsculas tras punto.
   * Barra de herramientas visual: Negrita, Cursiva, Listas con viñetas y numeradas, Títulos, Alertas urgentes y Notas de conformidad.
   * Selector de 6 plantillas técnicas de 1 solo clic (Diagnóstico, Mantenimiento preventivo, Plomería, Red eléctrica, Pintura/Estuco, Acta de recibido a satisfacción).
   * Contador de palabras y caracteres en tiempo real.

2. **✍️ Firma Digital y Certificación Electrónica Multi-Rol (`DigitalSignatureModal`):**
   * 3 modalidades de captura: Trazo táctil fluido en Canvas HD, Firma tipográfica caligráfica certificada y Carga de archivo de imagen.
   * Sellos de seguridad personalizados por rol (`admin`, `contratista`, `empresa`/`cliente`, `supervisor`).
   * **Firma en 1 clic:** Permite guardar la firma en el perfil del usuario para estamparla al instante en campo sin tener que dibujar cada vez.
   * Hash de integridad y marca de tiempo en hora legal colombiana.

3. **🛡️ Seguridad Bancaria con Código OTP para Eliminaciones:**
   * Autorización de doble factor: ningún registro se elimina sin un **código OTP aleatorio de 6 dígitos** (expiración de 2 minutos) enviado a `administracion@sosenlinea.com`.

4. **🗑️ Papelera de Seguridad & Restauración de Backups:**
   * Copia de seguridad automática antes de cualquier borrado, con restauración instantánea en 1 clic y exportación de backups completos en JSON cifrado.

5. **💵 Formateo de Moneda Colombiana (COP):**
   * Separación estricta de miles con punto (`$ 2.450.000`) y decimales con coma (`$ 2.450.000,00`) conforme al estándar bancario y de la DIAN.

6. **📱 Blindaje Anti-Desbordamiento (Overflow-Proof Shield):**
   * Auditoría de layout: Viewport protegido contra desplazamientos horizontales no deseados, tablas con contenedor `overflow-x-auto` independiente, modales adaptados a 92vh/96vw y celdas protegidas con `break-word`.

7. **📋 Centro de Órdenes de Trabajo y Reportes (`tblReportes`):**
   * Flujo de 4 pasos: Caso Inicial (#idRegistro) -> Cotizaciones Múltiples -> Documento Imprimible con Firma -> Seguimiento de Proceso y WhatsApp a 1 clic.
   * Trazabilidad completa con 29 estados operativos y barra de avance porcentual en vivo.

8. **🏢 Catálogos Maestros Completos:**
   * Terceros y Contratistas (con especialidad y cuenta bancaria), Clientes Inmobiliarios, Materiales de Obra (con alertas de stock), Sectores Urbanos y Herramientas.

9. **💰 Contabilidad Operativa & Validación de NIT:**
   * Ingresos, Egresos, Cuentas de Cobro, Balances y Validador de NIT con algoritmo oficial de Dígito de Verificación de la DIAN.

10. **🔐 Control de Acceso por Roles (RBAC):**
    * 7 perfiles: `admin`, `auxiliar`, `maestros`, `contable`, `campo`, `usuario`, `desarrollador`.

---

## 🛠️ Tecnologías y Stack Técnico

* **Frontend:** React 19, TypeScript 5.8, Vite 8.3, Vanilla CSS con Design Tokens ejecutivos.
* **Backend & Base de Datos:** PostgreSQL 17.6 en Supabase Cloud con conexión directa PostgREST y Service Role Key.
* **Iconografía:** Lucide React.
* **Hosting & CI/CD:** Vercel Edge Network con despliegue continuo automático desde rama `main`.

---

## ⚡ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor local
npm run dev

# Compilar para producción (TypeScript + Vite)
npm run build
```

---
*SOSENLINEA — Solución Digital Integral para el Mantenimiento Inmobiliario en Colombia.*
