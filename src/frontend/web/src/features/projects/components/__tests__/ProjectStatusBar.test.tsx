import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectStatusBar } from "../ProjectStatusBar";

const CATALOG = [
  { estadoId: "s1", codigoUnico: "CREADO", nombre: "Creado", colorHex: "#9BACD8", activo: true },
  { estadoId: "s2", codigoUnico: "EDITADO", nombre: "Editado", colorHex: "#F98513", activo: true },
  { estadoId: "s3", codigoUnico: "REVISION", nombre: "Revisión Catastral", colorHex: "#EAB308", activo: true },
  { estadoId: "s4", codigoUnico: "PUBLICADO", nombre: "Publicado", colorHex: "#10B981", activo: true },
  { estadoId: "s5", codigoUnico: "OBSERVACION", nombre: "Con Observación", colorHex: "#EF4444", activo: true },
];

vi.mock("../hooks/useProjectStatusBar", () => ({
  useProjectStatusBar: () => ({
    eligibility: {
      documentCount: 1,
      hasObservaciones: false,
      currentStatus: "REVISION",
    },
    isLoading: false,
    isUpdating: false,
    error: null,
    handleStatusChange: vi.fn(),
  }),
}));

vi.mock("../api/useEstadosCatalogo", () => ({
  useEstadosCatalogo: () => ({ data: CATALOG, isLoading: false }),
}));

describe("ProjectStatusBar", () => {
  it("renderiza los pasos con nombres del catálogo ProyectosEstados", () => {
    render(<ProjectStatusBar projectId="proj-1" />);
    expect(
      screen.getByRole("button", { name: "Revisión Catastral" })
    ).toBeInTheDocument();
  });

  it("usa el color del catálogo para el estado activo", () => {
    render(<ProjectStatusBar projectId="proj-1" />);
    const active = screen.getByRole("button", { name: "Revisión Catastral" });
    expect(active).toHaveStyle({ backgroundColor: "#EAB308" });
  });
});
