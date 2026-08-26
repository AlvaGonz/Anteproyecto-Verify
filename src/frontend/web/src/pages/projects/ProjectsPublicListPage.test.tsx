import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProjectsPublicListPage } from "./ProjectsPublicListPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

vi.mock("../../features/projects/api/useGlobalSearch", () => ({
  useGlobalSearch: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}));

const MOCK_PROJECTS = [
  { id: "1", nombreProyecto: "Residencial Terra Noble", categoriaId: 16, estadoValidacion: "Verificado", ubicacionTexto: "Santo Domingo", estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO", valorEstimado: 5000000, completionRate: 100, createdAtUtc: "2026-08-12T10:00:00Z" },
  { id: "2", nombreProyecto: "Torre San Gerónimo", categoriaId: 8, estadoValidacion: "Verificado", ubicacionTexto: "Santiago", estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO", valorEstimado: 8000000, completionRate: 100, createdAtUtc: "2026-08-14T15:00:00Z" },
  { id: "3", nombreProyecto: "Plaza Central Mall", categoriaId: 8, estadoValidacion: "Verificado", ubicacionTexto: "Santo Domingo", estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO", valorEstimado: 3000000, completionRate: 80, createdAtUtc: "2026-08-20T08:00:00Z" }
];

vi.mock("../../features/projects/api/usePublishedProjects", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../features/projects/api/usePublishedProjects")>();
  return {
    ...actual,
    useSuspensePublishedProjects: () => ({ data: MOCK_PROJECTS }),
  };
});

vi.mock("../../shared/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
  }),
}));

vi.mock("../../features/public/components/LandingNav", () => ({
  LandingNav: () => <nav data-testid="landing-nav" />,
}));

vi.mock("../../features/public/components/LandingFooter", () => ({
  LandingFooter: () => <footer data-testid="landing-footer" />,
}));

vi.mock("../../features/public/components/VerifySearchForm", () => ({
  VerifySearchForm: () => (
    <input placeholder="Ej: VF-2026-X83L" data-testid="verify-search" />
  ),
}));

vi.mock("../../features/public/components/ProjectStatusBadge", () => ({
  ProjectStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

vi.mock("../../features/provinces/api/useProvinces", () => ({
  useProvinces: () => ({
    data: [
      { id: "1", nombre: "Santo Domingo", latitud: 18.4861, longitud: -69.9312 },
      { id: "2", nombre: "Santiago", latitud: 19.4513, longitud: -70.6970 },
      { id: "3", nombre: "La Altagracia", latitud: 18.5800, longitud: -68.7200 },
    ],
  }),
}));

describe("ProjectsPublicListPage", () => {
  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectsPublicListPage />
          </Suspense>
        </MemoryRouter>
      </QueryClientProvider>
    );

  it("renders the hero title and search form", async () => {
    renderPage();
    expect(await screen.findByText(/Cero Incertidumbre En Su/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ej: VF-2026-X83L/i)).toBeInTheDocument();
  });

  it("renders project count in the directory header", async () => {
    const { container } = render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <ProjectsPublicListPage />
        </Suspense>
      </MemoryRouter>
    );
    await screen.findByText("Directorio de Proyectos");
    const countSpan = container.querySelector("p span.font-black");
    expect(countSpan).toHaveTextContent("3");
  });

  it("renders the Filtros toggle button", async () => {
    renderPage();
    const btn = await screen.findByRole("button", { name: /Filtros/i });
    expect(btn).toBeInTheDocument();
  });

  it("renders filter sidebar with search input", async () => {
    renderPage();
    const searchInput = await screen.findByPlaceholderText(/RNC/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("renders cumulative type checkboxes", async () => {
    renderPage();
    const { fireEvent } = await import("@testing-library/react");
    const toggleButton = await screen.findByRole("button", { name: /Tipo \(acumulativo\)/i });
    fireEvent.click(toggleButton);
    expect(await screen.findByText("ALBERGUES")).toBeInTheDocument();
    expect(screen.getByText("ALMACENES")).toBeInTheDocument();
    expect(screen.getByText("APARTAMENTOS")).toBeInTheDocument();
    expect(screen.getByText("VIVIENDAS")).toBeInTheDocument();
  });

  it("renders price range filter section", async () => {
    renderPage();
    expect(await screen.findByText(/Precio/)).toBeInTheDocument();
    const sliders = document.querySelectorAll('input[type="range"]');
    expect(sliders.length).toBeGreaterThanOrEqual(2);
  });

  it("renders province select", async () => {
    renderPage();
    expect(await screen.findByText("Provincia")).toBeInTheDocument();
    const provinceOptions = screen.getAllByText("Santo Domingo");
    expect(provinceOptions.length).toBeGreaterThanOrEqual(1);
  });

  it("renders all mock projects in the directory", async () => {
    renderPage();
    expect(await screen.findByText("Residencial Terra Noble")).toBeInTheDocument();
    expect(screen.getByText("Torre San Gerónimo")).toBeInTheDocument();
    expect(screen.getByText("Plaza Central Mall")).toBeInTheDocument();
  });

  it("initializes search query from URL parameter and filters projects", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/projects?search=Torre"]}>
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectsPublicListPage />
          </Suspense>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const searchInput = (await screen.findByPlaceholderText(/RNC/i)) as HTMLInputElement;
    expect(searchInput.value).toBe("Torre");
    expect(screen.getByText("Torre San Gerónimo")).toBeInTheDocument();
    expect(screen.queryByText("Residencial Terra Noble")).not.toBeInTheDocument();
  });

  it("renders date filter inputs (Desde and Hasta)", async () => {
    renderPage();
    expect(await screen.findByText("Filtrar por fecha")).toBeInTheDocument();
    expect(screen.getByText("Desde")).toBeInTheDocument();
    expect(screen.getByText("Hasta")).toBeInTheDocument();
  });

  it("filters projects by date range Desde and Hasta correctly", async () => {
    const { fireEvent } = await import("@testing-library/react");
    renderPage();
    await screen.findByText("Filtrar por fecha");

    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBe(2);

    const [desdeInput, hastaInput] = dateInputs as unknown as [HTMLInputElement, HTMLInputElement];

    // Filter between 2026-08-12 and 2026-08-14
    fireEvent.change(desdeInput, { target: { value: "2026-08-12" } });
    fireEvent.change(hastaInput, { target: { value: "2026-08-14" } });

    // Should include project 1 (Aug 12) and project 2 (Aug 14), but exclude project 3 (Aug 20)
    expect(screen.getByText("Residencial Terra Noble")).toBeInTheDocument();
    expect(screen.getByText("Torre San Gerónimo")).toBeInTheDocument();
    expect(screen.queryByText("Plaza Central Mall")).not.toBeInTheDocument();
  });

  it("resets date filter inputs when Limpiar filtros is clicked", async () => {
    const { fireEvent } = await import("@testing-library/react");
    renderPage();
    await screen.findByText("Filtrar por fecha");

    const dateInputs = document.querySelectorAll('input[type="date"]');
    const [desdeInput, hastaInput] = dateInputs as unknown as [HTMLInputElement, HTMLInputElement];

    fireEvent.change(desdeInput, { target: { value: "2026-08-12" } });
    fireEvent.change(hastaInput, { target: { value: "2026-08-14" } });

    const clearBtn = await screen.findByRole("button", { name: /Limpiar filtros/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText("Plaza Central Mall")).toBeInTheDocument();
  });
});
