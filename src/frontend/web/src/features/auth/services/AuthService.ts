import { apiClient, setAccessToken, getAccessToken, refreshAuthToken } from "../../../infrastructure/api/client";

export interface User {
  id: string;
  email: string;
  nombreCompleto?: string;
  nombre?: string;
  apellido?: string;
  role?: string;
  rol?: string;
  cedula?: string;
  telefono?: string;
  rnc?: string;
  razonSocial?: string;
  nombreComercial?: string;
  actividadEconomica?: string;
  direccion?: string;
  provincia?: string;
  nickname?: string;
  plan?: string;
  avatarUrl?: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | null | string;
  currentPeriodEnd?: string | null;
  // ponytail: pendingPlanCode/billingCycle drive the post-registration checkout redirect
  pendingPlanCode?: string | null;
  pendingBillingCycle?: string | null;
  // ponytail: guest/inviter fields for subscription display
  isGuest?: boolean;
  aceptoDescargo?: boolean;
  titularId?: string | null;
  inviterPlan?: string;
  maxUsuariosSecundarios?: number;
  inviteesList?: Array<{
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    estado?: string;
  }>;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type AuthError = 
  | { _tag: "InvalidCredentials"; message: string }
  | { _tag: "NetworkError"; message: string }
  | { _tag: "UnknownError"; message: string; original: unknown };


export const AuthService = {
  async login(email: string, password: string): Promise<{ data: AuthResponse } | { error: AuthError }> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      const token = response.data.accessToken ?? null;
      if (!token) {
        // Backend must return accessToken. If missing, treat as auth failure.
        return { error: { _tag: "NetworkError", message: "Token de acceso no recibido del servidor." } };
      }
      setAccessToken(token);

      return { data: {
        user: response.data.user,
        token: token
      }};
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 401) {
        return { error: { _tag: "InvalidCredentials", message: "Credenciales inválidas" } };
      }
      return { error: { 
        _tag: "NetworkError", 
        message: err.response?.data?.message || "Error al iniciar sesión" 
      }};
    }
  },

  async googleLogin(credential: string): Promise<{ data: AuthResponse } | { error: AuthError }> {
    try {
      const response = await apiClient.post('/auth/google', { credential });
      
      const token = response.data.accessToken ?? null;
      if (!token) {
        return { error: { _tag: "NetworkError", message: "Token de acceso no recibido del servidor." } };
      }
      setAccessToken(token);

      return { data: {
        user: response.data.user,
        token: token
      }};
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 401 || err.response?.status === 400) {
        return { error: { _tag: "InvalidCredentials", message: "Credenciales inválidas" } };
      }
      return { error: { 
        _tag: "NetworkError", 
        message: err.response?.data?.message || "Error al iniciar sesión con Google" 
      }};
    }
  },

  async register(
    nombre: string,
    apellido: string,
    email: string,
    password: string,
    telefono?: string,
    cedula?: string
  ): Promise<{ data: { message: string; usuarioId?: string } } | { error: AuthError }> {
    try {
      const response = await apiClient.post('/auth/register', {
        Nombre: nombre,
        Apellido: apellido,
        Email: email,
        Password: password,
        Telefono: telefono ?? "",
        Cedula: cedula ?? ""
      });
      return { data: response.data };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return { error: { 
        _tag: "NetworkError", 
        message: err.response?.data?.message || "Error al registrar el usuario" 
      }};
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      setAccessToken(null);
      // Hard delete cookies client-side as fallback to prevent 401 loops
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/auth/refresh;";
    }
  },

  async refreshAccessToken(): Promise<string | null> {
    try {
      return await refreshAuthToken();
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    // Fast path: use in-memory access token if available
    if (getAccessToken()) {
      try {
        const response = await apiClient.get('/auth/me');
        return response.data;
      } catch {
        // Token expired — fall through to refresh
      }
    }

    // Try refresh token (cookie-based)
    const newToken = await this.refreshAccessToken();
    if (newToken) {
      try {
        const response = await apiClient.get('/auth/me');
        return response.data;
      } catch {
        return null;
      }
    }

    return null;
  }
};
