import { useMutation } from "@tanstack/react-query";
import { apiClient, setAccessToken } from "@/infrastructure/api/client";
import type { LoginFormValues, RegisterFormValues } from "../schemas";

interface AuthResponse {
  accessToken: string;
  user: { id: string; nombre: string; email: string; rol: string };
}

export const useLogin = () =>
  // eslint-disable-next-line react-doctor/query-mutation-missing-invalidation
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
  // eslint-disable-next-line react-doctor/query-mutation-missing-invalidation
  useMutation({
    mutationFn: (data: Omit<RegisterFormValues, "confirmPassword" | "acceptedTerms"> & { returnUrl?: string; pendingPlanCode?: string; pendingBillingCycle?: string }) =>
      apiClient.post<AuthResponse>("/auth/register", data).then(res => res.data),
    onSuccess: (res) => {
      if (res.accessToken) {
        setAccessToken(res.accessToken);
      }
    },
  });

export const useLogout = () =>
  // eslint-disable-next-line react-doctor/query-mutation-missing-invalidation
  useMutation({
    mutationFn: () => apiClient.post("/auth/logout").then(res => res.data),
    onSuccess: () => setAccessToken(null),
  });

export const useResendVerificationEmail = () =>
  // eslint-disable-next-line react-doctor/query-mutation-missing-invalidation
  useMutation({
    mutationFn: (data: { email: string; returnUrl?: string }) =>
      apiClient.post("/auth/resend-verification", data).then(res => res.data),
    onError: (error) => {
      console.error("[RESEND_FAILURE]", { context: "resend-verification", error });
    },
  });
