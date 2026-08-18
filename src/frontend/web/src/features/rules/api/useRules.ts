import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../infrastructure/api/client";
import { z } from "zod";

export interface ReglaValidacionDto {
  id: string;
  codigo?: string;
  nombre: string;
  descripcion: string;
  condicionLogica: string;
  expresion?: string;
  valorUmbral?: number;
  minValor?: number;
  maxValor?: number;
  tipoDocumentoAplicable: string;
  nivelAlerta: string;
  tipoProyecto: string;
  activa: boolean;
  version: number;
  fechaCreacionUtc: string;
  rowVersion?: string;
}

export interface CreateRuleCommand {
  nombre: string;
  codigo?: string;
  descripcion: string;
  condicionLogica: string;
  expresion?: string;
  valorUmbral?: number;
  minValor?: number;
  maxValor?: number;
  tipoDocumentoAplicable: number;
  nivelAlerta: number;
  tipoProyecto: number;
}

export interface UpdateRuleCommand {
  id: string;
  codigo?: string;
  nombre: string;
  descripcion: string;
  condicionLogica: string;
  expresion?: string;
  valorUmbral?: number;
  minValor?: number;
  maxValor?: number;
  tipoDocumentoAplicable: number;
  nivelAlerta: number;
  tipoProyecto: number;
  activa?: boolean;
  rowVersion?: string;
}

export interface EvaluateRuleRequest {
  reglaId: string;
  proyectoId: string;
  superficieProyecto: number;
  superficieCatastro: number;
}

export interface ResultadoEvaluacionDto {
  reglaId: string;
  reglaNombre: string;
  reglaCodigo?: string;
  cumple: boolean;
  nivelAlerta: string;
  mensaje: string;
  valorCalculado: number;
  valorUmbral: number;
  superficieProyecto: number;
  superficieCatastro: number;
  diferenciaAbsoluta: number;
}

// Zod Schema for Rule 8 Tolerance Validation (0.01 to 0.20)
export const toleranceRuleSchema = z.object({
  valorUmbral: z
    .number()
    .min(0.01, "La tolerancia mínima permitida es 1% (0.01)")
    .max(0.20, "La tolerancia máxima permitida es 20% (0.20)"),
  nivelAlerta: z.enum(["Informativa", "Advertencia", "Bloqueante", "Baja", "Media", "Alta", "Critica"]),
  activa: z.boolean().default(true),
});

export type ToleranceRuleFormValues = z.infer<typeof toleranceRuleSchema>;

export const ruleKeys = {
  all: ["rules"] as const,
  list: (page?: number, pageSize?: number) => ["rules", "list", page, pageSize] as const,
  detail: (id: string) => ["rules", "detail", id] as const,
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

export const useRule = (id?: string) =>
  useQuery({
    queryKey: ruleKeys.detail(id || ""),
    queryFn: () =>
      apiClient
        .get<ReglaValidacionDto>(`/admin/rules/${id}`)
        .then((res) => res.data),
    enabled: !!id,
    staleTime: 60_000,
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
      apiClient.put<void>(`/admin/rules/${id}`, { id, ...body }).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
};

export const useEvaluateRule = () => {
  return useMutation({
    mutationKey: ["rules", "evaluate"],
    mutationFn: (request: EvaluateRuleRequest) =>
      apiClient.post<ResultadoEvaluacionDto>("/admin/rules/evaluar", request).then((res) => res.data),
  });
};
