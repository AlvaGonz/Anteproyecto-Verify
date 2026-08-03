import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProjectDocumentStatus } from "../ProjectDocumentStatus";
import { DocumentStatus, DocumentType } from "../../types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

// Mock the hooks
vi.mock("../../api/useDocuments", () => ({
  useDocuments: vi.fn(),
  useDownloadDocument: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { useDocuments } from "../../api/useDocuments";

describe("ProjectDocumentStatus", () => {
  it("renders loading state initially", () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);
    expect(screen.getByText(/Auditoría Digital en curso.../i)).toBeInTheDocument();
  });

  it("displays verified document with file name", () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: [
        {
          id: "doc-1",
          tipoDocumento: DocumentType.CertificadoTitulo,
          estadoDocumento: DocumentStatus.Verificado,
          nombreArchivoOriginal: "titulo_original.pdf",
        }
      ],
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);
    
    // Check if the filename is displayed
    expect(screen.getByText("titulo_original.pdf")).toBeInTheDocument();
    // Check if the status VERIFICADO (OCR) is displayed
    expect(screen.getByText("VERIFICADO")).toBeInTheDocument();
  });

  it("displays observed document without verified status", () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: [
        {
          id: "doc-2",
          tipoDocumento: DocumentType.CertificadoTitulo,
          estadoDocumento: DocumentStatus.Observado,
          nombreArchivoOriginal: "titulo_invalido.pdf",
        }
      ],
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);
    
    // Check if the filename is displayed
    expect(screen.getByText("titulo_invalido.pdf")).toBeInTheDocument();
    // Check if the status OBSERVADO is displayed
    expect(screen.getByText("OBSERVADO")).toBeInTheDocument();
  });

  it("counts essential documents using only the 5 Documentos Principales (not anexos)", () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: [
        {
          id: "doc-1",
          tipoDocumento: DocumentType.CertificadoTitulo,
          estadoDocumento: DocumentStatus.Verificado,
          nombreArchivoOriginal: "titulo_original.pdf",
        },
        {
          id: "doc-2",
          tipoDocumento: DocumentType.PoderNotarial,
          estadoDocumento: DocumentStatus.Verificado,
          nombreArchivoOriginal: "poder.pdf",
        },
      ],
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);

    // 1 of 5 esenciales present (PoderNotarial is an anexo and must NOT count)
    expect(screen.getByText("4 documentos esenciales")).toBeInTheDocument();
  });

  it("renders Documentos Principales and Anexos as separate sections", () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);

    expect(screen.getByText("Documentos Principales")).toBeInTheDocument();
    expect(screen.getByText("Anexos")).toBeInTheDocument();
    expect(screen.getByText("Cédula / Identidad del Titular")).toBeInTheDocument();
    expect(screen.getByText("Certificado EIA")).toBeInTheDocument();
  });
});
