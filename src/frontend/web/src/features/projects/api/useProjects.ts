import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";
import type { ProyectoDto as ApiProyectoDto } from "./types";
import type { ProyectoDto, CreateProyectoDto, LegalStatus, ProjectStatus } from "../types";

export const projectKeys = {
  all: ["projects"] as const,
  list: (page?: number, pageSize?: number, q?: string, estados?: string) =>
    ["projects", "list", page, pageSize, q ?? "", estados ?? ""] as const,
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
  categoriaId: apiProj.categoriaId,
  categoriaNombre: apiProj.categoriaNombre,
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
  superficieM2: apiProj.superficieM2,
  estatusIpi: apiProj.estatusIpi,
  integridadValidada: apiProj.integridadValidada,
});

interface PaginatedProjectsResponse {
  items: ApiProyectoDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const useProjects = (page = 1, pageSize = 50, q?: string, estados?: string) => {
  const query = useQuery({
    queryKey: projectKeys.list(page, pageSize, q, estados),
    queryFn: () =>
      apiClient
        .get<PaginatedProjectsResponse>("/projects", {
          params: { page, pageSize, q: q || undefined, estados: estados || undefined },
        })
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
      staleTime: 5_000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
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
    staleTime: 5_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["projects", "create"],
    mutationFn: (data: CreateProyectoDto) =>
      apiClient
        .post<ApiProyectoDto>("/projects", {
          ...data,
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
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await qc.cancelQueries({ queryKey: projectKeys.all });
      await qc.cancelQueries({ queryKey: projectKeys.detail(id) });
      await qc.cancelQueries({ queryKey: ["projectStatusEligibility", id] });

      const previousLists = qc.getQueriesData({ queryKey: ["projects", "list"] });
      const previousDetail = qc.getQueryData(projectKeys.detail(id));
      const previousEligibility = qc.getQueryData(["projectStatusEligibility", id]);

      // Optimistically update all project lists in cache
      qc.setQueriesData({ queryKey: ["projects", "list"] }, (oldData: any) => {
        if (!oldData) return oldData;
        const updateItem = (p: any) =>
          p.id === id ? { ...p, estadoProyecto: status as unknown as ProjectStatus, estatusDescripcion: status } : p;

        if (Array.isArray(oldData)) {
          return oldData.map(updateItem);
        }
        if (oldData.projects && Array.isArray(oldData.projects)) {
          return {
            ...oldData,
            projects: oldData.projects.map(updateItem),
          };
        }
        return oldData;
      });

      // Optimistically update project detail
      qc.setQueryData(projectKeys.detail(id), (oldProject: any) => {
        if (!oldProject) return oldProject;
        return {
          ...oldProject,
          estadoProyecto: status as unknown as ProjectStatus,
          estatusDescripcion: status,
        };
      });

      // Optimistically update projectStatusEligibility
      qc.setQueryData(["projectStatusEligibility", id], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, currentStatus: status };
      });

      return { previousLists, previousDetail, previousEligibility };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([qKey, data]) => {
          qc.setQueryData(qKey, data);
        });
      }
      if (context?.previousDetail) {
        qc.setQueryData(projectKeys.detail(id), context.previousDetail);
      }
      if (context?.previousEligibility) {
        qc.setQueryData(["projectStatusEligibility", id], context.previousEligibility);
      }
    },
    onSettled: (_data, _error, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: ["projectStatusEligibility", variables.id] });
      qc.invalidateQueries({ queryKey: ["statusHistory", variables.id] });
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
