import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projectsApi";
import { ProjectStatus } from "../types";
import { isSuccess } from "@/shared/utils/functional";
import { getProjectErrorMessage } from "../types";
import { useToast } from "@/shared/components/ui/Toast/ToastContext";

export const useProjectStatusBar = (projectId: string) => {
  const qc = useQueryClient();
  const { addToast } = useToast();

  const queryKey = ["projectStatusEligibility", projectId];

  const eligibilityQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await projectsApi.getProjectStatusEligibility(projectId);
      if (isSuccess(result)) {
        return result.data;
      }
      throw new Error(String(result.error) || "Failed to fetch status eligibility");
    },
    enabled: !!projectId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: ProjectStatus) => {
      const result = await projectsApi.updateProjectStatus(projectId, status);
      if (!isSuccess(result)) {
        throw new Error(String(result.error) || "Failed to update status");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate project and eligibility queries
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey });
      addToast("Estado actualizado exitosamente", "success");
    },
    onError: () => {
      addToast("Error al actualizar el estado", "error");
    },
  });

  const handleStatusChange = (status: ProjectStatus) => {
    updateStatusMutation.mutate(status);
  };

  return {
    eligibility: eligibilityQuery.data,
    isLoading: eligibilityQuery.isLoading,
    isUpdating: updateStatusMutation.isPending,
    error: eligibilityQuery.error || updateStatusMutation.error,
    handleStatusChange,
  };
};
