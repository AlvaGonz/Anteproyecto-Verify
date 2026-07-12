import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";

export interface PublicProjectSearchResultDto {
  id: string;
  nombreProyecto: string;
  codigoPublico?: string;
  estadoValidacion: string;
  ubicacionTexto?: string;
  estadoJuridico: number;
  estadoProyecto: number;
  estadoIntegridad: number;
}

export const useSearchPublicProjects = (query: string) =>
  useQuery({
    queryKey: ["publicProjectsSearch", query],
    queryFn: () => {
      const params = query ? `?q=${encodeURIComponent(query)}` : "";
      return apiClient
        .get<PublicProjectSearchResultDto[]>(`/public/projects/search${params}`)
        .then((res) => res.data);
    },
  });
