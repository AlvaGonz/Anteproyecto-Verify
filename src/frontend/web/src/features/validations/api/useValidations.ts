import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";

export const validationKeys = {
  byProject: (projectId: string) => ["validations", projectId] as const,
};

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
      qc.invalidateQueries({ queryKey: ["projects", projectId] }); // ponytail: detail may depend on validation status
      qc.invalidateQueries({ queryKey: ["projectStatusEligibility", projectId] }); // ponytail: eligibility may change after validation
      qc.invalidateQueries({ queryKey: ["audit", projectId] }); // ponytail: audit may record validation execution
    },
  });
};

