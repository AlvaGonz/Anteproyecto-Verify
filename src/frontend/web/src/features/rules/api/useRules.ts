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

export interface UpdateRuleCommand {
  id: string;
  nombre: string;
  descripcion: string;
  condicionLogica: string;
  tipoDocumentoAplicable: number;
  nivelAlerta: number;
  tipoProyecto: number;
}

export const ruleKeys = {
  all: ["rules"] as const,
  list: (page?: number, pageSize?: number) => ["rules", "list", page, pageSize] as const,
};

export const useRules = (page = 1, pageSize = 50) =>
  useQuery({
    queryKey: ruleKeys.list(page, pageSize),
    queryFn: () =>
      apiClient
        .get<ReglaValidacionDto[]>("/admin/rules", { params: { page, pageSize } })
        .then((res) => res.data),
    staleTime: 120_000,
    gcTime: 15 * 60 * 1000,
  });

export const useCreateRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["rules", "create"],
    mutationFn: (command: CreateRuleCommand) =>
      apiClient.post<{ id: string }>("/admin/rules", command).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
};

export const useToggleRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["rules", "toggle"],
    mutationFn: (id: string) =>
      apiClient.patch<void>(`/admin/rules/${id}/toggle`, {}).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
};

export const useUpdateRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["rules", "update"],
    mutationFn: ({ id, ...body }: UpdateRuleCommand) =>
      apiClient.put<void>(`/admin/rules/${id}`, body).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
};
