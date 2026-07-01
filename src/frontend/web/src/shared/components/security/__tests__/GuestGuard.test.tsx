import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GuestGuard } from '../GuestGuard';
import { useAuth } from '../../../context/AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the useAuth hook
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('GuestGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children if user is not authenticated', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false, loading: false });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestGuard>
                <div data-testid="guest-content">Guest Content</div>
              </GuestGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('guest-content')).toBeInTheDocument();
  });

  it('redirects to /admin/dashboard if user is authenticated', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true, loading: false });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestGuard>
                <div data-testid="guest-content">Guest Content</div>
              </GuestGuard>
            }
          />
          <Route path="/admin/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    // The guest content should not be rendered
    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
    // The user should be redirected to dashboard
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false, loading: true });

    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestGuard>
                <div data-testid="guest-content">Guest Content</div>
              </GuestGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
