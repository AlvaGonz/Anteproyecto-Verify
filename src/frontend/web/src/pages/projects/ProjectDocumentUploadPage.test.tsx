import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProjectDocumentUploadPage } from "./ProjectDocumentUploadPage";
import { MemoryRouter } from "react-router-dom";

// Mock the ProfessionalLayout to avoid sidebar issues in test
vi.mock("../../shared/components/layout/ProfessionalLayout", () => ({
  ProfessionalLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ProjectDocumentUploadPage", () => {
  it("renders the wizard header and step 2 info", () => {
    render(
      <MemoryRouter>
        <ProjectDocumentUploadPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/PASO 2/i)).toBeDefined();
    expect(screen.getByText(/Arrastre/i)).toBeDefined();
  });

  it("displays the project info card with correct ID", () => {
    render(
      <MemoryRouter>
        <ProjectDocumentUploadPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/EXP-2024-001/i)).toBeDefined();
  });

  it("lists the default files", () => {
    render(
      <MemoryRouter>
        <ProjectDocumentUploadPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/ESCRITURA_PROPIEDAD.PDF/i)).toBeDefined();
    expect(screen.getByText(/CEDULA_PROPIETARIO.JPG/i)).toBeDefined();
  });
});
