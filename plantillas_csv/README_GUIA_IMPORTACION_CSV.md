# 📋 Plantillas Oficiales de Importación CSV - SOSENLINEA ERP (2026-2027)

Este directorio contiene las plantillas maestras en formato CSV (delimitado por punto y coma `;` o coma `,`) para poblar e inicializar la base de datos de SOSENLINEA con registros limpios.

---

## 1. Plantilla de Órdenes y Reportes (`plantilla_modelo_reportes_sosenlinea.csv`)

### Columnas y Campos Soportados:

| Columna en CSV | Tipo | Obligatorio | Descripción / Ejemplo |
| :--- | :--- | :--- | :--- |
| **`Radicado`** | Texto / Número | Opcional | Número de orden (ej: `#1001`, `1001`, `ORD-2026-01`). Si se omite, el sistema lo genera automáticamente. |
| **`Fecha`** | Fecha | Opcional | Fecha del registro en formato `YYYY-MM-DD` (ej: `2026-09-27`). |
| **`Direccion_Inmueble`**| Texto | **Sí** | Dirección física del predio u orden (ej: `Cra 43A # 18 Sur - 120, Apto 502`). |
| **`Sector`** | Texto | Recomendado | Barrio o zona (ej: `El Poblado`, `Laureles`, `Belén`, `Medellín Centro`). |
| **`Cliente_Inmobiliaria`**| Texto | **Sí** | Inmobiliaria o cliente que contrata (ej: `Inversiones Santa María`). |
| **`Arrendatario`** | Texto | Opcional | Nombre del arrendatario o inquilino en sitio (ej: `Juan David Gómez`). |
| **`Propietario`** | Texto | Opcional | Nombre del titular del predio (ej: `Marta Helena Vélez`). |
| **`Quien_Contrata`** | Texto | Opcional | `Propietario`, `Arrendatario`, o `Inmobiliaria`. |
| **`Tipo_Trabajo`** | Texto | Recomendado | `Mantenimiento General`, `Mantenimiento Eléctrico`, `Plomería`, `Pintura`, etc. |
| **`Contratista_Asignado`**| Texto | Recomendado | Razón social o técnico a cargo (ej: `ESTRUCTURAS Y CONSTRUCCIONES S.A.S.`). |
| **`Total_Cotizado`** | Número | Recomendado | Valor total en COP sin signos de puntuación extra (ej: `3800000`). |
| **`Avance_Porcentaje`** | Número | Opcional | Número entre `0` y `100` (ej: `65`). Si el estado es `Ejecutado`, se asigna 100%. |
| **`Estado`** | Texto | Recomendado | `Borrador`, `Cotizado`, `En Progreso`, `En Revisión`, `Ejecutado`, `Cobrado`, `Garantía`. |
| **`Descripcion_Detalle`**| Texto | Opcional | Resumen detallado del daño, diagnóstico o trabajo solicitado. |

---

## 2. Plantilla de Catálogo de Materiales (`plantilla_modelo_materiales_sosenlinea.csv`)

### Columnas y Campos Soportados:

| Columna en CSV | Tipo | Descripción / Ejemplo |
| :--- | :--- | :--- |
| **`Codigo`** | Texto | Código de inventario (ej: `MAT-101`). |
| **`Nombre_Material`** | Texto | Nombre descriptivo del insumo o producto. |
| **`Categoria`** | Texto | `Eléctricos`, `Plomería`, `Pintura`, `Cerrajería`, `Mampostería`, etc. |
| **`Unidad`** | Texto | `Metro`, `Unidad`, `Tira 6m`, `Cuñete`, `Galón`, `Bolsa`. |
| **`Precio_Unitario`** | Número | Precio de venta o costo unitario en COP (ej: `18500`). |
| **`Stock_Actual`** | Número | Existencia física disponible en bodega (ej: `45`). |
| **`Stock_Minimo`** | Número | Umbral para alerta de reabastecimiento (ej: `10`). |
| **`Ubicacion`** | Texto | Estantería o área de almacén (ej: `Bodega Principal - Estante E2`). |
| **`Estado`** | Texto | `Optimo`, `Bajo Stock`, o `Agotado`. |

---

## 3. ¿Cómo Importar en el Sistema Web?

1. Abre el panel en [http://localhost:5173](http://localhost:5173).
2. Ve a **"Órdenes y Reportes"** o al **"Panel Principal"**.
3. Haz clic en el botón superior **"Importar CSV"**.
4. Puedes descargar la plantilla directamente desde el botón **"Descargar Plantilla CSV"** o usar los archivos de esta carpeta.
5. Puedes seleccionar la opción:
   - **"Inicializar base de datos limpia"**: Borra registros previos para arrancar desde cero con tu archivo CSV.
   - **"Anexar a registros existentes"**: Conserva lo que ya tienes y suma las filas nuevas.
6. El asistente detectará los encabezados automáticamente, te mostrará la vista previa y guardará los datos con sincronización total.
