import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginPage } from "../LoginPage";
import { useAuth } from "../../../shared/context/AuthContext";

vi.mock("../../../shared/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

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
    AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
  };
});

const renderPage = (route = "/login") => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
        <Route path="/checkout" element={<div data-testid="checkout">Checkout</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("LoginPage", () => {
  let mockLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin = vi.fn().mockResolvedValue(undefined);
    (useAuth as any).mockReturnValue({ login: mockLogin });
  });

  it("renders login form", () => {
    renderPage();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
  });

  it("redirects to /admin/dashboard on successful login when no redirect param is present", async () => {
    const user = userEvent.setup();
    renderPage("/login");
    
    await user.type(screen.getByLabelText(/Correo electrónico/i), "admin@example.com");
    await user.type(screen.getByLabelText(/Contraseña/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@example.com", "Password123!");
    });
    
    await waitFor(() => {
      expect(screen.getByTestId("dashboard")).toBeInTheDocument();
    });
  });

  it("redirects to the redirect param on successful login", async () => {
    const user = userEvent.setup();
    renderPage("/login?redirect=%2Fcheckout%3Fplan%3Dpro");
    
    await user.type(screen.getByLabelText(/Correo electrónico/i), "admin@example.com");
    await user.type(screen.getByLabelText(/Contraseña/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@example.com", "Password123!");
    });
    
    await waitFor(() => {
      expect(screen.getByTestId("checkout")).toBeInTheDocument();
    });
  });
});
