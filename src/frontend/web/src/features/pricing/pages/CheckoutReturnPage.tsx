import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../infrastructure/api/client'
import { normalizePlanKey, PLAN_CAPABILITIES } from '../utils/planCapabilities'

type PageStatus = 'loading' | 'success' | 'error'

export const CheckoutReturnPage = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const redirectedRef = useRef(false)
  const [status, setStatus] = useState<PageStatus>('loading')

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return }

    const verify = async () => {
      try {
        const { data } = await apiClient.get(
          `/v1/subscriptions/session-status?sessionId=${sessionId}`
        )

        if (data.status !== 'complete') {
          setStatus('error')
          return
        }

        // Invalidate TanStack Query caches so Settings + Dashboard
        // reflect the new plan without requiring a full page reload
        await queryClient.invalidateQueries({ queryKey: ['subscription', 'my-status'] })
        await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })

        if (redirectedRef.current) return
        redirectedRef.current = true

        // Normalize plan name returned by Stripe session (may be 'Profesional', 'empresa', etc.)
        const planKey = normalizePlanKey(data.plan ?? data.planName ?? null)
        const capabilities = PLAN_CAPABILITIES[planKey]

        // Pass plan context to dashboard via location state
        navigate('/dashboard', {
          replace: true,
          state: {
            planJustActivated: true,
            activatedPlan: capabilities,
          },
        })

      } catch {
        setStatus('error')
      }
    }

    verify()
  }, [sessionId, navigate, queryClient])

  // ── Loading ──
  if (status === 'loading') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-secondary text-sm font-medium">
          Verificando estado del pago...
        </p>
      </div>
    )
  }

  // ── Error ──
  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4 px-4">
      <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-2">
        <span className="text-rose-600 text-3xl">✕</span>
      </div>
      <h1 className="text-2xl font-bold text-rose-700 text-center">
        Hubo un problema con el pago
      </h1>
      <p className="text-text-secondary text-sm text-center max-w-sm">
        El pago no pudo confirmarse. Verifica con tu banco o intenta de nuevo.
      </p>
      <button
        onClick={() => navigate('/precios')}
        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold"
      >
        Volver a planes
      </button>
    </div>
  )
}
