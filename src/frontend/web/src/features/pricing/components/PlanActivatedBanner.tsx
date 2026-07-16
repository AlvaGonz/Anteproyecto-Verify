import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { PlanCapabilities } from '../utils/planCapabilities'

interface Props {
  plan: PlanCapabilities
  onDismiss: () => void
}

/*
  Renders a centered modal popup celebrating plan activation.
  Shows unlocked capabilities specific to the plan.
  Dismiss on: button click, Escape key, backdrop click.
*/
export const PlanActivatedBanner: React.FC<Props> = ({ plan, onDismiss }) => {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)

  // ponytail: Escape key dismisses the modal — simplest keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  let capabilities: string[] = []

  if (plan.label === 'Profesional') {
    capabilities = [
      'Hasta 25 consultas',
      '5 Proyectos registrables',
      'Presentación al público de los proyectos',
      'QR incluido'
    ]
  } else if (plan.label === 'Empresa') {
    capabilities = [
      'Hasta 100 consultas',
      '10 Proyectos registrables',
      'Presentación al público de los proyectos',
      'QR incluido',
      'Multi-usuario (5)'
    ]
  } else if (plan.label === 'Corporativo') {
    capabilities = [
      'Consultas ilimitadas',
      '50 Proyectos registrables',
      'Presentación al público de los proyectos',
      'QR incluido',
      'Multi-usuario (30)'
    ]
  } else {
    capabilities = [
      plan.queriesPerMonth === 'unlimited'
        ? 'Consultas ilimitadas'
        : `${plan.queriesPerMonth} consultas/mes`,
      plan.pdfReports && 'Reportes PDF descargables',
      plan.liensAlerts && 'Alertas de gravámenes',
      plan.multiUser && 'Multiusuario habilitado',
      plan.apiAccess === 'full' && 'Acceso API completo',
      plan.apiAccess === 'basic' && 'Acceso API básico',
      plan.prioritySupport && 'Soporte prioritario',
    ].filter(Boolean) as string[]
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Plan ${plan.label} activado`}
    >
      <div
        ref={panelRef}
        className={`
          relative mx-4 w-full max-w-md rounded-3xl border-2 p-8 shadow-2xl
          animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-500
          bg-surface ${plan.bgColor.replace(/bg-[a-zA-Z0-9-/]+/g, '').trim()}
        `}
      >
        {/* Close button */}
        <button type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${plan.color.replace('text-', 'bg-').replace('700', '100')} bg-opacity-20`}>
            <span className={`material-symbols-outlined text-4xl ${plan.color}`}>verified</span>
          </div>
        </div>

        {/* Title */}
        <p className={`text-center font-bold text-xl mb-1 ${plan.color}`}>
          ¡Plan {plan.label} activado!
        </p>
        <p className="text-center text-sm text-text-secondary mb-6">
          Tu suscripción ya está activa. Estos son tus nuevos beneficios:
        </p>

        {/* Capabilities */}
        <ul className="space-y-3 mb-8">
          {capabilities.map((cap) => (
            <li key={cap} className="flex items-center gap-3 text-sm font-medium text-text-primary">
              <span className={`material-symbols-outlined text-lg ${plan.color}`}>check_circle</span>
              {cap}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button type="button"
          onClick={onDismiss}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg
            ${plan.color.includes('primary') ? 'bg-primary text-on-primary hover:bg-primary/90' :
              plan.color.includes('secondary') ? 'bg-secondary text-on-secondary hover:bg-secondary/90' :
                'bg-surface text-on-surface hover:bg-surface-variant border border-outline-variant'}
          `}
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}
