import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";
import type { ProyectoDto as ApiProyectoDto } from "./types";
import type { ProyectoDto, CreateProyectoDto, LegalStatus } from "../types";
import { ProjectCategory } from "../types";

export const projectKeys = {
  all: ["projects"] as const,
  list: (page?: number, pageSize?: number) => ["projects", "list", page, pageSize] as const,
  detail: (id: string) => ["projects", id] as const,
  // ponytail: keep raw string keys for statusEligibility/validation/findings/audit
  // to match existing usage in other files until those files are updated
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
  imagenAdicional1: apiProj.imagenAdicional1,
  imagenAdicional2: apiProj.imagenAdicional2,
  imagenAdicional3: apiProj.imagenAdicional3,
  imagenAdicional4: apiProj.imagenAdicional4,
  imagenAdicional5: apiProj.imagenAdicional5,
  planNombre: apiProj.planNombre || null,
  registradoPor: apiProj.registradoPor || null,
});

interface PaginatedProjectsResponse {
  items: ApiProyectoDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const useProjects = (page = 1, pageSize = 50) => {
  const query = useQuery({
    queryKey: projectKeys.list(page, pageSize),
    queryFn: () =>
      apiClient
        .get<PaginatedProjectsResponse>("/projects", { params: { page, pageSize } })
        .then((res) => {
          const data = res.data as any;
          // Handle different response structures
          let items: any[] = [];
          if (Array.isArray(data)) {
            items = data;
          } else {
            items = data?.items || data?.Items || data?.data || [];
          }
          return {
            projects: items.map(mapApiProject),
            totalCount: data?.totalCount || data?.TotalCount || (Array.isArray(data) ? data.length : 0),
          };
        }),
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
    });

  return {
    data: query.data?.projects ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

export const useProject = (id: string) =>
  useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiProyectoDto>(`/projects/${id}`);
        return mapApiProject(response.data);
      } catch (error: any) {
        if (error.response?.status === 402 && error.response?.data?.error === "QUOTA_EXCEEDED") {
          const quotaError = new Error("QUOTA_EXCEEDED") as any;
          quotaError.limitType = error.response.data.limitType;
          quotaError.message = error.response.data.message;
          throw quotaError;
        }
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["projects", "create"],
    mutationFn: (data: CreateProyectoDto) =>
      apiClient
        .post<ApiProyectoDto>("/projects", {
          ...data,
          categoria: data.categoria ?? ProjectCategory.Residencial,
        })
        .then((res) => mapApiProject(res.data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKeys.all });
      await qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
};

export const useUpdateProjectStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["projects", "updateStatus"],
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient
        .patch<ApiProyectoDto>(`/projects/${id}/status`, JSON.stringify(status), {
          headers: { "Content-Type": "application/json" },
        })
        .then((res) => mapApiProject(res.data)),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: ["projectStatusEligibility", variables.id] });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["projects", "delete"],
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
};
