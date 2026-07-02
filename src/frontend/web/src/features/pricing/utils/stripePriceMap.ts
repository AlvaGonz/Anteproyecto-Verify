// Maps plan + billing cycle → Stripe Price ID from env vars
// NEVER expose secret key here — only publishable key + price IDs

export type PlanId = 'profesional' | 'empresa' | 'enterprise'
export type BillingCycle = 'monthly' | 'yearly'

export function getStripePriceId(plan: PlanId, billing: BillingCycle): string {
  const map: Record<PlanId, Record<BillingCycle, string>> = {
    profesional: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_PROFESIONAL_MONTHLY ?? '',
      yearly:  import.meta.env.VITE_STRIPE_PRICE_PROFESIONAL_YEARLY ?? '',
    },
    empresa: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_EMPRESA_MONTHLY ?? '',
      yearly:  import.meta.env.VITE_STRIPE_PRICE_EMPRESA_YEARLY ?? '',
    },
    enterprise: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY ?? '',
      yearly:  import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_YEARLY ?? '',
    },
  }
  const priceId = map[plan]?.[billing]
  if (!priceId) throw new Error(`Unknown plan/billing: ${plan}/${billing}`)
  return priceId
}
