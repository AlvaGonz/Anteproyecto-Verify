import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { VerifySearchForm, detectSearchType } from "./VerifySearchForm";
import { MemoryRouter } from "react-router-dom";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderForm = (variant: "light" | "dark" = "light", onSearch?: (type: string, query: string) => void) =>
  render(
    <MemoryRouter>
      <VerifySearchForm variant={variant} onSearch={onSearch} />
    </MemoryRouter>
  );

describe("detectSearchType helper", () => {
  it("should detect cert type for VF-formatted or VF-prefix strings", () => {
    expect(detectSearchType("VF-2026-X83L")).toBe("cert");
    expect(detectSearchType("vf-2026-1234")).toBe("cert");
    expect(detectSearchType("VF999")).toBe("cert");
  });

  it("should detect rnc type for 9 or 11 digit numbers", () => {
    expect(detectSearchType("101234567")).toBe("rnc");
    expect(detectSearchType("101-23456-7")).toBe("rnc");
    expect(detectSearchType("10123456789")).toBe("rnc");
  });

  it("should detect ipi type for 12 digit numbers", () => {
    expect(detectSearchType("101999999999")).toBe("ipi");
  });

  it("should fallback to suelo for general text or names", () => {
    expect(detectSearchType("Torre Bella")).toBe("suelo");
    expect(detectSearchType("12345")).toBe("suelo");
  });
});

describe("VerifySearchForm - Light Variant (Landing Page Hero)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the hero search bar without any dropdown", () => {
    renderForm("light");

    expect(screen.getByPlaceholderText(/Nombre del proyecto o código de verificación.../i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Consultar Ahora/i })).toBeInTheDocument();
    expect(screen.queryByText(/Tipo:/i)).not.toBeInTheDocument();
  });

  it("should NOT redirect to /login when an unauthenticated user submits a search on light variant", async () => {
    renderForm("light");

    const input = screen.getByPlaceholderText(/Nombre del proyecto o código de verificación.../i);
    fireEvent.change(input, { target: { value: "Torre Bella" } });

    const button = screen.getByRole("button", { name: /Consultar Ahora/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalledWith("/login");
      expect(mockNavigate).toHaveBeenCalledWith("/projects?search=Torre%20Bella");
    });
  });

  it("should navigate to /projects with detected cert type for certificate code", async () => {
    renderForm("light");

    const input = screen.getByPlaceholderText(/Nombre del proyecto o código de verificación.../i);
    fireEvent.change(input, { target: { value: "VF-2026-X83L" } });

    const button = screen.getByRole("button", { name: /Consultar Ahora/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/projects?type=cert&q=VF-2026-X83L");
    });
  });

  it("should navigate to /projects with detected rnc type for RNC code", async () => {
    renderForm("light");

    const input = screen.getByPlaceholderText(/Nombre del proyecto o código de verificación.../i);
    fireEvent.change(input, { target: { value: "101234567" } });

    const button = screen.getByRole("button", { name: /Consultar Ahora/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/projects?type=rnc&q=101234567");
    });
  });

  it("should call onSearch callback if provided", async () => {
    const onSearchMock = vi.fn();
    renderForm("light", onSearchMock);

    const input = screen.getByPlaceholderText(/Nombre del proyecto o código de verificación.../i);
    fireEvent.change(input, { target: { value: "Torre Bella" } });

    const button = screen.getByRole("button", { name: /Consultar Ahora/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearchMock).toHaveBeenCalledWith("suelo", "Torre Bella");
    });
  });
});

describe("VerifySearchForm - Dark Variant (Projects Page)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the dropdown selector with type options", () => {
    renderForm("dark");

    const typeButton = screen.getByText(/Tipo:/i);
    expect(typeButton).toBeInTheDocument();

    fireEvent.click(typeButton);
    expect(screen.getAllByText("RNC").length).toBeGreaterThan(0);
    expect(screen.getByText("IPI")).toBeInTheDocument();
  });

  it("should allow searching with explicit type selected from dropdown", async () => {
    renderForm("dark");

    const typeButton = screen.getByText(/Tipo:/i);
    fireEvent.click(typeButton);

    const rncOption = screen.getAllByText("RNC").pop()!;
    fireEvent.click(rncOption);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "101234567" } });

    const submitButton = screen.getByRole("button", { name: /CONSULTAR/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/projects?type=rnc&q=101234567");
    });
  });
});