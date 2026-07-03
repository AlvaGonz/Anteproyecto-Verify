import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PricingPage } from "../PricingPage";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual as any,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
      h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock react-i18next translation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  };
});

// We need to control the mock of AuthContext
const mockUseAuth = vi.fn();
vi.mock("../../../../shared/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("PricingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the PricingPage and utilizes internationalized translation keys", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    expect(screen.getByText("pricing.header.tag")).toBeInTheDocument();
  });

  it("navigates to /register when clicking Free plan and unauthenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    const freeButton = screen.getByText("pricing.cards.free.button");
    fireEvent.click(freeButton);

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  it("navigates to /dashboard when clicking Free plan and authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    const freeButton = screen.getByText("pricing.cards.free.button");
    fireEvent.click(freeButton);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("navigates to /register with redirect param when clicking Professional plan and unauthenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    const proButton = screen.getByText("pricing.cards.pro.button");
    fireEvent.click(proButton);

    expect(mockNavigate).toHaveBeenCalledWith("/register?redirect=%2Fcheckout%3Fplan%3Dprofesional%26billing%3Dmonthly");
  });

  it("navigates to /checkout when clicking Professional plan and authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    const proButton = screen.getByText("pricing.cards.pro.button");
    fireEvent.click(proButton);

    expect(mockNavigate).toHaveBeenCalledWith("/checkout?plan=profesional&billing=monthly");
  });

  it("displays correct USD prices for monthly subscription plans", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    expect(screen.getByText("$60 USD")).toBeInTheDocument();
    expect(screen.getByText("$170 USD")).toBeInTheDocument();
    expect(screen.getByText("$500 USD")).toBeInTheDocument();
  });

  it("displays correct USD prices with 20% discount for annual subscription plans", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    const yearlyButton = screen.getByText("pricing.header.yearly");
    fireEvent.click(yearlyButton);

    expect(screen.getByText("$48 USD")).toBeInTheDocument();
    expect(screen.getByText("$136 USD")).toBeInTheDocument();
    expect(screen.getByText("$400 USD")).toBeInTheDocument();
  });
});
