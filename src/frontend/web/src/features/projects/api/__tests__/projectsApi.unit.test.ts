import { projectsApi } from "../projectsApi";
import { apiClient } from "../../../../infrastructure/api/client";
import MockAdapter from "axios-mock-adapter";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ProjectStatus, IntegrityStatus, ProyectoDto } from "../../types";
import { isSuccess, isFailure } from "../../../../shared/utils/functional";

// Configure non-mock mode
import.meta.env.VITE_USE_MOCK = "false";

describe("projectsApi", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    vi.stubEnv("VITE_USE_MOCK", "false");
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  describe("projectsApi — getProjects", () => {
    it("returns success with project list on 200", async () => {
      const mockProjects: ProyectoDto[] = [
        {
          id: "proj-1",
          codigoInterno: "PRJ-1",
          nombre: "Project One",
          ubicacionTexto: "Santo Domingo",
          categoria: 1,
          estadoProyecto: ProjectStatus.Draft,
          estadoIntegridad: IntegrityStatus.Pending,
          usuarioCreadorId: "user-1",
          createdAtUtc: "2026-06-13T00:00:00Z"
        }
      ];

      mock.onGet("/projects").reply(200, mockProjects);

      const result = await projectsApi.getProjects();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockProjects);
      }
    });

    it("returns ServerError on non-200 response", async () => {
      mock.onGet("/projects").reply(500, { message: "Internal Error" });

      const result = await projectsApi.getProjects();

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error._tag).toBe("ServerError");
      }
    });

    it("returns UnknownError on network failure", async () => {
      mock.onGet("/projects").networkError();

      const result = await projectsApi.getProjects();

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error._tag).toBe("UnknownError");
      }
    });
  });

  describe("projectsApi — getProjectById", () => {
    it("returns success with matching project", async () => {
      const mockProject: ProyectoDto = {
        id: "proj-1",
        codigoInterno: "PRJ-1",
        nombre: "Project One",
        ubicacionTexto: "Santo Domingo",
        categoria: 1,
        estadoProyecto: ProjectStatus.Draft,
        estadoIntegridad: IntegrityStatus.Pending,
        usuarioCreadorId: "user-1",
        createdAtUtc: "2026-06-13T00:00:00Z"
      };

      mock.onGet("/projects/proj-1").reply(200, mockProject);

      const result = await projectsApi.getProjectById("proj-1");

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockProject);
      }
    });

    it("returns NotFound failure when project does not exist", async () => {
      mock.onGet("/projects/non-existent").reply(404);

      const result = await projectsApi.getProjectById("non-existent");

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error._tag).toBe("NotFound");
        if (result.error._tag === "NotFound") {
          expect(result.error.id).toBe("non-existent");
        }
      }
    });

    it("returns NotFound failure on 404 HTTP response", async () => {
      mock.onGet("/projects/proj-error").reply(404);

      const result = await projectsApi.getProjectById("proj-error");

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error._tag).toBe("NotFound");
      }
    });
  });

  describe("projectsApi — createProject", () => {
    it("posts to /projects and returns the new project on 200", async () => {
      const input = {
        nombre: "New Project",
        ubicacionTexto: "Santiago",
        usuarioCreadorId: "user-1",
        categoria: 1
      };

      const expectedProject: ProyectoDto = {
        id: "proj-new",
        codigoInterno: "PRJ-new",
        nombre: input.nombre,
        ubicacionTexto: input.ubicacionTexto,
        categoria: input.categoria,
        estadoProyecto: ProjectStatus.Draft,
        estadoIntegridad: IntegrityStatus.Pending,
        usuarioCreadorId: input.usuarioCreadorId,
        createdAtUtc: "2026-06-13T00:00:00Z"
      };

      mock.onPost("/projects").reply(200, expectedProject);

      const result = await projectsApi.createProject(input);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toEqual(expectedProject);
      }
    });

    it("returns ServerError when API returns 500", async () => {
      mock.onPost("/projects").reply(500, { message: "DB Error" });

      const result = await projectsApi.createProject({
        nombre: "Fail Project",
        ubicacionTexto: "Santiago",
        usuarioCreadorId: "user-1"
      });

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error._tag).toBe("ServerError");
      }
    });

    it("assigns Draft status and Pending integrity to new project", async () => {
      const input = {
        nombre: "Draft Project",
        ubicacionTexto: "Puerto Plata",
        usuarioCreadorId: "user-2"
      };

      mock.onPost("/projects").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.estadoProyecto).toBe(ProjectStatus.Draft);
        expect(body.estadoIntegridad).toBe(IntegrityStatus.Pending);

        const responseData: ProyectoDto = {
          id: "proj-draft",
          codigoInterno: "PRJ-draft",
          nombre: body.nombre,
          ubicacionTexto: body.ubicacionTexto,
          categoria: 1,
          estadoProyecto: body.estadoProyecto,
          estadoIntegridad: body.estadoIntegridad,
          usuarioCreadorId: body.usuarioCreadorId,
          createdAtUtc: "2026-06-13T00:00:00Z"
        };
        return [200, responseData];
      });

      const result = await projectsApi.createProject(input);
      expect(isSuccess(result)).toBe(true);
    });
  });

  describe("projectsApi — updateProject", () => {
    it("puts to /projects/:id and returns updated project", async () => {
      const updateData = {
        nombre: "Updated Name",
        ubicacionTexto: "La Vega",
        categoria: 2
      };

      const updatedProject: ProyectoDto = {
        id: "proj-1",
        codigoInterno: "PRJ-1",
        nombre: updateData.nombre,
        ubicacionTexto: updateData.ubicacionTexto,
        categoria: updateData.categoria,
        estadoProyecto: ProjectStatus.InReview,
        estadoIntegridad: IntegrityStatus.Verified,
        usuarioCreadorId: "user-1",
        createdAtUtc: "2026-06-13T00:00:00Z"
      };

      mock.onPut("/projects/proj-1").reply(200, updatedProject);

      const result = await projectsApi.updateProject("proj-1", updateData);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toEqual(updatedProject);
      }
    });

    it("returns NotFound when id does not exist", async () => {
      mock.onPut("/projects/non-existent").reply(404);

      const result = await projectsApi.updateProject("non-existent", {
        nombre: "Non Existent",
        ubicacionTexto: "N/A",
        categoria: 1
      });

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error._tag).toBe("NotFound");
      }
    });
  });

  describe("projectsApi — updateProjectStatus", () => {
    it("patches status and returns updated project", async () => {
      const updatedProject: ProyectoDto = {
        id: "proj-1",
        codigoInterno: "PRJ-1",
        nombre: "Project One",
        ubicacionTexto: "Santo Domingo",
        categoria: 1,
        estadoProyecto: ProjectStatus.Published,
        estadoIntegridad: IntegrityStatus.Pending,
        usuarioCreadorId: "user-1",
        createdAtUtc: "2026-06-13T00:00:00Z"
      };

      mock.onPatch("/projects/proj-1/status").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.status).toBe("Activo"); // Published status maps to "Activo"
        return [200, updatedProject];
      });

      const result = await projectsApi.updateProjectStatus("proj-1", ProjectStatus.Published);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toEqual(updatedProject);
      }
    });

    it("throws when an invalid ProjectStatus enum value is passed", async () => {
      // Using an invalid number cast as ProjectStatus
      await expect(
        projectsApi.updateProjectStatus("proj-1", 999 as ProjectStatus)
      ).rejects.toThrow("Invalid project status");
    });
  });
});
