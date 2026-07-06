import { 
  Option, 
  Result, 
  some, 
  none, 
  success, 
  failure 
} from "../../../shared/utils/functional";
import { apiClient, setAccessToken } from "../../../infrastructure/api/client";

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
  plan?: string;
  avatarUrl?: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | null | string;
  currentPeriodEnd?: string | null;
  // ponytail: pendingPlanCode/billingCycle drive the post-registration checkout redirect
  pendingPlanCode?: string | null;
  pendingBillingCycle?: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type AuthError = 
  | { _tag: "InvalidCredentials" }
  | { _tag: "NetworkError"; message: string }
  | { _tag: "UnknownError"; original: unknown };


export const AuthService = {
  async login(email: string, password: string): Promise<Result<AuthResponse, AuthError>> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      const token = response.data.accessToken ?? null;
      if (!token) {
        // Backend must return accessToken. If missing, treat as auth failure.
        return failure({ _tag: "NetworkError", message: "Token de acceso no recibido del servidor." });
      }
      setAccessToken(token);

      return success({
        user: response.data.user,
        token: token
      });
    } catch (e: any) {
      if (e.response?.status === 401) {
        return failure({ _tag: "InvalidCredentials" });
      }
      return failure({ 
        _tag: "NetworkError", 
        message: e.response?.data?.message || "Error al iniciar sesión" 
      });
    }
  },

  async register(
    nombre: string,
    apellido: string,
    email: string,
    password: string,
    telefono?: string,
    cedula?: string
  ): Promise<Result<{ message: string; usuarioId?: string }, AuthError>> {
    try {
      const response = await apiClient.post('/auth/register', {
        Nombre: nombre,
        Apellido: apellido,
        Email: email,
        Password: password,
        Telefono: telefono ?? "",
        Cedula: cedula ?? ""
      });
      return success(response.data);
    } catch (e: any) {
      return failure({ 
        _tag: "NetworkError", 
        message: e.response?.data?.message || "Error al registrar el usuario" 
      });
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      setAccessToken(null);
    }
  },

  async getCurrentUser(): Promise<Option<User>> {
    try {
      const response = await apiClient.get('/auth/me');
      return some(response.data);
    } catch {
      return none();
    }
  }
};
