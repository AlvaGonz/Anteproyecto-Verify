export type PostCheckoutState = 'dashboard' | 'pending_confirmation' | 'checkout' | 'error';

interface ResolverInput {
  sessionStatus: string;
  userSubscriptionStatus?: string;
  sessionPlan?: string | null;
  userPlanName?: string | null;
}

export function resolvePostCheckoutState({ sessionStatus, userSubscriptionStatus, sessionPlan, userPlanName }: ResolverInput): PostCheckoutState {
  if (sessionStatus === 'complete') {
    // If we have both session plan and user plan, ensure they match. 
    // This handles upgrades where status is already 'active' but plan hasn't updated yet.
    const isPlanMatched = !sessionPlan || !userPlanName || sessionPlan === userPlanName;

    if ((userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing') && isPlanMatched) {
      return 'dashboard';
    }
    return 'pending_confirmation';
  }
  
  if (sessionStatus === 'open') {
    return 'checkout';
  }
  
  return 'error';
}
