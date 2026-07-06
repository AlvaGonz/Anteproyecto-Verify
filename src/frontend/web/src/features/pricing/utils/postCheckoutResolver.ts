export type PostCheckoutState = 'dashboard' | 'pending_confirmation' | 'checkout' | 'error';

interface ResolverInput {
  sessionStatus: string;
  userSubscriptionStatus?: string;
}

export function resolvePostCheckoutState({ sessionStatus, userSubscriptionStatus }: ResolverInput): PostCheckoutState {
  if (sessionStatus === 'complete') {
    if (userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing') {
      return 'dashboard';
    }
    return 'pending_confirmation';
  }
  
  if (sessionStatus === 'open') {
    return 'checkout';
  }
  
  return 'error';
}
