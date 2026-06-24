import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../shared/components/layout/Sidebar';
import { AuthProvider } from '../shared/context/AuthContext';
import { AuthService } from '../features/auth/services/AuthService';
import { some } from '../shared/utils/functional';

// Mock AuthService
vi.mock('../features/auth/services/AuthService', () => ({
  AuthService: {
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  }
}));

// Mock useProjects
vi.mock('../features/projects/api/useProjects', () => ({
  useProjects: () => ({ data: [] })
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Cerrar Sesión button and calls logout on click', async () => {
    const mockUser = {
      id: '123',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    };

    // Mock getCurrentUser to return the user
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(some(mockUser));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Sidebar />
        </AuthProvider>
      </BrowserRouter>
    );

    // Find the button (it should appear after AuthContext initializes)
    const logoutButton = await screen.findByRole('button', { name: /Cerrar Sesión/i });
    expect(logoutButton).toBeInTheDocument();

    // Click it
    fireEvent.click(logoutButton);

    // Assert logout was called
    expect(AuthService.logout).toHaveBeenCalled();
  });
});
