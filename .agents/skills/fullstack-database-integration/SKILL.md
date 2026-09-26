---
name: fullstack-database-integration
description: >-
  Architectural patterns, migration scripts, and schema mappings for connecting frontend applications
  to cloud PostgreSQL databases (Neon, Supabase, Azure SQL). Use when designing tables, writing SQL migrations,
  configuring dual-database architectures, or connecting REST/RPC endpoints to frontend data contexts.
---

# Fullstack Database Integration & Migration

This skill outlines the procedures for connecting SOSENLINEA to cloud database instances (Neon / Supabase PostgreSQL) while preserving historical data and zero-loss operations.

## 1. Dual-Database Architecture Blueprint

- **BD 1: Operativa & Gestión (Neon / Supabase)**:
  - Tables: `reportes_ordenes`, `cotizaciones`, `materiales`, `clientes_inmobiliarias`, `contratistas`, `llaves`, `cuentas_cobro`, `movimientos_contables`, `audit_logs`.
  - Scalability: Connection pooling enabled (PgBouncer) for serverless compatibility.
- **BD 2: Autenticación & Perfiles (Supabase Auth / Firebase)**:
  - Tables: `auth.users`, `user_profiles`, `user_roles`, `session_audit`.
  - Roles: `admin`, `auxiliar`, `desarrollador`, `campo`, `usuario`.

## 2. Zero-Loss Historical Import Pipeline

When importing existing tables from CSV, Excel, or legacy databases:
1. **Column Mapping Engine**: Auto-detect canonical headers (`direccion`, `cliente`, `tipoTrabajo`, `estado`, `totalCotizacion`).
2. **Dynamic Unmapped Field Retention**: Any column that does not match a primary relational column must be automatically serialized into a JSONB `metadata` column or appended to operational notes, ensuring zero data loss.
3. **Data Type Coercion**:
   - Currency strings (`$ 350.000,00` or `$350,000`) sanitized to numeric floats (`350000`).
   - Dates parsed to ISO-8601 (`YYYY-MM-DD`).
   - Phone numbers stripped of non-numeric characters while preserving country codes.

## 3. Row-Level Security (RLS) & API Access

- Enable RLS on every public table: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
- Grant granular read/write policies based on `auth.jwt() ->> 'role'`.
- Operations personnel can update ticket statuses; only administrative roles can edit accounting records and delete entries.
