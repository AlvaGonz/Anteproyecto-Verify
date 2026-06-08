import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { ValidationResultDto } from "./types";

export const validationKeys = {
  byProject: (projectId: number) => ["validations", projectId] as const,
};

export const useValidations = (projectId: number) =>
  useQuery({
    queryKey: validationKeys.byProject(projectId),
    queryFn: () =>
      apiClient.get<ValidationResultDto[]>(`/projects/${projectId}/validations`).then(res => res.data),
    enabled: !!projectId,
  });

export const useSubmitValidation = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ValidationResultDto>) =>
      apiClient.post<ValidationResultDto>(`/projects/${projectId}/validations`, data).then(res => res.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: validationKeys.byProject(projectId) }),
  });
};

export const useLatestInternalValidation = (projectId: number) =>
  useQuery({
    queryKey: ["validations", "internal", "latest", projectId],
    queryFn: () => apiClient.get<any>(`/projects/${projectId}/validations/internal/latest`).then(res => res.data),
    enabled: !!projectId,
  });

export const useRunInternalValidation = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<any>(`/projects/${projectId}/validations/internal/run`, {}).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["validations", "internal", "latest", projectId] });
      qc.invalidateQueries({ queryKey: ["findings", projectId] });
    },
  });
};

export const useFindings = (projectId: number) =>
  useQuery({
    queryKey: ["findings", projectId],
    queryFn: () => apiClient.get<any[]>(`/projects/${projectId}/findings`).then(res => res.data),
    enabled: !!projectId,
  });

export const useValidationResult = (projectId: number) =>
  useQuery({
    queryKey: ["validations", "result", projectId],
    queryFn: () => apiClient.get<any>(`/projects/${projectId}/validations/result`).then(res => res.data),
    enabled: !!projectId,
  });

export const useRunFullValidation = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<any>(`/projects/${projectId}/validations/run`, {}).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["validations", "result", projectId] });
      qc.invalidateQueries({ queryKey: ["findings", projectId] });
      // Invalidate audit logs if needed
    },
  });
};

