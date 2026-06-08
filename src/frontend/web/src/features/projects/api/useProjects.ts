import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { ProyectoDto as ApiProyectoDto } from "./types";
import type { ProyectoDto, CreateProyectoDto } from "../types";
import { ProjectCategory, ProjectStatus, IntegrityStatus } from "../types";

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: number) => ["projects", id] as const,
};

const mapApiProject = (apiProj: ApiProyectoDto): ProyectoDto => ({
  id: String(apiProj.idProyecto),
  codigoInterno: `PRJ-${apiProj.idProyecto}`, // fallback
  nombre: apiProj.nombre,
  ubicacionTexto: apiProj.ubicacion || "",
  categoria: apiProj.tipoProyecto === "Comercial" ? ProjectCategory.Comercial : ProjectCategory.Residencial,
  estadoProyecto: apiProj.estado === "Activo" ? ProjectStatus.Published : ProjectStatus.Draft,
  estadoIntegridad: apiProj.estado === "Activo" ? IntegrityStatus.Verified : IntegrityStatus.Pending,
  usuarioCreadorId: String(apiProj.idUsuario),
  createdAtUtc: apiProj.fechaCreacion,
});

export const useProjects = () =>
  useQuery({
    queryKey: projectKeys.all,
    queryFn: () => apiClient.get<ApiProyectoDto[]>("/projects").then(res => res.data.map(mapApiProject)),
  });

export const useProject = (id: number) =>
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
        ubicacion: data.ubicacionTexto,
        categoria: data.categoria === ProjectCategory.Comercial ? "Comercial" : "Residencial",
        estado: "Pendiente"
      }).then(res => mapApiProject(res.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
};
