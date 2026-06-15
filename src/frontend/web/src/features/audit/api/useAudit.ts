import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { LogProyectoDto } from "./types";

export const auditKeys = {
  global: (filters?: any) => ["audit", "global", filters] as const,
  byProject: (projectId: string, filters?: any) => ["audit", projectId, filters] as const,
};

export const useAuditLog = (projectId: string, filters?: any) =>
  useQuery({
    queryKey: auditKeys.byProject(projectId, filters),
    queryFn: () => apiClient.get<LogProyectoDto[]>(`/projects/${projectId}/audit`, { params: filters }).then(res => res.data),
    enabled: !!projectId,
  });

export const useGlobalAuditTrail = (filters?: any) =>
  useQuery({
    queryKey: auditKeys.global(filters),
    queryFn: () => apiClient.get<LogProyectoDto[]>(`/admin/audit`, { params: filters }).then(res => res.data),
  });

export const useExportGlobalAudit = () =>
  useMutation({
    mutationKey: ['auditKeys'],
    mutationFn: async () => {
      const response = await apiClient.get(`/reports/global-audit`, { responseType: 'blob' }).then(res => res.data);
      return response as Blob;
    },
  });

