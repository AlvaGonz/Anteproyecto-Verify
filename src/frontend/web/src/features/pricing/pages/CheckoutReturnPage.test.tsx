import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CheckoutReturnPage } from './CheckoutReturnPage';
import apiClient from '../../../infrastructure/api/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock apiClient and useSearchParams
vi.mock('../../../infrastructure/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CheckoutReturnPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithRouter = (initialUrl: string) => {
    Object.defineProperty(window, 'location', {
      value: { search: initialUrl.split('?')[1] ? `?${initialUrl.split('?')[1]}` : '', pathname: '/checkout/return' },
      writable: true,
    });
    
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialUrl]}>
          <Routes>
            <Route path="/checkout/return" element={<CheckoutReturnPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('redirects to dashboard when session is complete', async () => {
    // session-status returns complete with plan
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { status: 'complete', plan: 'Empresa' }
    });

    renderWithRouter('/checkout/return?session_id=cs_test_123');

    // Advance past the 3s webhook buffer
    await vi.advanceTimersByTimeAsync(5000);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', expect.objectContaining({
        replace: true,
        state: expect.objectContaining({
          planJustActivated: true,
          activatedPlan: expect.objectContaining({ label: 'Empresa' })
        })
      }));
    });

    expect(apiClient.get).toHaveBeenCalledWith('/v1/subscriptions/session-status?sessionId=cs_test_123');
  });

  it('sends sessionId when Stripe uses camelCase param', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { status: 'complete', plan: 'Profesional' }
    });

    renderWithRouter('/checkout/return?sessionId=cs_test_abc');

    await vi.advanceTimersByTimeAsync(5000);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/v1/subscriptions/session-status?sessionId=cs_test_abc');
    });
  });

  it('shows error page when payment status is not complete', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { status: 'open', plan: null }
    });

    renderWithRouter('/checkout/return?session_id=cs_test_fail');

    await waitFor(() => {
      expect(screen.getByText('Hubo un problema con el pago')).toBeTruthy();
    });
  });

  it('shows error page when no session_id is provided', async () => {
    renderWithRouter('/checkout/return');

    await waitFor(() => {
      expect(screen.getByText('Hubo un problema con el pago')).toBeTruthy();
    });
  });
});
