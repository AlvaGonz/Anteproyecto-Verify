import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectsPublicListPage } from "./ProjectsPublicListPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../../features/projects/api/useSearchPublicProjects", () => ({
  useSearchPublicProjects: () => ({
    data: [
      { id: "1", nombreProyecto: "Residencial Terra Noble", categoria: "Residencial", estadoValidacion: "Verificado", ubicacionTexto: "Santo Domingo" },
      { id: "2", nombreProyecto: "Torre San Gerónimo", categoria: "Comercial", estadoValidacion: "Verificado", ubicacionTexto: "Santiago" },
      { id: "3", nombreProyecto: "Plaza Central Mall", categoria: "Comercial", estadoValidacion: "Verificado", ubicacionTexto: "Santo Domingo" }
    ],
    isLoading: false,
    isError: false,
  })
}));

// Mock AuthContext
vi.mock("../../shared/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
  }),
}));

describe("ProjectsPublicListPage", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  it("renders the directory with hero title and search form", () => {
    renderWithProviders(<ProjectsPublicListPage />);

    // Hero title
    expect(screen.getByText(/Cero Incertidumbre En Su/i)).toBeInTheDocument();
    // Search input (default VF placeholder)
    expect(screen.getByPlaceholderText(/Ej: VF-2026-X83L/i)).toBeInTheDocument();
  });

  it("renders mock projects list in the directory", () => {
    renderWithProviders(<ProjectsPublicListPage />);

    // Mock projects
    expect(screen.getByText("Residencial Terra Noble")).toBeInTheDocument();
    expect(screen.getByText("Torre San Gerónimo")).toBeInTheDocument();
    expect(screen.getByText("Plaza Central Mall")).toBeInTheDocument();
  });
});
