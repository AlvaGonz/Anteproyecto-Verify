import {
  DocumentDto,
  UploadDocumentDto,
  UpdateDocumentStatusDto,
  DocumentStatus,
} from "../types";
import { mockDocuments } from "../../../infrastructure/mock/mockDocuments";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

let localMockDocuments = [...mockDocuments];

export const documentsApi = {
  getProjectDocuments: async (projectId: string): Promise<DocumentDto[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(localMockDocuments.filter((d) => d.proyectoId === projectId));
        }, 500);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/documents`,
    );
    if (!response.ok) throw new Error("Failed to fetch documents");
    return response.json();
  },

  uploadDocument: async (
    projectId: string,
    dto: UploadDocumentDto,
    file: File,
  ): Promise<DocumentDto> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newDoc: DocumentDto = {
            id: `doc-${Math.random().toString(36).substr(2, 9)}`,
            proyectoId: projectId,
            tipoDocumento: dto.tipoDocumento,
            nombreArchivoOriginal: file.name,
            contentType: file.type || "application/octet-stream",
            extension: file.name.substring(file.name.lastIndexOf(".")),
            tamanoBytes: file.size,
            estadoDocumento: DocumentStatus.Uploaded,
            activo: true,
            version: 1,
            fechaEmision: dto.fechaEmision,
            institucionEmisora: dto.institucionEmisora,
            observaciones: dto.observaciones,
            usuarioCargaId: "user-dev-001",
            createdAtUtc: new Date().toISOString(),
          };
          localMockDocuments.push(newDoc);
          resolve({ ...newDoc });
        }, 800);
      });
    }
    const formData = new FormData();
    formData.append("tipoDocumento", dto.tipoDocumento.toString());
    if (dto.fechaEmision) formData.append("fechaEmision", dto.fechaEmision);
    if (dto.institucionEmisora)
      formData.append("institucionEmisora", dto.institucionEmisora);
    if (dto.observaciones) formData.append("observaciones", dto.observaciones);
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/documents`,
      {
        method: "POST",
        // 'Authorization': `Bearer ${token}` // TODO: Add when auth is ready
        body: formData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to upload document");
    }
    return response.json();
  },

  downloadDocument: async (
    projectId: string,
    documentId: string,
  ): Promise<void> => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const doc = localMockDocuments.find(d => d.id === documentId);
          if (!doc) {
            reject(new Error("Document not found"));
            return;
          }
          // Create a dummy blob for mock download
          const blob = new Blob(["Mock file content for " + doc.nombreArchivoOriginal], { type: doc.contentType });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = doc.nombreArchivoOriginal;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          resolve();
        }, 500);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/documents/${documentId}/download`,
      {
        method: "GET",
        // 'Authorization': `Bearer ${token}` // TODO: Add when auth is ready
      },
    );

    if (!response.ok) throw new Error("Failed to download document");

    // Create a blob and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Try to get filename from Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "document";
    if (contentDisposition && contentDisposition.indexOf("filename=") !== -1) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
        contentDisposition,
      );
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "");
      }
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  updateDocumentStatus: async (
    projectId: string,
    documentId: string,
    dto: UpdateDocumentStatusDto,
  ): Promise<DocumentDto> => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = localMockDocuments.findIndex(d => d.id === documentId);
          if (index !== -1) {
            localMockDocuments[index] = {
              ...localMockDocuments[index],
              ...dto,
              updatedAtUtc: new Date().toISOString(),
            };
            resolve({ ...localMockDocuments[index] });
          } else {
            reject(new Error("Document not found"));
          }
        }, 500);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/documents/${documentId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // 'Authorization': `Bearer ${token}` // TODO: Add when auth is ready
        },
        body: JSON.stringify(dto),
      },
    );
    if (!response.ok) throw new Error("Failed to update document status");
    return response.json();
  },
};
