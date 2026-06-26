import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyProfileForm } from '../MyProfileForm';
import { useAuth } from '../../../../shared/context/AuthContext';
import { ToastProvider } from '../../../../shared/components/ui/Toast/ToastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../../../../shared/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('MyProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render email and role as inputs', () => {
    (useAuth as any).mockReturnValue({
      user: {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        role: 'user',
      },
      isAuthenticated: true,
      loading: false,
    });

    renderWithProviders(<MyProfileForm />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Usuario')).toBeInTheDocument();

    const inputs = screen.queryAllByRole('textbox');
    const inputValues = inputs.map(i => (i as HTMLInputElement).value);
    expect(inputValues).not.toContain('test@example.com');
    expect(inputValues).not.toContain('Usuario');
  });
});
