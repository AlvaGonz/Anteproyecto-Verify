import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoogleOAuthProvider } from "@react-oauth/google";
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
    <GoogleOAuthProvider clientId="test-client-id">
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
          <Route path="/checkout" element={<div data-testid="checkout">Checkout</div>} />
          <Route path="/pricing" element={<div data-testid="pricing">Pricing</div>} />
        </Routes>
      </MemoryRouter>
    </GoogleOAuthProvider>
  );
};

// ponytail: LoginForm checks `if (!user) return` — login mock must return a user object
const defaultUser = {
  id: "u1",
  email: "admin@example.com",
  subscriptionStatus: "active",
  rol: "Administrator",
};

describe("LoginPage", () => {
  let mockLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin = vi.fn().mockResolvedValue(defaultUser);
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

  it("redirects to checkout when user has pending plan and no active subscription", async () => {
    mockLogin = vi.fn().mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      pendingPlanCode: "profesional",
      pendingBillingCycle: "monthly",
      subscriptionStatus: null,
    });
    (useAuth as any).mockReturnValue({ login: mockLogin });

    const user = userEvent.setup();
    renderPage("/login");

    await user.type(screen.getByLabelText(/Correo electrónico/i), "user@example.com");
    await user.type(screen.getByLabelText(/Contraseña/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByTestId("checkout")).toBeInTheDocument();
    });
  });

  it("redirects to dashboard when user has pending plan but active subscription", async () => {
    mockLogin = vi.fn().mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      pendingPlanCode: "profesional",
      pendingBillingCycle: "monthly",
      subscriptionStatus: "active",
    });
    (useAuth as any).mockReturnValue({ login: mockLogin });

    const user = userEvent.setup();
    renderPage("/login");

    await user.type(screen.getByLabelText(/Correo electrónico/i), "user@example.com");
    await user.type(screen.getByLabelText(/Contraseña/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByTestId("dashboard")).toBeInTheDocument();
    });
  });
});
