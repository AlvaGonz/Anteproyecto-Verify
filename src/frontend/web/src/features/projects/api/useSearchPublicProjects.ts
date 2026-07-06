import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";

export interface PublicProjectSearchResultDto {
  id: string;
  nombreProyecto: string;
  codigoPublico?: string;
  estadoValidacion: string;
  ubicacionTexto?: string;
}

export const useSearchPublicProjects = (query: string) =>
  useQuery({
    queryKey: ["publicProjectsSearch", query],
    queryFn: () => {
      if (!query) return Promise.resolve([]);
      return apiClient
        .get<PublicProjectSearchResultDto[]>(`/public/projects/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.data);
    },
    enabled: !!query,
  });
