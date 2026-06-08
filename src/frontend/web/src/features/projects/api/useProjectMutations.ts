import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { ProyectoDto, CreateProyectoDto, UpdateProyectoDto } from "../types";
import { projectKeys } from "./useProjects";

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProyectoDto) =>
      apiClient.post<ProyectoDto>("/projects", data).then(res => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
};

export const useUpdateProject = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProyectoDto) =>
      apiClient.put<ProyectoDto>(`/projects/${projectId}`, data).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
};
