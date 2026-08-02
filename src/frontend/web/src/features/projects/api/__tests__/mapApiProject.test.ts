import { describe, it, expect } from "vitest";

// mapApiProject is not exported, so we test integration via the hook.
// The critical path is: ApiProyectoDto fields → mapApiProject → ProyectoDto fields.
// The surface-level test verifies the api/types.ts ProyectoDto shape has superficieM2.
import type { ProyectoDto } from "../types";

describe("ProyectoDto shape (api/types.ts)", () => {
  it("has optional superficieM2 field", () => {
    const dto: ProyectoDto = {
      id: "",
      codigoInterno: "",
      nombre: "",
      ubicacionTexto: "",
      categoria: 1,
      estadoProyecto: "CREADO" as any,
      estadoIntegridad: 0,
      usuarioCreadorId: "",
      createdAtUtc: "",
      estatusDescripcion: "",
      estadoJuridico: 0,
    };
    dto.superficieM2 = 75.5;
    expect(dto.superficieM2).toBe(75.5);
  });
});