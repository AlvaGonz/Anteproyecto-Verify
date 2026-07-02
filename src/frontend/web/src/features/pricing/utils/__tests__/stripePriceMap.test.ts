import { describe, it, expect, vi } from 'vitest';
import { getStripePriceId } from '../stripePriceMap';

describe('getStripePriceId', () => {
  it('throws on unknown plan', () => {
    expect(() => getStripePriceId('unknown' as any, 'monthly')).toThrow();
  });

  it('returns env var value for valid plan', () => {
    // Vite loads these from import.meta.env, which in test might be mocked
    import.meta.env.VITE_STRIPE_PRICE_PROFESIONAL_MONTHLY = 'price_test_123';
    expect(getStripePriceId('profesional', 'monthly')).toBe('price_test_123');
  });
});
