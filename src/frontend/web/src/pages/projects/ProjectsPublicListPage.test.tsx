import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Suspense } from "react";
import { ProjectsPublicListPage } from "./ProjectsPublicListPage";

const MOCK_PROJECTS = [
  { id: "1", nombreProyecto: "Residencial Terra Noble", categoriaId: 16, estadoValidacion: "Verificado", ubicacionTexto: "Santo Domingo", estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO", valorEstimado: 5000000, completionRate: 100 },
  { id: "2", nombreProyecto: "Torre San Gerónimo", categoriaId: 8, estadoValidacion: "Verificado", ubicacionTexto: "Santiago", estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO", valorEstimado: 8000000, completionRate: 100 },
  { id: "3", nombreProyecto: "Plaza Central Mall", categoriaId: 8, estadoValidacion: "Verificado", ubicacionTexto: "Santo Domingo", estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO", valorEstimado: 3000000, completionRate: 80 }
];

vi.mock("../../features/projects/api/usePublishedProjects", () => ({
  useSuspensePublishedProjects: () => ({ data: MOCK_PROJECTS }),
  filterPublishedProjects: (projects: typeof MOCK_PROJECTS, filters: any) =>
    projects.filter((p) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (!p.nombreProyecto.toLowerCase().includes(q)) return false;
      }
      if (filters.projectTypes.length > 0 && p.categoriaId) {
        if (!filters.projectTypes.includes(p.categoriaId)) return false;
      }
      if (p.valorEstimado !== undefined && p.valorEstimado !== null) {
        if (p.valorEstimado < filters.priceRange[0] || p.valorEstimado > filters.priceRange[1]) return false;
      }
      if (filters.province && p.ubicacionTexto) {
        if (!p.ubicacionTexto.toLowerCase().includes(filters.province.toLowerCase())) return false;
      }
      return true;
    }),
  PROJECT_CATEGORIES: [
    { value: 1, label: "ALBERGUES" },
    { value: 2, label: "ALMACENES" },
    { value: 3, label: "APARTAMENTOS" },
    { value: 4, label: "CENTROS DE RECREACIÓN Y DEPORTES" },
    { value: 5, label: "CENTROS DE SALUD" },
    { value: 6, label: "COLEGIOS Y CENTROS EDUCATIVOS" },
    { value: 7, label: "COMBINADOS" },
    { value: 8, label: "COMERCIAL Y OFICINAS" },
    { value: 9, label: "DEPÓSITOS" },
    { value: 10, label: "ESTACIÓN DE COMBUSTIBLE" },
    { value: 11, label: "ESTRUCTURAS ESPECIALES" },
    { value: 12, label: "HOSPEDAJE" },
    { value: 13, label: "OBRAS DE ORDEN SOCIAL" },
    { value: 14, label: "PARQUEOS" },
    { value: 15, label: "SERVICIOS DE TRANSPORTE" },
    { value: 16, label: "VIVIENDAS" },
  ],
  PROVINCIAS: ["Distrito Nacional", "Santo Domingo", "Santiago"],
  PRICE_MAX: 15_000_000,
  PRICE_STEPS: 100_000,
  getDefaultProjectImage: () => "",
}));

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
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <ProjectsPublicListPage />
        </Suspense>
      </MemoryRouter>
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
    const searchInput = await screen.findByPlaceholderText("RNC, Cédula, Nombre...");
    expect(searchInput).toBeInTheDocument();
  });

  it("renders cumulative type checkboxes", async () => {
    renderPage();
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
});
