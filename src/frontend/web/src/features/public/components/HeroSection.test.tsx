import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HeroSection } from "./HeroSection";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "../../../shared/components/ui/Toast/ToastContext";

vi.mock("../../../shared/context/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "user-1", email: "test@example.com", role: "User" },
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe("HeroSection Component", () => {
  it("renders the hero headline and search form correctly without dropdown", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <HeroSection />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Seguridad técnica y jurídica en un clic/i);
    expect(screen.getByPlaceholderText(/Nombre del proyecto o código de verificación.../i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Consultar Ahora/i })).toBeInTheDocument();
    expect(screen.queryByText(/Tipo:/i)).not.toBeInTheDocument();
  });
});
