import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VerifySearchForm } from "./VerifySearchForm";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "../../../shared/components/ui/Toast/ToastContext";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock projectsApi.consumeQuota used inside handleSubmit via dynamic import
vi.mock("../../projects/api/projectsApi", () => ({
  projectsApi: {
    consumeQuota: vi.fn().mockResolvedValue({ _tag: "Success" }),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderForm = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>
          <VerifySearchForm variant="light" />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );

describe("VerifySearchForm Validation", () => {
  it("should show an error message when RNC format is invalid", async () => {
    renderForm();

    // Change search type to RNC
    const typeButton = screen.getByText(/Tipo:/i);
    fireEvent.click(typeButton);
    
    const rncOption = screen.getByText("RNC");
    fireEvent.click(rncOption);

    // Enter invalid RNC
    const input = screen.getByPlaceholderText(/Ej: 1-01-23456-7/i);
    fireEvent.change(input, { target: { value: "INVALID-RNC" } });
    
    const submitButton = screen.getByRole("button", { name: /CONSULTAR RNC/i });
    fireEvent.click(submitButton);

    // Expect Error message (This should fail currently as it's not implemented)
    expect(screen.getByText(/Formato de RNC inválido/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should show an error message when Cédula format is invalid", async () => {
    renderForm();

    // Change search type to Cédula
    const typeButton = screen.getByText(/Tipo:/i);
    fireEvent.click(typeButton);
    
    const cedulaOption = screen.getByText("Cédula");
    fireEvent.click(cedulaOption);

    // Enter invalid Cédula
    const input = screen.getByPlaceholderText(/Ej: 402-1234567-8/i);
    fireEvent.change(input, { target: { value: "402-1" } });
    
    const submitButton = screen.getByRole("button", { name: /CONSULTAR Cédula/i });
    fireEvent.click(submitButton);

    // Expect Error message
    expect(screen.getByText(/Formato de Cédula inválido/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should show an error message when Sello VeriFinca format is invalid", async () => {
    renderForm();

    // Default is Sello, but let's be explicit
    const input = screen.getByPlaceholderText(/Ej: VF-2026-X83L/i);
    fireEvent.change(input, { target: { value: "VF-123" } });
    
    const submitButton = screen.getByRole("button", { name: /CONSULTAR Sello VeriFinca/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Formato de Sello VeriFinca inválido/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should show an error message when Suelo format is invalid", async () => {
    renderForm();

    const typeButton = screen.getByText(/Tipo:/i);
    fireEvent.click(typeButton);
    
    const sueloOption = screen.getByText("Número Suelo");
    fireEvent.click(sueloOption);

    const input = screen.getByPlaceholderText(/Ej: 001-02-003/i);
    fireEvent.change(input, { target: { value: "001-02" } });
    
    const submitButton = screen.getByRole("button", { name: /CONSULTAR Número Suelo/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Formato de Número Suelo inválido/i)).toBeInTheDocument();
  });

  it("should navigate correctly when inputs are valid", async () => {
    renderForm();

    const input = screen.getByPlaceholderText(/Ej: VF-2026-X83L/i);
    fireEvent.change(input, { target: { value: "VF-2026-X83L" } });
    
    const submitButton = screen.getByRole("button", { name: /CONSULTAR Sello VeriFinca/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/projects?type=cert&q=VF-2026-X83L");
    });
  });
});