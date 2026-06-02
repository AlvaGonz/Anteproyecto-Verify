import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PricingPage } from "../PricingPage";
import { describe, it, expect, vi } from "vitest";

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

// Mock AuthContext
vi.mock("../../../../shared/context/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: false,
  }),
}));

describe("PricingPage", () => {
  it("renders the PricingPage and utilizes internationalized translation keys", () => {
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    // Assert that the page renders the pricing header tag i18n key rather than hardcoded Spanish
    expect(screen.getByText("pricing.header.tag")).toBeInTheDocument();
  });
});
