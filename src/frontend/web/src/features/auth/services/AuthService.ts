import { 
  Option, 
  Result, 
  some, 
  none, 
  success, 
  failure 
} from "../../../shared/utils/functional";
import { env } from "../../../infrastructure/config/env";

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
      const response = await fetch(`${env.API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      if (!response.ok) {
        if (response.status === 401) {
          return failure({ _tag: "InvalidCredentials" });
        }
        const errorData = await response.json().catch(() => ({ message: "Error al iniciar sesión" }));
        return failure({ _tag: "NetworkError", message: errorData.message || "Error al iniciar sesión" });
      }

      const data = await response.json();
      return success({
        user: data.user,
        token: "real-cookie-session"
      });
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
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
      const response = await fetch(`${env.API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          Nombre: nombre, 
          Apellido: apellido, 
          Email: email, 
          Password: password, 
          Telefono: telefono ?? "", 
          Cedula: cedula ?? "" 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error al registrar el usuario" }));
        return failure({ _tag: "NetworkError", message: errorData.message || "Error al registrar el usuario" });
      }

      const data = await response.json();
      return success(data);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${env.API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch {
      // Ignore errors on logout
    }
  },

  async getCurrentUser(): Promise<Option<User>> {
    try {
      const response = await fetch(`${env.API_URL}/api/auth/me`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) return none();
      const user = await response.json();
      return some(user);
    } catch {
      return none();
    }
  }
};
