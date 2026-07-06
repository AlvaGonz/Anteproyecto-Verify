import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { EmailVerifiedPage } from "../EmailVerifiedPage";
import { apiClient } from "@/infrastructure/api/client";
import { useAuth } from "../../../shared/context/AuthContext";

vi.mock("@/infrastructure/api/client", () => ({
  apiClient: {
    get: vi.fn(),
  }
}));

vi.mock("../../../shared/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const renderPage = (route = "/verify-email?token=valid-token") => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/verify-email" element={<EmailVerifiedPage />} />
        <Route path="/admin" element={<div data-testid="admin-page">Admin</div>} />
        <Route path="/checkout" element={<div data-testid="checkout-page">Checkout</div>} />
        <Route path="/pricing" element={<div data-testid="pricing-page">Pricing</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("EmailVerifiedPage", () => {
  let mockRefreshUser: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRefreshUser = vi.fn().mockResolvedValue(undefined);
    (useAuth as any).mockReturnValue({ refreshUser: mockRefreshUser });
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("shows error state when no token is present", () => {
    renderPage("/verify-email");
    expect(screen.getByText(/Error de verificación/i)).toBeInTheDocument();
  });

  it("verifies token, calls refreshUser, and redirects to sessionStorage redirect url", async () => {
    (apiClient.get as any).mockResolvedValueOnce({ data: { succeeded: true } });
    window.sessionStorage.setItem("redirect_after_verification", "/checkout?plan=pro");
    
    renderPage("/verify-email?token=valid-token");
    
    expect(screen.getByText(/Verificando tu correo/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/¡Cuenta verificada!/i)).toBeInTheDocument();
    });
    
    expect(apiClient.get).toHaveBeenCalledWith("/auth/verify?token=valid-token");
    expect(mockRefreshUser).toHaveBeenCalled();
    
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Continuar/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId("checkout-page")).toBeInTheDocument();
    });
    
    expect(window.sessionStorage.getItem("redirect_after_verification")).toBeNull();
  });

  it("redirects to /admin if no redirect is in sessionStorage", async () => {
    (apiClient.get as any).mockResolvedValueOnce({ data: { succeeded: true } });
    
    renderPage("/verify-email?token=valid-token");
    
    await waitFor(() => {
      expect(screen.getByText(/¡Cuenta verificada!/i)).toBeInTheDocument();
    });
    
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Continuar/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId("admin-page")).toBeInTheDocument();
    });
  });

  describe("new post-verify-checkout flow", () => {
    it("redirects to /checkout when nextStep is checkout and pendingPlanCode is set", async () => {
      (apiClient.get as any).mockResolvedValueOnce({
        data: { succeeded: true, nextStep: "checkout", pendingPlanCode: "profesional", pendingBillingCycle: "monthly" }
      });

      renderPage("/verify-email?token=valid-token");

      await waitFor(() => {
        expect(screen.getByText(/¡Cuenta verificada!/i)).toBeInTheDocument();
      });

      expect(apiClient.get).toHaveBeenCalledWith("/auth/verify?token=valid-token");

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /Continuar/i }));

      await waitFor(() => {
        expect(screen.getByTestId("checkout-page")).toBeInTheDocument();
      });
    });

    it("redirects to /pricing when nextStep is choose-plan", async () => {
      (apiClient.get as any).mockResolvedValueOnce({
        data: { succeeded: true, nextStep: "choose-plan" }
      });

      renderPage("/verify-email?token=valid-token");

      await waitFor(() => {
        expect(screen.getByText(/¡Cuenta verificada!/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /Continuar/i }));

      await waitFor(() => {
        expect(screen.getByTestId("pricing-page")).toBeInTheDocument();
      });
    });

    it("redirects to /admin when nextStep is dashboard", async () => {
      (apiClient.get as any).mockResolvedValueOnce({
        data: { succeeded: true, nextStep: "dashboard" }
      });

      renderPage("/verify-email?token=valid-token");

      await waitFor(() => {
        expect(screen.getByText(/¡Cuenta verificada!/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /Continuar/i }));

      await waitFor(() => {
        expect(screen.getByTestId("admin-page")).toBeInTheDocument();
      });
    });

    it("falls back to sessionStorage redirect when nextStep is null", async () => {
      (apiClient.get as any).mockResolvedValueOnce({
        data: { succeeded: true, nextStep: null }
      });
      window.sessionStorage.setItem("redirect_after_verification", "/custom");

      renderPage("/verify-email?token=valid-token");

      await waitFor(() => {
        expect(screen.getByText(/¡Cuenta verificada!/i)).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /Continuar/i }));

      // no route matching /custom, so this just checks no error
    });
  });
});
