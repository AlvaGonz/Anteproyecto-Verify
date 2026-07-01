import React from 'react';
import { useAuth } from "../../../shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CreditCard, Calendar, AlertCircle, ArrowRight, CheckCircle2, Clock } from "lucide-react";

export const SubscriptionSettings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const planName = user.plan || "Plan Básico";
  const status = user.subscriptionStatus || "inactive";
  const currentPeriodEnd = user.currentPeriodEnd ? new Date(user.currentPeriodEnd) : null;
  
  const isActive = status === "active" || status === "trialing";
  const isCanceled = status === "canceled";
  const isPastDue = status === "past_due" || status === "unpaid";

  let daysRemaining = null;
  if (currentPeriodEnd) {
    const diffTime = currentPeriodEnd.getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const handleModifySubscription = () => {
    navigate("/precios");
  };

  return (
    <div className="w-full max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl shadow-premium border border-border p-8 overflow-hidden relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-[#223382] mb-2 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary" />
                Mi Suscripción
              </h2>
              <p className="text-text-secondary text-sm">
                Gestiona tu plan actual y estado de facturación.
              </p>
            </div>
            
            {isActive && (
              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-2 font-semibold text-sm border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                Suscripción Activa
              </div>
            )}
            {isCanceled && (
              <div className="px-4 py-2 bg-rose-50 text-rose-700 rounded-full flex items-center gap-2 font-semibold text-sm border border-rose-200 shadow-sm">
                <AlertCircle className="w-4 h-4" />
                Suscripción Cancelada
              </div>
            )}
            {isPastDue && (
              <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full flex items-center gap-2 font-semibold text-sm border border-amber-200 shadow-sm">
                <AlertCircle className="w-4 h-4" />
                Pago Pendiente
              </div>
            )}
            {!isActive && !isCanceled && !isPastDue && (
              <div className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full flex items-center gap-2 font-semibold text-sm border border-slate-200 shadow-sm">
                Sin Plan Activo
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface-raised rounded-2xl p-6 border border-border/60 shadow-sm">
              <div className="text-text-secondary text-sm font-medium mb-1 uppercase tracking-wider text-[11px]">Plan Actual</div>
              <div className="text-xl font-bold text-[#223382] capitalize">{planName}</div>
            </div>

            <div className="bg-surface-raised rounded-2xl p-6 border border-border/60 shadow-sm">
              <div className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-1 uppercase tracking-wider text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                Próximo ciclo / Vencimiento
              </div>
              <div className="text-xl font-bold text-[#223382]">
                {currentPeriodEnd ? (
                  new Intl.DateTimeFormat('es', { day: '2-digit', month: 'long', year: 'numeric' }).format(currentPeriodEnd)
                ) : (
                  "N/A"
                )}
              </div>
              {daysRemaining !== null && daysRemaining >= 0 && (
                <div className="mt-3 text-sm font-bold flex items-center gap-1.5 text-primary bg-primary/5 w-fit px-3 py-1.5 rounded-lg border border-primary/10">
                  <Clock className="w-4 h-4" />
                  Quedan {daysRemaining} días
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-sm text-text-secondary font-medium">
              ¿Deseas cambiar tu plan o explorar otras opciones?
            </div>
            <button
              onClick={handleModifySubscription}
              className="vf-btn-primary h-[48px] px-8 shadow-floating hover:scale-[1.02] transition-transform font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                Modificar Suscripción <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
