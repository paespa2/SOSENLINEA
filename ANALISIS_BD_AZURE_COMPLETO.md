# 📊 ANÁLISIS COMPLETO BASE DE DATOS AZURE SQL
**Sistema de Gestión Empresarial - Programaacces**

---

## 🔍 RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| **Total de Tablas** | 94 |
| **Tablas Activas** | ~70 (tablas principales) |
| **Tablas Duplicadas/Obsoletas** | ~24 (requieren limpieza) |
| **Tipo de Base de Datos** | Migración Access → SQL Server |
| **Estado** | ⚠️ Requiere normalización y refactorización |

---

## 📋 TABLAS PRINCIPALES POR MÓDULO

### **1. MÓDULO: MAESTROS (Catálogos & Configuración)**

#### Clientes / Contratantes
- **tblClientes** (10 col) - Información de clientes principales
- **tblContratistas** (18 col) - Contratistas, especialidades, datos bancarios
- **tblNIT** (2 col) - Mapping NIT ↔ Contratante
- **NITS** (7 col) - Validación de NITs (duplicada/legacy)

#### Sectores & Zonas
- **tblSectores** (4 col) - Sectores, rutas, referencias
- **tblOrigen** (2 col) - Origen de las solicitudes

#### Herramientas & Equipos
- **tblHerramientas** (10 col) - Catálogo de herramientas/equipos
- **tblGrupoHerramientas** (2 col) - Grupos/categorías
- **tblEventoHerramienta** (3 col) - Asignación de eventos a herramientas
- **tblAsignacionHerramienta** (4 col) - Control de asignaciones

#### Materiales & Insumos
- **tblMateriales** (9 col) - Catálogo de materiales
- **tblMaterialesOriginal** (7 col) - Versión original (legacy)
- **tblInsumos** (8 col) - Insumos con referencias
- **tblMaterialesInventario** (4 col) - Stock actual
- **tblMaterialesInventarioAlm** (4 col) - Inventario almacén

#### Configuración
- **tblClase** (2 col) - Clasificación de elementos
- **tblGrupo** (3 col) - Grupos principales
- **tblAmbientes** (2 col) - Ambientes/espacios
- **tblEstado** (2 col) - Estados de registros
- **tblNovedades** (2 col) - Tipos de novedades
- **tabCuentas** (3 col) - Cuentas contables
- **tblPlanCuentas** (17 col) - Plan contable completo

---

### **2. MÓDULO: CONTABLE (Movimientos Financieros)**

#### Movimientos Contables
- **MOVIMIENTO** (14 col) - Registro de movimientos (legacy, de Access)
- **tblEgresos** (8 col) - Egresos registrados
- **tblEgresos_Liq_Tecnicos** (7 col) - Liquidaciones técnicas
- **tblRecibosCaja** (8 col) - Recibos de caja
- **tblRecibosCajaCasosPagados** (6 col) - Pagos por caso

#### Cuentas Corrientes & Cobro
- **tblCuentasCobro** (11 col) - Cuentas de cobro principales
- **tblCuentasCobro1** (8 col) - Versión simplificada (duplicada)
- **tblCtasCobro** (10 col) - Control de cuentas de cobro (legacy)
- **tblFacturasVenta** (10 col) - Facturas de venta

#### Centros de Costos
- **tabCentroCostos** (8 col) - Asignación de costos
- **tabControl** (2 col) - Control de registros

---

### **3. MÓDULO: COTIZACIONES & PRESUPUESTOS**

#### Cotizaciones (Principal)
- **tblCotizacion** (42 col) - **TABLA CRÍTICA** - Cotizaciones completas
- **tblDesCotizacion** (14 col) - Descripción detallada de items
- **tblDesCotizacionAmbientes** (3 col) - Ambientes involucrados
- **tblDesCotizacionGarantias** (3 col) - Garantías aplicables

#### Cotizaciones (Versiones Alternas/Legacy)
- **tblCotizacion1** (16 col) - Versión simplificada
- **tblCotizacionCopia** (23 col) - Copia de seguridad
- **tblCotizacionUno** (23 col) - Otra versión alternativa

#### Materiales en Cotización
- **tblMaterialeCotizacion** (7 col) - Materiales por cotización
- **tblMaterialeEntregadosContratista** (6 col) - Entregas a contratistas

#### Consolidaciones Financieras
- **tblConsolidadoCotizaciones** (4 col) - Sumario de cotizaciones
- **tblConsolidadoCaso** (5 col) - Consolidado por caso
- **tblConsolidadoValorCotizacion** (4 col) - Valores totales
- **tblConsolidadoValorCotizacionRealPagado** (3 col) - Valores pagados reales
- **tblTotalCotizacion** (3 col) - Totales finales

#### Análisis Financiero
- **tblGeneralResultadoFinacieroxCotizacion** (18 col) - Resultados P&L
- **tblGeneralxConceptoxCotizacio** (4 col) - Análisis por concepto
- **tblFactorCotizacion** (7 col) - Factores de incremento

---

### **4. MÓDULO: REPORTES & ÓRDENES DE TRABAJO**

#### Reportes (Principal)
- **tblReportes** (51 col) - **TABLA CRÍTICA** - Todas las órdenes de trabajo
  - Información de cliente, propiedad, dirección
  - Estados, fechas, asignaciones
  - Datos de contratista responsable

#### Detalles & Seguimiento
- **tblEjecucionTrabajos** (11 col) - Ejecución de órdenes
- **tblTareas** (8 col) - Tareas asociadas
- **tblProgramacion** (14 col) - Programación de trabajos

#### Entrega de Materiales
- **tblEntregaMateriales** (20 col) - Control de entregas
- **tblCorrespondencia** (9 col) - Comunicaciones/correspondencia
- **tblLlaves** (5 col) - Control de llaves

#### Informes & Consolidaciones
- **tblInforme** (5 col) - Informes generales
- **tblInforme1** (5 col) - Versión alternativa
- **tblInforme2009** (7 col) - Históricos 2009
- **tblInformeAnual** (7 col) - Resumen anual
- **tblConsolidadoLiquidacionTrabajo** (8 col) - Liquidaciones

#### Garantías
- **tblGarantias** (5 col) - Tipos de garantía
- **tblAutorizaciones** (8 col) - Autorizaciones de garantía
- **tblFirmaContrato** (20 col) - Firma y detalles de contrato

#### Reportes Especiales
- **XtblReportesConTareas** (1 col) - Reportes con tareas pendientes
- **XtblReportesExistentes** (2 col) - Índice de reportes
- **XtblUltimaNovedad** (3 col) - Última novedad por reporte

---

### **5. MÓDULO: ENCUESTAS & FEEDBACK**

- **tblPreguntasEncuesta** (2 col) - Preguntas de encuesta
- **tblRespuestasEncuesta** (8 col) - Respuestas registradas
- **tblRespuestasEncuestaValores** (1 col) - Valores de respuesta

---

### **6. MÓDULO: LIQUIDACIONES (Cálculos)**

- **tblLiquidacion** (7 col) - Liquidaciones detalladas
- **tblCorte** (5 col) - Cortes de período

---

### **7. MÓDULO: ANÁLISIS & ESTADÍSTICAS**

- **tblEstadisticas** (6 col) - Estadísticas por período
- **tblresumen** (4 col) - Resumen general
- **tblResumenEst** (6 col) - Resumen por estado
- **tblResumenAnualValores** (6 col) - Resumen anual financiero
- **tblEventos** (4 col) - Eventos registrados

---

### **8. TABLAS ESPECIALES (Financial/Consolidación)**

- **tblFINConsolidadoEgresos** (4 col) - FIN: Consolidado egresos
- **tblFINConsolidadoRecibosCaja** (3 col) - FIN: Recibos consolidados
- **tblFINConsolidadoxCotizacion** (7 col) - FIN: Por cotización
- **tblFINCreacionTblValorxCotizaciones** (3 col) - FIN: Valores por cotización
- **tblMundoAlianza** (6 col) - Datos de alianza externa

---

### **9. TABLAS OBSOLETAS/LEGACY (Requieren Limpieza)**

| Tabla | Razón | Acción |
|-------|-------|--------|
| **MOVIMIENTO** | Datos Access antiguos | ⛔ Deprecar |
| **bien_raiz** / **bien raiz** | Duplicadas, pocos datos | ⛔ Eliminar |
| **tblCotizacion1, tblCotizacionCopia, tblCotizacionUno** | Versiones alternas de tblCotizacion | ⚠️ Consolidar en tblCotizacion |
| **tblInforme, tblInforme1, tblInforme2009** | Múltiples versiones | ⚠️ Consolidar en tblInforme |
| **tblCuentasCobro1, tblCtasCobro** | Duplicadas de tblCuentasCobro | ⚠️ Consolidar |
| **Errores_al_guardar_Autocorrección_de_nombres** | Log de errores | ✅ Archivar |
| **liquida** | Tabla experimental | ❌ Eliminar |
| **Tabla1** | Tabla de prueba | ❌ Eliminar |
| **tblMaterialesOriginal** | Respaldo manual | ⚠️ Evaluar |

---

## 🔗 RELACIONES CRÍTICAS IDENTIFICADAS

### Jerarquía Principal
```
tblReportes (51 col) ← CENTRO DEL SISTEMA
    ├─ IdContratante → tblClientes
    ├─ IdContratista → tblContratistas
    ├─ IDSector → tblSectores
    ├─ IdEventos → tblEventos
    └─ IdEstado → tblEstado

tblCotizacion (42 col) ← PRESUPUESTOS
    ├─ IdRegistro → tblReportes
    ├─ IdContratista → tblContratistas
    ├─ IdGarantia → tblGarantias
    └─ Múltiples referencias a costos
```

### Flujo Contable
```
tblReportes → tblCotizacion → tblFacturasVenta → tblCuentasCobro → tblRecibosCaja → EGRESOS
```

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. **Falta de Normalización (3NF)**
- Muchas tablas tienen campos duplicados
- No hay relaciones FK explícitas en el script
- Tablas desnormalizadas (múltiples versiones de cotización)

### 2. **Falta de Integridad Referencial**
- No hay constraints explícitos entre tablas
- Riesgo de datos inconsistentes
- Orfandad de registros

### 3. **Diseño Heredado de Access**
- Campos con nombres inconsistentes (strXXX, numXXX, datXXX, memXXX, swXXX, olXXX)
- Tipos de datos ineficientes (float para IDs, nvarchar para números)
- Columnas timestamp innecesarias

### 4. **Tablas Obsoletas**
- 24 tablas duplicadas/legacy sin uso
- Genera confusión y mantenimiento innecesario

### 5. **Falta de Auditoría**
- No hay tabla de cambios (audit_log)
- Imposible rastrear quién y cuándo hizo cambios

---

## 💾 MAPEO A NUEVA ARQUITECTURA WEB

### Módulo 1: Maestros
```javascript
GET  /api/contractors          → tblContratistas
GET  /api/clients              → tblClientes
GET  /api/sectors              → tblSectores
GET  /api/materials            → tblMateriales
GET  /api/tools                → tblHerramientas
GET  /api/accounts             → tblPlanCuentas
```

### Módulo 2: Contable
```javascript
GET  /api/movements            → MOVIMIENTO + tblEgresos + tblRecibosCaja
POST /api/movements            → tblEgresos (nuevo)
GET  /api/accounts-payable     → tblCuentasCobro
POST /api/invoices             → tblFacturasVenta (nuevo)
```

### Módulo 3: Cotizaciones
```javascript
GET  /api/quotations           → tblCotizacion (consolidar tblCotizacion1, tblCotizacionCopia)
POST /api/quotations           → tblCotizacion (nuevo)
PUT  /api/quotations/:id       → tblCotizacion (actualizar)
GET  /api/quotations/:id/financial-summary → tblGeneralResultadoFinacieroxCotizacion
```

### Módulo 4: Reportes
```javascript
GET  /api/work-orders          → tblReportes
POST /api/work-orders          → tblReportes (nuevo)
PUT  /api/work-orders/:id      → tblReportes + tblEjecucionTrabajos
GET  /api/work-orders/:id/tasks → tblTareas
GET  /api/work-orders/:id/timeline → tblProgramacion + tblEjecucionTrabajos
```

### Módulo 5: Informes
```javascript
GET  /api/reports/daily        → tblReportes filtrado por fecha
GET  /api/reports/by-contractor → tblReportes agrupado por tblContratistas
GET  /api/reports/by-sector    → tblReportes agrupado por tblSectores
GET  /api/reports/annual       → tblResumenAnualValores
GET  /api/reports/survey       → tblRespuestasEncuesta
```

---

## 🛠️ PLAN DE REFACTORIZACIÓN

### FASE 1: Limpieza (Semana 1)
```sql
-- 1. Eliminar tablas obsoletas
DROP TABLE Errores_al_guardar_Autocorrección_de_nombres;
DROP TABLE Errores_de_pegado;
DROP TABLE bien_raiz;
DROP TABLE bien raiz;
DROP TABLE liquida;
DROP TABLE Tabla1;
-- ... etc
```

### FASE 2: Consolidación (Semana 2)
```sql
-- 2. Consolidar cotizaciones
INSERT INTO tblCotizacion (columnas) 
SELECT (columnas) FROM tblCotizacion1 WHERE NOT EXISTS...;

DELETE FROM tblCotizacion1;
DROP TABLE tblCotizacion1;
-- ... repetir para tblCotizacionCopia, tblCotizacionUno
```

### FASE 3: Normalización (Semana 3)
```sql
-- 3. Añadir Foreign Keys
ALTER TABLE tblCotizacion 
  ADD CONSTRAINT FK_Cot_Reporte 
  FOREIGN KEY (IdRegistro) REFERENCES tblReportes(IdRegistro);

ALTER TABLE tblReportes 
  ADD CONSTRAINT FK_Rep_Cliente 
  FOREIGN KEY (IdContratante) REFERENCES tblClientes(IdContratante);

-- ... etc
```

### FASE 4: Auditoría (Semana 4)
```sql
-- 4. Crear tabla de auditoría
CREATE TABLE audit_logs (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT,
  action VARCHAR(20),
  table_name VARCHAR(100),
  entity_id VARCHAR(50),
  before_data NVARCHAR(MAX),
  after_data NVARCHAR(MAX),
  changed_at DATETIME2 DEFAULT GETDATE(),
  ip_address VARCHAR(50)
);

-- Triggers en tablas principales
-- CREATE TRIGGER tr_tblReportes_Audit ON tblReportes ...
-- CREATE TRIGGER tr_tblCotizacion_Audit ON tblCotizacion ...
```

---

## 📊 ESTADÍSTICAS DE DATOS (Estimadas)

| Tabla | Registros Est. | Tamaño Est. |
|-------|-----------------|-------------|
| tblReportes | 5,000 - 50,000 | 100-500 MB |
| tblCotizacion | 5,000 - 50,000 | 80-400 MB |
| tblContratistas | 100-500 | 1-5 MB |
| tblClientes | 50-200 | 0.5-2 MB |
| tblMateriales | 500-2,000 | 5-20 MB |
| tblDesCotizacion | 50,000-500,000 | 200-1000 MB |

---

## 🔐 RECOMENDACIONES DE SEGURIDAD

1. **Nunca exponer IDs directamente** - Usar UUIDs
2. **Implementar Row-Level Security (RLS)** - Por rol/usuario
3. **Encriptar campos sensibles** - NITs, direcciones, números de cuenta
4. **Audit trail completo** - Quién, qué, cuándo, dónde, por qué
5. **Backups automáticos** - Daily en Azure SQL

---

## 📈 INDEXACIÓN RECOMENDADA

```sql
-- Tablas principales
CREATE CLUSTERED INDEX idx_tblReportes_IdRegistro 
  ON tblReportes(IdRegistro);
CREATE NONCLUSTERED INDEX idx_tblReportes_IdContratante 
  ON tblReportes(IdContratante);
CREATE NONCLUSTERED INDEX idx_tblReportes_Fecha 
  ON tblReportes(datFecha);

CREATE CLUSTERED INDEX idx_tblCotizacion_IdCotizacion 
  ON tblCotizacion(IdCotizacion);
CREATE NONCLUSTERED INDEX idx_tblCotizacion_IdRegistro 
  ON tblCotizacion(IdRegistro);

-- Tablas de búsqueda
CREATE NONCLUSTERED INDEX idx_tblContratistas_NIT 
  ON tblContratistas(IdContratista);
CREATE NONCLUSTERED INDEX idx_tblMateriales_Descripcion 
  ON tblMateriales(strDescripcion);
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Backup Completo** de base de datos actual
2. 📝 **Script de Limpieza** - Eliminar obsoletos
3. 🔗 **Añadir Constraints** - Integridad referencial
4. 📊 **Migración de Datos** - Consolidar duplicados
5. 🛡️ **Implementar Auditoría** - Trigger audit trail
6. 🧪 **Testing** - Validar integridad
7. 🌐 **API REST** - Exponer tablas normalizadas
8. 📱 **Frontend Web** - React + TypeScript

---

**Generado:** 2026-09-14
**Base de Datos:** Programaacces.database.windows.net
**Estado:** Ready for refactoring
