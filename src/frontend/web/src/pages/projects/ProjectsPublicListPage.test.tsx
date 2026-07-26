import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Suspense } from "react";
import { ProjectsPublicListPage } from "./ProjectsPublicListPage";

const MOCK_PROJECTS = [
  { id: "1", nombreProyecto: "Residencial Terra Noble", categoria: 1, estadoValidacion: "Verificado", ubicacionTexto: "Santo Domingo", estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO" },
  { id: "2", nombreProyecto: "Torre San Gerónimo", categoria: 2, estadoValidacion: "Verificado", ubicacionTexto: "Santiago", estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO" },
  { id: "3", nombreProyecto: "Plaza Central Mall", categoria: 2, estadoValidacion: "Verificado", ubicacionTexto: "Santo Domingo", estadoIntegridad: 1, estadoJuridico: 1, estadoProyecto: "PUBLICADO" }
];

vi.mock("../../features/projects/api/usePublishedProjects", () => ({
  useSuspensePublishedProjects: () => ({ data: MOCK_PROJECTS }),
  filterPublishedProjects: (projects: typeof MOCK_PROJECTS) => projects,
  PROJECT_CATEGORIES: [
    { value: 1, label: "Residencial" },
    { value: 2, label: "Comercial" },
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

  it("renders all mock projects in the directory", async () => {
    renderPage();
    expect(await screen.findByText("Residencial Terra Noble")).toBeInTheDocument();
    expect(screen.getByText("Torre San Gerónimo")).toBeInTheDocument();
    expect(screen.getByText("Plaza Central Mall")).toBeInTheDocument();
  });
});
