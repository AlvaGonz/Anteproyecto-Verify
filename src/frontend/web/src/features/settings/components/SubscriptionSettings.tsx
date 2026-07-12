import React, { useState } from 'react';

import { CreditCard, Calendar, AlertCircle, ArrowRight, CheckCircle2, Clock, RefreshCw, Gift } from "lucide-react";
import { useMySubscription, useSyncSubscription, useCancelSubscription, useReactivateSubscription } from "../api/useSettings";
import { normalizePlanKey, PLAN_CAPABILITIES } from '../../pricing/utils/planCapabilities';
import { PlansModal } from "./PlansModal";
import { CancelSubscriptionModal } from "./CancelSubscriptionModal";

const DATE_FORMATTER = new Intl.DateTimeFormat('es', { day: '2-digit', month: 'long', year: 'numeric' });
const PRICE_FORMATTER = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// ── Badge variants keyed by status ──────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  active: {
    label: "Suscripción Activa",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  trialing: {
    label: "Período de Prueba",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    icon: <Clock className="w-4 h-4" />,
  },
  free: {
    label: "Plan Gratuito",
    className: "bg-violet-50 text-violet-700 border-violet-200",
    icon: <Gift className="w-4 h-4" />,
  },
  canceled: {
    label: "Suscripción Cancelada",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  canceling: {
    label: "Cancelación Programada",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  past_due: {
    label: "Pago Pendiente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  unpaid: {
    label: "Pago Pendiente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  incomplete: {
    label: "Verificando suscripción",
    className: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
    icon: <Clock className="w-4 h-4" />,
  },
};

const NO_PLAN_CONFIG = {
  label: "Sin Plan Activo",
  className: "bg-slate-100 text-slate-700 border-slate-200",
  icon: null,
};

export const SubscriptionSettings: React.FC = () => {
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useMySubscription();

  const status = data?.subscriptionStatus ?? null;
  const planName = data?.plan ?? (data as any)?.planName ?? null;
  const planKey = normalizePlanKey(planName);
  const planCapabilities = planName ? PLAN_CAPABILITIES[planKey as keyof typeof PLAN_CAPABILITIES] : null;
  const currentPeriodEnd = data?.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null;

  const badgeConfig = status ? (STATUS_CONFIG[status] ?? STATUS_CONFIG.active) : NO_PLAN_CONFIG;
  const hasPlan = !!planName;

  let daysRemaining: number | null = null;
  if (currentPeriodEnd) {
    const diffTime = currentPeriodEnd.getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const formattedDate = currentPeriodEnd
    ? DATE_FORMATTER.format(currentPeriodEnd)
    : null;

  let formattedPrice: string | null = null;
  if (hasPlan && data) {
    // Determine the price based on the plan name and billing cycle (since DB stores DOP and we want USD UI)
    const isAnnual = data.billingCycle === 'year' || data.billingCycle === 'yearly';
    let priceVal = 0;

    if (planKey === 'profesional') {
      priceVal = isAnnual ? 48 : 60;
    } else if (planKey === 'empresa') {
      priceVal = isAnnual ? 136 : 170;
    } else if (planKey === 'corporativo') {
      priceVal = isAnnual ? 400 : 500;
    }

    if (priceVal > 0) {
      formattedPrice = PRICE_FORMATTER.format(priceVal) + ` USD ${isAnnual ? '(anual)' : ''} / mes`;
    } else if (data.planPrice === 0) {
      formattedPrice = "Gratis";
    } else if (data.planPrice && data.planPrice > 0) {
      formattedPrice = PRICE_FORMATTER.format(data.planPrice) + " USD / mes";
    }
  }

  const { mutate: syncSubscription, isPending: isSyncing } = useSyncSubscription();
  const { mutate: cancelSubscription, isPending: isCanceling } = useCancelSubscription();
  const { mutate: reactivateSubscription, isPending: isReactivating } = useReactivateSubscription();

  return (
    <div className="w-full max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl shadow-premium border border-border p-8 overflow-hidden relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-display font-bold text-[#223382] flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary" />
                  Mi Suscripción
                </h2>
                <button
                  type="button"
                  onClick={() => syncSubscription()}
                  disabled={isSyncing || isLoading}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sincronizar
                </button>
              </div>
              <p className="text-text-secondary text-sm">
                Gestiona tu plan actual y estado de facturación.
              </p>
            </div>

            {/* Status Badge */}
            {isLoading ? (
              <div className="px-4 py-2 bg-slate-100 rounded-full w-40 h-9 animate-pulse" />
            ) : !isError && (
              <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-semibold text-sm border shadow-sm ${badgeConfig.className}`}>
                {badgeConfig.icon}
                {badgeConfig.label}
              </div>
            )}
          </div>

          {/* Error State */}
          {isError && (
            <div className="mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-rose-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">No se pudo cargar la información de suscripción.</p>
              </div>
              <button type="button"
                onClick={() => refetch()}
                className="flex items-center gap-1.5 text-sm font-semibold text-rose-700 hover:text-rose-900 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            </div>
          )}

          {/* Incomplete Status Alert Box */}
          {!isLoading && !isError && status === 'incomplete' && (
            <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 text-amber-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Pago en proceso o verificación requerida</h4>
                  <p className="text-xs mt-1">Hemos detectado que iniciaste el proceso de pago pero aún no se ha confirmado. Si acabas de realizar el pago, por favor espera unos minutos o recarga la página. Si el problema persiste, contacta al soporte técnico.</p>
                </div>
              </div>
              <button type="button"
                onClick={() => refetch()}
                className="flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-200/50"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Plan Card */}
            <div className="bg-surface-raised rounded-2xl p-6 border border-border/60 shadow-sm">
              <div className="text-text-secondary text-sm font-medium mb-2 uppercase tracking-wider text-[11px]">
                Plan Actual
              </div>
              {isLoading ? (
                <>
                  <div className="h-7 w-36 bg-slate-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-[#223382] capitalize mb-1">
                    {hasPlan
                      ? <span className={planCapabilities?.color ?? ''}>{planCapabilities?.label ?? planName}</span>
                      : <span className="text-text-secondary font-medium text-base">Sin suscripción</span>
                    }
                  </div>
                  {formattedPrice && (
                    <div className="text-sm text-text-secondary font-medium">{formattedPrice}</div>
                  )}
                </>
              )}
            </div>

            {/* Next Billing Card */}
            <div className="bg-surface-raised rounded-2xl p-6 border border-border/60 shadow-sm">
              <div className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-2 uppercase tracking-wider text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                Próximo cobro
              </div>
              {isLoading ? (
                <div className="h-7 w-36 bg-slate-200 rounded animate-pulse" />
              ) : formattedDate ? (
                <>
                  <div className="text-xl font-bold text-[#223382]">
                    {formattedDate}
                  </div>
                  {daysRemaining !== null && daysRemaining >= 0 && (
                    <div className="mt-3 text-sm font-bold flex items-center gap-1.5 text-primary bg-primary/5 w-fit px-3 py-1.5 rounded-lg border border-primary/10">
                      <Clock className="w-4 h-4" />
                      Quedan {daysRemaining} días
                    </div>
                  )}
                </>
              ) : (
                <div className="text-base font-semibold text-text-secondary">
                  {hasPlan ? "—" : "Sin plan activo"}
                </div>
              )}
            </div>

          </div>

          {/* CTA Footer */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-sm text-text-secondary font-medium">
              ¿Deseas cambiar tu plan o explorar otras opciones?
            </div>
            <div className="flex gap-2">
              {status === 'active' && data?.isManagedByStripe && (
                <button type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={isCanceling}
                  className="vf-btn-secondary h-[48px] px-8 shadow-sm font-bold text-sm text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    {isCanceling ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                    Cancelar Suscripción
                  </span>
                </button>
              )}
              {status === 'canceling' && data?.isManagedByStripe && (
                <button type="button"
                  onClick={() => reactivateSubscription()}
                  disabled={isReactivating}
                  className="vf-btn-secondary h-[48px] px-8 shadow-sm font-bold text-sm text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    {isReactivating ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                    Reactivar Suscripción
                  </span>
                </button>
              )}
              <button type="button"
                onClick={() => setIsPlansModalOpen(true)}
                className="vf-btn-primary h-[48px] px-8 shadow-floating hover:scale-[1.02] transition-transform font-bold text-sm"
              >
                <span className="flex items-center gap-2">
                  {hasPlan ? "Modificar Suscripción" : "Ver Planes"} <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <PlansModal 
        isOpen={isPlansModalOpen} 
        onClose={() => setIsPlansModalOpen(false)} 
        currentPlan={planKey}
      />

      <CancelSubscriptionModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={(_feedback) => {
          // If we want to send feedback to the backend later, we can attach it to cancelSubscription.
          // For now we just call it.
          cancelSubscription();
          setIsCancelModalOpen(false);
        }}
        isCanceling={isCanceling}
      />
    </div>
  );
};

