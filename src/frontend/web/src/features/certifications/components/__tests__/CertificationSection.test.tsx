import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CertificationSection } from "../CertificationSection";

vi.mock("react-qr-code", () => ({
  default: ({ value }: { value: string }) => (
    <div data-testid="qr-value">{value}</div>
  ),
}));

vi.mock("../../api/useCertifications", () => ({
  useCertification: () => ({
    data: {
      id: 1,
      proyectoId: 1,
      codigoSello: "VERIFINCA-20260804-ABC12345",
      nombre: "Sello Bronce",
      nivel: "Bronce",
      urlQr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=intermedia",
      qrToken: "token",
      contadorAccesos: 0,
      fechaEmisionUtc: "2026-08-04T00:00:00Z",
      estado: "Emitido",
      vigente: true,
    },
    isLoading: false,
    error: null,
  }),
  useIssueSeal: () => ({
    isPending: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
}));

vi.mock("../../../projects/api/useProjects", () => ({
  useProject: () => ({
    data: {
      id: "proj-123",
      nombre: "Residencial Las Palmas",
      codigoInterno: "VF-LP-001",
      ubicacionTexto: "Santo Domingo",
    },
    isLoading: false,
  }),
}));

vi.mock("../../../settings/api/useSettings", () => ({
  usePlanLimits: () => ({
    planLimits: { qrIncluido: true },
    isLoading: false,
  }),
}));

describe("CertificationSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("codifica el QR con la URL de verificación pública /#/q/token para permitir bypass de acceso", () => {
    render(<CertificationSection projectId="proj-123" projectStatus="PUBLICADO" />);

    const qrValues = screen.getAllByTestId("qr-value");
    expect(qrValues.length).toBeGreaterThan(0);
    const qrValue = qrValues[0].textContent ?? "";
    expect(qrValue).toContain("/#/q/token");
    expect(qrValue).not.toContain("qrserver");
  });

  it("renders dedicated print root with data-print-ready attribute and metadata", () => {
    render(<CertificationSection projectId="proj-123" projectStatus="PUBLICADO" />);

    const printRoot = screen.getByTestId("integrity-seal-print-root");
    expect(printRoot).toBeDefined();
    expect(printRoot.getAttribute("data-print-ready")).toBe("true");
    expect(printRoot.textContent).toContain("VERIFINCA-20260804-ABC12345");
    expect(printRoot.textContent).toContain("Residencial Las Palmas");
  });

  it("renders accessible print button", () => {
    render(<CertificationSection projectId="proj-123" projectStatus="PUBLICADO" />);

    const printBtn = screen.getByRole("button", { name: /Imprimir/i });
    expect(printBtn).toBeDefined();
  });
});
