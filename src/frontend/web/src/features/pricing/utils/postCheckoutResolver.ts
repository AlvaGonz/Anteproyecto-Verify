export type PostCheckoutState = 'dashboard' | 'pending_confirmation' | 'checkout' | 'error';

interface ResolverInput {
  sessionStatus: string;
  userSubscriptionStatus?: string;
  sessionPlan?: string | null;
  userPlanName?: string | null;
}

// Normalize plan names for comparison (Stripe metadata may have old names)
function normalizePlanName(plan: string | null | undefined): string | null {
  if (!plan) return null;
  // Stripe metadata still uses "Enterprise" for the Corporativo plan
  if (plan === 'Enterprise') return 'Corporativo';
  return plan;
}

export function resolvePostCheckoutState({ sessionStatus, userSubscriptionStatus, sessionPlan, userPlanName }: ResolverInput): PostCheckoutState {
  const normalizedSessionPlan = normalizePlanName(sessionPlan);
  const normalizedUserPlan = normalizePlanName(userPlanName);

  if (sessionStatus === 'complete') {
    // If we have both session plan and user plan, ensure they match. 
    // This handles upgrades where status is already 'active' but plan hasn't updated yet.
    const isPlanMatched = !normalizedSessionPlan || !normalizedUserPlan || normalizedSessionPlan === normalizedUserPlan;

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
