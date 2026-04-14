import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProjectPublicDetailPage } from "./ProjectPublicDetailPage";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { ProjectStatus, IntegrityStatus, ProjectCategory } from "../../features/projects/types";

vi.mock("../../features/projects/api/projectsApi");

describe("ProjectPublicDetailPage", () => {
  it("renders project details", async () => {
    const mockProject = {
      id: "1",
      codigoInterno: "PRJ-1",
      nombre: "Proyecto Detalle Test",
      ubicacionTexto: "Ubicacion 1",
      categoria: ProjectCategory.Residencial,
      estadoProyecto: ProjectStatus.Published,
      estadoIntegridad: IntegrityStatus.Pending,
      usuarioCreadorId: "user1",
      createdAtUtc: new Date().toISOString(),
    };

    vi.mocked(projectsApi.getProjectById).mockResolvedValue({
      _tag: "Success",
      data: mockProject
    });

    render(
      <MemoryRouter initialEntries={["/projects/1"]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectPublicDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Proyecto Detalle Test")).toBeDefined();
      expect(screen.getByText("Ubicacion 1")).toBeDefined();
    });
  });
});
