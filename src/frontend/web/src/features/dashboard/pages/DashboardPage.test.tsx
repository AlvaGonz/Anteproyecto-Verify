import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Minimal mock for components to avoid rendering the entire page
vi.mock('../components/DashboardStats', () => ({
  DashboardStats: () => <div data-testid="dashboard-stats" />
}));
vi.mock('../../../components/layout/AppLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>
}));
vi.mock('../../../components/ui/Alert', () => ({
  Alert: ({ children, title }: any) => <div data-testid="alert-banner"><h2>{title}</h2>{children}</div>
}));
vi.mock('../components/ProjectsList', () => ({
  default: () => <div data-testid="projects-list" />
}));
vi.mock('../components/EmptyProjectsState', () => ({
  default: () => <div data-testid="empty-projects" />
}));

describe('DashboardPage', () => {
  const queryClient = new QueryClient();

  const renderWithRouter = (initialEntries: any[]) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders PlanActivatedBanner when planJustActivated is in location state', () => {
    // Arrange & Act
    renderWithRouter([{
      pathname: '/dashboard',
      state: {
        planJustActivated: true,
        activatedPlan: {
          label: 'Profesional',
          queriesPerMonth: 10,
          bgColor: 'bg-primary',
          color: 'text-white'
        }
      }
    }]);

    // Assert: Check if the banner is rendered
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/¡Plan Profesional activado!/i)).toBeInTheDocument();
  });

  it('does not render PlanActivatedBanner when planJustActivated is missing', () => {
    // Arrange & Act
    renderWithRouter([{
      pathname: '/dashboard',
      state: null
    }]);

    // Assert: Check if the banner is NOT rendered
    expect(screen.queryByTestId('alert-banner')).not.toBeInTheDocument();
  });
});
