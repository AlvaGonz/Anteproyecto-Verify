import { useState } from "react";
import { Link } from "react-router-dom";
import { X, CreditCard } from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";

const DISMISSED_KEY = "pendingPlanBannerDismissed";

export const PendingPlanBanner: React.FC = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === "true");

  const planCode = user?.pendingPlanCode;
  const billingCycle = user?.pendingBillingCycle || "monthly";
  const hasActiveSub =
    user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing";

  if (dismissed || !planCode || hasActiveSub) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in" role="status">
      <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
        <CreditCard className="w-4 h-4 text-amber-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-900">
          Suscripción pendiente
        </p>
        <p className="text-sm text-amber-800 mt-0.5">
          Completa tu suscripción al plan <span className="font-semibold capitalize">{planCode}</span> para acceder a todas las funcionalidades.
        </p>
        <Link
          to={`/checkout?plan=${planCode}&billing=${billingCycle}`}
          className="inline-block mt-2 text-sm font-bold text-amber-900 underline hover:text-amber-700 underline-offset-2 transition-colors"
        >
          Ir a pagar
        </Link>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Descartar"
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
