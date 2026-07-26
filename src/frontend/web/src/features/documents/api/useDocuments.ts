import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { DocumentoDto as ApiDocumentoDto } from "./types";
import type { DocumentDto } from "../types";
import { DocumentStatus, DocumentType } from "../types";

export const documentKeys = {
  byProject: (projectId: string) => ["documents", projectId] as const,
};

const mapApiDocument = (apiDoc: ApiDocumentoDto): DocumentDto => ({
  id: String(apiDoc.id),
  proyectoId: String(apiDoc.proyectoId),
  tipoDocumento: apiDoc.tipoDocumento as unknown as any,
  nombreArchivoOriginal: apiDoc.nombreArchivoOriginal,
  contentType: apiDoc.contentType || "application/octet-stream",
  extension: apiDoc.extension || apiDoc.nombreArchivoOriginal?.split(".").pop() || "",
  tamanoBytes: apiDoc.tamanoBytes || 0,
  estadoDocumento: apiDoc.estadoDocumento as unknown as DocumentStatus,
  activo: apiDoc.activo,
  version: apiDoc.version || 1,
  fechaEmision: apiDoc.fechaEmision,
  institucionEmisora: apiDoc.institucionEmisora || "N/A",
  usuarioCargaId: apiDoc.usuarioCargaId || "system",
  observaciones: apiDoc.observaciones || "",
  createdAtUtc: apiDoc.createdAtUtc,
  cedulaExtraction: apiDoc.cedulaExtraction,
  certificadoTituloExtraction: apiDoc.certificadoTituloExtraction,
  planoMensuraExtraction: apiDoc.planoMensuraExtraction,
  estadoJuridicoExtraction: apiDoc.estadoJuridicoExtraction,
  certificacionIPIExtraction: apiDoc.certificacionIPIExtraction,
  resultadoOcrJson: apiDoc.resultadoOcrJson,
  fileUrl: apiDoc.fileUrl,
});

export const useDocuments = (projectId: string) =>
  useQuery({
    queryKey: documentKeys.byProject(projectId),
    queryFn: () => apiClient.get<ApiDocumentoDto[]>(`/projects/${projectId}/documents`).then(res => res.data.map(mapApiDocument)),
    enabled: !!projectId,
    staleTime: 0,
    refetchOnMount: true,
  });

export const useUploadDocument = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['documentKeys'],
    mutationFn: (formData: FormData) =>
      apiClient.post<ApiDocumentoDto>(`/projects/${projectId}/documents`, formData).then(res => mapApiDocument(res.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.byProject(projectId) }),
  });
};

export const useUploadRequirementDocument = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['uploadRequirementDocument', projectId],
    mutationFn: ({ requirementCode, file }: { requirementCode: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      // Ensure we hit the v1 endpoint explicitly
      return apiClient.post<ApiDocumentoDto>(`v1/projects/${projectId}/documents/requirements/${requirementCode}/upload`, formData).then(res => mapApiDocument(res.data));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.byProject(projectId) }),
  });
};

export const useUpdateDocumentStatus = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useUpdateDocumentStatus'],
    mutationFn: (data: { documentId: string; activo: boolean }) =>
      apiClient.patch(`/projects/${projectId}/documents/${data.documentId}/status`, { activo: data.activo }).then(res => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.byProject(projectId) }),
  });
};

export const useUpdateDocumentType = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useUpdateDocumentType'],
    mutationFn: (data: { documentId: string; tipoDocumento: DocumentType }) =>
      apiClient.patch(`/projects/${projectId}/documents/${data.documentId}/type`, { tipoDocumento: data.tipoDocumento }).then(res => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.byProject(projectId) }),
  });
};

export const useUpdateDocumentFieldReview = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['useUpdateDocumentFieldReview'],
    mutationFn: (data: { documentId: string; fieldName: string; reviewState: number; correctedValue: string | null }) =>
      apiClient.patch(`/projects/${projectId}/documents/${data.documentId}/fields/${data.fieldName}`, {
        reviewState: data.reviewState,
        correctedValue: data.correctedValue
      }).then(res => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.byProject(projectId) }),
  });
};

export const useDownloadDocument = (projectId: string) => {
  // eslint-disable-next-line react-doctor/query-mutation-missing-invalidation
  return useMutation({
    mutationKey: ['useDownloadDocument'],
    mutationFn: (data: { id: string, fileName: string }) =>
      apiClient.get(`/projects/${projectId}/documents/${data.id}/download`, { responseType: "blob" }).then(res => ({ blob: res.data, fileName: data.fileName })),
    onSuccess: ({ blob, fileName }) => {
      // Create object URL and trigger download (simplistic approach for now)
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "documento.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });
};

