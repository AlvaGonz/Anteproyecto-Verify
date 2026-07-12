import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubscriptionSettings } from '../SubscriptionSettings';
import { useMySubscription, useSyncSubscription, useCancelSubscription, useReactivateSubscription } from '../../api/useSettings';
import { MemoryRouter } from 'react-router-dom';

// Mock the hooks
vi.mock('../../api/useSettings', () => ({
  useMySubscription: vi.fn(),
  useSyncSubscription: vi.fn(),
  useCancelSubscription: vi.fn(),
  useReactivateSubscription: vi.fn(),
}));

vi.mock('../PlansModal', () => ({
  PlansModal: () => <div data-testid="plans-modal">Plans Modal</div>
}));

describe('SubscriptionSettings', () => {
  const mockSync = vi.fn();
  const mockCancel = vi.fn();
  const mockReactivate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useSyncSubscription as any).mockReturnValue({ mutate: mockSync, isPending: false });
    (useCancelSubscription as any).mockReturnValue({ mutate: mockCancel, isPending: false });
    (useReactivateSubscription as any).mockReturnValue({ mutate: mockReactivate, isPending: false });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <SubscriptionSettings />
      </MemoryRouter>
    );
  };

  it('renders loading state correctly', () => {
    (useMySubscription as any).mockReturnValue({ isLoading: true, isError: false, data: null });
    renderComponent();
    expect(screen.getByText('Mi Suscripción')).toBeInTheDocument();
  });

  it('renders active subscription state and cancel button', () => {
    (useMySubscription as any).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        subscriptionStatus: 'active',
        plan: 'profesional',
        billingCycle: 'month',
        isManagedByStripe: true,
        currentPeriodEnd: new Date(Date.now() + 86400000 * 10).toISOString() // 10 days from now
      }
    });

    renderComponent();
    expect(screen.getByText('Suscripción Activa')).toBeInTheDocument();
    
    const cancelButton = screen.getByRole('button', { name: /Cancelar Suscripción/i });
    expect(cancelButton).toBeInTheDocument();
    
    // Test cancel flow — button opens a modal, need to confirm in modal
    fireEvent.click(cancelButton);
    const confirmButton = screen.getByRole('button', { name: /Sí, cancelar suscripción/i });
    fireEvent.click(confirmButton);
    expect(mockCancel).toHaveBeenCalled();
  });

  it('renders canceling status badge and reactivate button', () => {
    (useMySubscription as any).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        subscriptionStatus: 'canceling',
        plan: 'profesional',
        billingCycle: 'month',
        isManagedByStripe: true,
        currentPeriodEnd: new Date(Date.now() + 86400000 * 5).toISOString() // 5 days from now
      }
    });

    renderComponent();
    expect(screen.getByText('Cancelación Programada')).toBeInTheDocument();
    
    const reactivateButton = screen.getByRole('button', { name: /Reactivar Suscripción/i });
    expect(reactivateButton).toBeInTheDocument();
    
    fireEvent.click(reactivateButton);
    expect(mockReactivate).toHaveBeenCalled();
  });

  it('renders canceled status badge and no cancel/reactivate buttons', () => {
    (useMySubscription as any).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        subscriptionStatus: 'canceled',
        plan: 'profesional',
        billingCycle: 'month',
        isManagedByStripe: true,
      }
    });

    renderComponent();
    expect(screen.getByText('Suscripción Cancelada')).toBeInTheDocument();
    
    expect(screen.queryByRole('button', { name: /Cancelar Suscripción/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reactivar Suscripción/i })).not.toBeInTheDocument();
  });
});
