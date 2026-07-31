import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";
import { PaginatedResponse, UserSettings, ProfilePermissions, SubscriptionPlan, CreateUserDto, UpdateUserDto } from "../types/settings.types";
import { useAuth } from "../../../shared/context/AuthContext";
import { z } from "zod";

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
    mutationKey: ['useUpdateUserRole'],
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient.patch<void>(`/admin/users/${userId}/role`, { role }).then(res => res.data),
    onMutate: async ({ userId, role }) => {
      await qc.cancelQueries({ queryKey: ["settings", "users"] });
      qc.setQueriesData({ queryKey: ["settings", "users"] }, (old: any) => 
        old?.map((u: any) => u.id === userId ? { ...u, role } : u)
      );
    },
    onSettled: () => {
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
    onMutate: async ({ userId, planId }) => {
      await qc.cancelQueries({ queryKey: ["settings", "users"] });
      qc.setQueriesData({ queryKey: ["settings", "users"] }, (old: any) => 
        old?.map((u: any) => u.id === userId ? { ...u, planId } : u)
      );
    },
    onSettled: () => {
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
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ["settings", "users"] });
      qc.setQueriesData({ queryKey: ["settings", "users"] }, (old: any) => 
        old ? [{ id: "temp-" + Date.now(), ...data, planCreatedAt: new Date().toISOString() }, ...old] : old
      );
    },
    onSettled: () => {
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
    onMutate: async ({ userId, data }) => {
      await qc.cancelQueries({ queryKey: ["settings", "users"] });
      qc.setQueriesData({ queryKey: ["settings", "users"] }, (old: any) => 
        old?.map((u: any) => u.id === userId ? { ...u, ...data } : u)
      );
    },
    onSettled: () => {
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
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ["settings", "users"] });
      qc.setQueriesData({ queryKey: ["settings", "users"] }, (old: any) => 
        old?.filter((u: any) => u.id !== userId)
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["settings", "users"] });
    },
  });
};

export const useUpdateMyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["useUpdateMyProfile"],
    mutationFn: (data: { nombre: string; apellido: string; telefono?: string; cedula?: string; rnc?: string; razonSocial?: string; nombreComercial?: string; actividadEconomica?: string; direccion?: string; provincia?: string; nickname?: string; currentPassword?: string; newPassword?: string }) =>
      apiClient.patch("/auth/profile", data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate auth/me so AuthContext reflects the new name
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const useUploadAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["useUploadAvatar"],
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.post<{ message: string; url: string }>("/auth/me/avatar", formData).then((res) => res.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const PlanLimitsSchema = z.object({
  maxConsultas: z.number(),
  maxProyectos: z.number(),
  presentacionPublica: z.boolean(),
  qrIncluido: z.boolean(),
  maxUsuariosSecundarios: z.number(),
  maxAlmacenamientoMb: z.number(),
  alertasTiempoReal: z.boolean(),
  modeloLm: z.boolean(),
  validacionLote: z.boolean(),
  exportacionExcel: z.boolean(),
  exportacionPdf: z.boolean(),
  integracionCrm: z.boolean(),
  soporteTipo: z.string().nullable().default(''),
  accesoApi: z.boolean(),
  consultasUsadas: z.number(),
  proyectosCreados: z.number(),
});

export type PlanLimitsDto = z.infer<typeof PlanLimitsSchema>;

export const PricingInfoSchema = z.object({
  monthlyPrice: z.number(),
  yearlyPrice: z.number(),
  yearlyDiscountPercent: z.number(),
  yearlyBadge: z.string(),
});

export type PricingInfoDto = z.infer<typeof PricingInfoSchema>;

export const MySubscriptionStatusSchema = z.object({
  plan: z.string().nullable().optional(),
  planPrice: z.number().nullable().optional(),
  subscriptionStatus: z.string().nullable().optional(),
  currentPeriodEnd: z.string().nullable().optional(),
  stripeSubscriptionId: z.string().nullable().optional(),
  isManagedByStripe: z.boolean().optional(),
  billingCycle: z.string().nullable().optional(),
  isGuest: z.boolean().optional(),
  inviterPlan: z.string().nullable().optional(),
  inviterName: z.string().nullable().optional(),
  planLimits: PlanLimitsSchema.nullable().optional(),
  pricing: PricingInfoSchema.nullable().optional(),
});

export type MySubscriptionStatus = z.infer<typeof MySubscriptionStatusSchema>;

export const useMySubscription = (options?: { refetchInterval?: number }) =>
  useQuery<MySubscriptionStatus>({
    queryKey: ["subscription", "my-status"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<MySubscriptionStatus>("/v1/subscriptions/my-status");
        return MySubscriptionStatusSchema.parse(res.data);
      } catch (err: any) {
        // ponytail: log removed to prevent console pollution
        throw err;
      }
    },
    staleTime: 0,
    gcTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchInterval: options?.refetchInterval ?? 15_000,
    retry: 1,
  });

export const usePlanLimits = () => {
  const { data, isLoading, isError, refetch } = useMySubscription();
  
  return {
    planLimits: data?.planLimits ?? null,
    isLoading,
    isError,
    isUnavailable: !isLoading && !isError && data?.planLimits === null,
    refetch,
  };
};

export const useSyncSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["useSyncSubscription"],
    mutationFn: () => apiClient.post<{message: string}>("/v1/subscriptions/sync").then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription", "my-status"] });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    }
  });
};

export const useCancelSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["useCancelSubscription"],
    mutationFn: () => apiClient.post<{message: string}>("/v1/subscriptions/cancel").then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription", "my-status"] });
    }
  });
};

export const useReactivateSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["useReactivateSubscription"],
    mutationFn: () => apiClient.post<{message: string}>("/v1/subscriptions/reactivate").then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription", "my-status"] });
    }
  });
};


export const useUpdateInviteeLimits = () => {
  const qc = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationKey: ["useUpdateInviteeLimits"],
    mutationFn: ({ inviteeId, maxProyectosDelegados, maxConsultasDelegadas }: { inviteeId: string; maxProyectosDelegados: number | null; maxConsultasDelegadas: number | null }) =>
      apiClient.put<{message: string}>(`/admin/users/invitees/${inviteeId}/limits`, { maxProyectosDelegados, maxConsultasDelegadas }).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      qc.invalidateQueries({ queryKey: ["settings", "users"] });
      refreshUser();
    },
  });
};

export const useRemoveInvitee = () => {
  const qc = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationKey: ["useRemoveInvitee"],
    mutationFn: (inviteeId: string) =>
      apiClient.delete<{message: string}>(`/admin/users/invitees/${inviteeId}`).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      qc.invalidateQueries({ queryKey: ["settings", "users"] });
      refreshUser();
    },
  });
};

export const useInviteUser = () => {
  const qc = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationKey: ["useInviteUser"],
    mutationFn: (data: { nombre: string; apellido: string; email: string; telefono: string; cedula: string; maxProyectosDelegados?: number | null; maxConsultasDelegadas?: number | null }) =>
      apiClient.post<{message: string}>(`/admin/users/invite`, data).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      qc.invalidateQueries({ queryKey: ["settings", "users"] });
      refreshUser();
    },
  });
};
