# 🎯 PROMPT TÉCNICO COMPLETO: DESARROLLO SISTEMA WEB
## Integración con Base de Datos Azure SQL Actual (Programaacces)

---

## 📋 ÍNDICE

1. Visión General & Objetivos
2. Arquitectura Técnica
3. Mapeo BD Actual → Aplicación Web
4. Especificaciones por Módulo
5. Base de Datos (Refactorización)
6. API REST
7. Frontend
8. Seguridad & Auditoría
9. Roadmap Detallado
10. Testing & QA

---

## 🎯 PARTE 1: VISIÓN GENERAL

### Objetivo Principal
Migrar sistema de gestión empresarial heredado (Access → SQL Server) a una **aplicación web moderna, responsive, multi-rol y auditable** que permita:

- ✅ Gestión de cotizaciones y presupuestos (tblCotizacion)
- ✅ Órdenes de trabajo / reportes (tblReportes)
- ✅ Control contable (tblEgresos, tblCuentasCobro, tblRecibosCaja)
- ✅ Maestros dinámicos (Contratistas, Materiales, Sectores)
- ✅ Informes y exportación (PDF, Excel)
- ✅ RBAC granular (Admin, Maestros, Contable, Campo, Usuario)
- ✅ Auditoría completa de cambios

### Estado Actual de la BD
- **94 tablas** en Azure SQL Server
- **~70 tablas activas**, ~24 obsoletas
- **Falta de integridad referencial** (no hay FKs)
- **Tablas duplicadas** (tblCotizacion, tblCotizacion1, tblCotizacionCopia, etc.)
- **Herencia de Access** - Convenciones de nombres heredadas (strXXX, numXXX, datXXX)
- **Sin auditoría** de cambios

---

## 🏗️ PARTE 2: ARQUITECTURA TÉCNICA

### Stack Elegido

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN (Frontend)                   │
├─────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + TailwindCSS + ShadcnUI             │
│  - Componentes reutilizables                               │
│  - State management: Zustand                                │
│  - HTTP Client: Axios                                       │
│  - Bundler: Vite                                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (JSON)
┌─────────────────────▼───────────────────────────────────────┐
│                  SERVIDOR (Backend API)                      │
├─────────────────────────────────────────────────────────────┤
│  Node.js 20 + Express.js + TypeScript                       │
│  - Rutas RESTful                                            │
│  - Middleware (Auth, Audit, CORS, Rate Limit)             │
│  - JWT para autenticación                                  │
│  - ORM: TypeORM o Prisma                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ SQL Server Protocol
┌─────────────────────▼───────────────────────────────────────┐
│              PERSISTENCIA (Base de Datos)                    │
├─────────────────────────────────────────────────────────────┤
│  Azure SQL Server (Programaacces.database.windows.net)      │
│  - PostgreSQL 15+ (alternativa local)                      │
│  - Índices optimizados                                     │
│  - Auditoría de cambios (triggers)                         │
│  - Respaldos automáticos                                   │
└─────────────────────────────────────────────────────────────┘
```

### Dependencias Principales

**Backend (package.json)**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "typeorm": "^0.3.16",
    "mssql": "^9.0.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.0",
    "cors": "^2.8.5",
    "morgan": "^1.10.0"
  }
}
```

**Frontend (package.json)**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "zustand": "^4.4.0",
    "axios": "^1.5.0",
    "react-router-dom": "^6.16.0",
    "recharts": "^2.10.0",
    "shadcn-ui": "^0.3.0",
    "tailwindcss": "^3.3.0"
  }
}
```

### Convenciones de Código

**Nombres de Carpetas:**
```
backend/
├── src/
│   ├── controllers/        # Lógica de rutas
│   ├── services/          # Lógica de negocios
│   ├── repositories/      # Acceso a BD
│   ├── middlewares/       # Auth, Audit, etc.
│   ├── entities/          # Modelos TypeORM
│   ├── dtos/             # Data Transfer Objects
│   ├── decorators/       # Custom decorators
│   ├── guards/           # Protección de rutas
│   ├── pipes/            # Validación
│   └── config/           # Configuración

frontend/
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── pages/           # Páginas/vistas completas
│   ├── hooks/           # Hooks personalizados
│   ├── store/           # Zustand stores (auth, ui)
│   ├── services/        # Llamadas a API
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Funciones auxiliares
│   ├── styles/          # Tailwind config
│   └── assets/          # Imágenes, fonts, etc.
```

---

## 🔗 PARTE 3: MAPEO BD ACTUAL → APLICACIÓN WEB

### Tabla: tblReportes (51 col) → Módulo "Órdenes de Trabajo"

**Objeto en BD:**
```typescript
// entities/Reporte.ts
@Entity('tblReportes')
export class Reporte {
  @PrimaryGeneratedColumn('increment')
  IdRegistro: number;

  @Column('float')
  IdContratante: number;

  @ManyToOne(() => Cliente)
  cliente: Cliente;

  @Column('nvarchar', { length: 255 })
  strArrendatario: string;

  @Column('nvarchar', { length: 255 })
  strPropietario: string;

  @Column('nvarchar', { length: 255 })
  strDireccion: string;

  @Column('datetime2', { precision: 0 })
  datFecha: Date;

  @ManyToOne(() => Contratista)
  contratista: Contratista;

  @Column('int')
  IdEstado: number;

  @Column('nvarchar', { length: 'max' })
  strReporte: string;

  @Column('datetime2', { nullable: true })
  datTerminado?: Date;

  @Column('datetime2', { nullable: true })
  datAprobada?: Date;

  // ... 34 campos más

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('int', { nullable: true })
  createdBy?: number; // userId
}
```

**Objeto en Frontend:**
```typescript
// types/Reporte.ts
export interface Reporte {
  idRegistro: number;
  idContratante: number;
  arrendatario: string;
  propietario: string;
  direccion: string;
  fecha: Date;
  idContratista: number;
  estado: 'Borrador' | 'Cotizado' | 'Ejecutado' | 'Cobrado' | 'Descartado';
  reporte: string;
  fechaTerminado?: Date;
  notaFinal?: string;
  cotizacion?: Cotizacion;
  tareas?: Tarea[];
}
```

**Endpoint API:**
```typescript
// routes/reportes.ts
GET    /api/reportes                    // Listar con filtros, paginación
GET    /api/reportes/:id                // Obtener detalle
GET    /api/reportes/:id/timeline       // Historial y tareas
POST   /api/reportes                    // Crear nuevo reporte
PUT    /api/reportes/:id                // Actualizar reporte
DELETE /api/reportes/:id                // Archivar (soft delete)
POST   /api/reportes/:id/cotizar        // Crear cotización asociada
POST   /api/reportes/:id/ejecutar       // Marcar como ejecutado
POST   /api/reportes/:id/aprobar        // Aprobar por supervisor
```

---

### Tabla: tblCotizacion (42 col) → Módulo "Presupuestos"

**Objeto en BD (Consolidado):**
```typescript
// entities/Cotizacion.ts
@Entity('tblCotizacion')
export class Cotizacion {
  @PrimaryGeneratedColumn('increment')
  IdCotizacion: number;

  @ManyToOne(() => Reporte)
  reporte: Reporte;

  @Column('datetime2', { precision: 0 })
  datCotizacion: Date;

  @Column('float')
  numMaterial: number;

  @Column('float')
  numManoObra: number;

  @Column('float')
  numTransporte: number;

  @Column('float')
  numTodoCosto: number; // Total

  @ManyToOne(() => Contratista)
  contratista: Contratista;

  @ManyToOne(() => Garantia, { nullable: true })
  garantia?: Garantia;

  @Column('datetime2', { nullable: true })
  datAutorizacionCotizacion?: Date;

  @OneToMany(() => DescCotizacion, desc => desc.cotizacion)
  items: DescCotizacion[];

  @OneToMany(() => DescCotizacionAmbiente, amb => amb.cotizacion)
  ambientes: DescCotizacionAmbiente[];

  // Cálculos y análisis
  @Column('float', { nullable: true })
  numUtilidad?: number;

  @Column('real', { nullable: true })
  numPorcentaje?: number;

  // Auditoría
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('int', { nullable: true })
  createdBy?: number;
}
```

**Endpoint API:**
```typescript
GET    /api/cotizaciones                         // Listar
GET    /api/cotizaciones/:id                     // Detalle
GET    /api/cotizaciones/:id/financial-summary   // Análisis P&L
POST   /api/cotizaciones                         // Crear
PUT    /api/cotizaciones/:id                     // Actualizar
POST   /api/cotizaciones/:id/items               // Agregar items
PUT    /api/cotizaciones/:id/items/:itemId       // Actualizar item
DELETE /api/cotizaciones/:id/items/:itemId       // Eliminar item
POST   /api/cotizaciones/:id/approve             // Aprobar
POST   /api/cotizaciones/:id/export-pdf          // Exportar PDF
GET    /api/cotizaciones/:id/export-excel        // Exportar Excel
```

---

### Tabla: tblContratistas (18 col) → Módulo "Maestros - Contratistas"

**CRUD Dinámico:**
```typescript
// services/ContratistasService.ts
export class ContratistasService {
  
  // Listar con filtros y paginación
  async listar(filtros: {
    tipo?: 'Contratista' | 'Proveedor' | 'Tercero',
    sector?: number,
    ciudad?: string,
    activo?: boolean,
    search?: string,
    page?: number,
    limit?: number
  }) {
    // WHERE tipo = ? AND sector = ? AND ...
    // ORDER BY strNombre
    // LIMIT :limit OFFSET (:page-1) * :limit
  }

  // Crear nuevo
  async crear(data: CreateContratista) {
    // Validar NIT único
    // Validar email (si existe)
    // Encriptar datos sensibles
    // INSERT y registrar en audit_logs
    // Enviar email de verificación
  }

  // Actualizar
  async actualizar(id: string, data: UpdateContratista) {
    // Capturar estado ANTES
    // Actualizar
    // Capturar estado DESPUÉS
    // Registrar cambios en audit_logs
  }

  // Eliminar (soft delete)
  async eliminar(id: string) {
    // swActivo = 0
    // Registrar en audit_logs
  }

  // Búsqueda avanzada
  async buscarPorNIT(nit: string) {
    // Validar formato NIT colombiano
    // Buscar en tblContratistas
  }

  // Exportar
  async exportarCSV(filtros: any): Promise<Buffer> {
    // Generar CSV con datos
  }

  async exportarExcel(filtros: any): Promise<Buffer> {
    // Generar XLSX con formato
  }

  // Historial
  async obtenerHistorial(id: string) {
    // SELECT FROM audit_logs WHERE table_name = 'tblContratistas' 
    // AND entity_id = id ORDER BY created_at DESC
  }
}
```

---

## 📊 PARTE 4: ESPECIFICACIONES POR MÓDULO

### MÓDULO 1: AUTENTICACIÓN & AUTORIZACIÓN

#### 4.1.1 Estructura de Usuarios
```typescript
// entities/User.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  email: string;

  @Column('varchar')
  passwordHash: string;

  @Column('varchar', { length: 100 })
  fullName: string;

  @ManyToOne(() => Role)
  role: Role;

  @Column('boolean', { default: true })
  active: boolean;

  @Column('varchar', { length: 15, nullable: true })
  phoneNumber?: string;

  @Column('datetime2')
  lastLogin?: Date;

  @Column('varchar', { length: 50, nullable: true })
  ipAddress?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50, unique: true })
  name: 'admin' | 'maestros' | 'contable' | 'campo' | 'usuario';

  @Column('jsonb')
  permissions: Permission[]; // {modules: [...], actions: [...]}

  @CreateDateColumn()
  createdAt: Date;
}

interface Permission {
  module: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'export' | 'approve')[];
  filter?: { [key: string]: any };
}
```

#### 4.1.2 Endpoints de Autenticación
```typescript
POST   /api/auth/login                    // { email, password }
POST   /api/auth/logout
GET    /api/auth/me                       // Perfil actual
POST   /api/auth/refresh-token            // Renovar JWT
POST   /api/auth/change-password          // Cambiar contraseña
POST   /api/auth/forgot-password          // Recuperar contraseña
PUT    /api/auth/verify-email/:token      // Verificar email
```

#### 4.1.3 JWT & Seguridad
```typescript
// middleware/auth.ts
export const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, permissions }
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Guard para verificar permisos
export const requirePermission = (module: string, action: string) => {
  return (req, res, next) => {
    const hasPermission = req.user.permissions.some(p => 
      p.module === module && p.actions.includes(action)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    next();
  };
};
```

---

### MÓDULO 2: MAESTROS (CRUD Dinámico)

#### 4.2.1 Contratistas
```typescript
// entities/Contratista.ts
@Entity('tblContratistas')
export class Contratista {
  @PrimaryColumn('varchar', { length: 50 })
  IdContratista: string; // NIT

  @Column('varchar', { length: 255 })
  strNombre: string;

  @Column('varchar', { length: 50 })
  strTipo: 'Contratista' | 'Proveedor' | 'Tercero';

  @Column('varchar', { length: 50 })
  strEspecialidad?: string;

  @Column('varchar', { length: 50 })
  strTel: string;

  @Column('varchar', { length: 255 })
  strDireccion: string;

  @Column('varchar', { length: 50 })
  strContacto: string;

  @Column('varchar', { length: 100 })
  email?: string;

  // Datos bancarios
  @Column('varchar', { length: 50 })
  strBanco?: string;

  @Column('varchar', { length: 50 })
  strTipoCta?: 'Corriente' | 'Ahorros';

  @Column('varchar', { length: 50 })
  strNumeroCta?: string;

  @Column('bit', { default: 1 })
  swActivo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('int', { nullable: true })
  createdBy?: number;
}
```

**Frontend - Tabla de Contratistas:**
```typescript
// components/Maestros/ContratistasTable.tsx
export const ContratistasTable = ({ filtros, onEdit, onDelete }) => {
  const [contratistas, setContratistas] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0 });

  useEffect(() => {
    buscarContratistas(filtros, pagination.page);
  }, [filtros, pagination.page]);

  return (
    <div>
      {/* Barra de búsqueda y filtros */}
      <SearchBar 
        placeholder="Buscar por nombre, NIT..."
        filters={[
          { name: 'tipo', label: 'Tipo', options: ['Contratista', 'Proveedor', 'Tercero'] },
          { name: 'ciudad', label: 'Ciudad', type: 'text' },
          { name: 'activo', label: 'Estado', options: ['Activo', 'Inactivo'] }
        ]}
      />

      {/* Tabla con CRUD */}
      <DataTable
        columns={[
          { field: 'IdContratista', header: 'NIT', sortable: true },
          { field: 'strNombre', header: 'Nombre', sortable: true },
          { field: 'strTipo', header: 'Tipo', sortable: true },
          { field: 'strTel', header: 'Teléfono' },
          { field: 'strDireccion', header: 'Dirección' },
          { 
            field: 'actions', 
            header: 'Acciones',
            template: (row) => (
              <>
                <button onClick={() => onEdit(row)}>Editar</button>
                <button onClick={() => onDelete(row.id)}>Eliminar</button>
                <button onClick={() => verHistorial(row.id)}>Historial</button>
              </>
            )
          }
        ]}
        data={contratistas}
        paginator
        onPageChange={(e) => setPagination({ ...pagination, page: e.page + 1 })}
        totalRecords={pagination.total}
      />

      {/* Modal para crear/editar */}
      <Modal visible={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSave}>
          <FormField name="IdContratista" label="NIT" required validate={validateNIT} />
          <FormField name="strNombre" label="Nombre" required />
          <FormField name="strTipo" label="Tipo" type="select" 
            options={['Contratista', 'Proveedor', 'Tercero']} />
          <FormField name="strTel" label="Teléfono" />
          <FormField name="strDireccion" label="Dirección" />
          <FormField name="email" label="Email" type="email" />
          <FormField name="strBanco" label="Banco" />
          <FormField name="strNumeroCta" label="No. Cuenta" />
          <Button type="submit">Guardar</Button>
        </Form>
      </Modal>
    </div>
  );
};
```

#### 4.2.2 Materiales & Insumos
```typescript
// Similar a Contratistas, pero para tblMateriales

// Endpoints
GET    /api/materiales?grupo=2&categoria=5
POST   /api/materiales
PUT    /api/materiales/:id
DELETE /api/materiales/:id
POST   /api/materiales/bulk-import (CSV)
GET    /api/materiales/export-excel
```

#### 4.2.3 Sectores & Zonas
```typescript
GET    /api/sectores
POST   /api/sectores
PUT    /api/sectores/:id
DELETE /api/sectores/:id

// Estructura
@Entity('tblSectores')
export class Sector {
  @PrimaryGeneratedColumn()
  IDSector: number;

  @Column('varchar')
  strSector: string;

  @Column('int', { nullable: true })
  IDSectorRef?: number; // Parent sector

  @Column('varchar')
  strRuta?: string;
}
```

---

### MÓDULO 3: ÓRDENES DE TRABAJO / REPORTES

#### 4.3.1 Listar Reportes
```typescript
// GET /api/reportes?estado=Cotizado&sector=2&fecha_desde=2024-01-01&fecha_hasta=2024-12-31&page=1&limit=20

interface ReportesFiltros {
  estado?: 'Borrador' | 'Cotizado' | 'Ejecutado' | 'Cobrado' | 'Descartado';
  sector?: number;
  contratista?: string;
  cliente?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  direccion?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Response
{
  data: [
    {
      idRegistro: 1001,
      fechaReporte: '2024-09-10',
      direccion: 'Cra 45 #23-10, Medellín',
      arrendatario: 'Juan Pérez',
      contratista: 'ESTRUCTURAS Y CIA',
      estado: 'Cotizado',
      reporte: 'Reparación de pisos...',
      cotizacionFecha: '2024-09-10',
      totalCotizacion: 1500000,
      tasaAvance: 0.6
    },
    // ... más registros
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 243,
    totalPages: 13
  }
}
```

#### 4.3.2 Crear Reporte
```typescript
POST /api/reportes
{
  "idContratante": 5,
  "arrendatario": "Nuevo Cliente",
  "propietario": "Propietario Name",
  "direccion": "Dirección completa",
  "idSector": 2,
  "reporte": "Descripción del problema",
  "idContratista": "12345",  // Asignación inicial opcional
  "photos": [File, File, ...]  // Uploads
}

Response:
{
  "idRegistro": 10001,
  "status": "created",
  "message": "Reporte creado exitosamente"
}
```

#### 4.3.3 Timeline de Reporte
```typescript
GET /api/reportes/:id/timeline

Response:
{
  reporte: { /* datos principales */ },
  timeline: [
    {
      fecha: '2024-09-10 14:30:00',
      evento: 'Reporte creado',
      usuario: 'admin@empresa.com',
      detalles: 'Dirección: Cra 45 #23'
    },
    {
      fecha: '2024-09-11 09:00:00',
      evento: 'Cotización creada',
      usuario: 'cotizador@empresa.com',
      detalles: 'Total: $1.500.000',
      cotizacionId: 5001
    },
    {
      fecha: '2024-09-11 15:30:00',
      evento: 'Cotización aprobada',
      usuario: 'supervisor@empresa.com',
      detalles: 'Autorizado por supervisión'
    },
    {
      fecha: '2024-09-12 08:00:00',
      evento: 'Ejecución iniciada',
      usuario: 'campo@empresa.com',
      detalles: 'Contratista: ESTRUCTURAS Y CIA',
      ejecucionId: 7001
    }
  ],
  tareas: [
    {
      id: 201,
      descripcion: 'Llevar materiales',
      fechaVencimiento: '2024-09-12',
      asignadoA: 'Luis García',
      estado: 'Completada'
    }
  ]
}
```

---

### MÓDULO 4: COTIZACIONES & PRESUPUESTOS

#### 4.4.1 Crear Cotización
```typescript
POST /api/cotizaciones
{
  "idReporte": 1001,
  "idContratista": "12345",
  "descripcion": "Reparación estructura...",
  "items": [
    {
      "descripcion": "Cemento portland",
      "cantidad": 50,
      "unidad": "sacos",
      "valorUnitario": 30000,
      "idAmbiente": 1,
      "valorTotal": 1500000
    },
    {
      "descripcion": "Mano de obra",
      "cantidad": 1,
      "unidad": "Valor",
      "valorUnitario": 800000,
      "valorTotal": 800000
    },
    {
      "descripcion": "Transporte",
      "cantidad": 1,
      "unidad": "Valor",
      "valorUnitario": 150000,
      "valorTotal": 150000
    }
  ],
  "idGarantia": 1,
  "diasGarantia": 30,
  "observaciones": "Se incluye limpieza final"
}

Response:
{
  "idCotizacion": 5001,
  "totalMateriales": 1500000,
  "totalManoObra": 800000,
  "totalTransporte": 150000,
  "totalCotizacion": 2450000,
  "estado": "Borrador",
  "fechaCreacion": "2024-09-11T10:30:00Z"
}
```

#### 4.4.2 Resumen Financiero
```typescript
GET /api/cotizaciones/:id/financial-summary

Response:
{
  cotizacion: { /* datos */ },
  analisis: {
    // Estructura de costos
    desglose: {
      materiales: { valor: 1500000, porcentaje: 61.2 },
      manoObra: { valor: 800000, porcentaje: 32.7 },
      transporte: { valor: 150000, porcentaje: 6.1 },
      total: 2450000
    },
    
    // Márgenes (si existen cotizaciones previas)
    margen: {
      utilidadNeta: 400000,
      porcentajeUtilidad: 16.3,
      tasaRetorno: 0.20
    },

    // Comparativas
    comparativa: {
      vs_cotizacionAnterior: {
        diferencia: 150000,
        porcentaje: 6.5,
        tendencia: 'arriba'
      },
      vs_promedio_sector: {
        diferencia: -200000,
        porcentaje: -7.6,
        tendencia: 'abajo'
      }
    }
  }
}
```

#### 4.4.3 Exportar Cotización
```typescript
GET /api/cotizaciones/:id/export-pdf
// Genera PDF con:
// - Logo de empresa
// - Datos del cliente
// - Desglose de items
// - Total
// - Términos y condiciones
// - Firma

GET /api/cotizaciones/:id/export-excel
// Genera XLSX con:
// - Hoja 1: Cotización formal
// - Hoja 2: Análisis financiero
// - Hoja 3: Historial de cotizaciones para este reporte
```

---

### MÓDULO 5: CONTABILIDAD

#### 4.5.1 Egresos
```typescript
POST /api/egresos
{
  "fechaEgreso": "2024-09-12",
  "idContratista": "12345",
  "concepto": "Pago mano de obra",
  "valor": 500000,
  "idCotizacion": 5001,
  "idFactura": null,  // Opcional
  "comprobante": File,  // Upload
  "estado": "Borrador"  // Borrador → Registrado → Conciliado
}

GET /api/egresos?fechaDesde=2024-09-01&fechaHasta=2024-09-30&estado=Registrado
// Filtros: contratista, concepto, rango de valor, etc.

GET /api/egresos/resumen?periodo=mes
// Retorna: {totalEgresos, egresosPorContratista, egresosPorConcepto}
```

#### 4.5.2 Cuentas por Cobrar
```typescript
POST /api/cuentas-cobro
{
  "idReporte": 1001,
  "idCotizacion": 5001,
  "descripcion": "Cuenta por cobro - Primera entrega",
  "valorTotal": 1200000,
  "valorPagado": 0,
  "fechaVencimiento": "2024-10-12",
  "observaciones": "Pago 50% al recibir materiales"
}

GET /api/cuentas-cobro?estado=Pendiente&cliente=5
// Retorna cuentas sin pagar

PUT /api/cuentas-cobro/:id/pagar
{
  "valorPagado": 1200000,
  "fechaPago": "2024-09-20",
  "referenciaTransferencia": "TRF-20240920-001",
  "idRecibo": 8001
}
```

#### 4.5.3 Reportes Contables
```typescript
GET /api/reportes-contables/estado-financiero?periodo=2024-09

Response:
{
  periodo: '2024-09',
  ingresos: {
    total: 5000000,
    porCotizacion: [
      { idCotizacion: 5001, cliente: 'Cliente X', valor: 2000000 }
    ],
    porContratista: [
      { contratista: 'ESTRUCTURAS Y CIA', valor: 3000000 }
    ]
  },
  egresos: {
    total: 3200000,
    porConcepto: [
      { concepto: 'Mano de obra', valor: 1500000 },
      { concepto: 'Materiales', valor: 1200000 },
      { concepto: 'Transporte', valor: 500000 }
    ]
  },
  utilidad: 1800000,
  tasaRetorno: 0.36
}
```

---

## 💾 PARTE 5: BASE DE DATOS (REFACTORIZACIÓN)

### 5.1 Script de Limpieza (FASE 1)

```sql
-- 1. Eliminar tablas obsoletas
DROP TABLE IF EXISTS [dbo].[Errores al guardar Autocorrección de nombres];
DROP TABLE IF EXISTS [dbo].[Errores de pegado];
DROP TABLE IF EXISTS [dbo].[Errores_al_guardar_Autocorrección_de_nombres];
DROP TABLE IF EXISTS [dbo].[Errores_de_pegado];
DROP TABLE IF EXISTS [dbo].[bien_raiz];
DROP TABLE IF EXISTS [dbo].[bien raiz];
DROP TABLE IF EXISTS [dbo].[liquida];
DROP TABLE IF EXISTS [dbo].[Tabla1];

-- 2. Consolidar cotizaciones
-- Insertar datos faltantes de versiones alternas
INSERT INTO [dbo].[tblCotizacion] (IdRegistro, datCotizacion, ...)
SELECT IdRegistro, datCotizacion, ...
FROM [dbo].[tblCotizacion1]
WHERE NOT EXISTS (
  SELECT 1 FROM [dbo].[tblCotizacion] c 
  WHERE c.IdCotizacion = tblCotizacion1.IdCotizacion
);

-- Eliminar versiones alternas
DROP TABLE IF EXISTS [dbo].[tblCotizacion1];
DROP TABLE IF EXISTS [dbo].[tblCotizacionCopia];
DROP TABLE IF EXISTS [dbo].[tblCotizacionUno];

-- 3. Consolidar informes
INSERT INTO [dbo].[tblInforme] (IdRegistro, datFecha, ...)
SELECT IdRegistro, datFecha, ...
FROM [dbo].[tblInforme1]
WHERE NOT EXISTS (...);

DROP TABLE IF EXISTS [dbo].[tblInforme1];
DROP TABLE IF EXISTS [dbo].[tblInforme2009];
```

### 5.2 Script de Integridad Referencial (FASE 2)

```sql
-- Crear tablas de referencia base
CREATE TABLE [dbo].[users] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  [email] VARCHAR(100) UNIQUE NOT NULL,
  [passwordHash] VARCHAR(255) NOT NULL,
  [fullName] VARCHAR(100) NOT NULL,
  [roleId] UNIQUEIDENTIFIER NOT NULL,
  [active] BIT DEFAULT 1,
  [phoneNumber] VARCHAR(15),
  [lastLogin] DATETIME2,
  [ipAddress] VARCHAR(50),
  [createdAt] DATETIME2 DEFAULT GETDATE(),
  [updatedAt] DATETIME2,
  FOREIGN KEY (roleId) REFERENCES [dbo].[roles](id)
);

CREATE TABLE [dbo].[roles] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  [name] VARCHAR(50) UNIQUE NOT NULL,
  [permissions] NVARCHAR(MAX),  -- JSON
  [createdAt] DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE [dbo].[audit_logs] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [userId] UNIQUEIDENTIFIER,
  [action] VARCHAR(20),  -- CREATE, UPDATE, DELETE
  [tableName] VARCHAR(100),
  [entityId] VARCHAR(50),
  [beforeData] NVARCHAR(MAX),  -- JSON
  [afterData] NVARCHAR(MAX),   -- JSON
  [changedAt] DATETIME2 DEFAULT GETDATE(),
  [ipAddress] VARCHAR(50),
  FOREIGN KEY (userId) REFERENCES [dbo].[users](id)
);

-- Agregar Foreign Keys a tablas principales
ALTER TABLE [dbo].[tblReportes]
ADD CONSTRAINT FK_Reporte_Cliente 
FOREIGN KEY (IdContratante) REFERENCES [dbo].[tblClientes](IdContratante);

ALTER TABLE [dbo].[tblReportes]
ADD CONSTRAINT FK_Reporte_Contratista 
FOREIGN KEY (IdContratista) REFERENCES [dbo].[tblContratistas](IdContratista);

ALTER TABLE [dbo].[tblCotizacion]
ADD CONSTRAINT FK_Cotizacion_Reporte 
FOREIGN KEY (IdRegistro) REFERENCES [dbo].[tblReportes](IdRegistro);

ALTER TABLE [dbo].[tblCotizacion]
ADD CONSTRAINT FK_Cotizacion_Contratista 
FOREIGN KEY (IdContratista) REFERENCES [dbo].[tblContratistas](IdContratista);

-- ... más FK según necesidad
```

### 5.3 Triggers de Auditoría (FASE 3)

```sql
-- Trigger para auditar cambios en tblReportes
CREATE TRIGGER tr_tblReportes_Audit
ON [dbo].[tblReportes]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @action VARCHAR(10);
  IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    SET @action = 'UPDATE';
  ELSE IF EXISTS (SELECT 1 FROM inserted)
    SET @action = 'INSERT';
  ELSE
    SET @action = 'DELETE';

  INSERT INTO [dbo].[audit_logs] (userId, action, tableName, entityId, beforeData, afterData, ipAddress)
  SELECT
    NULL,  -- userId (se capturar en app)
    @action,
    'tblReportes',
    CAST(COALESCE(d.IdRegistro, i.IdRegistro) AS VARCHAR(50)),
    (SELECT * FROM deleted d FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
    (SELECT * FROM inserted i FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
    HOST_NAME()  -- O capturar desde aplicación
  FROM inserted i
  FULL OUTER JOIN deleted d ON i.IdRegistro = d.IdRegistro
  WHERE @action != 'INSERT' OR i.IdRegistro IS NOT NULL;
END;

-- Trigger similar para tblCotizacion, tblEgresos, etc.
CREATE TRIGGER tr_tblCotizacion_Audit
ON [dbo].[tblCotizacion]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  -- Similar al anterior
END;
```

### 5.4 Índices Optimizados (FASE 4)

```sql
-- Índices Clustered (primary)
CREATE CLUSTERED INDEX idx_tblReportes_PK ON [dbo].[tblReportes](IdRegistro);
CREATE CLUSTERED INDEX idx_tblCotizacion_PK ON [dbo].[tblCotizacion](IdCotizacion);

-- Índices Non-Clustered (búsquedas frecuentes)
CREATE NONCLUSTERED INDEX idx_tblReportes_Cliente ON [dbo].[tblReportes](IdContratante);
CREATE NONCLUSTERED INDEX idx_tblReportes_Fecha ON [dbo].[tblReportes](datFecha);
CREATE NONCLUSTERED INDEX idx_tblReportes_Estado ON [dbo].[tblReportes](IdEstado);
CREATE NONCLUSTERED INDEX idx_tblReportes_Contratista ON [dbo].[tblReportes](IdContratista);

CREATE NONCLUSTERED INDEX idx_tblCotizacion_Reporte ON [dbo].[tblCotizacion](IdRegistro);
CREATE NONCLUSTERED INDEX idx_tblCotizacion_Contratista ON [dbo].[tblCotizacion](IdContratista);
CREATE NONCLUSTERED INDEX idx_tblCotizacion_Fecha ON [dbo].[tblCotizacion](datCotizacion);

CREATE NONCLUSTERED INDEX idx_tblContratistas_NIT ON [dbo].[tblContratistas](IdContratista);
CREATE NONCLUSTERED INDEX idx_tblContratistas_Activo ON [dbo].[tblContratistas](swActivo);

-- Índices para búsqueda full-text (opcional)
CREATE FULLTEXT CATALOG ftCatalog;
CREATE FULLTEXT INDEX ON [dbo].[tblReportes](strReporte, strDireccion)
KEY INDEX idx_tblReportes_PK
ON ftCatalog;
```

---

## 🔌 PARTE 6: API REST (Especificación Completa)

### 6.1 Estructura de Respuestas

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": { /* datos */ },
  "message": "Operación completada",
  "timestamp": "2024-09-14T10:30:45.123Z"
}
```

**Respuesta con Error:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "El NIT ya existe en el sistema",
    "details": {
      "field": "IdContratista",
      "value": "12345678"
    }
  },
  "timestamp": "2024-09-14T10:30:45.123Z"
}
```

**Respuesta con Paginación:**
```json
{
  "success": true,
  "data": [
    { /* registro 1 */ },
    { /* registro 2 */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 243,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 6.2 Endpoints por Módulo

**[Ver documento detallado de 50+ endpoints en ANEXO]**

---

## 🎨 PARTE 7: FRONTEND (Componentes & UI)

### 7.1 Estructura de Carpetas

```
frontend/src/
├── components/
│   ├── Maestros/
│   │   ├── ContratistasModule.tsx
│   │   ├── ContratistasTable.tsx
│   │   ├── ContratistasForm.tsx
│   │   ├── MaterialesModule.tsx
│   │   ├── SectoresModule.tsx
│   │   └── index.ts
│   ├── Reportes/
│   │   ├── ReportesModule.tsx
│   │   ├── ReportesTable.tsx
│   │   ├── ReporteDetail.tsx
│   │   ├── ReporteTimeline.tsx
│   │   └── index.ts
│   ├── Cotizaciones/
│   │   ├── CotizacionesModule.tsx
│   │   ├── CotizacionForm.tsx
│   │   ├── CotizacionDetail.tsx
│   │   ├── FinancialSummary.tsx
│   │   └── index.ts
│   ├── Contable/
│   │   ├── EgresosModule.tsx
│   │   ├── CuentasCobroModule.tsx
│   │   ├── ReportesContables.tsx
│   │   └── index.ts
│   ├── Shared/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DataTable.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Modal.tsx
│   │   ├── Form.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   └── index.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── NotFound.tsx
│   └── index.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useFetch.ts
│   ├── useForm.ts
│   ├── useModal.ts
│   └── index.ts
├── store/
│   ├── authStore.ts       // Zustand: usuario, rol, permisos
│   ├── uiStore.ts         // Zustand: menú abierto, tema, etc
│   └── index.ts
├── services/
│   ├── api.ts             // Configuración de Axios
│   ├── reportesService.ts
│   ├── cotizacionesService.ts
│   ├── contratistasService.ts
│   ├── contableService.ts
│   └── authService.ts
├── types/
│   ├── Reporte.ts
│   ├── Cotizacion.ts
│   ├── Contratista.ts
│   ├── User.ts
│   ├── Common.ts
│   └── index.ts
├── utils/
│   ├── formatters.ts      // formatCurrency, formatDate, etc
│   ├── validators.ts      // validateNIT, validateEmail, etc
│   ├── constants.ts       // Estados, tipos, etc
│   └── index.ts
├── styles/
│   ├── globals.css
│   ├── tailwind.config.js
│   └── theme.css
└── App.tsx
```

### 7.2 Menú de Navegación (Dinámico por Rol)

```typescript
// store/authStore.ts
interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'maestros' | 'contable' | 'campo' | 'usuario';
  permissions: {
    módulo: string;
    acciones: ('crear' | 'leer' | 'actualizar' | 'eliminar' | 'exportar')[];
  }[];
}

// components/Sidebar.tsx
const menuItems = {
  admin: [
    { label: 'Dashboard', icon: 'dashboard', path: '/' },
    { 
      label: 'Maestros', 
      icon: 'settings',
      children: [
        { label: 'Contratistas', path: '/maestros/contratistas' },
        { label: 'Clientes', path: '/maestros/clientes' },
        { label: 'Materiales', path: '/maestros/materiales' },
        { label: 'Sectores', path: '/maestros/sectores' },
        { label: 'Herramientas', path: '/maestros/herramientas' }
      ]
    },
    { label: 'Reportes', path: '/reportes', icon: 'assignment' },
    { label: 'Cotizaciones', path: '/cotizaciones', icon: 'description' },
    { label: 'Contable', path: '/contable', icon: 'accounting' },
    { label: 'Usuarios', path: '/usuarios', icon: 'people' },
    { label: 'Auditoría', path: '/auditoria', icon: 'history' }
  ],
  maestros: [
    { label: 'Dashboard', path: '/' },
    { 
      label: 'Maestros',
      children: [
        { label: 'Contratistas', path: '/maestros/contratistas' },
        { label: 'Materiales', path: '/maestros/materiales' },
        { label: 'Sectores', path: '/maestros/sectores' }
      ]
    },
    { label: 'Ver Reportes', path: '/reportes' }
  ],
  contable: [
    { label: 'Dashboard', path: '/' },
    { label: 'Egresos', path: '/contable/egresos' },
    { label: 'Cuentas por Cobrar', path: '/contable/cuentas-cobro' },
    { label: 'Reportes Financieros', path: '/reportes-contables' }
  ],
  campo: [
    { label: 'Mis Órdenes', path: '/reportes?asignadoA=me' },
    { label: 'Reportar Novedad', path: '/novedades/crear' },
    { label: 'Tareas', path: '/tareas' }
  ],
  usuario: [
    { label: 'Dashboard', path: '/' },
    { label: 'Consultar Cotizaciones', path: '/cotizaciones' }
  ]
};
```

### 7.3 Paleta de Colores (Tailwind)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      // Primario (Azul - como en las imágenes)
      primary: {
        50: '#f0f7ff',
        100: '#e0efff',
        400: '#3b82f6',
        500: '#2563eb',  // Azul principal
        600: '#1e40af',
        700: '#1e3a8a'
      },
      // Secundario (Crema/Beige)
      secondary: {
        50: '#fffbf0',
        100: '#fef5e7',
        200: '#f0ebe0',  // Crema principal
        300: '#e0dbc9',
        400: '#d0cbb5'
      },
      // Acento (Naranja/Marrón)
      accent: {
        400: '#ea9d5f',
        500: '#e8a255',  // Naranja principal
        600: '#d89350'
      },
      // Estados
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      disabled: '#9ca3af'
    }
  }
};
```

### 7.4 Ejemplo: Módulo de Contratistas (Completo)

```typescript
// pages/Maestros/Contratistas.tsx
export const ContratistasPage: React.FC = () => {
  const [filtros, setFiltros] = useState({
    tipo: '',
    ciudad: '',
    search: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedContratista, setSelectedContratista] = useState(null);

  const { data, loading, error, pagination, refetch } = useFetch(
    '/api/contratistas',
    { params: { ...filtros, page: 1, limit: 20 } }
  );

  const handleBuscar = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  const handleCrear = () => {
    setSelectedContratista(null);
    setShowModal(true);
  };

  const handleEditar = (contratista) => {
    setSelectedContratista(contratista);
    setShowModal(true);
  };

  const handleGuardar = async (formData) => {
    try {
      if (selectedContratista) {
        await api.put(`/api/contratistas/${selectedContratista.id}`, formData);
      } else {
        await api.post('/api/contratistas', formData);
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const handleExportar = async (formato: 'csv' | 'excel') => {
    try {
      const response = await api.get(
        `/api/contratistas/export-${formato}`,
        { params: filtros, responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contratistas.${formato === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Error al exportar:', err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-700">Contratistas</h1>
          <div className="space-x-2">
            <Button onClick={handleCrear} variant="primary">
              + Nuevo Contratista
            </Button>
            <Button onClick={() => handleExportar('excel')} variant="secondary">
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <Card>
          <SearchBar
            onSearch={handleBuscar}
            filters={[
              { 
                name: 'tipo', 
                label: 'Tipo',
                type: 'select',
                options: ['Contratista', 'Proveedor', 'Tercero']
              },
              { 
                name: 'ciudad',
                label: 'Ciudad',
                type: 'text'
              },
              {
                name: 'search',
                label: 'Buscar',
                type: 'text',
                placeholder: 'Nombre, NIT, teléfono...'
              }
            ]}
          />
        </Card>

        {/* Tabla */}
        <Card>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : error ? (
            <div className="text-center py-8 text-error">Error al cargar datos</div>
          ) : (
            <DataTable
              columns={[
                { field: 'IdContratista', header: 'NIT', sortable: true, width: '100px' },
                { field: 'strNombre', header: 'Nombre', sortable: true, width: '300px' },
                { field: 'strTipo', header: 'Tipo', sortable: true, width: '120px' },
                { field: 'strTel', header: 'Teléfono', width: '120px' },
                { field: 'strDireccion', header: 'Dirección', width: '300px' },
                { field: 'swActivo', header: 'Estado', width: '100px',
                  template: (row) => (
                    <span className={row.swActivo ? 'text-success' : 'text-error'}>
                      {row.swActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  )
                },
                { 
                  field: 'actions', 
                  header: 'Acciones',
                  width: '200px',
                  template: (row) => (
                    <div className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleEditar(row)}
                      >
                        Editar
                      </Button>
                      <Button 
                        size="sm"
                        variant="tertiary"
                        onClick={() => verHistorial(row.id)}
                      >
                        Historial
                      </Button>
                    </div>
                  )
                }
              ]}
              data={data}
              paginator
              pagination={pagination}
              onPageChange={refetch}
            />
          )}
        </Card>
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        visible={showModal}
        onHide={() => setShowModal(false)}
        title={selectedContratista ? 'Editar Contratista' : 'Nuevo Contratista'}
      >
        <ContratistasForm
          data={selectedContratista}
          onSubmit={handleGuardar}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </Layout>
  );
};
```

---

## 🔐 PARTE 8: SEGURIDAD & AUDITORÍA

### 8.1 Autenticación & JWT

```typescript
// middleware/auth.ts
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    
    req.user = user; // {id, email, role, permissions}
    next();
  });
};

// routes/auth.ts
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Validar credenciales
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generar JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  // Actualizar lastLogin
  user.lastLogin = new Date();
  user.ipAddress = req.ip;
  await user.save();

  res.json({ token, user: { id, email, fullName, role } });
});
```

### 8.2 RBAC (Role-Based Access Control)

```typescript
// middleware/rbac.ts
export const requireRole = (...roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const requirePermission = (module: string, action: string) => {
  return (req, res, next) => {
    const hasPermission = req.user.permissions?.some(p =>
      p.module === module && p.actions.includes(action)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        error: `Permission denied: ${module}.${action}` 
      });
    }

    next();
  };
};

// routes/cotizaciones.ts
// Solo admin y maestros pueden crear cotizaciones
app.post('/api/cotizaciones',
  authenticateToken,
  requirePermission('cotizaciones', 'create'),
  async (req, res) => {
    // ...
  }
);

// Solo contable puede aprobar
app.post('/api/cotizaciones/:id/approve',
  authenticateToken,
  requireRole('admin', 'contable'),
  async (req, res) => {
    // ...
  }
);
```

### 8.3 Auditoría & Trazabilidad

```typescript
// middleware/audit.ts
export const auditMiddleware = async (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // Solo registrar si fue exitosa (2xx, 3xx)
    if (res.statusCode >= 200 && res.statusCode < 400) {
      // Extractar información de cambio
      const tabla = req.path.split('/')[2]; // /api/cotizaciones → cotizaciones
      const metodo = req.method; // POST, PUT, DELETE

      if (['POST', 'PUT', 'DELETE'].includes(metodo) && req.user) {
        AuditLog.create({
          userId: req.user.id,
          action: metodo === 'POST' ? 'CREATE' : metodo === 'PUT' ? 'UPDATE' : 'DELETE',
          tableName: tabla,
          entityId: req.params.id || req.body.id,
          afterData: data?.data ? JSON.stringify(data.data) : null,
          ipAddress: req.ip,
          timestamp: new Date()
        });
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

// routes
app.use(auditMiddleware);

// Endpoint para consultar auditoría
app.get('/api/audit-logs',
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    const logs = await AuditLog.find({
      tableName: req.query.table,
      createdAt: {
        $gte: new Date(req.query.desde),
        $lte: new Date(req.query.hasta)
      }
    }).limit(100);

    res.json({ data: logs });
  }
);

// Ver historial de un registro específico
app.get('/api/audit-logs/:tabla/:id',
  authenticateToken,
  async (req, res) => {
    const historial = await AuditLog.find({
      tableName: req.params.tabla,
      entityId: req.params.id
    }).sort({ timestamp: -1 });

    res.json({ data: historial });
  }
);
```

### 8.4 Validación & Sanitización

```typescript
// validators/index.ts
export const validarNIT = (nit: string): boolean => {
  // Algoritmo de validación NIT colombiano
  const nitLimpio = nit.replace(/\D/g, '');
  if (nitLimpio.length !== 8 && nitLimpio.length !== 10) return false;

  const digitos = nitLimpio.split('').map(Number);
  const multiplicadores = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43];
  let sumatoria = 0;

  for (let i = 0; i < digitos.length - 1; i++) {
    sumatoria += digitos[i] * multiplicadores[i];
  }

  const residuo = sumatoria % 11;
  const digito = residuo === 0 ? 0 : residuo === 1 ? 9 : 11 - residuo;

  return digito === digitos[digitos.length - 1];
};

// routes/contratistas.ts
app.post('/api/contratistas',
  body('IdContratista')
    .custom((nit) => {
      if (!validarNIT(nit)) {
        throw new Error('NIT inválido');
      }
      return true;
    }),
  body('email').isEmail(),
  body('strTel').isMobilePhone('es-CO'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Proceder...
  }
);
```

---

## 🗓️ PARTE 9: ROADMAP DETALLADO (11 Semanas)

### Semana 1-2: Configuración Base & Auth
- [ ] Setup Node.js + Express + TypeScript
- [ ] Setup React + Vite + TypeScript
- [ ] Conectar a Azure SQL Server
- [ ] Crear tabla `users` y `roles`
- [ ] Implementar login y JWT
- [ ] RBAC básico
- [ ] Testing: endpoints de auth

**Entregable:** Sistema de login funcional

---

### Semana 3-4: Maestros (Fase 1)
- [ ] Crear entidades: Contratista, Cliente, Sector
- [ ] Endpoints CRUD para Contratistas
- [ ] Frontend: Tabla, búsqueda, filtros
- [ ] Modal crear/editar Contratistas
- [ ] Validación NIT
- [ ] Exportar a CSV/Excel
- [ ] Testing: endpoints de contratistas

**Entregable:** Módulo Maestros - Contratistas 100% funcional

---

### Semana 5-6: Maestros (Fase 2) + Auditoría
- [ ] CRUD Materiales, Sectores, Herramientas
- [ ] Crear tabla `audit_logs`
- [ ] Implementar triggers de auditoría (SQL)
- [ ] Endpoint para ver historial
- [ ] Frontend: ver historial de cambios
- [ ] Testing: auditoría

**Entregable:** Todos los maestros + auditoría funcionales

---

### Semana 7-8: Reportes (Órdenes de Trabajo)
- [ ] Crear entidad Reporte (tblReportes refactorizado)
- [ ] Endpoints CRUD Reportes
- [ ] Frontend: tabla, filtros, búsqueda
- [ ] Crear Reporte + asociar contratista
- [ ] Timeline del reporte (historial de eventos)
- [ ] Adjuntar documentos (fotos, planos)
- [ ] Testing

**Entregable:** Módulo Reportes 100% funcional

---

### Semana 9-10: Cotizaciones & Contable
- [ ] Entidad Cotizacion (consolidada: tblCotizacion + tblCotizacion1 + etc)
- [ ] CRUD Cotizaciones
- [ ] Items de cotización (tblDesCotizacion)
- [ ] Cálculos automáticos (totales, márgenes)
- [ ] Exportar PDF y Excel
- [ ] Egresos (tblEgresos)
- [ ] Cuentas por Cobro (tblCuentasCobro)
- [ ] Testing

**Entregable:** Cotizaciones y módulo contable funcionales

---

### Semana 11+: Informes, Reportes & Pulido
- [ ] Reportes financieros
- [ ] Gráficos (Recharts)
- [ ] Filtros avanzados por período
- [ ] Temas y branding
- [ ] Optimización de performance
- [ ] Testing E2E
- [ ] Documentación
- [ ] Preparar para producción (deployment)

**Entregable:** Sistema completo listo para producción

---

## 🧪 PARTE 10: TESTING & QA

### 10.1 Unit Tests (Backend)

```bash
npm install --save-dev jest @types/jest ts-jest
```

```typescript
// __tests__/validators.test.ts
describe('Validadores', () => {
  it('valida NIT correctamente', () => {
    expect(validarNIT('12345678-9')).toBe(true);
    expect(validarNIT('12345')).toBe(false);
  });

  it('valida email', () => {
    const validator = new EmailValidator();
    expect(validator.isValid('test@empresa.com')).toBe(true);
    expect(validator.isValid('invalido')).toBe(false);
  });
});

// __tests__/services.test.ts
describe('ContratistasService', () => {
  let service: ContratistasService;

  beforeEach(() => {
    service = new ContratistasService();
  });

  it('crea un contratista', async () => {
    const data = {
      IdContratista: '12345678',
      strNombre: 'Test Contractor'
    };

    const result = await service.crear(data);
    expect(result).toHaveProperty('id');
  });

  it('lanza error si NIT ya existe', async () => {
    await expect(
      service.crear({ IdContratista: '123' })
    ).rejects.toThrow('NIT already exists');
  });
});
```

### 10.2 Integration Tests

```typescript
// __tests__/api.test.ts
describe('API - Contratistas', () => {
  let app;
  let db;

  beforeAll(async () => {
    app = createApp();
    db = await connectDB();
  });

  afterAll(async () => {
    await db.close();
  });

  it('POST /api/contratistas crea un contratista', async () => {
    const response = await request(app)
      .post('/api/contratistas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        IdContratista: '12345678',
        strNombre: 'New Contractor'
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
  });

  it('GET /api/contratistas retorna lista paginada', async () => {
    const response = await request(app)
      .get('/api/contratistas?page=1&limit=20')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('requiere token JWT', async () => {
    const response = await request(app)
      .get('/api/contratistas');

    expect(response.status).toBe(401);
  });
});
```

### 10.3 E2E Tests (Cypress)

```javascript
// cypress/e2e/contratistas.cy.js
describe('Módulo Contratistas', () => {
  before(() => {
    cy.login('admin@empresa.com', 'password');
  });

  it('crea un nuevo contratista', () => {
    cy.visit('/maestros/contratistas');
    cy.contains('Nuevo Contratista').click();
    
    cy.get('input[name=IdContratista]').type('12345678');
    cy.get('input[name=strNombre]').type('Test Contractor');
    cy.get('select[name=strTipo]').select('Contratista');
    cy.get('input[name=strTel]').type('3001234567');
    
    cy.contains('Guardar').click();
    
    cy.contains('Contratista creado exitosamente').should('be.visible');
    cy.contains('Test Contractor').should('be.visible');
  });

  it('edita un contratista existente', () => {
    cy.visit('/maestros/contratistas');
    cy.contains('Test Contractor').parent().contains('Editar').click();
    
    cy.get('input[name=strNombre]').clear().type('Updated Name');
    cy.contains('Guardar').click();
    
    cy.contains('Contratista actualizado').should('be.visible');
  });

  it('filtra contratistas por tipo', () => {
    cy.visit('/maestros/contratistas');
    cy.get('select[name=tipo]').select('Proveedor');
    
    cy.get('table tbody tr').each(($row) => {
      cy.wrap($row).contains('Proveedor');
    });
  });
});
```

---

## 📚 CONCLUSIÓN

Este prompt proporciona una **guía completa paso a paso** para desarrollar una aplicación web moderna basada en la estructura actual de tu base de datos Azure SQL.

**Puntos clave:**
- ✅ Integración con **94 tablas existentes**
- ✅ Refactorización y limpieza de datos heredados
- ✅ Arquitectura **escalable y mantenible**
- ✅ **RBAC granular** (5 roles)
- ✅ **Auditoría completa** de cambios
- ✅ **API REST** de 50+ endpoints
- ✅ **Frontend responsivo** con componentes reutilizables
- ✅ **Testing** en múltiples niveles

**Próximos pasos:**
1. Backup de BD en Azure
2. Ejecutar script de limpieza (FASE 1)
3. Setup de proyecto Node.js
4. Setup de proyecto React
5. Comenzar Semana 1-2 del roadmap

---

**Generado:** 2026-09-14
**Para:** Sistema de Gestión Empresarial (Programaacces)
**Versión:** 1.0

