import { 
  Option, 
  Result, 
  some, 
  none, 
  success, 
  failure 
} from "../../../shared/utils/functional";
import { apiClient } from "../../../infrastructure/api/client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
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
      return success({
        user: response.data.user,
        token: "real-cookie-session"
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
