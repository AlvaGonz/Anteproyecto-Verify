import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import type { DocumentoDto as ApiDocumentoDto } from "./types";
import type { DocumentDto } from "../types";
import { DocumentStatus } from "../types";

export const documentKeys = {
  byProject: (projectId: string) => ["documents", projectId] as const,
};

const mapApiDocument = (apiDoc: ApiDocumentoDto): DocumentDto => ({
  id: String(apiDoc.idDocumento),
  proyectoId: String(apiDoc.idProyecto),
  tipoDocumento: apiDoc.tipo as any,
  nombreArchivoOriginal: apiDoc.nombre,
  contentType: "application/octet-stream",
  extension: apiDoc.nombre.split(".").pop() || "",
  tamanoBytes: apiDoc.tamanio || 0,
  estadoDocumento: apiDoc.estado === "Aprobado" ? DocumentStatus.Valid : DocumentStatus.Uploaded,
  activo: true,
  version: 1,
  fechaEmision: apiDoc.fechaSubida,
  institucionEmisora: "N/A",
  usuarioCargaId: "system",
  observaciones: "",
  createdAtUtc: apiDoc.fechaSubida,
});

export const useDocuments = (projectId: string) =>
  useQuery({
    queryKey: documentKeys.byProject(projectId),
    queryFn: () => apiClient.get<ApiDocumentoDto[]>(`/projects/${projectId}/documents`).then(res => res.data.map(mapApiDocument)),
    enabled: !!projectId,
  });

export const useUploadDocument = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.post<ApiDocumentoDto>(`/projects/${projectId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(res => mapApiDocument(res.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.byProject(projectId) }),
  });
};

export const useUpdateDocumentStatus = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { documentId: string; activo: boolean }) =>
      apiClient.patch(`/projects/${projectId}/documents/${data.documentId}/status`, { activo: data.activo }).then(res => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.byProject(projectId) }),
  });
};

export const useDownloadDocument = (projectId: string) => {
  return useMutation({
    mutationFn: (documentId: string) =>
      apiClient.get(`/projects/${projectId}/documents/${documentId}/download`, { responseType: "blob" }).then(res => res.data),
    onSuccess: (data: any) => {
      // Create object URL and trigger download (simplistic approach for now)
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "document"); // Could extract filename from headers
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });
};

