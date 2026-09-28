-- ==============================================================================
-- SOSENLINEA ERP - Esquema de Base de Datos para Usuarios y Perfiles en Supabase
-- Base de Datos 2: Gestión de Identidad, Autenticación y Control de Accesos
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumeración de Roles en el Sistema
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sos_user_role') THEN
    CREATE TYPE sos_user_role AS ENUM (
      'admin',           -- Acceso total administrativo y financiero
      'auxiliar',        -- Gestión de órdenes, presupuestos y contratistas
      'desarrollador',   -- Acceso técnico, logs y configuración
      'campo',           -- Operaciones en sitio, avance de obra y reportes
      'usuario'          -- Vista general o cliente final
    );
  END IF;
END $$;

-- 3. Tabla de Perfiles de Usuario (Extensión de auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cargo TEXT,
  role sos_user_role NOT NULL DEFAULT 'usuario',
  company_name TEXT,
  company_nit TEXT,
  property_address TEXT,
  specialty TEXT,
  has_arl BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_login TIMESTAMPTZ
);

-- 4. Índices para Búsqueda y Rendimiento
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- 5. Trigger para Actualizar updated_at Automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Trigger Automático: Crear Perfil al Registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    username,
    full_name,
    email,
    phone,
    role,
    cargo,
    is_active
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Usuario SOS'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::sos_user_role, 'usuario'::sos_user_role),
    COALESCE(NEW.raw_user_meta_data->>'cargo', 'Usuario Registrado'),
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Tabla de Auditoría de Sesiones y Autenticación
CREATE TABLE IF NOT EXISTS public.session_audit (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_RESET', 'ROLE_CHANGE'
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_session_audit_user ON public.session_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_session_audit_created ON public.session_audit(created_at DESC);

-- 8. Configuración de Seguridad en Fila (Row-Level Security - RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_audit ENABLE ROW LEVEL SECURITY;

-- Políticas de user_profiles:
-- Los usuarios autenticados pueden ver perfiles básicos de sus compañeros
DROP POLICY IF EXISTS "Ver perfiles de usuarios" ON public.user_profiles;
CREATE POLICY "Ver perfiles de usuarios" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Los usuarios solo pueden editar su propio perfil
DROP POLICY IF EXISTS "Editar mi propio perfil" ON public.user_profiles;
CREATE POLICY "Editar mi propio perfil" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Los administradores tienen control total sobre los perfiles
DROP POLICY IF EXISTS "Admin control total perfiles" ON public.user_profiles;
CREATE POLICY "Admin control total perfiles" ON public.user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );

-- Políticas de session_audit: Solo administradores pueden consultar auditoría de accesos
DROP POLICY IF EXISTS "Admin ver auditoría de accesos" ON public.session_audit;
CREATE POLICY "Admin ver auditoría de accesos" ON public.session_audit
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );
