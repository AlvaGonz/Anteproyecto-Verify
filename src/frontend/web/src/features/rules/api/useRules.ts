import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";

export interface ReglaValidacionDto {
  id: string;
  nombre: string;
  descripcion: string;
  condicionLogica: string;
  tipoDocumentoAplicable: string;
  nivelAlerta: string;
  tipoProyecto: string;
  activa: boolean;
  version: number;
  fechaCreacionUtc: string;
}

export interface CreateRuleCommand {
  nombre: string;
  descripcion: string;
  condicionLogica: string;
  tipoDocumentoAplicable: number;
  nivelAlerta: number;
  tipoProyecto: number;
}

export const useRules = () =>
  useQuery({
    queryKey: ["rules"],
    queryFn: () => apiClient.get<ReglaValidacionDto[]>("/admin/rules").then(res => res.data),
  });

export const useCreateRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useRules'],
    mutationFn: (command: CreateRuleCommand) =>
      apiClient.post<{ id: string }>("/admin/rules", command).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rules"] });
    },
  });
};

export const useToggleRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useToggleRule'],
    mutationFn: (id: string) =>
      apiClient.patch<void>(`/admin/rules/${id}/toggle`, {}).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rules"] });
    },
  });
};

