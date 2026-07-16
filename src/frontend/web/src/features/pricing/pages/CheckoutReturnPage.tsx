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
  // HashRouter puts query params in the hash, not window.location.search.
  // URL: http://localhost:3000/#/checkout/return?session_id=xxx
  // window.location.search = "" (empty)
  // window.location.hash = "#/checkout/return?session_id=xxx"
  const rawHash = window.location.hash;
  const hashSearch = rawHash.includes('?') ? rawHash.split('?')[1] : '';
  const hashParams = new URLSearchParams(hashSearch);
  
  // Use a ref to store the initial sessionId so it survives URL cleanup
  const initialSessionIdRef = useRef<string | null>(
    searchParams.get('session_id') ??
    hashParams.get('session_id') ??
    searchParams.get('sessionId') ??
    hashParams.get('sessionId')
  );
  const sessionId = initialSessionIdRef.current;
  
  // Keep source parameter for returning to previous tab
  const source = searchParams.get('source') ?? hashParams.get('source');
  const navigate = useNavigate()

  const handleBack = () => {
    if (source === 'settings') {
      navigate('/admin/settings');
    } else if (source === 'portal') {
      navigate('/admin/dashboard');
    } else {
      navigate('/plans');
    }
  };

  const queryClient = useQueryClient()
  const redirectedRef = useRef(false)
  const { refreshUser, user } = useAuth()
  const [status, setStatus] = useState<PageStatus>('loading')

  useEffect(() => {
    // ponytail: use local flag (not shared ref) to prevent StrictMode double-mount
    // race: each effect instance has its OWN `mounted`, so mount 1's cleanup sets
    // mount 1's flag to false, and mount 2's verify can only see mount 2's flag.
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isPolling = true;

    const safeStatus = (s: PageStatus) => { if (mounted) setStatus(s) }
    const safeNavigate = (to: string, opts?: any) => { if (mounted) navigate(to, opts) }

    if (!sessionId) {
      safeStatus('error');
    } else {
      // Immediately remove session_id from browser history to prevent
      // it appearing in Referrer headers or server access logs (OWASP A05)
      try {
        // In HashRouter, session_id is in the hash, not search
        const hash = window.location.hash;
        const hashPath = hash.includes('?') ? hash.split('?')[0] : hash;
        const hashSearch = hash.includes('?') ? hash.split('?')[1] : '';
        const hashParams = new URLSearchParams(hashSearch);
        
        if (hashParams.has('session_id') || hashParams.has('sessionId')) {
          hashParams.delete('session_id');
          hashParams.delete('sessionId');
          const newHash = hashPath + (hashParams.toString() ? '?' + hashParams.toString() : '');
          window.history.replaceState({}, '', newHash);
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
        // race: each effect instance has its OWN `mounted`, so mount 1's cleanup sets
        // mount 1's flag to false, and mount 2's verify can only see mount 2's flag.
        if (_processedSessions.has(sessionId)) {
          // Already processed — navigate directly without calling API again
          console.log('[CheckoutReturn] Session already processed, navigating to dashboard');
          safeNavigate('/admin/dashboard', { replace: true })
          return
        }

        try {
          console.log('[CheckoutReturn] Verifying session:', sessionId);
          const { data } = await apiClient.get(
            `/v1/subscriptions/session-status?sessionId=${sessionId}`
          )
          console.log('[CheckoutReturn] Session status response:', data);

          let state = resolvePostCheckoutState({
            sessionStatus: data.status,
            userSubscriptionStatus: user?.subscriptionStatus ?? undefined,
            sessionPlan: data.plan ?? undefined,
            userPlanName: user?.plan ?? undefined
          });
          let resolvedPlan = data.plan || user?.plan;
          console.log('[CheckoutReturn] Initial state:', state, { sessionStatus: data.status, userSubscriptionStatus: user?.subscriptionStatus, sessionPlan: data.plan, userPlanName: user?.plan });

          if (state === 'error') {
            safeStatus('error')
            return
          }

          if (state === 'checkout') {
            safeNavigate('/checkout', { replace: true })
            return
          }

          // Polling control
          let attempts = 0;
          while (state === 'pending_confirmation' && attempts < 15 && mounted && isPolling) {
            attempts++;
            console.log('[CheckoutReturn] Polling attempt:', attempts);
            await new Promise(resolve => {
              timeoutId = setTimeout(resolve, 2000);
            });
            
            // Invalidate caches to fetch latest user status
            await queryClient.invalidateQueries({ queryKey: ['subscription', 'my-status'] })
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
            await queryClient.invalidateQueries({ queryKey: ['notifications'] })
            await refreshUser();
            
            // Fetch directly to get the current state synchronously for the next check
            const statusRes = await apiClient.get('/v1/subscriptions/my-status');
            const latestStatus = statusRes.data.subscriptionStatus;
            const latestPlan = statusRes.data.plan;
            resolvedPlan = latestPlan || resolvedPlan;
            console.log('[CheckoutReturn] Polling - latest status:', latestStatus, 'latest plan:', latestPlan);

            state = resolvePostCheckoutState({
              sessionStatus: data.status,
              userSubscriptionStatus: latestStatus ?? undefined,
              sessionPlan: data.plan ?? undefined,
              userPlanName: latestPlan ?? undefined
            });
            console.log('[CheckoutReturn] Polling - new state:', state);
          }

          if (state !== 'dashboard') {
            // As a final fallback, manually trigger a sync in case the webhook was missed or delayed
            try {
              await apiClient.post('/v1/subscriptions/sync');
              
              // Invalidate caches and fetch one last time
              await queryClient.invalidateQueries({ queryKey: ['subscription', 'my-status'] });
              await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
              await queryClient.invalidateQueries({ queryKey: ['notifications'] });
              await refreshUser();
              
              const statusRes = await apiClient.get('/v1/subscriptions/my-status');
              const finalStatus = statusRes.data.subscriptionStatus;
              const finalPlan = statusRes.data.plan;
              resolvedPlan = finalPlan || resolvedPlan;
              
              state = resolvePostCheckoutState({
                sessionStatus: data.status,
                userSubscriptionStatus: finalStatus ?? undefined,
                sessionPlan: data.plan ?? undefined,
                userPlanName: finalPlan ?? undefined
              });
            } catch (syncError) {
              // Ignore sync error and proceed to error state
            }

            if (state !== 'dashboard') {
              // Could not verify active subscription after polling and sync fallback
              safeStatus('error');
              return;
            }
          }

          // Guard with mounted FIRST — prevents mount 1's stale verify (StrictMode)
          // from setting redirectedRef or _processedSessions, which would cause
          // mount 2 to bail out without navigating (redirectedRef already true)
          if (!mounted) return
          if (redirectedRef.current) return
          redirectedRef.current = true

          // Fix: use safeNavigate (react-router navigate) instead of window.location.href
          // to avoid pathname contamination in HashRouter (#/admin/dashboard not /admin/dashboard#/admin/dashboard)
          const currentPlan = resolvedPlan;
          const capabilities = PLAN_CAPABILITIES[normalizePlanKey(currentPlan)];
          safeNavigate('/admin/dashboard', {
            replace: true,
            state: { planJustActivated: true, activatedPlan: capabilities }
          })
          _processedSessions.add(sessionId)

        } catch {
          safeStatus('error')
        }
      }

      verify()
    }

    return () => {
      mounted = false
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
        onClick={handleBack}
        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold"
      >
        Volver a planes
      </button>
    </div>
  )
}
