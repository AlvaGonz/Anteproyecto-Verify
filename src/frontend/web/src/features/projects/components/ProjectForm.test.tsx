import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectForm } from "./ProjectForm";
import { AuthProvider } from "../../../shared/context/AuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useAuth so we don't need the real AuthProvider which causes state update act() warnings.
vi.mock("../../../shared/context/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "1", role: "DEVELOPER" },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

// Also mock Leaflet since jsdom doesn't have a real canvas/DOM layout engine.
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

// Suppress leaflet.css import in jsdom
vi.mock("leaflet/dist/leaflet.css", () => ({}));
vi.mock("leaflet/dist/images/marker-icon-2x.png", () => ({ default: "" }));
vi.mock("leaflet/dist/images/marker-icon.png", () => ({ default: "" }));
vi.mock("leaflet/dist/images/marker-shadow.png", () => ({ default: "" }));

vi.mock("../api/useCategories", () => ({
  useCategories: () => ({
    data: [
      { id: 1, nombre: "ALBERGUES", descripcion: null },
      { id: 16, nombre: "VIVIENDAS", descripcion: null },
    ],
  }),
}));

const queryClient = new QueryClient();

const renderWithAuth = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );

describe("ProjectForm", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("renders form fields", () => {
    renderWithAuth(<ProjectForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/Nombre del Proyecto/i)).toBeDefined();
    expect(screen.getByLabelText(/Provincia/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Guardar/i })).toBeDefined();
  });

  it("disables save button when required fields are empty", () => {
    renderWithAuth(<ProjectForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const submitButton = screen.getByRole("button", { name: /Guardar/i }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it("calls onSubmit with correct data when form is filled", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<ProjectForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

    const nameInput = screen.getByLabelText(/Nombre del Proyecto/i);
    const provinciaSelect = screen.getByLabelText(/Provincia/i);
    const submitButton = screen.getByRole("button", { name: /Guardar/i });

    fireEvent.change(nameInput, { target: { value: "Residencial Las Palmas" } });
    fireEvent.change(provinciaSelect, { target: { value: "Santiago" } });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "Residencial Las Palmas",
        ubicacionTexto: "Santiago",
      }),
    );
  });
});
