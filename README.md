# 🛠️ SOSENLINEA — Sistema Operativo y ERP Web para Mantenimiento Inmobiliario (2026)

Plataforma empresarial de gestión operativa, financiera, logística y documental para el sector inmobiliario y de mantenimiento locativo en Colombia. Desarrollada con arquitectura moderna de alta disponibilidad sobre **React 19 + TypeScript + Vite + Supabase Cloud (PostgreSQL 17.6) + PostgREST + Vercel Edge CI/CD**.

* 🌐 **Sitio Web en Producción:** [https://sosenlinea.vercel.app](https://sosenlinea.vercel.app)
* 🗄️ **Base de Datos Cloud:** PostgreSQL 17.6 en Supabase Cloud (`us-east-1`, Ref: `hgywidapnfslfsjfuxdi`)
* 📦 **Repositorio GitHub Oficial:** [https://github.com/paespa2/SOSENLINEA.git](https://github.com/paespa2/SOSENLINEA.git) (Rama `main`)

---

## 📚 DOCUMENTACIÓN OFICIAL DEL PROYECTO

Toda la información del sistema se encuentra documentada a detalle en los siguientes manuales maestros:

1. 📄 **[RESUMEN_EJECUTIVO_BD.md](./RESUMEN_EJECUTIVO_BD.md):**
   - Auditoría técnica completa de la plataforma (qué tenemos implementado al 100% vs. qué falta para la Fase 2).
   - Ficha técnica de arquitectura, seguridad y persistencia resiliente PostgREST.
   - Especificación de roles, permisos granulares y credenciales.
   - Propuesta económica oficial de **$12.000.000 COP** estructurada en **4 cuotas de $3.000.000 COP** condicionadas a hitos.
   - Bitácora cronológica de versiones y despliegues.

2. 📖 **[MANUAL_DE_OPERACIONES_Y_USUARIO.md](./MANUAL_DE_OPERACIONES_Y_USUARIO.md):**
   - Guía paso a paso para usuarios y personal operativo.
   - Cómo crear órdenes de trabajo en el flujo de 4 partes.
   - Uso del Asistente de Redacción y Autocorrector Ortográfico (`SmartTextEditor`).
   - Configuración y firma digital en 1 clic desde el celular o tablet.
   - Protocolo de seguridad bancaria con Código OTP para eliminaciones y restauración desde la papelera de contingencia.
   - Liquidación de cuentas de cobro y validación de NIT DIAN.

---

## 🚀 RESUMEN DE CAPACIDADES PRINCIPALES

* **✨ Asistente de Redacción & Autocorrector Técnico (`SmartTextEditor`):** Corrección ortográfica instantánea de términos técnicos colombianos (acentuación, puntuación, mayúsculas) y 6 plantillas de diagnóstico/recibido.
* **✍️ Firma Digital Multi-Rol con Firma en 1 Clic (`DigitalSignatureModal`):** Canvas táctil HD, firma caligráfica certificada y almacenamiento de firma en el perfil del usuario para agilidad operativa en campo.
* **🛡️ Seguridad Bancaria 2FA (Código OTP):** Ningún registro se elimina sin un código de seguridad de 6 dígitos con expiración de 2 minutos despachado a `administracion@sosenlinea.com`.
* **🗑️ Papelera de Seguridad & Backups JSON:** Restauración en 1 segundo de órdenes eliminadas y exportador de copias de seguridad en formato JSON.
* **💵 Moneda Colombiana Estricta (COP):** Separador de miles con punto (`$ 2.450.000`) y decimales con coma (`$ 2.450.000,00`) según estándar bancario y de la DIAN.
* **📱 Blindaje Global Anti-Desbordamiento:** Layout responsivo protegido contra scroll horizontal indeseado, modales adaptados a 92vh/96vw y celdas protegidas con `break-word`.
* **📋 Gestión Integral de Órdenes en 4 Pasos:** Registro de Caso -> Cotizaciones Múltiples -> Acta Imprimible con Firma -> Bitácora y Enlace a WhatsApp.
* **🏢 Catálogos Maestros:** Clientes, Contratistas/Terceros, Materiales de Obra, Sectores Urbanos y Herramientas.
* **💰 Contabilidad Operativa & Validación de NIT:** Ingresos, Egresos, Cuentas de Cobro y Validador de NIT con Dígito de Verificación DIAN.
* **🔐 Control de Acceso por Roles (RBAC):** 7 perfiles operativos (`admin`, `auxiliar`, `maestros`, `contable`, `campo`, `usuario`, `desarrollador`).

---

## 🛠️ STACK TECNOLÓGICO

* **Frontend:** React 19, TypeScript 5.8, Vite 8.3, Design Tokens ejecutivos en CSS puro.
* **Base de Datos:** PostgreSQL 17.6 en Supabase Cloud con Service Role Key administrativa.
* **Iconografía:** Lucide React.
* **Despliegue & Hosting:** Vercel Edge Network con despliegue continuo automático en rama `main`.

---

## ⚡ COMANDOS DE DESARROLLO

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo local
npm run dev

# 3. Compilación de producción (TypeScript + Vite)
npm run build
```

---
*SOS EN LÍNEA — Solución Digital Integral para el Mantenimiento Inmobiliario en Colombia © 2026.*
