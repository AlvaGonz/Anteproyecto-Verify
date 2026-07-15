import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight, XCircle } from "lucide-react";
import { apiClient } from "@/infrastructure/api/client";
import { useAuth } from "../../shared/context/AuthContext";

export const EmailVerifiedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(3);
  const hasAttempted = useRef(false);
  const { refreshUser } = useAuth();

  // ponytail: store nextStep from API to drive post-verify navigation
  const nextStepRef = useRef<string | null>(null);
  const pendingPlanRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        setStatus("error");
      }, 0);
      return () => clearTimeout(timer);
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    // Call API to verify token
    apiClient.get(`/auth/verify?token=${token}`)
      .then(async (response) => {
        // Since backend set cookies, we can just load the user profile
        if (response.data?.succeeded) {
            await refreshUser();
            // Store nextStep and pendingPlan from backend response
            nextStepRef.current = response.data.nextStep ?? null;
            pendingPlanRef.current = response.data.pendingPlanCode ?? null;
        }
        setStatus("success");
      })
      .catch(() => {
        const timer = setTimeout(() => {
          setStatus("error");
        }, 0);
        return () => clearTimeout(timer);
      });
  }, [token, refreshUser]);

  const computeTargetUrl = useCallback((): string => {
    // New flow: backend tells frontend where to go
    if (nextStepRef.current === "checkout" && pendingPlanRef.current) {
      return `/checkout?plan=${pendingPlanRef.current}`;
    }
    if (nextStepRef.current === "choose-plan") {
      return "/pricing";
    }
    if (nextStepRef.current === "dashboard") {
      return "/admin";
    }
    // Legacy fallback
    const storedRedirect = window.sessionStorage.getItem('redirect_after_verification');
    const urlReturnUrl = searchParams.get('returnUrl');
    return urlReturnUrl || storedRedirect || "/admin";
  }, [searchParams]);

  useEffect(() => {
    if (status === "success") {
      const targetUrl = computeTargetUrl();
      const storedRedirect = window.sessionStorage.getItem('redirect_after_verification');

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (storedRedirect) {
              window.sessionStorage.removeItem('redirect_after_verification');
            }
            navigate(targetUrl);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, navigate, computeTargetUrl]);

  const handleContinueClick = () => {
    const targetUrl = computeTargetUrl();
    const storedRedirect = window.sessionStorage.getItem('redirect_after_verification');
    if (storedRedirect) {
      window.sessionStorage.removeItem('redirect_after_verification');
    }
    navigate(targetUrl);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-premium border border-border p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        {status === "loading" && (
          <div className="py-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-[#223382] mb-2">Verificando tu correo...</h2>
            <p className="text-text-secondary text-sm">Espera un momento mientras confirmamos tu cuenta.</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-[#223382] mb-3">¡Cuenta verificada!</h2>
            <p className="text-text-secondary mb-6">
              Tu correo electrónico ha sido verificado con éxito y hemos iniciado sesión por ti.
            </p>
            <div className="text-sm font-medium text-text-secondary mb-8 bg-slate-50 py-3 rounded-lg border border-border/60">
              Serás redirigido en <span className="text-primary font-bold text-base px-1">{countdown}</span> segundos...
            </div>
            <button type="button"
              onClick={handleContinueClick}
              className="vf-btn-primary w-full h-[52px] text-sm font-bold shadow-floating hover:scale-[1.02] transition-transform"
            >
              <span className="flex items-center justify-center gap-2">
                Continuar <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-[#223382] mb-3">Error de verificación</h2>
            <p className="text-text-secondary mb-6">
              El enlace de verificación es inválido o ha expirado. Por favor, intenta registrarte nuevamente o solicita un nuevo enlace.
            </p>
            <button type="button"
              onClick={() => navigate("/login")}
              className="vf-btn-secondary w-full h-[52px] text-sm font-bold bg-slate-100 hover:bg-slate-200 text-text-primary rounded-xl transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
