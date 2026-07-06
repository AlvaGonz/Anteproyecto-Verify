import { render, screen, fireEvent } from "@testing-library/react";
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

// Mock AuthContext
vi.mock("../../../../shared/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
  }),
}));

// Mock react-to-print
const mockHandlePrint = vi.fn();
vi.mock("react-to-print", () => ({
  useReactToPrint: () => mockHandlePrint,
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

    expect(screen.getByText(/legal\.billing\.title/i)).toBeInTheDocument();
  });

  it("renders the print/download PDF button when dropdown is opened", () => {
    render(
      <BrowserRouter>
        <LegalPage />
      </BrowserRouter>
    );

    // Open the dropdown by clicking the navigation button
    const navButton = screen.getByRole("button", { name: /términos de servicio/i });
    fireEvent.click(navButton);

    // Now the "Descargar PDF" button should be visible
    const printButton = screen.getByRole("button", { name: /descargar pdf/i });
    expect(printButton).toBeInTheDocument();
  });

  it("does NOT call window.print() when print button is clicked", () => {
    const originalPrint = window.print;
    window.print = vi.fn();

    render(
      <BrowserRouter>
        <LegalPage />
      </BrowserRouter>
    );

    // Open the dropdown
    const navButton = screen.getByRole("button", { name: /términos de servicio/i });
    fireEvent.click(navButton);

    // Click the print button
    const printButton = screen.getByRole("button", { name: /descargar pdf/i });
    fireEvent.click(printButton);

    // window.print should NOT be called (we use react-to-print instead)
    expect(window.print).not.toHaveBeenCalled();

    window.print = originalPrint;
  });

  it("calls the react-to-print handler when print button is clicked", () => {
    mockHandlePrint.mockClear();

    render(
      <BrowserRouter>
        <LegalPage />
      </BrowserRouter>
    );

    // Open the dropdown
    const navButton = screen.getByRole("button", { name: /términos de servicio/i });
    fireEvent.click(navButton);

    // Click the print button
    const printButton = screen.getByRole("button", { name: /descargar pdf/i });
    fireEvent.click(printButton);

    // The react-to-print handler should be called
    expect(mockHandlePrint).toHaveBeenCalled();
  });
});