import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterPage } from "../RegisterPage";
import { ToastProvider } from "../../../shared/components/ui/Toast/ToastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRegister } from "../../../features/auth/api/useAuth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { registerSchema } from "../../../features/auth/schemas";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../../shared/context/AuthContext", () => ({
  useAuth: vi.fn(() => ({ googleLogin: vi.fn() })),
}));

vi.mock("../../../features/auth/api/useAuth", () => ({
  useRegister: vi.fn(),
  useResendVerificationEmail: vi.fn(() => ({ mutate: vi.fn(), isPending: false, isSuccess: false })),
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderPage = () =>
  render(
    <GoogleOAuthProvider clientId="test-client-id">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <RegisterPage />
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );

/**
 * Fill every required field in the form with valid data.
 * Must be called with the same `user` instance that later clicks submit.
 */
const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/Nombre completo/i), "Juan");
  await user.type(screen.getByLabelText(/Apellido/i), "Pérez");
  await user.type(screen.getByLabelText(/Correo electrónico/i), "juan@example.com");
  // telefono is mocked — value is set via register("telefono").onChange
  await user.type(screen.getByLabelText(/Teléfono/i), "8095550199");
  // Valid RD cédula (check-digit for 001-0000001-7)
  await user.type(screen.getByLabelText(/Cédula/i), "00100000017");
  await user.type(screen.getByLabelText(/^Contraseña/i), "Password1!");
  await user.click(screen.getByRole("checkbox"));
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("RegisterPage", () => {
  let mockMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();
    (useRegister as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });
  });

  // ── Render ─────────────────────────────────────────────────────────────

  it("renders all registration form fields and submit button", () => {
    renderPage();

    expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cédula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear mi cuenta/i })).toBeInTheDocument();
  });

  it("renders a link to navigate to the login page", () => {
    renderPage();

    const loginLink = screen.getByRole("link", { name: /inicia sesión aquí/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  // ── Field-level validation errors (triggered on submit) ────────────────

  it("displays validation errors when submitting with empty fields", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /crear mi cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/El nombre debe tener al menos 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/El apellido debe tener al menos 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/El correo es requerido/i)).toBeInTheDocument();
    });
  });

  it("shows invalid email format error when email is malformed", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: "not-an-email" } });

    const result = registerSchema.safeParse({
      nombre: "Juan", apellido: "Pérez", email: "not-an-email",
      telefono: "8095550199", cedula: "00112345678",
      password: "Password1!", acceptedTerms: true,
    });
    expect(result.success).toBe(false);
    const emailErrors = result.error?.flatten().fieldErrors.email ?? [];
    expect(emailErrors).toContain("Formato de correo inválido");
  });

  it("shows password too short error when password is fewer than 8 characters", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/^Contraseña/i), { target: { value: "Ab1!" } });

    const result = registerSchema.safeParse({
      nombre: "Juan", apellido: "Pérez", email: "juan@example.com",
      telefono: "8095550199", cedula: "00112345678",
      password: "Ab1!", acceptedTerms: true,
    });
    expect(result.success).toBe(false);
    const passErrors = result.error?.flatten().fieldErrors.password ?? [];
    expect(passErrors).toContain("La contraseña debe tener mínimo 8 caracteres");
  });

  it("shows the first password complexity error when requirements are not met", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/^Contraseña/i), { target: { value: "abcdefgh" } });

    const result = registerSchema.safeParse({
      nombre: "Juan", apellido: "Pérez", email: "juan@example.com",
      telefono: "8095550199", cedula: "00112345678",
      password: "abcdefgh", acceptedTerms: true,
    });
    expect(result.success).toBe(false);
    const passErrors = result.error?.flatten().fieldErrors.password ?? [];
    expect(passErrors).toContain("Debe contener al menos una mayúscula");
  });

  it("shows live password requirements checker when user starts typing", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Contraseña/i), "A");

    expect(screen.getByText(/Requisitos de seguridad/i)).toBeInTheDocument();
    // The checker panel has specific labels distinct from the zod error span
    expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
    expect(screen.getByText(/Al menos 1 Mayúscula/i)).toBeInTheDocument();
    expect(screen.getByText(/Al menos 1 Minúscula/i)).toBeInTheDocument();
    expect(screen.getByText(/Al menos 1 Número/i)).toBeInTheDocument();
    expect(screen.getByText(/Al menos 1 Carácter Especial/i)).toBeInTheDocument();
  });

  // ── Submission states ──────────────────────────────────────────────────

  it("calls register mutation with sanitised form data on valid submission", async () => {
    const user = userEvent.setup();
    renderPage();
    await fillValidForm(user);

    // After fillValidForm the form should be valid — button enabled
    await user.click(screen.getByRole("button", { name: /crear mi cuenta/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    const [data, _options] = mockMutate.mock.calls[0];
    expect(data).toMatchObject({
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@example.com",
    });
    // acceptedTerms must be stripped before the API call
    expect(data).not.toHaveProperty("acceptedTerms");
  });

  it("shows success message after successful registration", async () => {
    mockMutate.mockImplementation(
      (_data: unknown, { onSuccess }: { onSuccess?: () => void }) => {
        onSuccess?.();
      },
    );

    const user = userEvent.setup();
    renderPage();
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: /crear mi cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/Revisa tu correo/i)).toBeInTheDocument();
      // The email address the user typed should appear in the success message
      expect(screen.getByText(/juan@example.com/i)).toBeInTheDocument();
    });
  });

  it("does not submit the form when fields are invalid", async () => {
    const user = userEvent.setup();
    renderPage();

    // Click submit with empty form — handleSubmit validates and prevents onSubmit
    await user.click(screen.getByRole("button", { name: /crear mi cuenta/i }));

    // Validation errors must appear
    await waitFor(() => {
      expect(screen.getByText(/El correo es requerido/i)).toBeInTheDocument();
    });

    // But mutation must not have been called
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows loading state during form submission", async () => {
    (useRegister as any).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    });

    renderPage();

    expect(screen.getByText(/Procesando Registro/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /procesando registro/i })).toBeDisabled();
  });

  it("shows API error alert when registration fails", () => {
    (useRegister as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: new Error("El correo electrónico ya está registrado"),
    });

    renderPage();

    expect(screen.getByText(/El correo electrónico ya está registrado/i)).toBeInTheDocument();
  });
});
