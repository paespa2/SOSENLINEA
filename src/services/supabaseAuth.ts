/**
 * supabaseAuth.ts — Cliente Soberano y Ligero de Supabase para SOSENLINEA (2026-2027)
 * 
 * Se comunica directamente con las APIs REST de Supabase Auth y PostgreSQL.
 * Cero dependencias externas para garantizar compilacion limpia en Vite y Vercel.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hgywidapnfslfsjfuxdi.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_p0JJBSVl7ig-t-QDskX6QQ_BR3pKOrU';

export interface SupabaseUser {
  id: string;
  email: string;
  role?: string;
  full_name?: string;
  cargo?: string;
  company_name?: string;
}

export interface SupabaseAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, any>;
  };
}

export const supabaseAuth = {
  /**
   * Iniciar sesion directamente con Supabase Auth (email + password)
   */
  async signIn(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: SupabaseUser }> {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.message || 'Error de autenticacion en Supabase');
    }

    const authData = data as SupabaseAuthResponse;
    const profile = await this.getProfile(authData.user.id, authData.access_token);

    return {
      accessToken: authData.access_token,
      refreshToken: authData.refresh_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profile?.role || 'usuario',
        full_name: profile?.full_name || authData.user.email.split('@')[0],
        cargo: profile?.cargo || 'Usuario Registrado',
        company_name: profile?.company_name || 'SOSENLINEA',
      },
    };
  },

  /**
   * Obtener perfil del usuario desde la tabla user_profiles
   */
  async getProfile(userId: string, accessToken: string): Promise<any | null> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) return null;
      const profiles = await res.json();
      return profiles && profiles.length > 0 ? profiles[0] : null;
    } catch {
      return null;
    }
  },

  /**
   * Registrar nuevo usuario con Supabase Auth
   */
  async signUp(email: string, password: string, fullName: string, role: string = 'usuario'): Promise<void> {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          full_name: fullName,
          role,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.message || 'Error al registrar usuario en Supabase');
    }
  },

  /**
   * Cerrar sesion en Supabase
   */
  /**
   * Actualizar usuario en Supabase Auth (ej. cambio de contrasea)
   */
  async updateUser(accessToken: string, attributes: { password?: string; data?: Record<string, any> }): Promise<any> {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attributes),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.msg || err.error_description || 'Error al actualizar usuario en Supabase');
    }
    return await res.json();
  },

  async signOut(accessToken: string): Promise<void> {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch {}
  },
};


export const supabaseDb = {
  /**
   * Consulta una tabla completa de Supabase
   */
  async getTable<T>(tableName: string): Promise<T[]> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (!res.ok) return [];
      return await res.json() as T[];
    } catch {
      return [];
    }
  },

  /**
   * Inserta un nuevo registro en Supabase
   */
  async insertRow(tableName: string, rowData: any): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(rowData),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Actualiza un registro en Supabase
   */
  async updateRow(tableName: string, matchColumn: string, matchValue: any, data: any): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?${matchColumn}=eq.${encodeURIComponent(String(matchValue))}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Elimina un registro en Supabase
   */
  async deleteRow(tableName: string, matchColumn: string, matchValue: any): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?${matchColumn}=eq.${encodeURIComponent(String(matchValue))}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Estado de salud en tiempo real de Supabase
   */
  async getHealthStatus(): Promise<{ connected: boolean; url: string; engine: string; tablesCount: number }> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/clientes?select=id&limit=1`, {
        headers: { 'apikey': SUPABASE_ANON_KEY },
      });
      return {
        connected: res.status === 200,
        url: SUPABASE_URL,
        engine: 'PostgreSQL 16+ (Supabase Cloud)',
        tablesCount: 8,
      };
    } catch {
      return {
        connected: false,
        url: SUPABASE_URL,
        engine: 'Offline Fallback',
        tablesCount: 0,
      };
    }
  }
};
