import apiClient from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<LoginResponse>("/auth/login", body).then((r) => r.data),
  logout: () => apiClient.post("/auth/logout").then((r) => r.data),
  refresh: () =>
    apiClient.post<LoginResponse>("/auth/refresh", {}, { withCredentials: true }).then((r) => r.data),
};
