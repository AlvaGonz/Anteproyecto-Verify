import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight, XCircle } from "lucide-react";
import { apiClient } from "@/infrastructure/api/client";

export const EmailVerifiedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(7);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    // Call API to verify token
    apiClient.get(`/auth/verify?token=${token}`)
      .then(() => {
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [token]);

  useEffect(() => {
    if (status === "success") {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate("/login?verified=true");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, navigate]);

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
              Tu correo electrónico ha sido verificado con éxito. Ya estás registrado en VeriFinca.
            </p>
            <div className="text-sm font-medium text-text-secondary mb-8 bg-slate-50 py-3 rounded-lg border border-border/60">
              Serás redirigido al inicio de sesión en <span className="text-primary font-bold text-base px-1">{countdown}</span> segundos...
            </div>
            <button
              onClick={() => navigate("/login?verified=true")}
              className="vf-btn-primary w-full h-[52px] text-sm font-bold shadow-floating hover:scale-[1.02] transition-transform"
            >
              <span className="flex items-center justify-center gap-2">
                Ir al inicio de sesión ahora <ArrowRight className="w-4 h-4" />
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
            <button
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
