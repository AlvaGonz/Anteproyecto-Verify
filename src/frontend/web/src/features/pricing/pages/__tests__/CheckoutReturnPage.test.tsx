import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CheckoutReturnPage } from '../CheckoutReturnPage';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../infrastructure/api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { status: 'complete' } })
  }
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('CheckoutReturnPage', () => {
  it('renders loading initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/checkout/return?session_id=123']}>
          <CheckoutReturnPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText(/Verificando estado del pago/i)).toBeInTheDocument();
  });
});
