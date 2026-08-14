import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";

export interface ProyectoEstadoCatalogo {
  estadoId: string;
  codigoUnico: string;
  nombre: string;
  colorHex: string;
}

export const useEstadosCatalogo = () =>
  useQuery({
    queryKey: ["projectStatuses", "catalogo"],
    queryFn: () =>
      apiClient
        .get<ProyectoEstadoCatalogo[]>("/projects/estados")
        .then((res) => res.data),
  });
