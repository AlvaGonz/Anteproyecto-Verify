import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";

export interface Provincia {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
}

export function useProvinces() {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: async (): Promise<Provincia[]> => {
      const { data } = await apiClient.get<Provincia[]>("/provinces");
      return data;
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: Infinity,
  });
}
