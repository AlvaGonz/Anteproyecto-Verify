import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectsPublicListPage } from "./ProjectsPublicListPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../../features/projects/api/useProjects", () => ({
  useProjects: () => ({
    data: [
      { id: 1, nombre: "Residencial Terra Noble", categoria: "Residencial", estado: "Aprobado", idVerificacionPublica: "VF-1" },
      { id: 2, nombre: "Torre San Gerónimo", categoria: "Comercial", estado: "Aprobado", idVerificacionPublica: "VF-2" },
      { id: 3, nombre: "Plaza Central Mall", categoria: "Comercial", estado: "Aprobado", idVerificacionPublica: "VF-3" }
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
