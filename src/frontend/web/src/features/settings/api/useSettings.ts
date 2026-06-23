import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";
import { PaginatedResponse, UserSettings, ProfilePermissions, SubscriptionPlan, CreateUserDto, UpdateUserDto } from "../types/settings.types";

export const useUsers = (page = 1, pageSize = 50) =>
  useQuery({
    queryKey: ["settings", "users", page, pageSize],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<UserSettings>>("/admin/users", { params: { page, pageSize } })
        .then(res => res.data.items),
  });

export const useProfiles = () =>
  useQuery({
    queryKey: ["settings", "profiles"],
    queryFn: () => apiClient.get<ProfilePermissions[]>("/admin/profiles").then(res => res.data),
  });

export const usePlans = () =>
  useQuery({
    queryKey: ["settings", "plans"],
    queryFn: () => apiClient.get<SubscriptionPlan[]>("/admin/plans").then(res => res.data),
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
