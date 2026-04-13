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

export const AuthService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    // In a real app, we would use httpClient.post
    // For now, we simulate a successful login
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === "admin@verifinca.com" && password === "admin123") {
          resolve({
            user: {
              id: "1",
              email: "admin@verifinca.com",
              name: "Administrador VeriFinca",
              role: "admin",
            },
            token: "mock-jwt-token",
          });
        } else {
          // Allow any login for demo purposes but with a default user
          resolve({
            user: {
              id: "2",
              email: email,
              name: "Usuario Demo",
              role: "user",
            },
            token: "mock-jwt-token",
          });
        }
      }, 1000);
    });
  },

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("vf_token");
    if (!token) return null;
    
    // Simulate fetching user from session
    return {
      id: "1",
      email: "admin@verifinca.com",
      name: "Administrador VeriFinca",
      role: "admin",
    };
  }
};
