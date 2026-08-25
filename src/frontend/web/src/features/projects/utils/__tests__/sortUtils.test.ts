import { describe, it, expect } from "vitest";
import { sortProjectsByRecentUpdate } from "../sortUtils";
import { ProyectoDto, ProjectStatus, LegalStatus, IntegrityStatus } from "../../types";

const mockProject = (id: string, createdAtUtc: string, updatedAtUtc?: string): ProyectoDto => ({
  id,
  codigoInterno: `PRJ-${id}`,
  nombre: `Project ${id}`,
  ubicacionTexto: "Ubicacion",
  categoriaId: 1,
  categoriaNombre: "Cat",
  estadoProyecto: ProjectStatus.Draft,
  estadoJuridico: LegalStatus.Pending,
  estadoIntegridad: IntegrityStatus.Pending,
  estatusDescripcion: "Creado",
  usuarioCreadorId: "usr1",
  integridadValidada: 0,
  createdAtUtc,
  updatedAtUtc,
});

describe("sortProjectsByRecentUpdate", () => {
  it("should sort projects by updatedAtUtc descending when it exists", () => {
    const projects = [
      mockProject("1", "2026-08-01T10:00:00Z", "2026-08-10T10:00:00Z"),
      mockProject("2", "2026-08-05T10:00:00Z", "2026-08-15T10:00:00Z"),
      mockProject("3", "2026-08-02T10:00:00Z", "2026-08-12T10:00:00Z"),
    ];

    const sorted = sortProjectsByRecentUpdate(projects);
    expect(sorted[0].id).toBe("2"); // Aug 15
    expect(sorted[1].id).toBe("3"); // Aug 12
    expect(sorted[2].id).toBe("1"); // Aug 10
  });

  it("should fallback to createdAtUtc if updatedAtUtc is not provided", () => {
    const projects = [
      mockProject("1", "2026-08-20T10:00:00Z"), // No update
      mockProject("2", "2026-08-01T10:00:00Z", "2026-08-25T10:00:00Z"), // Updated later
      mockProject("3", "2026-08-22T10:00:00Z"), // No update
    ];

    const sorted = sortProjectsByRecentUpdate(projects);
    expect(sorted[0].id).toBe("2"); // Aug 25 (updatedAtUtc)
    expect(sorted[1].id).toBe("3"); // Aug 22 (createdAtUtc)
    expect(sorted[2].id).toBe("1"); // Aug 20 (createdAtUtc)
  });

  it("should not mutate the original array", () => {
    const projects = [
      mockProject("1", "2026-08-01T10:00:00Z"),
      mockProject("2", "2026-08-02T10:00:00Z"),
    ];
    
    const originalRef = [...projects];
    sortProjectsByRecentUpdate(projects);
    
    expect(projects[0].id).toBe(originalRef[0].id);
    expect(projects[1].id).toBe(originalRef[1].id);
  });
});
