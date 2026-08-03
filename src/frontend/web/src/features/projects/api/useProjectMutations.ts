import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "./projectsApi";
import type { CreateProyectoDto, UpdateProyectoDto } from "../types";
import { getProjectErrorMessage } from "../types";
import { projectKeys } from "./useProjects";
import { isSuccess } from "@/shared/utils/functional";

export class LimitReachedError extends Error {
  constructor(message?: string) {
    super(message || "Has alcanzado el límite permitido");
    this.name = "LimitReachedError";
  }
}

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useCreateProject'],
    mutationFn: async (data: CreateProyectoDto & { fotosNuevas?: File[] }) => {
      const result = await projectsApi.createProject(data);
      if (!isSuccess(result)) {
        if (result.error._tag === "LimitReached") {
          throw new LimitReachedError(getProjectErrorMessage(result.error));
        }
        throw new Error(getProjectErrorMessage(result.error));
      }
      return result.value;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
};

export const useUpdateProject = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useUpdateProject'],
    mutationFn: async (data: UpdateProyectoDto) => {
      const result = await projectsApi.updateProject(projectId, data);
      if (!isSuccess(result)) throw new Error(getProjectErrorMessage(result.error));
      return result.value;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      qc.invalidateQueries({ queryKey: ["projectStatusEligibility", projectId] }); // ponytail: status may auto-transition after save
      qc.invalidateQueries({ queryKey: ["statusHistory", projectId] }); // ponytail: CREADO→EDITADO auto-promote writes a new entry
    },
  });
};

export { useDeleteProject } from "./useProjects";
