import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsPage } from '../SettingsPage';
import { useAuth } from '../../../shared/context/AuthContext';
import { ToastProvider } from '../../../shared/components/ui/Toast/ToastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
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

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          {ui}
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should hide admin tabs for non-admin user', () => {
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

    renderWithProviders(<SettingsPage />);

    expect(screen.queryByText('Usuarios y Accesos')).not.toBeInTheDocument();
    expect(screen.queryByText('Perfiles y Permisos')).not.toBeInTheDocument();
  });
});
