# 📖 MANUAL DE OPERACIONES Y GUÍA DE USUARIO
### PLATAFORMA SOS EN LÍNEA — GESTIÓN INMOBILIARIA Y MANTENIMIENTO LOCATIVO
**Versión del Sistema:** 2.4.0 (2026)  
**Acceso Web:** [https://sosenlinea.vercel.app](https://sosenlinea.vercel.app)  

---

## 🎯 OBJETIVO DEL MANUAL
Este documento es la guía oficial de consulta rápida para el personal administrativo, auxiliares de servicio, contadores, supervisores y cuadrillas técnicas de **SOS EN LÍNEA**. Aquí se explica de manera sencilla y visual cómo utilizar cada módulo de la plataforma web.

---

## 🔑 1. INICIO DE SESIÓN Y SELECCIÓN DE ROL

1. Ingresa a [https://sosenlinea.vercel.app](https://sosenlinea.vercel.app).
2. Si no has iniciado sesión, verás la **Página de Bienvenida (Home Page)**.
3. Haz clic en el botón superior **"Iniciar Sesión / Ingresar al Sistema"**.
4. Puedes ingresar con cualquiera de los correos corporativos asignados (o seleccionar un rol en el selector rápido de demostración):
   - **Administrador:** `admin@sosenlinea.com` (Control y aprobación total).
   - **Auxiliar de Operaciones:** `auxiliar@sosenlinea.com` (Gestión de órdenes y clientes).
   - **Contabilidad:** `contable@sosenlinea.com` (Cuentas de cobro, ingresos y egresos).
   - **Técnico de Campo:** `campo@sosenlinea.com` (Ejecución y firmas en celular).
5. Contraseña por defecto: `Admin2026*`.
6. Haz clic en **"Entrar al Sistema"**.

---

## 📋 2. GESTIÓN DE ÓRDENES DE TRABAJO Y REPORTES

### 2.1. ¿Cómo crear una nueva orden de trabajo?
1. En el menú lateral, pulsa **"Órdenes y Reportes"**.
2. Haz clic en el botón azul superior **"+ Nueva Orden de Trabajo"**.
3. **Paso 1: Datos del Caso:**
   - Selecciona el **Cliente / Inmobiliaria** en la lista desplegable.
   - Escribe la **Dirección del Inmueble** (ej. *Calle 10 # 43E-20, Apto 502*).
   - Elige el **Sector** de la ciudad.
   - Asigna el **Contratista o Técnico** encargado.
   - **Redacción de la Descripción:**
     - Escribe los detalles del daño o trabajo a realizar.
     - **Tip Pro:** Pulsa el botón **`✨ Autocorregir`** para que el sistema corrija automáticamente la ortografía técnica, tildes y mayúsculas.
     - **Tip Pro 2:** Pulsa el botón **`📋 Plantillas`** para insertar diagnósticos predefinidos de plomería, electricidad, pintura o mantenimiento.
   - Asigna el presupuesto inicial estimado y pulsa **"Guardar y Continuar a Cotización"**.

4. **Paso 2: Cotizaciones del Caso:**
   - Agrega los ítems que componen el arreglo (Mano de obra, Materiales, Transporte).
   - El sistema calcula subtotales, margen comercial e impuestos automáticamente.

5. **Paso 3: Documento PDF & Firma Electrónica:**
   - Aquí se genera el acta formal de la orden de trabajo.
   - **Para Firmar:**
     - Si ya configuraste tu firma en tu perfil, pulsa **`⚡ Firmar en 1 Clic`**.
     - O pulsa **`✏️ Asistente de Firma`** para dibujar tu firma en pantalla táctil con el dedo o seleccionar firma certificada.
   - Pulsa **"Imprimir / Descargar PDF Oficial"** para guardar el documento o imprimirlo.

6. **Paso 4: Seguimiento en Vivo & WhatsApp:**
   - Registra notas cronológicas sobre avances o acuerdos con el arrendatario.
   - Pulsa el botón verde **"WhatsApp"** para enviar un mensaje directo al cliente con los datos de la orden precargados.

---

## ✍️ 3. CONFIGURACIÓN DE TU FIRMA DIGITAL PERSONAL

Para poder firmar cualquier documento u orden en 1 solo segundo desde tu celular o computadora:
1. Haz clic en tu nombre en la parte superior derecha de la pantalla y pulsa **"Mi Perfil"**.
2. Selecciona la pestaña **"Firma Digital"**.
3. Haz clic en **"Crear mi Firma Digital Ahora"**:
   - **Opción A (Trazo con el dedo o mouse):** Dibuja tu firma en el recuadro blanco.
   - **Opción B (Firma Certificada):** Escribe tu nombre y el sistema generará una firma caligráfica formal.
   - **Opción C (Subir imagen):** Carga una foto de tu firma.
4. Asegúrate de marcar la casilla **"Guardar esta firma como mi firma predeterminada"**.
5. Haz clic en **"Confirmar y Estampar Firma"**. ¡Listo! A partir de ese momento podrás firmar cualquier documento con un solo clic.

---

## 🛡️ 4. CÓMO BORRAR UN REGISTRO DE MANERA SEGURA (CÓDIGO OTP)

Para evitar pérdidas accidentales de información, el sistema cuenta con seguridad bancaria:
1. Al pulsar el botón de **Eliminar** (ícono de caneca roja) en una orden:
2. Aparecerá la ventana de seguridad **"Autorización de Seguridad Bancaria"**.
3. El sistema genera un **código de seguridad de 6 dígitos** (válido por 2 minutos) registrado para `administracion@sosenlinea.com`.
4. Copia el código que aparece en el recuadro superior e ingrésalo en las 6 casillas.
5. Haz clic en **"Autorizar y Eliminar Registro"**.
6. **¿Qué pasa con la orden?** La orden no se destruye de inmediato; se guarda automáticamente en la **Papelera de Seguridad**.

---

## 🗑️ 5. USO DE LA PAPELERA Y RESTAURACIÓN DE BACKUPS

Si borraste una orden por error o necesitas recuperar información:
1. En el módulo de Órdenes, pulsa el botón **`🗑️ Papelera & Backups`** en la barra superior.
2. Verás la lista de todas las órdenes eliminadas recientemente.
3. Para recuperar una orden, haz clic en **"Restaurar"**. La orden volverá inmediatamente a la lista activa con todos sus datos intactos.
4. Para descargar una copia de seguridad en tu computadora, pulsa **"Exportar Backups JSON"**.

---

## 💵 6. MÓDULO CONTABLE Y VALIDACIÓN DE NIT DIAN

### 6.1. Cuentas de Cobro de Contratistas
1. En el menú, dirígete a **Contabilidad ➔ "Cuentas de Cobro"**.
2. Puedes registrar cuentas de cobro de los técnicos, asociándolas a las órdenes ejecutadas, calculando retenciones de ley y verificando sus cuentas bancarias.

### 6.2. Validador Oficial de NIT ante la DIAN
1. Ve a **Contabilidad ➔ "Validador de NIT"**.
2. Escribe el número del NIT o cédula del cliente o contratista.
3. El sistema aplica el algoritmo oficial de la DIAN y te indicará el **Dígito de Verificación (DV)** exacto y si el documento está correctamente estructurado para facturación electrónica.

---

## 🏢 7. ADMINISTRACIÓN DE CATÁLOGOS MAESTROS

En la sección **Maestros** puedes gestionar los datos base de la empresa:
- **Clientes:** Registro de inmobiliarias, propietarios y empresas con sus datos de contacto y facturación.
- **Contratistas / Terceros:** Registro de técnicos y cuadrillas con especialidad (electricista, plomero, pintor) y datos bancarios para transferencias.
- **Materiales:** Inventario de insumos de obra con precios unitarios y alertas de stock mínimo.
- **Sectores:** Zonas de cobertura urbana para zonificación de cuadrillas.
- **Herramientas & Llaves:** Control de inventario de equipos y custodia de llaves de los inmuebles atendidos.

---
*Manual de Operaciones SOS EN LÍNEA — Versión 2.4.0 (2026).*
