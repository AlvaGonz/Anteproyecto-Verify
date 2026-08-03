import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsPage } from '../SettingsPage';
import { useAuth } from '../../../shared/context/AuthContext';
import { ToastProvider } from '../../../shared/components/ui/Toast/ToastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '../../../infrastructure/api/client';
import React from 'react';

vi.mock('../../../shared/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../infrastructure/api/client', () => ({
  apiClient: { get: vi.fn() },
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
      refreshUser: vi.fn(),
    });

    renderWithProviders(<SettingsPage />);

    expect(screen.queryByText('Usuarios y Accesos')).not.toBeInTheDocument();
    expect(screen.queryByText('Perfiles y Permisos')).not.toBeInTheDocument();
  });

  it('requests the full user list (no 50-row cap) for the users tab', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', email: 'admin@test.com', role: 'admin' },
      isAuthenticated: true,
      loading: false,
      refreshUser: vi.fn(),
    });

    const users = Array.from({ length: 60 }, (_, i) => ({
      id: `u${i}`,
      nombre: 'User',
      apellido: `${i}`,
      email: `u${i}@test.com`,
      role: 'user',
      telefono: null,
      cedula: null,
      rnc: null,
      razonSocial: null,
      nombreComercial: null,
      planName: 'Profesional',
    }));

    vi.mocked(apiClient.get).mockImplementation(async (url: string) =>
      url === '/admin/users'
        ? { data: { items: users, totalCount: 60, page: 1, pageSize: 50 } }
        : { data: [] }
    );

    renderWithProviders(<SettingsPage />);
    await waitFor(() => expect(screen.getByText('Usuarios y Accesos')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Usuarios y Accesos'));

    await waitFor(() => {
      const usersCall = vi.mocked(apiClient.get).mock.calls.find((c) => c[0] === '/admin/users');
      expect(usersCall).toBeDefined();
      const pageSize = (usersCall![1] as { params: { pageSize: number } }).params.pageSize;
      expect(pageSize).toBeGreaterThan(50);
    });
  });
});
