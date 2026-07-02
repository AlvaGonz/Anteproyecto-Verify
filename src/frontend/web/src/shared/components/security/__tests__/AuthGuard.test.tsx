import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthGuard } from "../AuthGuard";
import { useAuth } from "../../../context/AuthContext";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}{location.search}</div>;
};

const renderGuard = (initialRoute: string) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<LocationDisplay />} />
        <Route path="/register" element={<LocationDisplay />} />
        <Route path="/*" element={
          <AuthGuard>
            <div data-testid="protected-content">Protected Content</div>
          </AuthGuard>
        } />
      </Routes>
    </MemoryRouter>
  );
};

describe("AuthGuard", () => {
  it("shows loading state when auth is loading", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false, loading: true });
    const { container } = renderGuard("/dashboard");
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true, loading: false });
    renderGuard("/dashboard");
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to /login for normal routes", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false, loading: false });
    renderGuard("/dashboard");
    expect(screen.getByTestId("location-display")).toHaveTextContent("/login");
  });

  it("redirects unauthenticated users to /register for checkout routes and preserves redirect param", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false, loading: false });
    renderGuard("/checkout?plan=pro");
    expect(screen.getByTestId("location-display")).toHaveTextContent("/register?redirect=%2Fcheckout%3Fplan%3Dpro");
  });
});
