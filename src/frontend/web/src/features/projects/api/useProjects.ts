import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";
import type { ProyectoDto as ApiProyectoDto } from "./types";
import type { ProyectoDto, CreateProyectoDto, LegalStatus } from "../types";
import { ProjectCategory } from "../types";

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", id] as const,
};

const mapApiProject = (apiProj: ApiProyectoDto): ProyectoDto => ({
  id: String(apiProj.id),
  codigoInterno: apiProj.codigoInterno || `PRJ-${apiProj.id}`,
  nombre: apiProj.nombre,
  ubicacionTexto: apiProj.ubicacionTexto || "",
  ubicacionGps: apiProj.ubicacionGps,
  valorEstimado: apiProj.valorEstimado,
  categoria: apiProj.categoria,
  datosDesarrollador: apiProj.datosDesarrollador,
  rncDesarrollador: apiProj.rncDesarrollador,
  designacionCatastral: apiProj.designacionCatastral,
  matricula: apiProj.matricula,
  estatusDescripcion: apiProj.estatusDescripcion,
  estadoJuridico: apiProj.estadoJuridico as LegalStatus,
  estadoProyecto: apiProj.estadoProyecto,
  estadoIntegridad: apiProj.estadoIntegridad,
  usuarioCreadorId: String(apiProj.usuarioCreadorId),
  createdAtUtc: apiProj.createdAtUtc,
  imagenUrl: apiProj.imagenUrl,
});

export const useProjects = () =>
  useQuery({
    queryKey: projectKeys.all,
    queryFn: () => apiClient.get<ApiProyectoDto[]>("/projects").then(res => res.data.map(mapApiProject)),
  });

export const useProject = (id: string) =>
  useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => apiClient.get<ApiProyectoDto>(`/projects/${id}`).then(res => mapApiProject(res.data)),
    enabled: !!id,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['projectKeys'],
    mutationFn: (data: CreateProyectoDto) =>
      apiClient.post<ApiProyectoDto>("/projects", {
        ...data,
        categoria: data.categoria ?? ProjectCategory.Residencial,
      }).then(res => mapApiProject(res.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
};

export const useUpdateProjectStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['updateProjectStatus'],
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      apiClient.patch<ApiProyectoDto>(`/projects/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
      }).then(res => mapApiProject(res.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
};

export const useProjectDiagnosis = () => {
  // eslint-disable-next-line react-doctor/query-mutation-missing-invalidation
  return useMutation({
    mutationKey: ['projectDiagnosis'],
    mutationFn: async (id: string) => {
      // We will just return the diagnosis result directly from api
      const response = await apiClient.get(`/projects/${id}/documents/diagnosis`);
      return response.data;
    }
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['deleteProject'],
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`).then(res => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
};
