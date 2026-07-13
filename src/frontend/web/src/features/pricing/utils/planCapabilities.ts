export type PlanKey = 'consultor' | 'profesional' | 'empresa' | 'corporativo'

export interface PlanCapabilities {
  label: string
  queriesPerMonth: number | 'unlimited'
  pdfReports: boolean
  liensAlerts: boolean
  multiUser: boolean
  apiAccess: boolean | 'basic' | 'full'
  prioritySupport: boolean
  color: string          // Tailwind text color class for dashboard badge
  bgColor: string        // Tailwind bg color class for dashboard banner
}

export const PLAN_CAPABILITIES: Record<PlanKey, PlanCapabilities> = {
  consultor: {
    label: 'Consultor',
    queriesPerMonth: 1,
    pdfReports: false,
    liensAlerts: false,
    multiUser: false,
    apiAccess: false,
    prioritySupport: false,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50 border-violet-200',
  },
  profesional: {
    label: 'Profesional',
    queriesPerMonth: 25,
    pdfReports: true,
    liensAlerts: true,
    multiUser: false,
    apiAccess: false,
    prioritySupport: true,
    color: 'text-primary',
    bgColor: 'bg-primary/5 border-primary/20',
  },
  empresa: {
    label: 'Empresa',
    queriesPerMonth: 100,
    pdfReports: true,
    liensAlerts: true,
    multiUser: true,
    apiAccess: 'basic',
    prioritySupport: true,
    color: 'text-secondary',
    bgColor: 'bg-secondary/5 border-secondary/20',
  },
  corporativo: {
    label: 'Corporativo',
    queriesPerMonth: 'unlimited',
    pdfReports: true,
    liensAlerts: true,
    multiUser: true,
    apiAccess: 'full',
    prioritySupport: true,
    color: 'text-on-surface',
    bgColor: 'bg-surface-variant border-outline-variant',
  },
}

// Normalize backend plan string to PlanKey (handles casing/spaces)
export function normalizePlanKey(raw: string | null | undefined): PlanKey {
  if (!raw) return 'consultor'
  const lower = raw.toLowerCase().trim()
  if (lower.includes('corporativo')) return 'corporativo'
  if (lower.includes('empresa')) return 'empresa'
  if (lower.includes('profesional') || lower.includes('professional')) return 'profesional'
  return 'consultor'
}
