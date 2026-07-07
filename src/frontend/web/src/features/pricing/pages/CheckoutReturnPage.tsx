import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../infrastructure/api/client'
import { useAuth } from '../../../shared/context/AuthContext'
import { resolvePostCheckoutState } from '../utils/postCheckoutResolver'
import { normalizePlanKey, PLAN_CAPABILITIES } from '../utils/planCapabilities'
type PageStatus = 'loading' | 'success' | 'error'

// Module-level — never persisted to disk, cleared on full navigation
const _processedSessions = new Set<string>()

export const CheckoutReturnPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  // HashRouter does not expose query params from the real URL path.
  // Stripe appends ?session_id= to the real URL (before the #), so
  // we must read it from window.location.search directly.
  const rawSearch = window.location.search;
  const rawParams = new URLSearchParams(rawSearch);
  
  // Use a ref to store the initial sessionId so it survives URL cleanup
  const initialSessionIdRef = useRef<string | null>(
    searchParams.get('session_id') ??
    rawParams.get('session_id') ??
    searchParams.get('sessionId') ??
    rawParams.get('sessionId')
  );
  const sessionId = initialSessionIdRef.current;

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const redirectedRef = useRef(false)
  const { refreshUser, user } = useAuth()
  const [status, setStatus] = useState<PageStatus>('loading')

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isPolling = true;

    if (!sessionId) {
      setStatus('error');
    } else {
      // Immediately remove session_id from browser history to prevent
      // it appearing in Referrer headers or server access logs (OWASP A05)
      try {
        const newUrl = new URL(window.location.href, window.location.origin !== 'null' ? window.location.origin : 'http://localhost');
        if (newUrl.searchParams.has('session_id') || newUrl.searchParams.has('sessionId')) {
          newUrl.searchParams.delete('session_id');
          newUrl.searchParams.delete('sessionId');
          // In some test environments newUrl.toString() forces the base URL. 
          // newUrl.pathname + newUrl.search + newUrl.hash is safer for relative replacements.
          window.history.replaceState({}, '', newUrl.pathname + newUrl.search + newUrl.hash);
        }
      } catch (e) {
        // Ignore parsing errors in test environments
      }
      
      if (searchParams.has('session_id') || searchParams.has('sessionId')) {
        searchParams.delete('session_id');
        searchParams.delete('sessionId');
        setSearchParams(searchParams, { replace: true });
      }

      const verify = async () => {
        // Idempotency guard — prevents re-processing on hot-reload / StrictMode
        if (_processedSessions.has(sessionId)) {
          // Already processed — navigate directly without calling API again
          navigate('/admin/dashboard', { replace: true })
          return
        }

        try {
          const { data } = await apiClient.get(
            `/v1/subscriptions/session-status?sessionId=${sessionId}`
          )

          let state = resolvePostCheckoutState({
            sessionStatus: data.status,
            userSubscriptionStatus: user?.subscriptionStatus
          });

          if (state === 'error') {
            setStatus('error')
            return
          }

          if (state === 'checkout') {
            navigate('/checkout', { replace: true })
            return
          }

          // Polling control
          let attempts = 0;
          while (state === 'pending_confirmation' && attempts < 15 && isPolling) {
            attempts++;
            await new Promise(resolve => {
              timeoutId = setTimeout(resolve, 2000);
            });
            
            // Invalidate caches to fetch latest user status
            await queryClient.invalidateQueries({ queryKey: ['subscription', 'my-status'] })
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
            await refreshUser();
            
            // Fetch directly to get the current state synchronously for the next check
            const authRes = await apiClient.get('/auth/me');
            const latestStatus = authRes.data.subscriptionStatus;

            state = resolvePostCheckoutState({
              sessionStatus: data.status,
              userSubscriptionStatus: latestStatus
            });
          }

          if (state !== 'dashboard') {
            // Could not verify active subscription after polling
            setStatus('error')
            return
          }

          if (redirectedRef.current) return
          redirectedRef.current = true

          const planKey = normalizePlanKey(data.plan ?? data.planName ?? null)
          const capabilities = PLAN_CAPABILITIES[planKey]

          navigate('/admin/dashboard', {
            replace: true,
            state: {
              planJustActivated: true,
              activatedPlan: capabilities,
            },
          })
          _processedSessions.add(sessionId)

        } catch {
          setStatus('error')
        }
      }

      verify()
    }

    return () => {
      isPolling = false;
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [sessionId, navigate, queryClient, refreshUser, user?.subscriptionStatus])

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
      <button type="button"
        onClick={() => navigate('/plans')}
        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold"
      >
        Volver a planes
      </button>
    </div>
  )
}
