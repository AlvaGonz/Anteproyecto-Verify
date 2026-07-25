import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";

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
  categoria?: number;
  designacionCatastral?: string;
  matricula?: string;
  rncDesarrollador?: string;
  cedulaRncPropietario?: string;
}

export const usePublishedProjects = () =>
  useQuery({
    queryKey: ["publishedProjects"],
    queryFn: () =>
      apiClient
        .get<PublicProjectSearchResultDto[]>(`/public/projects/search`)
        .then((res) => res.data.filter((p) => p.estadoProyecto === "PUBLICADO")),
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
    if (filters.projectTypes.length > 0 && p.categoria) {
      if (!filters.projectTypes.includes(p.categoria)) return false;
    }

    // Price range
    if (p.valorEstimado !== undefined && p.valorEstimado !== null) {
      if (p.valorEstimado < filters.priceRange[0] || p.valorEstimado > filters.priceRange[1]) {
        return false;
      }
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
  { value: 1, label: "Residencial" },
  { value: 2, label: "Comercial" },
  { value: 3, label: "Turístico" },
  { value: 4, label: "Mixto" },
  { value: 5, label: "Industrial" },
  { value: 99, label: "Otro" },
];

export function getDefaultProjectImage(categoryId?: number): string {
  switch (categoryId) {
    case 1: // Residencial
      return "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop";
    case 2: // Comercial
      return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop";
    case 3: // Turístico
      return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop";
    case 4: // Mixto
      return "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1000&auto=format&fit=crop";
    case 5: // Industrial
      return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop";
    default:
      return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop";
  }
}

export const PRICE_STEPS = 100_000;
export const PRICE_MAX = 15_000_000;