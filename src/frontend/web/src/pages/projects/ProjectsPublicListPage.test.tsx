import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectsPublicListPage } from "./ProjectsPublicListPage";

describe("ProjectsPublicListPage", () => {
  it("renders the directory with hero title and search form", () => {
    render(
      <MemoryRouter>
        <ProjectsPublicListPage />
      </MemoryRouter>
    );

    // Hero title
    expect(screen.getByText(/Cero Incertidumbre En Su/i)).toBeInTheDocument();
    // Search input (default VF placeholder)
    expect(screen.getByPlaceholderText(/Ej: VF-2026-X83L/i)).toBeInTheDocument();
  });

  it("renders mock projects list in the directory", () => {
    render(
      <MemoryRouter>
        <ProjectsPublicListPage />
      </MemoryRouter>
    );

    // Mock projects
    expect(screen.getByText("Residencial Terra Noble")).toBeInTheDocument();
    expect(screen.getByText("Torre San Gerónimo")).toBeInTheDocument();
    expect(screen.getByText("Plaza Central Mall")).toBeInTheDocument();
  });
});
