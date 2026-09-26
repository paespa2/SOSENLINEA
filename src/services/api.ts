/**
 * api.ts — Cliente HTTP centralizado para la API REST
 *
 * - Maneja el JWT automáticamente (adjunta el token en headers)
 * - Refresca el token cuando expira (401 + TOKEN_EXPIRED)
 * - Tipado genérico de respuestas
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── Tipos ─────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// ─── Token Storage ─────────────────────────────────────────────────────────

const TOKEN_KEY    = 'sos_access_token';
const REFRESH_KEY  = 'sos_refresh_token';

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  setAccess: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (token: string) => localStorage.setItem(REFRESH_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Refresh ────────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    tokenStore.clear();
    window.dispatchEvent(new CustomEvent('sos:logout'));
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json() as { accessToken: string };
  tokenStore.setAccess(data.accessToken);
  return data.accessToken;
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = tokenStore.getAccess();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Token expirado → intentar refresh
  if (res.status === 401 && retry) {
    const body = await res.clone().json() as ApiError;
    if (body.code === 'TOKEN_EXPIRED') {
      if (isRefreshing) {
        // Encolar mientras otra petición refresca
        const newToken = await new Promise<string>((resolve) => {
          refreshQueue.push(resolve);
        });
        return apiFetch<T>(path, options, false);
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        refreshQueue.forEach(cb => cb(newToken));
        refreshQueue = [];
        return apiFetch<T>(path, options, false);
      } finally {
        isRefreshing = false;
      }
    }
  }

  if (!res.ok) {
    let errorData: ApiError;
    try {
      errorData = await res.json() as ApiError;
    } catch {
      errorData = { error: `HTTP ${res.status}: ${res.statusText}` };
    }
    throw Object.assign(new Error(errorData.error), errorData);
  }

  // Respuestas sin cuerpo (204 No Content)
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ─── API helpers ────────────────────────────────────────────────────────────

export const api = {
  get:    <T>(path: string, params?: Record<string, string | number | boolean>) => {
    const url = params
      ? `${path}?${new URLSearchParams(
          Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
        )}`
      : path;
    return apiFetch<T>(url);
  },
  post:   <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};

// ─── Auth endpoints ─────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
}

export interface ForgotPasswordResponse {
  message: string;
  maskedEmail?: string;
  expiresInSeconds?: number;
  devOtp?: string;
}

export interface VerifyOtpResponse {
  valid: boolean;
  message: string;
  username?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { username, password }),
  me: () =>
    api.get<{ user: LoginResponse['user'] }>('/api/auth/me'),
  forgotPassword: (emailOrUsername: string) =>
    api.post<ForgotPasswordResponse>('/api/auth/forgot-password', { emailOrUsername }),
  verifyOtp: (emailOrUsername: string, otp: string) =>
    api.post<VerifyOtpResponse>('/api/auth/verify-otp', { emailOrUsername, otp }),
  resetPassword: (emailOrUsername: string, otp: string, newPassword: string) =>
    api.post<ResetPasswordResponse>('/api/auth/reset-password', { emailOrUsername, otp, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ success: boolean; message: string }>('/api/auth/change-password', { currentPassword, newPassword }),
};

export const auditApi = {
  getLogs: (params?: { page?: number; limit?: number; module?: string; action?: string; desde?: string; hasta?: string }) =>
    api.get<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>('/api/audit', params),
};

export const maestrosApi = {
  getClientes: () => api.get<any[]>('/api/clientes'),
  createCliente: (data: any) => api.post<{ id: string; message: string }>('/api/clientes', data),
  updateCliente: (id: string, data: any) => api.put<{ message: string }>(`/api/clientes/${id}`, data),
  getSectores: () => api.get<any[]>('/api/sectores'),
  createSector: (data: any) => api.post<{ id: string; message: string }>('/api/sectores', data),
  getMateriales: () => api.get<any[]>('/api/materiales'),
  createMaterial: (data: any) => api.post<{ id: string; message: string }>('/api/materiales', data),
  updateMaterialStock: (id: string, stock: number) => api.patch<{ message: string }>(`/api/materiales/${id}/stock`, { stock }),
};

export const reportesApi = {
  getReportes: (params?: { page?: number; limit?: number; estado?: string; search?: string }) =>
    api.get<{ data: any[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>('/api/reportes', params),
  getReporteById: (id: number) => api.get<any>(`/api/reportes/${id}`),
  createReporte: (data: any) => api.post<{ id: number; message: string }>('/api/reportes', data),
  updateReporte: (id: number, data: any) => api.put<{ message: string }>(`/api/reportes/${id}`, data),
};

export const informesApi = {
  getDashboard: () => api.get<{ ordenes: any; financiero: any; novedadesCriticas: number }>('/api/informes/dashboard'),
  getDiario: (fecha?: string) => api.get<{ fecha: string; total: number; data: any[] }>('/api/informes/diario', fecha ? { fecha } : undefined),
  getNovedades: () => api.get<any[]>('/api/informes/novedades'),
  createNovedad: (data: any) => api.post<{ id: number; message: string }>('/api/informes/novedades', data),
};

export default api;


