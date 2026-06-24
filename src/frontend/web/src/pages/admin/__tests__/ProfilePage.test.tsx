import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfilePage } from '../ProfilePage';
import { useAuth } from '../../../shared/context/AuthContext';
import { ToastProvider } from '../../../shared/components/ui/Toast/ToastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../../../shared/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const mockUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin' as const,
  telefono: '8095551234',
  cedula: '00112345678'
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('should render email, role and cedula as text, not inputs', () => {
    renderWithProviders(<ProfilePage />);

    // Check that email, role and cedula are rendered as text in the document
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('00112345678')).toBeInTheDocument();

    // Verify they are not inputs. 
    // We have only 2 or 5 inputs (name, telefono, currentPassword, newPassword, confirmPassword)
    // none of which should have the value of the email, role or cedula.
    const inputs = screen.queryAllByRole('textbox');
    const passwordInputs = screen.queryAllByLabelText(/contraseña/i);
    
    // Name and telefono are textbox
    expect(inputs.length).toBe(2);
    
    const inputValues = inputs.map(i => (i as HTMLInputElement).value);
    expect(inputValues).not.toContain('john@example.com');
    expect(inputValues).not.toContain('admin');
    expect(inputValues).not.toContain('00112345678');
  });

  it('should show error when newPassword is provided but currentPassword is empty', async () => {
    renderWithProviders(<ProfilePage />);
    const user = userEvent.setup();

    // Open password section
    const toggleButton = screen.getByText('Cambiar contraseña');
    await user.click(toggleButton);

    // Find the new password input and type
    const newPasswordInput = screen.getByLabelText(/Nueva Contraseña/i, { selector: 'input' });
    await user.type(newPasswordInput, 'Valid123!');

    // Find submit button and click
    const submitBtn = screen.getByRole('button', { name: /Guardar Cambios/i });
    await user.click(submitBtn);

    // Wait for the validation error to appear
    await waitFor(() => {
      expect(screen.getByText('Debes ingresar tu contraseña actual')).toBeInTheDocument();
    });
  });
});
