import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";
import type { ProyectoDto as ApiProyectoDto } from "./types";
import type { ProyectoDto, CreateProyectoDto } from "../types";
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
  categoria: apiProj.categoria,
  estadoProyecto: apiProj.estadoProyecto,
  estadoIntegridad: apiProj.estadoIntegridad,
  usuarioCreadorId: String(apiProj.usuarioCreadorId),
  createdAtUtc: apiProj.createdAtUtc,
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
    mutationFn: (data: CreateProyectoDto) =>
      apiClient.post<ApiProyectoDto>("/projects", {
        nombre: data.nombre,
        ubicacionTexto: data.ubicacionTexto,
        categoria: data.categoria ?? ProjectCategory.Residencial,
        usuarioCreadorId: data.usuarioCreadorId,
        datosDesarrollador: data.datosDesarrollador,
        designacionCatastral: data.designacionCatastral
      }).then(res => mapApiProject(res.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
};
