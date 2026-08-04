import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouterProvider } from "react-router-dom";

vi.mock("../../pages/projects/ProjectPublicDetailPage", () => ({
  default: () => <div data-testid="public-project-page">Proyecto Público</div>,
  ProjectPublicDetailPage: () => <div data-testid="public-project-page">Proyecto Público</div>,
}));

vi.mock("../../pages/auth/LoginPage", () => ({
  default: () => <div data-testid="login-page">Login</div>,
  LoginPage: () => <div data-testid="login-page">Login</div>,
}));

vi.mock("../../shared/context/AuthContext", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, loading: false }),
}));

describe("Ruta pública /p/:slug", () => {
  beforeEach(() => {
    window.location.hash = "#/p/proj-123";
    vi.resetModules();
  });

  it("permite ver el proyecto público sin estar autenticado", async () => {
    const { router } = await import("../index");

    render(<RouterProvider router={router} />);

    expect(await screen.findByTestId("public-project-page")).toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });
});
