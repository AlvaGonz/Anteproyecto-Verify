import { useMutation } from "@tanstack/react-query";
import { apiClient, setAccessToken } from "@/infrastructure/api/client";
import type { LoginFormValues, RegisterFormValues } from "../schemas";

interface AuthResponse {
  accessToken: string;
  user: { id: string; nombre: string; email: string; rol: string };
}

export const useLogin = () =>
  useMutation({
    mutationFn: (data: LoginFormValues) =>
      apiClient.post<AuthResponse>("/auth/login", data).then(res => res.data),
    onSuccess: (res) => {
      if (res.accessToken) {
        setAccessToken(res.accessToken);
      }
    },
  });

export const useRegister = () =>
  useMutation({
    mutationFn: (data: Omit<RegisterFormValues, "confirmPassword">) =>
      apiClient.post<AuthResponse>("/auth/register", data).then(res => res.data),
    onSuccess: (res) => {
      if (res.accessToken) {
        setAccessToken(res.accessToken);
      }
    },
  });

export const useLogout = () =>
  useMutation({
    mutationFn: () => apiClient.post("/auth/logout").then(res => res.data),
    onSuccess: () => setAccessToken(null),
  });
