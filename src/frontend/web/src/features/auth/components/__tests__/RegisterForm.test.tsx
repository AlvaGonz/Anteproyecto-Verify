import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterForm } from "../RegisterForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRegister } from "../../api/useAuth";

vi.mock("../../api/useAuth", () => ({
  useRegister: vi.fn(),
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderForm = (route = "/") => {
  window.history.pushState({}, "Test page", route);
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/Nombre completo/i), "Juan");
  await user.type(screen.getByLabelText(/Apellido/i), "Pérez");
  await user.type(screen.getByLabelText(/Correo electrónico/i), "juan@example.com");
  await user.type(screen.getByLabelText(/Teléfono/i), "8095550199");
  await user.type(screen.getByLabelText(/Cédula/i), "00100000017");
  await user.type(screen.getByLabelText(/^Contraseña/i), "Password1!");
  await user.click(screen.getByRole("checkbox"));
};

describe("RegisterForm", () => {
  let mockMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();
    (useRegister as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("stores redirect param in sessionStorage on successful registration", async () => {
    mockMutate.mockImplementation((_data: unknown, { onSuccess }: { onSuccess?: () => void }) => {
      onSuccess?.();
    });

    const user = userEvent.setup();
    renderForm("/register?redirect=%2Fcheckout%3Fplan%3Dpro");
    await fillValidForm(user);
    
    await user.click(screen.getByRole("button", { name: /crear mi cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/Revisa tu correo/i)).toBeInTheDocument();
    });

    expect(window.sessionStorage.getItem("redirect_after_verification")).toBe("/checkout?plan=pro");
    expect(window.localStorage.getItem("redirect_after_verification")).toBeNull();
  });
});
