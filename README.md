# SOSENLINEA - Sistema Integral de Gestión Inmobiliaria y Mantenimiento

Sistema web corporativo diseñado para el mantenimiento, reparación y alistamiento de inmuebles en Medellín y municipios del Valle de Aburrá (Colombia). Desarrollado con arquitectura moderna en **React 18 + TypeScript + Vite + Vanilla CSS**, optimizado para escritorio (PC) y dispositivos móviles (iPhone, iPad, Android).

---

## 🛠️ Tecnologías y Stack Técnico

- **Frontend Core**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Diseño & Estilos**: Vanilla CSS con variables de diseño (Design Tokens), arquitectura responsiva nativa y soporte para modo oscuro e impresión oficial (`@media print`).
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Almacenamiento Local & Reactivo**: Context API (`AuthContext`, `DataContext`, `LanguageContext`) con soporte para sincronización offline y persistencia en cliente.

---

## 📂 Arquitectura de Módulos y Rutas

```
sos_programa_web/
├── src/
│   ├── components/
│   │   ├── auth/           # LoginView, Cambio de Clave, Control de Sesión
│   │   ├── common/         # Modal, Badge, Feedback, Spinner
│   │   ├── home/           # HomePage pública bilingüe (ES / EN)
│   │   ├── layout/         # Navbar (Móvil/PC), Sidebar Drawer, Breadcrumb
│   │   └── modules/
│   │       ├── dashboard/   # Panel Principal y Estadísticas en Vivo
│   │       ├── reportes/    # Reportes & Órdenes (4 Fases Operativas)
│   │       ├── cotizaciones/# Cotizaciones y Presupuestos ligados a idRegistro
│   │       ├── contable/    # Ingresos, Egresos, Cuentas de Cobro, Balances
│   │       ├── informes/    # Diario Consolidado, Novedades, Encuestas
│   │       ├── operaciones/ # Llaves, Entrega de Materiales, Herramientas
│   │       ├── maestros/    # Inmobiliarias, Sectores, Contratistas, Materiales
│   │       ├── impresiones/ # Generador de Actas y Cotizaciones en PDF
│   │       ├── auditoria/   # Bitácora Criptográfica de Eventos y Sellos
│   │       └── database/    # Consola de Base de Datos y Diagnósticos
│   ├── context/            # AuthContext, DataContext, LanguageContext
│   ├── data/               # Semillas iniciales y catálogo de pruebas
│   ├── types/              # Definiciones TypeScript de entidades
│   └── utils/              # Formateadores COP/Fecha, Exportación CSV, Imprimir
├── public/                 # Favicon, assets estáticos y reglas SPA (_redirects)
├── vercel.json             # Enrutamiento SPA para Vercel
├── .env.example            # Plantilla de variables de entorno seguras
└── index.html              # HTML5 con meta viewport táctil para iOS/Android
```

---

## 🚀 Funcionalidades Destacadas

### 1. Jerarquía de Casos en 2 Niveles (`idRegistro` e `idCotizacion`)
- **`idRegistro`**: Identificador numérico secuencial del expediente de mantenimiento en predio.
- **`codigoAlfanumerico`**: Radicado editable para vincular códigos de inmobiliarias (ej. `ORD-2026-MED-01`).
- **`tipoTrabajo`**: Clasificación fija de labor que acompaña el historial del caso (*Plomería, Electricidad, Obra Civil, Pintura, Mantenimiento General, etc.*).
- **Sub-Cotizaciones Ligadas**: Un caso maestro puede contener múltiples cotizaciones (`idCotizacion`), permitiendo adiciones o reformas conservando la misma ficha técnica.

### 2. Formulario de 4 Fases Operativas
1. **Parte 1 - Reporte / Caso**: Dirección, rutas de transporte público (buses/metro), referencia en predio, selector de "Quién Contrata" (*Arrendatario, Propietario, Inmobiliaria, Tercero*), checklist opcional de Arrendatario y Propietario con documento (CC/NIT/CE), y asignación técnica dual (**Técnico de Cotización** + **Técnico de Ejecución**).
2. **Parte 2 - Cotización de Mano de Obra y Materiales**: Matriz de ítems con unidades de medida (`UN`, `M2`, `ML`, `GLB`, `HR`, `DIA`), precios unitarios ajustables y notas técnicas por etiquetas predeterminadas.
3. **Parte 3 - Firma Electrónica & Acta Digital**: Canvas táctil interactivo para firma en sitio (con soporte para iPhone/Android) y generación de documento PDF imprimible.
4. **Parte 4 - Proceso & Seguimiento en Vivo**:
   - Selector de **22+ estados agrupados** (*Cotizaciones, Comunicaciones, Operaciones y Financiero*).
   - **Agenda de Actividades y Horarios**: Programación de visitas y controles de calidad con alternador de estado (`Programada` ↔ `Cumplida`).
   - **Anexos Técnicos y Notas por Etiquetas**: Registro de reformas locativas con estimación de duración.
   - **Notificaciones WhatsApp Multicanal a un Clic**: Filtros por Destinatario (*Arrendatario, Propietario, Proveedor*) y Propósito (*Llamado a la Acción CTA vs Confirmación Informativa*), con firma y nombre del asesor en sesión.
   - **Sellos Digitales de Autoría**: Registro inmutable de cada novedad con usuario, cargo y sello criptográfico (`SOS-SIG-...`).

### 3. Informe Diario Consolidado
- Búsqueda multi-parámetro por `idRegistro`, `codigoAlfanumerico`, `tipoTrabajo` y estado.
- Vista de correlación de expedientes con detalle de sub-cotizaciones vinculadas, total cotizado y citas activas en agenda.
- Exportación a CSV e impresión en PDF formal.

---

## 🔐 Matriz de Roles y Seguridad

| Módulo / Función | Administrador | Auxiliar Administrativo |
| :--- | :---: | :---: |
| **Dashboard y Estadísticas** | ✅ Acceso Total | ✅ Acceso Total |
| **Reportes y Órdenes** | ✅ Acceso Total | ✅ Acceso Total |
| **Cotizaciones y Presupuestos** | ✅ Acceso Total | ✅ Acceso Total |
| **Informes Diarios & Casos** | ✅ Acceso Total | ✅ Acceso Total |
| **Generador de Impresiones PDF** | ✅ Acceso Total | ✅ Acceso Total |
| **Módulos Contables & Balances** | ✅ Acceso Total | ❌ Acceso Denegado |
| **Maestros (Clientes, Terceros)** | ✅ Acceso Total | ❌ Acceso Denegado |
| **Auditoría & Consola de BD** | ✅ Acceso Total | ❌ Acceso Denegado |

---

## 💻 Instalación y Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/TU_USUARIO/sos_programa_web.git
   cd sos_programa_web
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abrir en el navegador en `http://localhost:5173`.

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 🌐 Guía de Despliegue en Producción

### Despliegue en Vercel
1. Instala el CLI de Vercel o conecta tu repositorio de GitHub directamente desde [vercel.com](https://vercel.com).
2. El archivo `vercel.json` incluido reescribe automáticamente todas las rutas al `index.html` para la SPA.
3. El comando de build es `npm run build` y el directorio de salida es `dist`.

### Despliegue en Netlify
1. Conecta tu repositorio en [netlify.com](https://netlify.com).
2. El archivo `public/_redirects` incluido asegura el funcionamiento de rutas directas y recargas.
3. Build command: `npm run build`, Publish directory: `dist`.

---

## 📄 Licencia

Uso exclusivo corporativo para **SOSENLINEA**. Todos los derechos reservados.
