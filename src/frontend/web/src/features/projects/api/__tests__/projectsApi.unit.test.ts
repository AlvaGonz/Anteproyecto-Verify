import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { projectsApi } from "../projectsApi";
import {
  ProjectStatus,
  ProjectCategory,
  IntegrityStatus,
} from "../../types";

// Mock apiClient to delegate to global.fetch so that the test's fetch mocks intercept the requests
vi.mock("../../../../infrastructure/api/client", () => {
  return {
    apiClient: {
      get: vi.fn().mockImplementation(async (url: string) => {
        const res = await global.fetch(`http://localhost:5000/api${url}`, { method: "GET" });
        const data = await res.json();
        if (!res.ok) {
          throw { response: { status: res.status, data } };
        }
        return { data };
      }),
      post: vi.fn().mockImplementation(async (url: string, body: any) => {
        const res = await global.fetch(`http://localhost:5000/api${url}`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          throw { response: { status: res.status, data } };
        }
        return { data };
      }),
      put: vi.fn().mockImplementation(async (url: string, body: any) => {
        const res = await global.fetch(`http://localhost:5000/api${url}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          throw { response: { status: res.status, data } };
        }
        return { data };
      }),
      patch: vi.fn().mockImplementation(async (url: string, body: any) => {
        const res = await global.fetch(`http://localhost:5000/api${url}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          throw { response: { status: res.status, data } };
        }
        return { data };
      }),
    },
  };
});

// ── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_PROJECT = {
  id: "proj-001",
  codigoInterno: "VF-001-2026",
  nombre: "Residencial Las Palmas",
  ubicacionTexto: "La Romana, RD",
  categoria: ProjectCategory.Residencial,
  estadoProyecto: ProjectStatus.Draft,
  estadoIntegridad: IntegrityStatus.Pending,
  usuarioCreadorId: "user-001",
  createdAtUtc: "2026-01-01T00:00:00Z",
};

const MOCK_CREATE_DTO = {
  nombre: "Nuevo Proyecto Test",
  ubicacionTexto: "Santo Domingo, RD",
  usuarioCreadorId: "user-001",
  categoria: ProjectCategory.Comercial,
};

const MOCK_UPDATE_DTO = {
  nombre: "Proyecto Actualizado",
  ubicacionTexto: "Santiago, RD",
  categoria: ProjectCategory.Mixto,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function mockFetchReject(error: Error) {
  global.fetch = vi.fn().mockRejectedValue(error);
}

// Force USE_MOCK=false so tests exercise the real fetch path
vi.stubEnv("VITE_USE_MOCK", "false");
vi.stubEnv("VITE_API_URL", "http://localhost:5000/api");

describe("projectsApi — READ", () => {
  afterEach(() => vi.restoreAllMocks());

  it("getProjects — returns success with project list on 200", async () => {
    mockFetch(200, [MOCK_PROJECT]);
    const result = await projectsApi.getProjects();
    expect(result).toMatchObject({ _tag: "Success", data: [MOCK_PROJECT] });
  });

  it("getProjects — returns ServerError on non-200", async () => {
    mockFetch(500, {});
    const result = await projectsApi.getProjects();
    expect(result).toMatchObject({ _tag: "Failure", error: { _tag: "ServerError" } });
  });

  it("getProjects — returns UnknownError on network failure", async () => {
    mockFetchReject(new Error("Network error"));
    const result = await projectsApi.getProjects();
    expect(result).toMatchObject({ _tag: "Failure", error: { _tag: "UnknownError" } });
  });

  it("getProjectById — returns success when project found", async () => {
    mockFetch(200, MOCK_PROJECT);
    const result = await projectsApi.getProjectById("proj-001");
    expect(result).toMatchObject({ _tag: "Success", data: MOCK_PROJECT });
  });

  it("getProjectById — returns NotFound on 404", async () => {
    mockFetch(404, {});
    const result = await projectsApi.getProjectById("proj-999");
    expect(result).toMatchObject({ _tag: "Failure", error: { _tag: "NotFound", id: "proj-999" } });
  });

  it("getProjectById — returns ServerError on 500", async () => {
    mockFetch(500, {});
    const result = await projectsApi.getProjectById("proj-001");
    expect(result).toMatchObject({ _tag: "Failure", error: { _tag: "ServerError" } });
  });
});

describe("projectsApi — CREATE", () => {
  afterEach(() => vi.restoreAllMocks());

  it("createProject — POSTs and returns new project on 200", async () => {
    const created = { ...MOCK_PROJECT, id: "proj-new", ...MOCK_CREATE_DTO };
    mockFetch(200, created);
    const result = await projectsApi.createProject(MOCK_CREATE_DTO);
    expect(result).toMatchObject({ _tag: "Success", data: { id: "proj-new" } });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/projects",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("createProject — returns ServerError on 500", async () => {
    mockFetch(500, {});
    const result = await projectsApi.createProject(MOCK_CREATE_DTO);
    expect(result).toMatchObject({ _tag: "Failure", error: { _tag: "ServerError" } });
  });

  it("createProject — sends correct JSON body", async () => {
    mockFetch(200, { ...MOCK_PROJECT, ...MOCK_CREATE_DTO });
    await projectsApi.createProject(MOCK_CREATE_DTO);
    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
    const body = JSON.parse(callArgs[0][1].body);
    expect(body.nombre).toBe("Nuevo Proyecto Test");
    expect(body.usuarioCreadorId).toBe("user-001");
  });
});

describe("projectsApi — UPDATE", () => {
  afterEach(() => vi.restoreAllMocks());

  it("updateProject — PUTs and returns updated project", async () => {
    const updated = { ...MOCK_PROJECT, ...MOCK_UPDATE_DTO };
    mockFetch(200, updated);
    const result = await projectsApi.updateProject("proj-001", MOCK_UPDATE_DTO);
    expect(result).toMatchObject({ _tag: "Success", data: { nombre: "Proyecto Actualizado" } });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/projects/proj-001",
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("updateProject — returns ServerError on failure", async () => {
    mockFetch(500, {});
    const result = await projectsApi.updateProject("proj-001", MOCK_UPDATE_DTO);
    expect(result).toMatchObject({ _tag: "Failure", error: { _tag: "ServerError" } });
  });

  it("updateProjectStatus — PATCHes status and returns updated project", async () => {
    const updated = { ...MOCK_PROJECT, estadoProyecto: ProjectStatus.InReview };
    mockFetch(200, updated);
    const result = await projectsApi.updateProjectStatus("proj-001", ProjectStatus.InReview);
    expect(result).toMatchObject({
      _tag: "Success",
      data: { estadoProyecto: ProjectStatus.InReview },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/projects/proj-001/status",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("updateProjectStatus — returns ServerError on 500", async () => {
    mockFetch(500, {});
    const result = await projectsApi.updateProjectStatus("proj-001", ProjectStatus.Published);
    expect(result).toMatchObject({ _tag: "Failure", error: { _tag: "ServerError" } });
  });
});
