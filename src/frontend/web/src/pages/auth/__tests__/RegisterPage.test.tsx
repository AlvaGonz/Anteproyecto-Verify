import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { RegisterPage } from "../RegisterPage";
import { ToastProvider } from "../../../shared/components/ui/Toast/ToastContext";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...(actual as object),
    motion: {
      div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...props}>{children}</div>
      ),
      button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <button {...props}>{children}</button>
      ),
    },
  };
});

describe("RegisterPage", () => {
  const renderPage = () =>
    render(
      <BrowserRouter>
        <ToastProvider>
          <RegisterPage />
        </ToastProvider>
      </BrowserRouter>
    );

  it("renders TRD professional registration fields", () => {
    renderPage();

    expect(screen.getByPlaceholderText("Nombre")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Apellido")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Teléfono")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Cédula")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña de acceso")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear mi cuenta/i })).toBeInTheDocument();
  });
});
