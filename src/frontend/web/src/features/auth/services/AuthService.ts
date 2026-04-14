import { 
  Option, 
  Result, 
  some, 
  none, 
  success, 
  failure 
} from "../../../shared/utils/functional";

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
            // Allow any login for demo but simulate credential check
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
  },

  async logout(): Promise<void> {
    localStorage.removeItem("vf_token");
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  },

  async getCurrentUser(): Promise<Option<User>> {
    const token = localStorage.getItem("vf_token");
    if (!token) return none();
    
    // Simulate fetching user from session
    return some({
      id: "1",
      email: "admin@verifinca.com",
      name: "Administrador VeriFinca",
      role: "admin",
    });
  }
};
