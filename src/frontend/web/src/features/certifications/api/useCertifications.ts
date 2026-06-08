import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { SelloIntegridadDto } from "./types";

export const certificationKeys = {
  byProject: (projectId: number) => ["certifications", projectId] as const,
};

export const useCertification = (projectId: number) =>
  useQuery({
    queryKey: certificationKeys.byProject(projectId),
    queryFn: () => apiClient.get<SelloIntegridadDto>(`/projects/${projectId}/seal`).then(res => res.data),
    enabled: !!projectId,
  });

export const useIssueSeal = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<SelloIntegridadDto>(`/projects/${projectId}/seal`).then(res => res.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: certificationKeys.byProject(projectId) }),
  });
};

