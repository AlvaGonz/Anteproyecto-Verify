import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";
import { UserSettings, ProfilePermissions, SubscriptionPlan } from "../types/settings.types";

export const useUsers = () =>
  useQuery({
    queryKey: ["settings", "users"],
    queryFn: () => apiClient.get<UserSettings[]>("/admin/users").then(res => res.data),
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
    mutationFn: ({ userId, planId }: { userId: string; planId: string }) =>
      apiClient.patch<void>(`/admin/users/${userId}/plan`, { planId }).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "users"] });
    },
  });
};

