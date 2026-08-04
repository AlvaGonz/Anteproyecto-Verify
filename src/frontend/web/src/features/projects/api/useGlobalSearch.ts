import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface ProjectoBasicDto {
  id: string;
  nombre: string;
  estado: string;
}

export interface NetworkNodeDto {
  id: string;
  etiqueta: string;
  tipo: string;
}

export interface NetworkEdgeDto {
  origenId: string;
  destinoId: string;
  relacion: string;
}

export interface NetworkGraphDto {
  nodos: NetworkNodeDto[];
  enlaces: NetworkEdgeDto[];
}

export interface SearchResultDto {
  tipoConsulta: string;
  esValido: boolean;
  tituloPrincipal: string;
  detalles: Record<string, string>;
  proyectosRelacionados: ProjectoBasicDto[];
  grafoRed: NetworkGraphDto;
}

const fetchGlobalSearch = async (type: string, query: string): Promise<SearchResultDto> => {
  const { data } = await axios.get<SearchResultDto>(
    `/api/v1/search/global`,
    { params: { type, q: query } }
  );
  return data;
};

export const useGlobalSearch = (type: string, query: string) => {
  return useQuery({
    queryKey: ["global-search", type, query],
    queryFn: () => fetchGlobalSearch(type, query),
    enabled: !!type && !!query,
    retry: false, // Do not retry on 404
  });
};
