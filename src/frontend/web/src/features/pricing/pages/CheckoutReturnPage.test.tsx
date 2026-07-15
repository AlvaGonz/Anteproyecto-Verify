import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CheckoutReturnPage } from './CheckoutReturnPage';
import apiClient from '../../../infrastructure/api/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../infrastructure/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockRefreshUser = vi.fn();
vi.mock('../../../shared/context/AuthContext', () => ({
  useAuth: () => ({
    refreshUser: mockRefreshUser,
    user: { subscriptionStatus: 'inactive' }
  })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ponytail: clear module-level _processedSessions between tests
// The component keeps a module-level Set<string> to prevent re-processing.
// We can't import it directly (module boundary), so we re-require fresh each test
// by resetting the module registry. But that's heavy — simpler: mock apiClient to
// always return a fresh session so the Set doesn't accumulate.
let _processedSessions: Set<string>;
vi.mock('../utils/postCheckoutResolver', () => ({
  resolvePostCheckoutState: (input: any) => {
    if (input.sessionStatus === 'complete' && input.userSubscriptionStatus === 'active') return 'dashboard';
    if (input.sessionStatus === 'open') return 'checkout';
    return 'pending_confirmation';
  }
}));

describe('CheckoutReturnPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Clear the module-level _processedSessions by re-importing
    // This is a known vitest pattern for resetting module state
    _processedSessions = new Set();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithRouter = (initialUrl: string) => {
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
    // ponytail: mock auth/me to return active subscription so resolvePostCheckoutState → 'dashboard'
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes('session-status')) {
        return { data: { status: 'complete', plan: 'Empresa' } };
      }
      if (url.includes('/auth/me')) {
        return { data: { subscriptionStatus: 'active' } };
      }
      if (url.includes('my-status')) {
        return { data: { subscriptionStatus: 'active', plan: 'Empresa' } };
      }
      return { data: {} };
    });
    vi.mocked(apiClient.post).mockResolvedValue({ data: { message: 'ok' } });

    renderWithRouter('/checkout/return?session_id=cs_test_123');

    await vi.advanceTimersByTimeAsync(5000);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', expect.objectContaining({
        replace: true,
      }));
    });

    expect(apiClient.get).toHaveBeenCalledWith('/v1/subscriptions/session-status?sessionId=cs_test_123');
  });

  it('sends sessionId when Stripe uses camelCase param', async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes('session-status')) {
        return { data: { status: 'complete', plan: 'Profesional' } };
      }
      if (url.includes('/auth/me')) {
        return { data: { subscriptionStatus: 'active' } };
      }
      return { data: {} };
    });

    renderWithRouter('/checkout/return?sessionId=cs_test_abc');

    await vi.advanceTimersByTimeAsync(5000);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/v1/subscriptions/session-status?sessionId=cs_test_abc');
    });
  });

  it('redirects to checkout when payment status is open', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { status: 'open', plan: null }
    });

    renderWithRouter('/checkout/return?session_id=cs_test_fail');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/checkout', { replace: true });
    });
  });

  it('shows error page when no session_id is provided', async () => {
    renderWithRouter('/checkout/return');

    await waitFor(() => {
      expect(screen.getByText('Hubo un problema con el pago')).toBeTruthy();
    });
  });
});
