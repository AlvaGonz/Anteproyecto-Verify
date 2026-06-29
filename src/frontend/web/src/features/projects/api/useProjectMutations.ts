import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "./projectsApi";
import type { CreateProyectoDto, UpdateProyectoDto } from "../types";
import { getProjectErrorMessage } from "../types";
import { projectKeys } from "./useProjects";

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useCreateProject'],
    mutationFn: async (data: CreateProyectoDto & { fotosNuevas?: File[] }) => {
      const result = await projectsApi.createProject(data);
      if (result._tag === "Failure") throw new Error(getProjectErrorMessage(result.error));
      return result.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
};

export const useUpdateProject = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useUpdateProject'],
    mutationFn: async (data: UpdateProyectoDto) => {
      const result = await projectsApi.updateProject(projectId, data);
      if (result._tag === "Failure") throw new Error(getProjectErrorMessage(result.error));
      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
};

export { useDeleteProject } from "./useProjects";
