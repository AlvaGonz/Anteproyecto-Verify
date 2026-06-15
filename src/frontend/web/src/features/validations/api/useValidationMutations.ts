import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import { validationKeys } from "./useValidations";
import type { CreateValidationFormValues } from "../schemas";

export const useSubmitValidation = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useSubmitValidation'],
    mutationFn: (data: CreateValidationFormValues) =>
      apiClient.post(`/projects/${projectId}/validations`, data).then(res => res.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: validationKeys.byProject(projectId) }),
  });
};
