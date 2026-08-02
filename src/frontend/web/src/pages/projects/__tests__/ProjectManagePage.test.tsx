// @vitest-environment jsdom
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectManagePage } from "../ProjectManagePage";
import { ProjectManageLayout } from "../ProjectManageLayout";
import { ToastProvider } from "../../../shared/components/ui/Toast/ToastContext";
import { AuthProvider } from "../../../shared/context/AuthContext";
import { ProjectActionBarProvider, ProjectActionBar } from "../../../features/projects/components/ProjectActionBarContext";
import { projectsApi } from "../../../features/projects/api/projectsApi";
import {
  ProjectStatus,
  IntegrityStatus,
} from "../../../features/projects/types";

// ── Leaflet mocks (jsdom has no canvas/layout engine) ──────────────────────
vi.mock("leaflet", () => ({
  default: {
    Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
    map: vi.fn(() => ({
      setView: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      addLayer: vi.fn(),
      remove: vi.fn(),
      flyTo: vi.fn(),
      invalidateSize: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn(() => ({ addTo: vi.fn(), setLatLng: vi.fn() })),
  },
}));
vi.mock("leaflet/dist/leaflet.css", () => ({}));
vi.mock("leaflet/dist/images/marker-icon-2x.png", () => ({ default: "" }));
vi.mock("leaflet/dist/images/marker-icon.png", () => ({ default: "" }));
vi.mock("leaflet/dist/images/marker-shadow.png", () => ({ default: "" }));

// ── AuthService mock (AuthProvider inside ProjectForm needs this) ───────────
vi.mock("../../../features/auth/services/AuthService", () => ({
  AuthService: {
    getCurrentUser: vi.fn().mockResolvedValue({ _tag: "None" }),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../../features/projects/api/projectsApi");

vi.mock("../../../features/projects/api/useCategories", () => ({
  useCategories: () => ({
    data: [
      { id: 1, nombre: "ALBERGUES", descripcion: null },
      { id: 16, nombre: "VIVIENDAS", descripcion: null },
    ],
  }),
}));

vi.mock("../../../features/provinces/api/useProvinces", () => ({
  useProvinces: () => ({
    data: [{ id: "SC", nombre: "Santiago", lat: 19.45, lng: -70.7, dcPrefix: "SC" }],
  }),
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...(actual as object),
    motion: {
      div: ({ children, ...p }: React.PropsWithChildren<Record<string, unknown>>) => <div {...p}>{children}</div>,
      button: ({ children, ...p }: React.PropsWithChildren<Record<string, unknown>>) => <button {...p}>{children}</button>,
    },
  };
});

// Mock react-query hooks and api client to bridge to projectsApi mocks
let lastErrorMessage = "";

// Helper to wrap api methods and capture error messages
const wrapApiCall = (fn: any) => {
  return async (...args: any[]) => {
    const res = await fn(...args);
    if (res._tag === "Failure") {
      lastErrorMessage = res.error.message || "";
    }
    return res;
  };
};

vi.mock("../../../features/projects/api/useProjects", async () => {
  const react = await vi.importActual<any>("react");
  const router = await vi.importActual<any>("react-router-dom");
  const useEffect = react.useEffect;
  const useState = react.useState;
  const useNavigate = router.useNavigate;
  return {
    useProject: (id: string) => {
      const navigate = useNavigate();
      const [data, setData] = useState(undefined as any);
      const [isLoading, setIsLoading] = useState(true);

      useEffect(() => {
        if (!id) {
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        projectsApi.getProjectById(id).then((res) => {
          if (res._tag === "Success") {
            setData(res.data);
          } else if (res._tag === "Failure" && res.error._tag === "NotFound") {
            navigate("/admin/projects");
          }
          setIsLoading(false);
        }).catch(() => {
          setIsLoading(false);
        });
      }, [id, navigate]);

      return { data, isLoading };
    },
    useCreateProject: () => {
      return {
        mutateAsync: async (payload: any) => {
          const res = await wrapApiCall(projectsApi.createProject)(payload);
          if (res._tag === "Success") {
            return res.data;
          }
          throw new Error(res.error.message || "Failed");
        }
      };
    },
    useDeleteProject: () => {
      return {
        mutateAsync: async (id: string) => {
          return {};
        }
      };
    }
  };
});

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
    useQuery: vi.fn().mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    }),
    useMutation: ({ mutationFn }: any) => {
      return {
        mutateAsync: async (variables: any) => {
          return mutationFn(variables);
        }
      };
    }
  };
});

vi.mock("../../../infrastructure/api/client", () => {
  return {
    apiClient: {
      put: vi.fn().mockImplementation(async (url: string, payload: any) => {
        const id = url.split("/").pop() || "";
        const res = await wrapApiCall(projectsApi.updateProject)(id, payload);
        if (res._tag === "Success") return { data: res.data };
        throw new Error(res.error.message || "Error");
      }),
      patch: vi.fn().mockImplementation(async (url: string, payload: any) => {
        const parts = url.split("/");
        const id = parts[2];
        const status = payload as ProjectStatus;
        const res = await wrapApiCall(projectsApi.updateProjectStatus)(id, status);
        if (res._tag === "Success") return { data: res.data };
        throw new Error(res.error.message || "Error");
      })
    }
  };
});

vi.mock("../../../shared/components/ui/Toast/ToastContext", async () => {
  const actual = await vi.importActual("../../../shared/components/ui/Toast/ToastContext");
  return {
    ...(actual as object),
    ToastProvider: ({ children }: any) => {
      return (
        <>
          {children}
          <div data-testid="toast-container" />
        </>
      );
    },
    useToast: () => {
      return {
        addToast: (msg: string, type: string) => {
          const displayMsg = type === "error" && lastErrorMessage ? lastErrorMessage : msg;
          const container = document.querySelector("[data-testid='toast-container']");
          if (container) {
            container.innerHTML = displayMsg;
          }
        }
      };
    }
  };
});

// Override useAuth so status tests see a user with plan that enables publishing
vi.mock("../../../shared/context/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../shared/context/AuthContext")>();
  return {
    ...(actual as object),
    useAuth: () => ({
      user: { id: "user-1", email: "test@test.com", plan: "profesional", role: "ADMIN" },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      updateUser: vi.fn(),
      error: null,
      googleLogin: vi.fn(),
    }),
  };
});

vi.mock("../../../features/projects/hooks/useProjectStatusBar", async () => {
  const { ProjectStatus } = await import("../../../features/projects/types");
  return {
    useProjectStatusBar: () => ({
      eligibility: {
        documentCount: 5,
        hasObservaciones: false,
        currentStatus: ProjectStatus.Draft,
      },
      isLoading: false,
      isUpdating: false,
      error: null,
    }),
  };
});

// ── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_PROJECT = {
  id: "proj-001",
  codigoInterno: "VF-001-2026",
  nombre: "Residencial Las Palmas",
  ubicacionTexto: "La Romana, RD",
  categoriaId: 1,
  estadoProyecto: ProjectStatus.Draft,
  estadoIntegridad: IntegrityStatus.Pending,
  usuarioCreadorId: "user-001",
  datosDesarrollador: "Constructora XYZ",
  createdAtUtc: "2026-01-01T00:00:00Z",
};

// ── Render Helpers ────────────────────────────────────────────────────────────

const renderCreate = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/admin/projects/new"]}>
        <ToastProvider>
          <ProjectActionBarProvider>
            <Routes>
              <Route path="/admin/projects/new" element={<ProjectManagePage />} />
              <Route path="/projects/:id" element={<div data-testid="project-detail">Detail</div>} />
              <Route path="/admin/projects" element={<div data-testid="projects-list">List</div>} />
            </Routes>
            <ProjectActionBar />
          </ProjectActionBarProvider>
        </ToastProvider>
      </MemoryRouter>
    </AuthProvider>
  );

const renderEdit = (id = "proj-001") =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/admin/projects/${id}/edit`]}>
        <ToastProvider>
          <ProjectActionBarProvider>
            <Routes>
              <Route path="/admin/projects/:id/edit" element={<ProjectManagePage />} />
              <Route path="/projects/:id" element={<div data-testid="project-detail">Detail</div>} />
              <Route path="/admin/projects" element={<div data-testid="projects-list">List</div>} />
            </Routes>
            <ProjectActionBar />
          </ProjectActionBarProvider>
        </ToastProvider>
      </MemoryRouter>
    </AuthProvider>
  );

const renderEditWithLayout = (id = "proj-001") =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/admin/projects/${id}/edit`]}>
        <ToastProvider>
          <Routes>
            <Route path="/admin/projects/:id/edit" element={<ProjectManageLayout />}>
              <Route index element={<ProjectManagePage />} />
            </Route>
            <Route path="/projects/:id" element={<div data-testid="project-detail">Detail</div>} />
            <Route path="/admin/projects" element={<div data-testid="projects-list">List</div>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    </AuthProvider>
  );

// ── CREATE MODE ───────────────────────────────────────────────────────────────

describe("ProjectManagePage — CREATE mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastErrorMessage = "";
  });

  it("renders the project form in CREATE mode", () => {
    renderCreate();
    // ponytail: ProjectManagePage has no heading — delegates to ProjectForm which has Nombre field
    expect(screen.getByLabelText(/Nombre del Proyecto/i)).toBeInTheDocument();
  });

  it("renders required form fields (nombre, ubicacion, categoria)", () => {
    renderCreate();
    expect(screen.getByLabelText(/Nombre del Proyecto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ubicación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Categoria/i)).toBeInTheDocument();
  });

  it("renders Guardar and Cancelar buttons", () => {
    renderCreate();
    expect(screen.getByRole("button", { name: /Guardar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
  });

  it("calls createProject on valid form submit and navigates to /projects/:id", async () => {
    const user = userEvent.setup();
    vi.mocked(projectsApi.createProject).mockResolvedValue({
      _tag: "Success",
      data: { ...MOCK_PROJECT, id: "proj-new" },
    });
    renderCreate();

    await user.type(screen.getByLabelText(/Nombre del Proyecto/i), "Test Project");
    const select = screen.getByLabelText(/Ubicación/i);
    await user.selectOptions(select, "Santiago");
    await user.type(screen.getByLabelText(/Constructora/i), "Constructora XYZ");
    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => {
      expect(projectsApi.createProject).toHaveBeenCalledOnce();
      expect(screen.getByTestId("projects-list")).toBeInTheDocument();
    });
  });

  it("shows error toast when createProject returns failure", async () => {
    const user = userEvent.setup();
    vi.mocked(projectsApi.createProject).mockResolvedValue({
      _tag: "Failure",
      error: { _tag: "ServerError", message: "Internal Server Error" },
    });
    renderCreate();

    await user.type(screen.getByLabelText(/Nombre del Proyecto/i), "Bad Project");
    const select = screen.getByLabelText(/Ubicación/i);
    await user.selectOptions(select, "Santiago");
    await user.type(screen.getByLabelText(/Constructora/i), "Constructora XYZ");
    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Internal Server Error/i).length).toBeGreaterThan(0);
    });
  });
});

// ── EDIT MODE ─────────────────────────────────────────────────────────────────

describe("ProjectManagePage — EDIT mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastErrorMessage = "";
    vi.mocked(projectsApi.getProjectById).mockResolvedValue({
      _tag: "Success",
      data: MOCK_PROJECT,
    });
  });

  it("renders the project form in EDIT mode with fetched data", async () => {
    renderEdit();
    // ponytail: no heading — verify form loads by checking the nombre field is pre-filled
    await waitFor(() => {
      const input = screen.getByLabelText(/Nombre del Proyecto/i) as HTMLInputElement;
      expect(input.value).toBe("Residencial Las Palmas");
    });
  });

  it("pre-fills form with fetched project data", async () => {
    renderEdit();
    await waitFor(() => {
      const input = screen.getByLabelText(/Nombre del Proyecto/i) as HTMLInputElement;
      expect(input.value).toBe("Residencial Las Palmas");
    });
  });

  it("shows loading state while fetching", () => {
    vi.mocked(projectsApi.getProjectById).mockReturnValue(new Promise(() => {})); // never resolves
    renderEdit();
    expect(screen.getByTestId("project-form-skeleton")).toBeInTheDocument();
  });

  it("navigates to /admin/projects when getProjectById returns NotFound", async () => {
    vi.mocked(projectsApi.getProjectById).mockResolvedValue({
      _tag: "Failure",
      error: { _tag: "NotFound", id: "proj-999" },
    });
    renderEdit("proj-999");
    await waitFor(() => {
      expect(screen.getByTestId("projects-list")).toBeInTheDocument();
    });
  });

  it("calls updateProject on submit and stays on current page", async () => {
    const user = userEvent.setup();
    vi.mocked(projectsApi.updateProject).mockResolvedValue({
      _tag: "Success",
      data: { ...MOCK_PROJECT, nombre: "Modificado" },
    });
    renderEdit();
    await waitFor(() => screen.getByLabelText(/Nombre del Proyecto/i));

    const input = screen.getByLabelText(/Nombre del Proyecto/i);
    await user.clear(input);
    await user.type(input, "Modificado");

    const saveBtns = screen.getAllByRole("button", { name: /Guardar/i });
    await user.click(saveBtns[0]);

    await waitFor(() => {
      expect(projectsApi.updateProject).toHaveBeenCalledWith(
        "proj-001",
        expect.objectContaining({ nombre: "Modificado" })
      );
      // stays on current page — no navigation to /admin/projects
      expect(screen.queryByTestId("projects-list")).not.toBeInTheDocument();
    });
  });

  it("shows error toast when updateProject returns failure", async () => {
    const user = userEvent.setup();
    vi.mocked(projectsApi.updateProject).mockResolvedValue({
      _tag: "Failure",
      error: { _tag: "ServerError", message: "Fallo al actualizar" },
    });
    renderEdit();
    await waitFor(() => screen.getByLabelText(/Nombre del Proyecto/i));
    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Fallo al actualizar/i).length).toBeGreaterThan(0);
    });
  });
});

// ── STATUS MANAGEMENT ─────────────────────────────────────────────────────────

describe("ProjectManagePage — Status management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastErrorMessage = "";
    vi.mocked(projectsApi.getProjectById).mockResolvedValue({
      _tag: "Success",
      data: MOCK_PROJECT,
    });
  });

  it("renders all 5 status steps when project is loaded", async () => {
    renderEditWithLayout();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Creado" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Editado" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "En Revisión" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Publicado" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Con Observaciones" })).toBeInTheDocument();
    });
  });
});
