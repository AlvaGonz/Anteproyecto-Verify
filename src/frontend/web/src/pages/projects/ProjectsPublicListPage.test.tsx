import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectsPublicListPage } from "./ProjectsPublicListPage";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { ProjectStatus, IntegrityStatus } from "../../features/projects/types";

vi.mock("../../features/projects/api/projectsApi");

describe("ProjectsPublicListPage", () => {
  it("renders loading state initially", () => {
    vi.mocked(projectsApi.getProjects).mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <ProjectsPublicListPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Cargando proyectos/i)).toBeDefined();
  });

  it("renders projects list after loading", async () => {
    const mockProjects = [
      {
        id: "1",
        codigoInterno: "PRJ-1",
        nombre: "Proyecto Test 1",
        ubicacionTexto: "Ubicacion 1",
        estadoProyecto: ProjectStatus.Published,
        estadoIntegridad: IntegrityStatus.Pending,
        usuarioCreadorId: "user1",
        createdAtUtc: new Date().toISOString(),
      },
    ];

    vi.mocked(projectsApi.getProjects).mockResolvedValue(mockProjects);

    render(
      <MemoryRouter>
        <ProjectsPublicListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Proyecto Test 1")).toBeDefined();
    });
  });
});
