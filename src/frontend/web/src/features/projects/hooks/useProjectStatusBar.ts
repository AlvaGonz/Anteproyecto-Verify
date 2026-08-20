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
        return result.value;
      }
      throw new Error(getProjectErrorMessage(result.error) || "Failed to fetch status eligibility");
    },
    enabled: !!projectId,
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: ProjectStatus) => {
      const result = await projectsApi.updateProjectStatus(projectId, status);
      if (!isSuccess(result)) {
        throw new Error(getProjectErrorMessage(result.error) || "Failed to update status");
      }
      return result.value;
    },
    onMutate: async (newStatus: ProjectStatus) => {
      await qc.cancelQueries({ queryKey });
      await qc.cancelQueries({ queryKey: ["projects", projectId] });
      await qc.cancelQueries({ queryKey: ["projects"] });

      const previousEligibility = qc.getQueryData(queryKey);
      const previousProject = qc.getQueryData(["projects", projectId]);

      qc.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return { ...old, currentStatus: newStatus };
      });

      qc.setQueryData(["projects", projectId], (old: any) => {
        if (!old) return old;
        return { ...old, estadoProyecto: newStatus, estatusDescripcion: newStatus };
      });

      qc.setQueriesData({ queryKey: ["projects", "list"] }, (oldData: any) => {
        if (!oldData) return oldData;
        const updateItem = (p: any) =>
          p.id === projectId ? { ...p, estadoProyecto: newStatus, estatusDescripcion: newStatus } : p;
        if (Array.isArray(oldData)) {
          return oldData.map(updateItem);
        }
        if (oldData.projects && Array.isArray(oldData.projects)) {
          return { ...oldData, projects: oldData.projects.map(updateItem) };
        }
        return oldData;
      });

      return { previousEligibility, previousProject };
    },
    onError: (_err, _newStatus, context) => {
      if (context?.previousEligibility) {
        qc.setQueryData(queryKey, context.previousEligibility);
      }
      if (context?.previousProject) {
        qc.setQueryData(["projects", projectId], context.previousProject);
      }
      addToast("Error al actualizar el estado", "error");
    },
    onSettled: () => {
      // Invalidate project and eligibility queries
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", projectId] });
      qc.invalidateQueries({ queryKey }); // statusEligibility
      qc.invalidateQueries({ queryKey: ["statusHistory", projectId] });
      qc.invalidateQueries({ queryKey: ["audit", projectId] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onSuccess: () => {
      addToast("Estado actualizado exitosamente", "success");
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
