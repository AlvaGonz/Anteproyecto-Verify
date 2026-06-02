import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { LegalPage } from "../LegalPage";
import { describe, it, expect, vi, beforeAll } from "vitest";

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

beforeAll(() => {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  window.IntersectionObserver = MockIntersectionObserver as any;
  (globalThis as any).IntersectionObserver = MockIntersectionObserver;
});

describe("LegalPage", () => {
  it("renders the LegalPage and utilizes internationalized translation keys", () => {
    render(
      <BrowserRouter>
        <LegalPage />
      </BrowserRouter>
    );

    // Assert that the page renders the complianceCenter i18n key rather than hardcoded Spanish
    expect(screen.getByText("legal.complianceCenter")).toBeInTheDocument();
  });
});
