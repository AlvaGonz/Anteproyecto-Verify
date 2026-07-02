// @vitest-environment jsdom
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectManagePage } from "../ProjectManagePage";
import { ToastProvider } from "../../../shared/components/ui/Toast/ToastContext";
import { AuthProvider } from "../../../shared/context/AuthContext";
import { projectsApi } from "../../../features/projects/api/projectsApi";
import {
  ProjectStatus,
  ProjectCategory,
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

// ── Fixtures ─────────────────────────────────────────────────────────────────

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

// ── Render Helpers ────────────────────────────────────────────────────────────

const renderCreate = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/admin/projects/new"]}>
        <ToastProvider>
          <Routes>
            <Route path="/admin/projects/new" element={<ProjectManagePage />} />
            <Route path="/projects/:id" element={<div data-testid="project-detail">Detail</div>} />
            <Route path="/admin/projects" element={<div data-testid="projects-list">List</div>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    </AuthProvider>
  );

const renderEdit = (id = "proj-001") =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/admin/projects/${id}/edit`]}>
        <ToastProvider>
          <Routes>
            <Route path="/admin/projects/:id/edit" element={<ProjectManagePage />} />
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

  it("renders 'Crear Nuevo Proyecto' heading", () => {
    renderCreate();
    expect(screen.getByText(/Crear Nuevo Proyecto/i)).toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
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

  it("renders 'Editar Proyecto' heading", async () => {
    renderEdit();
    await waitFor(() => expect(screen.getByText(/Editar Proyecto/i)).toBeInTheDocument());
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

  it("calls updateProject on submit and navigates to /projects/:id", async () => {
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
    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => {
      expect(projectsApi.updateProject).toHaveBeenCalledWith(
        "proj-001",
        expect.objectContaining({ nombre: "Modificado" })
      );
      expect(screen.getByTestId("projects-list")).toBeInTheDocument();
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
      expect(screen.getByText(/Fallo al actualizar/i)).toBeInTheDocument();
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

  it("renders all 4 status buttons when project is loaded", async () => {
    renderEdit();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Draft/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /InReview/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Published/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Observed/i })).toBeInTheDocument();
    });
  });

  it("calls updateProjectStatus with InReview on button click", async () => {
    const user = userEvent.setup();
    vi.mocked(projectsApi.updateProjectStatus).mockResolvedValue({
      _tag: "Success",
      data: { ...MOCK_PROJECT, estadoProyecto: ProjectStatus.InReview },
    });
    renderEdit();
    await waitFor(() => screen.getByRole("button", { name: /InReview/i }));

    await user.click(screen.getByRole("button", { name: /InReview/i }));
    await waitFor(() => {
      expect(projectsApi.updateProjectStatus).toHaveBeenCalledWith(
        "proj-001",
        ProjectStatus.InReview
      );
    });
  });

  it("shows error toast when updateProjectStatus fails", async () => {
    const user = userEvent.setup();
    vi.mocked(projectsApi.updateProjectStatus).mockResolvedValue({
      _tag: "Failure",
      error: { _tag: "ServerError", message: "Error de estado" },
    });
    renderEdit();
    await waitFor(() => screen.getByRole("button", { name: /Published/i }));
    await user.click(screen.getByRole("button", { name: /Published/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error de estado/i)).toBeInTheDocument();
    });
  });
});
