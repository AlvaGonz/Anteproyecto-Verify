import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";
import { PaginatedResponse, UserSettings, ProfilePermissions, SubscriptionPlan, CreateUserDto, UpdateUserDto } from "../types/settings.types";

export const useUsers = (page = 1, pageSize = 50, enabled = true) =>
  useQuery({
    queryKey: ["settings", "users", page, pageSize],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<UserSettings>>("/admin/users", { params: { page, pageSize } })
        .then(res => res.data.items),
    enabled,
  });

export const useProfiles = (enabled = true) =>
  useQuery({
    queryKey: ["settings", "profiles"],
    queryFn: () => apiClient.get<ProfilePermissions[]>("/admin/profiles").then(res => res.data),
    enabled,
  });

export const usePlans = (enabled = true) =>
  useQuery({
    queryKey: ["settings", "plans"],
    queryFn: () => apiClient.get<SubscriptionPlan[]>("/admin/plans").then(res => res.data),
    enabled,
  });

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useUsers'],
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient.patch<void>(`/admin/users/${userId}/role`, { role }).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "users"] });
    },
  });
};

export const useUpdateUserPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useUpdateUserPlan'],
    mutationFn: ({ userId, planId }: { userId: string; planId: string }) =>
      apiClient.patch<void>(`/admin/users/${userId}/plan`, { planId }).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "users"] });
    },
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useCreateUser'],
    mutationFn: (data: CreateUserDto) =>
      apiClient.post<UserSettings>(`/admin/users`, data).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "users"] });
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useUpdateUser'],
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserDto }) =>
      apiClient.put<UserSettings>(`/admin/users/${userId}`, data).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "users"] });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useDeleteUser'],
    mutationFn: (userId: string) =>
      apiClient.delete<void>(`/admin/users/${userId}`).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "users"] });
    },
  });
};

export const useUpdateMyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["useUpdateMyProfile"],
    mutationFn: (data: { nombre: string; apellido: string; telefono?: string; currentPassword?: string; newPassword?: string }) =>
      apiClient.patch("/auth/profile", data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate auth/me so AuthContext reflects the new name
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export interface MySubscriptionStatus {
  plan: string | null;
  planPrice: number | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  stripeSubscriptionId: string | null;
  isManagedByStripe: boolean;
}

export const useMySubscription = () =>
  useQuery<MySubscriptionStatus>({
    queryKey: ["subscription", "my-status"],
    queryFn: () =>
      apiClient
        .get<MySubscriptionStatus>("/v1/subscriptions/my-status")
        .then((res) => res.data),
    staleTime: 0,
    gcTime: 1000 * 30,
    refetchOnWindowFocus: true,
    retry: 1,
  });
