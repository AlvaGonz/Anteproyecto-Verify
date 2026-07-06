import { PlanCapabilities, PLAN_CAPABILITIES, normalizePlanKey } from './planCapabilities';

export interface PlanPermissions extends PlanCapabilities {
  canAccessFeatures: boolean;
}

/**
 * Validates if the subscription status is considered active.
 * Only 'active' and 'trialing' are considered active paid subscription states.
 */
export function isSubscriptionActive(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing';
}

/**
 * Resolves the effective capabilities for a user, combining the plan and the subscription status.
 * If the plan is a paid plan (anything other than 'consultor') and the status is not 'active' or 'trialing',
 * it falls back to the 'consultor' (free) plan capabilities.
 */
export function getEffectiveCapabilities(
  planName: string | null | undefined,
  subscriptionStatus: string | null | undefined
): PlanCapabilities {
  const planKey = normalizePlanKey(planName);
  
  // Free plan ('consultor') is always active and has no payment status constraints
  if (planKey === 'consultor') {
    return PLAN_CAPABILITIES.consultor;
  }

  // Paid plans require an active/trialing subscription status
  if (isSubscriptionActive(subscriptionStatus)) {
    return PLAN_CAPABILITIES[planKey];
  }

  // Fallback to free plan capabilities if subscription is not active
  return PLAN_CAPABILITIES.consultor;
}
