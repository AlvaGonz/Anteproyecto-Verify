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
    apiClient.post<LoginResponse>("/auth/login", body).then((r: { data: LoginResponse }) => r.data),
  logout: () => apiClient.post("/auth/logout").then((r: { data: unknown }) => r.data),
  refresh: () =>
    apiClient.post<LoginResponse>("/auth/refresh", {}, { withCredentials: true }).then((r: { data: LoginResponse }) => r.data),
  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (body: { token: string; newPassword: string }) =>
    apiClient.post("/auth/reset-password", body).then((r) => r.data),
};
