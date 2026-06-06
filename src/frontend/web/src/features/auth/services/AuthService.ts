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

let mockSessionUser: User | null = {
  id: "1",
  email: "admin@verifinca.com",
  name: "Administrador VeriFinca",
  role: "admin",
};

export const AuthService = {
  async login(email: string, password: string): Promise<Result<AuthResponse, AuthError>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          if (email === "admin@verifinca.com" && password === "admin123") {
            const user = {
              id: "1",
              email: "admin@verifinca.com",
              name: "Administrador VeriFinca",
              role: "admin",
            };
            mockSessionUser = user;
            resolve(success({
              user,
              token: "mock-jwt-token",
            }));
          } else if (email.includes("error")) {
            resolve(failure({ _tag: "NetworkError", message: "Error de conexión con el servidor" }));
          } else {
            // Allow any login for demo but simulate credential check
            const user = {
              id: "2",
              email: email,
              name: "Usuario Demo",
              role: "user",
            };
            mockSessionUser = user;
            resolve(success({
              user,
              token: "mock-jwt-token",
            }));
          }
        } catch (e) {
          resolve(failure({ _tag: "UnknownError", original: e }));
        }
      }, 1000);
    });
  },


  async register(
    nombre: string,
    apellido: string,
    email: string,
    password: string,
    telefono?: string,
    cedula?: string
  ): Promise<Result<{ message: string; usuarioId?: string }, AuthError>> {
    const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(success({
            message: "Usuario registrado exitosamente (Mock).",
            usuarioId: "mock-new-user-guid"
          }));
        }, 1000);
      });
    }

    try {
      const response = await fetch(`${env.API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, apellido, email, password, telefono, cedula })
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
    mockSessionUser = null;
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  },

  async getCurrentUser(): Promise<Option<User>> {
    const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
    if (USE_MOCK) {
      if (!mockSessionUser) return none();
      return some(mockSessionUser);
    }

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
  },

  async registerAccount(params: {
    email: string;
    name: string;
    telefono?: string;
    cedula?: string;
  }): Promise<Result<{ message: string }, AuthError>> {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    try {
      const response = await fetch(`${API_BASE}/email-test/uc-01-account-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: params.email,
          name: params.name,
          telefono: params.telefono,
          cedula: params.cedula,
        }),
      });

      if (!response.ok) {
        let errorMsg = `Error ${response.status}: No se pudo enviar el correo de verificación.`;
        try {
          const errorJson = await response.json();
          if (errorJson?.error) {
            errorMsg = errorJson.error;
          }
        } catch {
          /* ignore parse errors */
        }
        return failure({ _tag: "NetworkError", message: errorMsg });
      }

      return success({ message: "Cuenta registrada exitosamente." });
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  }
};
