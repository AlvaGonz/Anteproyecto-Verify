import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectForm } from "./ProjectForm";

describe("ProjectForm", () => {
  it("renders form fields", () => {
    render(<ProjectForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/Nombre del Proyecto/i)).toBeDefined();
    expect(screen.getByLabelText(/Ubicación/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Guardar/i })).toBeDefined();
  });

  it("calls onSubmit with correct data", async () => {
    const handleSubmit = vi.fn();
    render(<ProjectForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

    const nameInput = screen.getByLabelText(/Nombre del Proyecto/i);
    const locationInput = screen.getByLabelText(/Ubicación/i);
    const submitButton = screen.getByRole("button", { name: /Guardar/i });

    fireEvent.change(nameInput, { target: { value: "Nuevo Proyecto" } });
    fireEvent.change(locationInput, { target: { value: "Nueva Ubicacion" } });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "Nuevo Proyecto",
        ubicacionTexto: "Nueva Ubicacion",
      }),
    );
  });
});
