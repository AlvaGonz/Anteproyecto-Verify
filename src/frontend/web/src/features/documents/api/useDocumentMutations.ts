import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import { documentKeys } from "./useDocuments";
import type { DocumentoDto } from "./types";

export const useUploadDocument = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.post<DocumentoDto>(
        `/projects/${projectId}/documents`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      ).then(res => res.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: documentKeys.byProject(projectId) }),
  });
};
