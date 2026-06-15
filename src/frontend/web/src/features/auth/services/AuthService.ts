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
    const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            if (email === "admin@verifinca.com" && password === "admin123") {
              resolve(success({
                user: {
                  id: "1",
                  email: "admin@verifinca.com",
                  name: "Administrador VeriFinca",
                  role: "admin",
                },
                token: "mock-jwt-token",
              }));
            } else if (email.includes("error")) {
              resolve(failure({ _tag: "NetworkError", message: "Error de conexión con el servidor" }));
            } else {
              resolve(success({
                user: {
                  id: "2",
                  email: email,
                  name: "Usuario Demo",
                  role: "user",
                },
                token: "mock-jwt-token",
              }));
            }
          } catch (e) {
            resolve(failure({ _tag: "UnknownError", original: e }));
          }
        }, 1000);
      });
    }

    try {
      const response = await fetch(`${env.API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 400) {
          return failure({ _tag: "InvalidCredentials" });
        }
        const errorData = await response.json().catch(() => ({ message: "Error de inicio de sesión" }));
        return failure({ _tag: "NetworkError", message: errorData.message || "Error al iniciar sesión" });
      }

      const data = await response.json();
      return success(data as AuthResponse);
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
    localStorage.removeItem("vf_token");
    localStorage.removeItem("vf_user");
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  },

  async getCurrentUser(): Promise<Option<User>> {
    const token = localStorage.getItem("vf_token");
    const userJson = localStorage.getItem("vf_user");
    if (!token || !userJson) return none();
    try {
      const user = JSON.parse(userJson) as User;
      return some(user);
    } catch {
      return none();
    }
  }
};
