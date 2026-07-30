import React, { useState } from 'react';

import { CreditCard, Calendar, AlertCircle, ArrowRight, CheckCircle2, Clock, RefreshCw, Gift, Award } from "lucide-react";
import { useMySubscription, useCancelSubscription, useReactivateSubscription } from "../api/useSettings";
import { PlansModal } from "./PlansModal";
import { CancelSubscriptionModal } from "./CancelSubscriptionModal";
import { useAuth } from "../../../shared/context/AuthContext";

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
    label: "Plan Consultor",
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
  const { data, isLoading, isError, error, refetch } = useMySubscription();

  React.useEffect(() => {
    if (isError && error) {
      console.error('[SubscriptionSettings] Error al cargar suscripción:', error);
    }
  }, [isError, error]);
  const { user } = useAuth();

  const status = data?.subscriptionStatus ?? null;
  const planName = data?.plan ?? (data as any)?.planName ?? (data?.isGuest ? data?.inviterPlan : null) ?? null;
  const currentPeriodEnd = data?.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null;
  const limits = data?.planLimits;

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

  const billingCycle = data?.billingCycle ?? 'monthly';

  let formattedPrice: string | null = null;
  let originalMonthlyPrice: string | null = null;
  let isDiscountApplied = false;

  if (hasPlan && data) {
    const basePrice = data.planPrice ?? 0;
    if (basePrice === 0 && !data.pricing?.monthlyPrice && !data.pricing?.yearlyPrice) {
      formattedPrice = 'Gratis';
    } else {
      const monthlyPrice = data.pricing?.monthlyPrice ?? basePrice;
      // ponytail: if billing cycle string is unreliable (e.g. defaults to monthly in backend), use daysRemaining > 35 as heuristic
      const isAnnual = ['yearly', 'annual', 'year', 'anual'].includes(String(billingCycle).toLowerCase()) || (daysRemaining ?? 0) > 35;
      
      if (isAnnual) {
        const yearlyPrice = data.pricing?.yearlyPrice ?? (monthlyPrice * 12 * 0.8);
        formattedPrice = `${PRICE_FORMATTER.format(yearlyPrice)} USD / año`;
        originalMonthlyPrice = `${PRICE_FORMATTER.format(monthlyPrice)} USD / mes`;
        isDiscountApplied = true;
      } else {
        formattedPrice = `${PRICE_FORMATTER.format(monthlyPrice)} USD / mes`;
      }
    }
  }

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
              </div>
              <p className="text-text-secondary text-sm">
                Gestiona tu plan actual y estado de facturación.
              </p>
            </div>

            {/* Status Badge */}
            {isLoading ? (
              <div className="px-4 py-2 bg-slate-100 rounded-full w-40 h-9 animate-pulse" />
            ) : !isError && !(status === 'free' && (user?.role === "admin" || user?.role === "owner")) && (
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
                className="flex items-center gap-1.5 text-sm font-semibold text-rose-700 hover:text-rose-900 transition-colors whitespace-nowrap"
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
            <div
              data-testid="subscription-plan-card"
              className={`bg-surface-raised rounded-2xl p-6 border border-border/60 shadow-sm${data?.isGuest ? ' guest-plan-badge' : ''}`}
            >
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
                  {data?.isGuest && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                      <Award className="w-3.5 h-3.5" />
                      Invitado
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <div className="text-xl font-bold text-[#223382] capitalize">
                      {data?.isGuest && data?.inviterPlan
                        ? <span>{data.inviterPlan}</span>
                        : hasPlan
                          ? <span className="text-primary">{planName}</span>
                          : <span className="text-text-secondary font-medium text-base">Sin suscripción</span>
                      }
                    </div>
                  </div>
                  {formattedPrice && (
                    <div className="flex flex-col gap-0.5 mt-1">
                      {originalMonthlyPrice && (
                        <div className="text-xs text-text-secondary font-medium line-through opacity-70">
                          {originalMonthlyPrice}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-text-secondary font-medium">{formattedPrice}</div>
                        {isDiscountApplied && (
                          <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                            {data?.pricing?.yearlyBadge ?? '20% Dto. Anual'}
                          </div>
                        )}
                      </div>
                    </div>
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

          {/* Limits Card */}
          {limits && (
            <>
            <div data-testid="subscription-plan-limits" className="bg-surface-raised rounded-2xl p-6 border border-border/60 shadow-sm mb-8">
              <h3 className="text-lg font-bold text-[#223382] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Límites de tu Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-testid="consultas-limit" className="flex justify-between items-center p-3 bg-white rounded-lg border border-border/50">
                  <span className="text-sm font-medium text-text-secondary">Consultas Mensuales</span>
                  <span className="font-bold text-[#223382]">
                    {limits.consultasUsadas} / {limits.maxConsultas === -1 ? 'Ilimitadas' : limits.maxConsultas}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-border/50">
                  <span className="text-sm font-medium text-text-secondary">Proyectos</span>
                  <span className="font-bold text-[#223382]">
                    {limits.proyectosCreados} / {limits.maxProyectos === -1 ? 'Ilimitados' : limits.maxProyectos}
                  </span>
                </div>
              </div>
            </div>

            {/* Funciones Especiales */}
            <div className="bg-surface-raised rounded-2xl p-6 border border-border/60 shadow-sm mb-8">
              <h3 className="text-lg font-bold text-[#223382] mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Funciones Especiales
              </h3>
              <div className="flex flex-wrap gap-4">
                {limits.exportacionPdf && (
                  <button type="button" data-testid="export-pdf-btn" className="px-4 py-2 rounded-lg border font-semibold text-sm bg-white text-text-primary hover:bg-slate-50 transition-colors">
                    PDF
                 </button>
                )}

                

                <button
                  type="button"
                  data-testid="project-publication-control"
                  disabled={!limits.presentacionPublica}
                  title={!limits.presentacionPublica ? "Tu plan no permite presentar proyectos" : "Publicar Proyecto"}
                  className="px-4 py-2 rounded-lg border font-semibold text-sm bg-white text-text-primary hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Presentación Pública
               </button>
              </div>
            </div>
            </>
          )}


          {/* CTA Footer */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-sm text-text-secondary font-medium">
              {data?.isGuest ? (
                <>
                  Tu suscripción es gestionada por el propietario de tu cuenta{data?.inviterName ? ` (${data.inviterName})` : ''}.
                </>
              ) : (
                '¿Deseas cambiar tu plan o explorar otras opciones?'
              )}
            </div>
            {!data?.isGuest && (
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
            )}
          </div>
        </div>
      </div>

      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        currentPlan={planName ?? undefined}
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

