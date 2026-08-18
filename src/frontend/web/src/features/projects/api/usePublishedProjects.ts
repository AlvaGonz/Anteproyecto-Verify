import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";

export interface PublishedProjectsResponse {
  items: PublicProjectSearchResultDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface PublicProjectSearchResultDto {
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
  valorEstimado?: number;
  categoriaId?: number;
  designacionCatastral?: string;
  matricula?: string;
  rncDesarrollador?: string;
  cedulaRncPropietario?: string;
  completionRate: number;
  integridadValidada: number;
}

interface UsePublishedProjectsParams {
  page?: number;
  pageSize?: number;
}

export const usePublishedProjects = ({ page = 1, pageSize = 12 }: UsePublishedProjectsParams = {}) =>
  useQuery({
    queryKey: ["publishedProjects", page, pageSize],
    queryFn: () =>
      apiClient
        .get<PublishedProjectsResponse>(`/public/projects/search`, { params: { page, pageSize } })
        .then((res) => res.data.items.filter((p) => p.estadoProyecto === "PUBLICADO" || p.estadoProyecto === "OBSERVACION")),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const usePublishedProjectsCount = () =>
  useQuery({
    queryKey: ["publishedProjectsCount"],
    queryFn: () =>
      apiClient
        .get<PublishedProjectsResponse>(`/public/projects/search`, { params: { page: 1, pageSize: 1 } })
        .then((res) => res.data.totalCount),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const useSuspensePublishedProjects = ({ page = 1, pageSize = 12 }: UsePublishedProjectsParams = {}) =>
  useSuspenseQuery({
    queryKey: ["publishedProjects", page, pageSize],
    queryFn: () =>
      apiClient
        .get<PublishedProjectsResponse>(`/public/projects/search`, { params: { page, pageSize } })
        .then((res) => res.data.items.filter((p) => p.estadoProyecto === "PUBLICADO" || p.estadoProyecto === "OBSERVACION")),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export interface PublishedProjectFilters {
  searchQuery: string;
  projectTypes: number[];
  priceRange: [number, number];
  province: string;
  latLng?: string;
}

export function filterPublishedProjects(
  projects: PublicProjectSearchResultDto[],
  filters: PublishedProjectFilters
): PublicProjectSearchResultDto[] {
  return projects.filter((p) => {

    // Search query: RNC, Cedula, Project Name, Cadastral Designation
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matches =
        (p.rncDesarrollador?.toLowerCase().includes(q) ?? false) ||
        (p.cedulaRncPropietario?.toLowerCase().includes(q) ?? false) ||
        (p.nombreProyecto?.toLowerCase().includes(q) ?? false) ||
        (p.designacionCatastral?.toLowerCase().includes(q) ?? false);
      if (!matches) return false;
    }

    // Project types (checkboxes - cumulative)
    if (filters.projectTypes.length > 0 && p.categoriaId) {
      if (!filters.projectTypes.includes(p.categoriaId)) return false;
    }

    // Price range
    if (p.valorEstimado !== undefined && p.valorEstimado !== null) {
      if (p.valorEstimado < filters.priceRange[0]) return false;
      if (filters.priceRange[1] < PRICE_MAX && p.valorEstimado > filters.priceRange[1]) return false;
    } else {
      // If no price, exclude unless price range starts at 0
      if (filters.priceRange[0] > 0) return false;
    }

    // Province filter
    if (filters.province && p.ubicacionTexto) {
      if (!p.ubicacionTexto.toLowerCase().includes(filters.province.toLowerCase())) {
        return false;
      }
    }

    // Lat/Lng filter (auto-assign province)
    if (filters.latLng) {
      const match = filters.latLng.match(/([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)/);
      if (match) {
        // Check if project's lat/lng is close (within ~10km)
        // We'll do this via provincia auto-assignment in the filter
      }
    }

    return true;
  });
}

export const PROJECT_CATEGORIES = [
  { value: 1, label: "ALBERGUES" },
  { value: 2, label: "ALMACENES" },
  { value: 3, label: "APARTAMENTOS" },
  { value: 4, label: "CENTROS DE RECREACIÓN Y DEPORTES" },
  { value: 5, label: "CENTROS DE SALUD" },
  { value: 6, label: "COLEGIOS Y CENTROS EDUCATIVOS" },
  { value: 7, label: "COMBINADOS" },
  { value: 8, label: "COMERCIAL Y OFICINAS" },
  { value: 9, label: "DEPÓSITOS" },
  { value: 10, label: "ESTACIÓN DE COMBUSTIBLE" },
  { value: 11, label: "ESTRUCTURAS ESPECIALES" },
  { value: 12, label: "HOSPEDAJE" },
  { value: 13, label: "OBRAS DE ORDEN SOCIAL" },
  { value: 14, label: "PARQUEOS" },
  { value: 15, label: "SERVICIOS DE TRANSPORTE" },
  { value: 16, label: "VIVIENDAS" },
];

export function getDefaultProjectImage(categoryId?: number): string {
  switch (categoryId) {
    case 3: // APARTAMENTOS
    case 16: // VIVIENDAS
      return "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop";
    case 8: // COMERCIAL Y OFICINAS
    case 2: // ALMACENES
    case 9: // DEPÓSITOS
      return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop";
    case 12: // HOSPEDAJE
    case 1: // ALBERGUES
      return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop";
    case 4: // CENTROS DE RECREACIÓN Y DEPORTES
    case 7: // COMBINADOS
      return "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1000&auto=format&fit=crop";
    case 5: // CENTROS DE SALUD
    case 6: // COLEGIOS Y CENTROS EDUCATIVOS
    case 10: // ESTACIÓN DE COMBUSTIBLE
    case 11: // ESTRUCTURAS ESPECIALES
    case 13: // OBRAS DE ORDEN SOCIAL
    case 14: // PARQUEOS
    case 15: // SERVICIOS DE TRANSPORTE
      return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop";
    default:
      return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop";
  }
}

export const PRICE_STEPS = 500_000;
export const PRICE_MAX = 15_000_000;