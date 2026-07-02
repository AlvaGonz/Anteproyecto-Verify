import React from "react";
import { Mail } from "lucide-react";
import { useResendVerificationEmail } from "../api/useAuth";

interface VerificationEmailActionsProps {
  email: string;
  redirectUrl?: string;
  onRetryRegister: () => void;
}

export const VerificationEmailActions: React.FC<VerificationEmailActionsProps> = ({ 
  email, 
  redirectUrl, 
  onRetryRegister 
}) => {
  const { mutate: resendEmail, isPending: isResending, isSuccess: resendSuccess, error: resendError } = useResendVerificationEmail();

  return (
    <div className="w-full text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-200">
        <Mail className="w-10 h-10 text-emerald-600" />
      </div>
      <h3 className="text-2xl font-display font-extrabold text-[#223382] mb-3 tracking-tight">Revisa tu correo</h3>
      <p className="text-text-secondary mb-8 leading-relaxed max-w-sm mx-auto">
        Hemos enviado un enlace de verificación a <span className="font-semibold text-text-primary block mt-1 text-lg">{email}</span>
        Por favor, haz clic en el enlace para activar tu cuenta.
      </p>
      <div className="pt-6 border-t border-border/50">
        <p className="text-sm text-text-secondary">
          ¿No lo recibiste? Revisa tu carpeta de spam,{" "}
          <button 
            type="button"
            onClick={() => resendEmail({ email, returnUrl: redirectUrl })}
            disabled={isResending}
            className="text-primary hover:text-[#1a2663] hover:underline font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="resend-verification-button"
          >
            {isResending ? "reenviando..." : "reenviar correo"}
          </button>{" "}
          o{" "}
          <button 
            type="button"
            onClick={onRetryRegister} 
            className="text-primary hover:text-[#1a2663] hover:underline font-semibold transition-colors"
          >
            intenta registrarte nuevamente
          </button>.
        </p>
        {resendError && (
          <div className="mt-4 p-3 bg-rose-50 text-rose-600 rounded-md text-sm text-center font-medium" data-testid="resend-error-message">
            {(resendError as Error).message || "Error al reenviar el correo."}
          </div>
        )}
        {resendSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 rounded-md text-sm text-center font-medium" data-testid="resend-success-message">
            Correo de verificación reenviado exitosamente.
          </div>
        )}
      </div>
    </div>
  );
};
