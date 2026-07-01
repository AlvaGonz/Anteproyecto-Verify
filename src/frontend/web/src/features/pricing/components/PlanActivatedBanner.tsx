import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { PlanCapabilities } from '../utils/planCapabilities'

interface Props {
  plan: PlanCapabilities
  onDismiss: () => void
}

/*
  Renders a top-of-dashboard dismissible banner celebrating plan activation.
  Shows unlocked capabilities specific to the plan.
  Auto-dismisses after 12 seconds.
*/
export const PlanActivatedBanner: React.FC<Props> = ({ plan, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 12_000)
    return () => clearTimeout(t)
  }, [onDismiss])

  const capabilities = [
    plan.queriesPerMonth === 'unlimited'
      ? 'Consultas ilimitadas'
      : `${plan.queriesPerMonth} consultas/mes`,
    plan.pdfReports && 'Reportes PDF',
    plan.liensAlerts && 'Alertas de gravámenes',
    plan.multiUser && 'Multiusuario habilitado',
    plan.apiAccess === 'full' && 'API Full Access',
    plan.apiAccess === 'basic' && 'API básica habilitada',
    plan.prioritySupport && 'Soporte prioritario',
  ].filter(Boolean) as string[]

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        relative flex items-start gap-4 rounded-2xl border p-5 shadow-sm
        animate-in slide-in-from-top-2 fade-in duration-500
        ${plan.bgColor}
      `}
    >
      <CheckCircle2 className={`w-6 h-6 mt-0.5 flex-shrink-0 ${plan.color}`} />
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-base ${plan.color}`}>
          ¡Plan {plan.label} activado! 🎉
        </p>
        <p className="text-sm text-text-secondary mt-0.5">
          Ahora tienes acceso a:
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {capabilities.map((cap) => (
            <li
              key={cap}
              className={`
                text-xs font-semibold px-2.5 py-1 rounded-full border
                ${plan.bgColor} ${plan.color}
              `}
            >
              ✓ {cap}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
