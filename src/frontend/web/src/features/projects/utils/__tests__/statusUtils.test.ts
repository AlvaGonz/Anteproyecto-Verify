import { describe, expect, it } from "vitest";
import { getStatusPresentation } from "../statusUtils";

describe("getStatusPresentation", () => {
  it("usa Nombre y ColorHex del catálogo del backend", () => {
    const meta = getStatusPresentation({
      estadoProyecto: "REVISION",
      estadoNombre: "En Revisión",
      estadoColorHex: "#EAB308",
    });
    expect(meta.label).toBe("En Revisión");
    expect(meta.colorHex).toBe("#EAB308");
  });

  it("no traduce un CodigoUnico desconocido por un fallback hardcoded", () => {
    const meta = getStatusPresentation({
      estadoProyecto: "SUSPENDIDO",
      estadoNombre: undefined,
      estadoColorHex: undefined,
    });
    expect(meta.label).toBe("SUSPENDIDO");
  });
});
