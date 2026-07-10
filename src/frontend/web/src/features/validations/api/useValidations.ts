import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { ValidationResultDto } from "./types";

export const validationKeys = {
  byProject: (projectId: string) => ["validations", projectId] as const,
};

const useValidations = (projectId: string) =>
  useQuery({
    queryKey: validationKeys.byProject(projectId),
    queryFn: () =>
      apiClient.get<ValidationResultDto[]>(`/projects/${projectId}/validations`).then(res => res.data),
    enabled: !!projectId,
  });

const useLatestInternalValidation = (projectId: string) =>
  useQuery({
    queryKey: ["validations", "internal", "latest", projectId],
    queryFn: () => apiClient.get<any>(`/projects/${projectId}/validations/internal/latest`).then(res => res.data),
    enabled: !!projectId,
  });

export const useFindings = (projectId: string) =>
  useQuery({
    queryKey: ["findings", projectId],
    queryFn: () => apiClient.get<any[]>(`/projects/${projectId}/findings`)
      .then(res => res.data)
      .catch((err) => {
        if (err.response?.status === 404) return [];
        throw err;
      }),
    enabled: !!projectId,
  });

export const useValidationResult = (projectId: string) =>
  useQuery({
    queryKey: ["validations", "result", projectId],
    queryFn: () => apiClient.get<any>(`/projects/${projectId}/validation-result`)
      .then(res => res.data)
      .catch((err) => {
        if (err.response?.status === 404) return null;
        throw err;
      }),
    enabled: !!projectId,
  });

export const useRunFullValidation = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useFindings'],
    mutationFn: () => apiClient.post<any>(`/projects/${projectId}/validate`, {}).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["validations", "result", projectId] });
      qc.invalidateQueries({ queryKey: ["findings", projectId] });
      // Invalidate audit logs if needed
    },
  });
};

