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

  it("codifica el QR con la URL directa del proyecto, no una intermedia", () => {
    render(<CertificationSection projectId="proj-123" projectStatus="PUBLICADO" />);

    const qrValue = screen.getByTestId("qr-value").textContent ?? "";
    expect(qrValue).toContain("/#/p/proj-123");
    expect(qrValue).not.toContain("qrserver");
    expect(qrValue).not.toContain("/q/");
  });
});
