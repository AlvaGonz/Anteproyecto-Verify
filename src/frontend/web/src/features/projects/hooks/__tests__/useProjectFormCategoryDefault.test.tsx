import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("leaflet", () => ({
  default: {
    Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
    map: vi.fn(() => ({
      setView: vi.fn(),
      on: vi.fn(),
      flyTo: vi.fn(),
      invalidateSize: vi.fn(),
      remove: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn(() => ({ addTo: vi.fn(), setLatLng: vi.fn() })),
  },
}));
vi.mock("leaflet/dist/leaflet.css", () => ({}));
vi.mock("leaflet/dist/images/marker-icon-2x.png", () => ({ default: "" }));
vi.mock("leaflet/dist/images/marker-icon.png", () => ({ default: "" }));
vi.mock("leaflet/dist/images/marker-shadow.png", () => ({ default: "" }));

vi.mock("../../../../shared/context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  QueryClient: class {},
}));

vi.mock("../../../provinces/api/useProvinces", () => ({
  useProvinces: () => ({ data: [] }),
}));

vi.mock("../../api/useCategories", () => ({
  useCategories: () => ({
    data: [
      { id: 1, nombre: "ALBERGUES", descripcion: null },
      { id: 16, nombre: "VIVIENDAS", descripcion: null },
    ],
  }),
}));

import { useProjectForm } from "../useProjectForm";

function Probe() {
  const { basicFields } = useProjectForm({
    initialData: undefined,
    onSubmit: async () => {},
    onCancel: () => {},
  });
  return <div data-testid="default-categoria-id">{basicFields.categoriaId}</div>;
}

describe("useProjectForm category default", () => {
  it("defaults categoriaId to the first API-sourced category, not a hardcoded magic number", () => {
    render(<Probe />);
    expect(screen.getByTestId("default-categoria-id").textContent).toBe("1");
  });
});
