import { useEffect, useRef } from 'react'

interface Props {
  planName: string
  onDismiss: () => void
}

/*
  Renders a centered modal popup celebrating plan activation.
  Dismiss on: button click, Escape key, backdrop click.
*/
export const PlanActivatedBanner: React.FC<Props> = ({ planName, onDismiss }) => {
  const panelRef = useRef<HTMLDivElement>(null)

  // ponytail: Escape key dismisses the modal — simplest keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Plan ${planName} activado`}
    >
      <div
        ref={panelRef}
        className={`
          relative mx-4 w-full max-w-md rounded-3xl border-2 p-8 shadow-2xl
          animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-500
          bg-surface
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
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-100 bg-opacity-20">
            <span className="material-symbols-outlined text-4xl text-emerald-600">verified</span>
          </div>
        </div>

        {/* Title */}
        <p className="text-center font-bold text-xl mb-1 text-emerald-600">
          ¡Suscripción activada!
        </p>
        <p className="text-center text-sm text-text-secondary mb-8">
          Tu plan {planName} ya está activo. Revisa la sección de configuración para ver tus límites.
        </p>

        {/* CTA */}
        <button type="button"
          onClick={onDismiss}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg bg-primary text-on-primary hover:bg-primary/90"
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}
