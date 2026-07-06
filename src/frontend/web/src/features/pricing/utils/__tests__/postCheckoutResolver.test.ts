import { resolvePostCheckoutState } from '../postCheckoutResolver';

describe('resolvePostCheckoutState', () => {
  it('should return "dashboard" if subscription is active', () => {
    const state = resolvePostCheckoutState({
      sessionStatus: 'complete',
      userSubscriptionStatus: 'active'
    });
    expect(state).toBe('dashboard');
  });

  it('should return "pending_confirmation" if session is complete but user is not active yet', () => {
    const state = resolvePostCheckoutState({
      sessionStatus: 'complete',
      userSubscriptionStatus: 'inactive' // Missing webhook update
    });
    expect(state).toBe('pending_confirmation');
  });

  it('should return "checkout" if session is open', () => {
    const state = resolvePostCheckoutState({
      sessionStatus: 'open',
      userSubscriptionStatus: 'inactive'
    });
    expect(state).toBe('checkout');
  });

  it('should return "error" if session is expired', () => {
    const state = resolvePostCheckoutState({
      sessionStatus: 'expired',
      userSubscriptionStatus: 'inactive'
    });
    expect(state).toBe('error');
  });
});
