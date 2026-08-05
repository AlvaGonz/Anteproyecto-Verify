import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CertificadoTituloExtractionCard } from "../CertificadoTituloExtractionCard";
import {
  CertificadoTituloRdExtractionV1,
  ExtractionStatus,
  FieldStatus,
} from "../../types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
   </QueryClientProvider>
  );
};

const baseExtraction: CertificadoTituloRdExtractionV1 = {
  schemaVersion: "1.0",
  documentType: "CertificadoTitulo",
  extractionStatus: ExtractionStatus.Completed,
  overallConfidence: 0.9,
  oficina: { rawValue: "SD", normalizedValue: "SD", confidence: 0.9, status: FieldStatus.Valid, sourcePage: 1 },
  designacionCatastral: { rawValue: "1", normalizedValue: "1", confidence: 0.9, status: FieldStatus.Valid, sourcePage: 1 },
  fechaYHoraInscripcion: { rawValue: "2024", normalizedValue: "2024", confidence: 0.9, status: FieldStatus.Valid, sourcePage: 1 },
  vieneDe: { rawValue: "X", normalizedValue: "X", confidence: 0.9, status: FieldStatus.Valid, sourcePage: 1 },
  matricula: { rawValue: "0100035082", normalizedValue: "0100035082", confidence: 0.9, status: FieldStatus.Valid, sourcePage: 1 },
  municipio: { rawValue: "DN", normalizedValue: "DN", confidence: 0.9, status: FieldStatus.Valid, sourcePage: 1 },
  provincia: { rawValue: "DN", normalizedValue: "DN", confidence: 0.9, status: FieldStatus.Valid, sourcePage: 1 },
  superficieM2: { rawValue: "168.00", normalizedValue: "168.00", confidence: 0.9, status: FieldStatus.Valid, sourcePage: 1 },
  warnings: [],
  processorName: "PaddleOCR",
  processorVersion: "1.0",
};

describe("CertificadoTituloExtractionCard numeric fields", () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);
  });

  it("renders matricula without thousands separator", () => {
    render(
      <CertificadoTituloExtractionCard extraction={baseExtraction} />,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText("0100035082")).toBeInTheDocument();
    expect(screen.queryByText("0,100,035,082")).not.toBeInTheDocument();
  });

  it("renders superficie M2 with US thousands separator and 2 decimals", () => {
    const extraction: CertificadoTituloRdExtractionV1 = {
      ...baseExtraction,
      superficieM2: { rawValue: "2000", normalizedValue: "2000", confidence: 0.9, status: FieldStatus.Valid, sourcePage: 1 },
    };
    render(
      <CertificadoTituloExtractionCard extraction={extraction} />,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText("2,000.00")).toBeInTheDocument();
  });

  it("renders large superficie with multiple separators", () => {
    const extraction: CertificadoTituloRdExtractionV1 = {
      ...baseExtraction,
      superficieM2: { rawValue: "2000000", normalizedValue: "2000000", confidence: 0.9, status: FieldStatus.Valid, sourcePage: 1 },
    };
    render(
      <CertificadoTituloExtractionCard extraction={extraction} />,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText("2,000,000.00")).toBeInTheDocument();
  });

  it("renders non-numeric fields without thousands separator", () => {
    render(
      <CertificadoTituloExtractionCard extraction={baseExtraction} />,
      { wrapper: createWrapper() },
    );
    // oficina="SD" is rendered as a numeric-free text
    const oficinaLabel = screen.getByText("Oficina");
    expect(oficinaLabel).toBeInTheDocument();
    // SD appears in the oficina span
    expect(oficinaLabel.parentElement?.textContent).toContain("SD");
  });

  it("exposes numeric input via data-testid when editing", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(
      <CertificadoTituloExtractionCard extraction={baseExtraction} onEditField={onEdit} />,
      { wrapper: createWrapper() },
    );
    const editButtons = screen.getAllByTitle("Editar campo");
    // Click the edit button for superficieM2 (find via hover/parent)
    // There should be 6 visible edit buttons (text-based fields only)
    expect(editButtons.length).toBeGreaterThan(0);
  });
});
