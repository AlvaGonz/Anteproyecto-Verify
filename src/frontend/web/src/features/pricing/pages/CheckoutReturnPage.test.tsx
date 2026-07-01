import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  });

  const renderWithRouter = (initialUrl: string) => {
    // We override window.location.search for the test since the component reads from it
    Object.defineProperty(window, 'location', {
      value: { search: initialUrl.split('?')[1] ? `?${initialUrl.split('?')[1]}` : '', pathname: '/checkout/return' },
      writable: true,
    });
    
    // Also mock history.replaceState so it doesn't crash in JSDOM
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

  it('redirects to dashboard when session_id is valid and status is complete', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { status: 'complete', plan: 'Profesional' }
    });

    renderWithRouter('/checkout/return?session_id=cs_test_123');

    // Wait for the navigate to be called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', expect.objectContaining({
        replace: true,
        state: expect.objectContaining({
          planJustActivated: true,
          activatedPlan: expect.any(Object)
        })
      }));
    });

    // Check if apiClient was called with camelCase sessionId
    expect(apiClient.get).toHaveBeenCalledWith('/v1/subscriptions/session-status?sessionId=cs_test_123');
  });

  it('sends correct parameter to backend if Stripe uses sessionId instead of session_id', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { status: 'complete', plan: 'Básico' }
    });

    // Arrange: what if the query param is sessionId?
    renderWithRouter('/checkout/return?sessionId=cs_test_abc');

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/v1/subscriptions/session-status?sessionId=cs_test_abc');
    });
  });
});
