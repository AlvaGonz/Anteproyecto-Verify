import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { RequirementUploadRow } from "../RequirementUploadRow";
import { DocumentDto, DocumentType, DocumentStatus } from "../../types";

describe("RequirementUploadRow", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    requirementCode: "TITULO_PROPIEDAD" as const,
    title: "Título de Propiedad",
    description: "Documento oficial emitido por Registro de Títulos",
    required: true,
    status: "missing" as const,
    acceptedTypes: "application/pdf",
    onUpload: vi.fn(),
    isUploading: false,
  };

  it("renders requirement title, description, and Adjuntar CTA", () => {
    render(<RequirementUploadRow {...defaultProps} />);
    expect(screen.getByText("Título de Propiedad")).toBeInTheDocument();
    expect(screen.getByText("Documento oficial emitido por Registro de Títulos")).toBeInTheDocument();
    expect(screen.getByText("Adjuntar")).toBeInTheDocument();
  });

  it("click triggers hidden file input and selection calls onUpload", async () => {
    render(<RequirementUploadRow {...defaultProps} />);
    
    const fileInput = screen.getByTestId("requirement-file-input-TITULO_PROPIEDAD");
    const testFile = new File(["dummy content"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(defaultProps.onUpload).toHaveBeenCalledWith(testFile);
    });
  });

  it("shows uploading state when isUploading=true", () => {
    render(<RequirementUploadRow {...defaultProps} isUploading={true} status="uploading" />);
    expect(screen.getByText("Subiendo...")).toBeInTheDocument();
    expect(screen.getByTestId("requirement-status-TITULO_PROPIEDAD")).toHaveTextContent("Subiendo...");
  });

  it("shows uploaded state when status is uploaded", () => {
    const uploadedDoc: DocumentDto = {
      id: "doc-1",
      proyectoId: "p-1",
      tipoDocumento: DocumentType.CertificadoTitulo,
      nombreArchivoOriginal: "mi-titulo.pdf",
      contentType: "application/pdf",
      extension: ".pdf",
      tamanoBytes: 1024,
      estadoDocumento: DocumentStatus.Uploaded,
      activo: true,
      version: 1,
      usuarioCargaId: "u-1",
      createdAtUtc: new Date().toISOString(),
      fileUrl: "http://example.com/mi-titulo.pdf"
    };

    render(<RequirementUploadRow {...defaultProps} status="uploaded" uploadedDocument={uploadedDoc} />);
    expect(screen.getByText("mi-titulo.pdf")).toBeInTheDocument();
    expect(screen.getByText("Cargado")).toBeInTheDocument();
  });

  it("shows error message when uploadError is provided", () => {
    render(<RequirementUploadRow {...defaultProps} status="error" uploadError="Error de red al subir" />);
    expect(screen.getByText("Error de red al subir")).toBeInTheDocument();
    expect(screen.getByText("Reintentar")).toBeInTheDocument();
  });

  it("rejects file exceeding max size client-side", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<RequirementUploadRow {...defaultProps} maxSizeBytes={100} />);
    
    const fileInput = screen.getByTestId("requirement-file-input-TITULO_PROPIEDAD");
    
    // Create a file larger than 100 bytes (dummy content is 13 bytes * 10 = 130 bytes)
    const largeFile = new File(["dummy content dummy content dummy content dummy content dummy content dummy content dummy content dummy content dummy content dummy content"], "large.pdf", { type: "application/pdf" });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(defaultProps.onUpload).not.toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("El archivo excede el límite permitido"));
    });
    
    alertMock.mockRestore();
  });
});
