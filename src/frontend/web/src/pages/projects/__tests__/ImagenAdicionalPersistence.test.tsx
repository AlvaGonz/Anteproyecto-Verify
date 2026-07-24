// @vitest-environment jsdom
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

vi.mock("../../../features/auth/services/AuthService", () => ({
  AuthService: {
    getCurrentUser: vi.fn().mockResolvedValue({ _tag: "None" }),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

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

let lastErrorMessage = "";

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

const PROJECT_WITH_ADITIONAL_IMAGES = {
  id: "proj-photos-001",
  codigoInterno: "VF-001-2026",
  nombre: "Residencial Las Palmas",
  ubicacionTexto: "La Romana, RD",
  categoria: ProjectCategory.Residencial,
  estadoProyecto: ProjectStatus.Draft,
  estadoIntegridad: IntegrityStatus.Pending,
  usuarioCreadorId: "user-001",
  createdAtUtc: "2026-01-01T00:00:00Z",
  imagenAdicional1: "https://example.com/foto1.jpg",
  imagenAdicional2: "https://example.com/foto2.jpg",
  imagenAdicional3: "",
  imagenAdicional4: null,
  imagenAdicional5: null,
  datosDesarrollador: "Constructora Las Palmas SRL",
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

import { ProjectActionBarProvider } from "../ProjectActionBarContext";

const renderEdit = (id = "proj-photos-001") =>
  render(
    <MemoryRouter initialEntries={[`/admin/projects/${id}/edit`]}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <ProjectActionBarProvider>
              <Routes>
                <Route path="/admin/projects/:id/edit" element={<ProjectManagePage />} />
                <Route path="/projects/:id" element={<div data-testid="project-detail">Detail</div>} />
                <Route path="/admin/projects" element={<div data-testid="projects-list">List</div>} />
              </Routes>
            </ProjectActionBarProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );

describe("ImagenAdicional persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastErrorMessage = "";
    vi.mocked(projectsApi.getProjectById).mockResolvedValue({
      _tag: "Success",
      data: { ...PROJECT_WITH_ADITIONAL_IMAGES },
    });
    vi.mocked(projectsApi.getProjectStatusEligibility).mockResolvedValue({
      _tag: "Success",
      data: { canTransition: true, availableStatuses: [], currentStatus: ProjectStatus.Draft },
    });
  });

  it("preserves imagenAdicional1 value in update payload on submit", async () => {
    const user = userEvent.setup();
    vi.mocked(projectsApi.updateProject).mockResolvedValue({
      _tag: "Success",
      data: { ...PROJECT_WITH_ADITIONAL_IMAGES },
    });
    renderEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre del Proyecto/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => {
      expect(projectsApi.updateProject).toHaveBeenCalledWith(
        "proj-photos-001",
        expect.objectContaining({
          imagenAdicional1: "https://example.com/foto1.jpg",
          imagenAdicional2: "https://example.com/foto2.jpg",
        })
      );
    });
  });

  it("includes all extra photo fields in the update payload", async () => {
    const user = userEvent.setup();
    vi.mocked(projectsApi.updateProject).mockResolvedValue({
      _tag: "Success",
      data: { ...PROJECT_WITH_ADITIONAL_IMAGES },
    });
    renderEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre del Proyecto/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => {
      expect(projectsApi.updateProject).toHaveBeenCalled();
      const callArg = vi.mocked(projectsApi.updateProject).mock.calls[0][1];
      expect(callArg).toHaveProperty("imagenAdicional1", "https://example.com/foto1.jpg");
      expect(callArg).toHaveProperty("imagenAdicional2", "https://example.com/foto2.jpg");
      expect(callArg).toHaveProperty("imagenAdicional3");
      expect(callArg).toHaveProperty("imagenAdicional4");
      expect(callArg).toHaveProperty("imagenAdicional5");
    });
  });
});
