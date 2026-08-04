import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";

export interface StatusHistoryEntry {
  id: string;
  proyectoId: string;
  estadoAnteriorId: string | null;
  estadoAnteriorNombre: string | null;
  estadoNuevoId: string;
  estadoNuevoNombre: string;
  usuarioId: string;
  usuarioNombre: string;
  fechaCambioUtc: string;
}

export const useStatusHistory = (projectId: string) =>
  useQuery({
    queryKey: ["statusHistory", projectId],
    queryFn: () =>
      apiClient
        .get<StatusHistoryEntry[]>(`/projects/${projectId}/status-history`)
        .then((res) => res.data),
    enabled: !!projectId,
  });
