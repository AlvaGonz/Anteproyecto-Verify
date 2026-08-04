import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import { documentKeys } from "./useDocuments";
import { projectKeys } from "../../projects/api/useProjects";
import type { DocumentoDto } from "./types";

export const useUploadDocument = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useUploadDocument'],
    mutationFn: (formData: FormData) =>
      apiClient.post<DocumentoDto>(
        `/projects/${projectId}/documents`,
        formData
      ).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.byProject(projectId) });
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      qc.invalidateQueries({ queryKey: ["projectStatusEligibility", projectId] });
      qc.invalidateQueries({ queryKey: ["statusHistory", projectId] }); // ponytail: upload may auto-promote to REVISION
    },
  });
};

export const useUpdateDocumentFieldReview = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useUpdateDocumentFieldReview'],
    mutationFn: ({ documentId, fieldName, data }: { documentId: string, fieldName: string, data: import('../types').UpdateDocumentFieldReviewDto }) =>
      apiClient.patch<DocumentoDto>(
        `/projects/${projectId}/documents/${documentId}/fields/${fieldName}`,
        data
      ).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.byProject(projectId) });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
};
