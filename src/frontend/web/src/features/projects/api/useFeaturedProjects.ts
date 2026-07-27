import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";

export interface FeaturedProjectDto {
  id: string;
  nombreProyecto: string;
  codigoPublico?: string;
  estadoValidacion: string;
  ubicacionTexto?: string;
  estadoJuridico: number;
  estadoProyecto: string;
  estadoIntegridad: number;
  constructora?: string;
  registrante?: string;
  imagenUrl?: string;
  categoria?: number;
  valorEstimado?: number;
  designacionCatastral?: string;
  matricula?: string;
  rncDesarrollador?: string;
  cedulaRncPropietario?: string;
  completionRate: number;
}

export const useFeaturedProjects = (count = 5) =>
  useQuery({
    queryKey: ["featuredProjects", count],
    queryFn: () =>
      apiClient
        .get<FeaturedProjectDto[]>(`/public/projects/featured?count=${count}`)
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const useSuspenseFeaturedProjects = (count = 5) =>
  useSuspenseQuery({
    queryKey: ["featuredProjects", count],
    queryFn: () =>
      apiClient
        .get<FeaturedProjectDto[]>(`/public/projects/featured?count=${count}`)
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });