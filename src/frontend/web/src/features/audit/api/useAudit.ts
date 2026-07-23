import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { LogProyectoDto } from "./types";
import type { AuditFilters } from "../types";

export const auditKeys = {
  all: ["audit"] as const,
  global: (filters?: AuditFilters) => ["audit", "global", filters] as const,
  byProject: (projectId: string, filters?: AuditFilters) => ["audit", projectId, filters] as const,
};

export const useAuditLog = (projectId: string, filters?: AuditFilters) =>
  useQuery({
    queryKey: auditKeys.byProject(projectId, filters),
    queryFn: () =>
      apiClient
        .get<LogProyectoDto[]>(`/projects/${projectId}/audit`, { params: filters })
        .then((res) => res.data),
    enabled: !!projectId,
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
  });

export const useGlobalAuditTrail = (filters?: AuditFilters) =>
  useQuery({
    queryKey: auditKeys.global(filters),
    queryFn: () =>
      apiClient
        .get<LogProyectoDto[]>(`/admin/audit`, { params: filters })
        .then((res) => res.data),
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
  });

export const useExportGlobalAudit = () =>
  useMutation({
    mutationKey: ["audit", "export"],
    mutationFn: async () => {
      const response = await apiClient.get(`/reports/global-audit`, { responseType: "blob" }).then((res) => res.data);
      return response as Blob;
    },
  });

