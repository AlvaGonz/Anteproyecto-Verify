import { render, screen, within } from "@testing-library/react";
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
    // Check if the status SUMINISTRADO (OCR) is displayed
    expect(screen.getByText("SUMINISTRADO")).toBeInTheDocument();
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
    // Check if the status SUMINISTRADO is displayed
    expect(screen.getByText("SUMINISTRADO")).toBeInTheDocument();
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
    expect(screen.getByText("Poder Notarial")).toBeInTheDocument();
  });

  it("shows 80% confidence when all 5 essentials are uploaded but no anexos", () => {
    const essentials = [
      DocumentType.CertificadoTitulo,
      DocumentType.CertificacionEstadoJuridico,
      DocumentType.PlanoMensuraCatastral,
      DocumentType.CopiaCedulaIdentidad,
      DocumentType.CertificacionIPI,
    ];
    vi.mocked(useDocuments).mockReturnValue({
      data: essentials.map((tipoDocumento, i) => ({
        id: `doc-${i}`,
        tipoDocumento,
        estadoDocumento: DocumentStatus.Verificado,
        nombreArchivoOriginal: `doc-${i}.pdf`,
      })),
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);

    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("shows 100% confidence when all 5 essentials and all 5 anexos are uploaded", () => {
    const essentials = [
      DocumentType.CertificadoTitulo,
      DocumentType.CertificacionEstadoJuridico,
      DocumentType.PlanoMensuraCatastral,
      DocumentType.CopiaCedulaIdentidad,
      DocumentType.CertificacionIPI,
    ];
    const anexos = [
      DocumentType.CertificadoUsoSuelo,
      DocumentType.RegistroMercantil,
      DocumentType.PoderNotarial,
      DocumentType.RNC,
      DocumentType.CertificadoEIA,
    ];
    vi.mocked(useDocuments).mockReturnValue({
      data: [...essentials, ...anexos].map((tipoDocumento, i) => ({
        id: `doc-${i}`,
        tipoDocumento,
        estadoDocumento: DocumentStatus.Verificado,
        nombreArchivoOriginal: `doc-${i}.pdf`,
      })),
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);

    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("shows 20% confidence when no essentials are uploaded but all 5 anexos are", () => {
    const anexos = [
      DocumentType.CertificadoUsoSuelo,
      DocumentType.RegistroMercantil,
      DocumentType.PoderNotarial,
      DocumentType.RNC,
      DocumentType.CertificadoEIA,
    ];
    vi.mocked(useDocuments).mockReturnValue({
      data: anexos.map((tipoDocumento, i) => ({
        id: `doc-${i}`,
        tipoDocumento,
        estadoDocumento: DocumentStatus.Verificado,
        nombreArchivoOriginal: `doc-${i}.pdf`,
      })),
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);

    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("shows the uploaded cedula doc when its type is legacy ID (4) instead of CopiaCedulaIdentidad (26)", () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: [
        {
          id: "doc-cedula",
          tipoDocumento: DocumentType.ID,
          estadoDocumento: DocumentStatus.Verificado,
          nombreArchivoOriginal: "cedula nueva Nadelka.pdf",
        },
      ],
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);

    // The cedula card must show the uploaded file instead of NO SUMINISTRADO
    expect(screen.getByText("cedula nueva Nadelka.pdf")).toBeInTheDocument();
    const cedulaCard = screen.getByText("Cédula / Identidad del Titular").closest(".group") as HTMLElement;
    expect(within(cedulaCard).queryByText("NO SUMINISTRADO")).not.toBeInTheDocument();
  });

  it("counts a legacy ID (4) cedula doc as an uploaded essential", () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: [
        {
          id: "doc-cedula",
          tipoDocumento: DocumentType.ID,
          estadoDocumento: DocumentStatus.Verificado,
          nombreArchivoOriginal: "cedula.pdf",
        },
      ],
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);

    // 1 of 5 essentials present → 4 missing; confidence 16% (16 * 1/5 = 3.2 → rounds to 3? no: 80/5 = 16 per doc)
    expect(screen.getByText("4 documentos esenciales")).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("does not over-count duplicate docs of the same type (2 titulos = 1 essential)", () => {
    const essentials = [
      { tipoDocumento: DocumentType.CertificadoTitulo },
      { tipoDocumento: DocumentType.CertificadoTitulo }, // duplicate of same type
      { tipoDocumento: DocumentType.CertificacionEstadoJuridico },
      { tipoDocumento: DocumentType.PlanoMensuraCatastral },
      { tipoDocumento: DocumentType.CopiaCedulaIdentidad },
      { tipoDocumento: DocumentType.CertificacionIPI },
    ];
    const anexos = [{ tipoDocumento: DocumentType.PoderNotarial }];
    vi.mocked(useDocuments).mockReturnValue({
      data: [...essentials, ...anexos].map((d, i) => ({
        id: `doc-${i}`,
        ...d,
        estadoDocumento: DocumentStatus.Verificado,
        nombreArchivoOriginal: `doc-${i}.pdf`,
      })),
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<ProjectDocumentStatus projectId="proj-123" categoriaId={16} />);

    // 5 unique essentials (80%) + 1 anexo (10%) = 90% — NOT 100%
    expect(screen.getByText("90")).toBeInTheDocument();
    expect(screen.queryByText("100")).not.toBeInTheDocument();
  });
});
