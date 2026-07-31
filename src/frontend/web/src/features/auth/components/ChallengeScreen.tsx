import { useState, useRef, useEffect } from "react";
import { m } from "framer-motion";
import { ShieldCheck, Mail, KeyRound, ArrowLeft, Loader2, AlertCircle, Lock } from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";
import { TwoFactorService } from "../../auth/services/TwoFactorService";

type Mode = "totp" | "email" | "recovery";

const CODE_LENGTH = 6;

export const ChallengeScreen: React.FC = () => {
  const { pendingChallenge, clearChallenge, refreshUser } = useAuth();
  const [mode, setMode] = useState<Mode>("totp");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  if (!pendingChallenge) return null;

  const handleCodeChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(sanitized);
    setError(null);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!pendingChallenge) return;
    if (mode !== "recovery" && code.length !== CODE_LENGTH) {
      setError("Ingrese los 6 dígitos del código.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      if (mode === "totp") {
        await TwoFactorService.verifyChallenge(pendingChallenge.challengeToken, code);
      } else if (mode === "email") {
        await TwoFactorService.verifyEmailOtp(pendingChallenge.challengeToken, code);
      } else {
        await TwoFactorService.consumeRecoveryCode(pendingChallenge.challengeToken, code.trim());
      }
      setInfo("Verificación exitosa. Redirigiendo…");
      clearChallenge();
      await refreshUser();
      window.location.hash = "#/admin/dashboard";
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message ?? err?.message ?? "No se pudo verificar el código.";
      setError(status === 423 || status === 429 ? "Demasiados intentos. Espere unos minutos." : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestEmailOtp = async () => {
    if (!pendingChallenge) return;
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      await TwoFactorService.requestEmailOtp(pendingChallenge.challengeToken);
      setEmailSent(true);
      setInfo(`Código enviado a ${pendingChallenge.emailMasked}.`);
      setMode("email");
      setCode("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo enviar el código.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    clearChallenge();
    window.location.hash = "#/login";
  };

  const title = mode === "recovery" ? "Código de recuperación" : "Verificación en dos pasos";
  const placeholder = mode === "recovery" ? "ABCD-EFGH-IJKL" : "000000";

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center mb-4">
          <ShieldCheck className="w-7 h-7 text-primary" />
       </div>
        <h3 className="text-2xl font-display font-extrabold text-[#223382] tracking-tight">{title}</h3>
        <p className="text-text-secondary mt-1 text-sm">
          {mode === "recovery"
            ? "Ingrese uno de los códigos de recuperación que recibió al activar la verificación."
            : `Hola de nuevo. Confirme su identidad para continuar. Le enviamos un código a ${pendingChallenge.emailMasked}.`}
       </p>
     </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium flex items-start gap-2" role="alert">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{"error"}</span>
       </div>
      )}

      {info && !error && (
        <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-r-xl text-sm font-medium" role="status">
          {info}
       </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label className="sr-only" htmlFor="twoFactorCode">{"placeholder"}</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border pointer-events-none" />
            <input
              ref={inputRef}
              id="twoFactorCode"
              type="text"
              inputMode={mode === "recovery" ? "text" : "numeric"}
              autoComplete={mode === "recovery" ? "off" : "one-time-code"}
              placeholder={placeholder}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="vf-input w-full pl-12 pr-4 h-[52px] text-center tracking-[0.4em] font-mono"
              maxLength={mode === "recovery" ? 16 : CODE_LENGTH}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (mode !== "recovery" && code.length !== CODE_LENGTH) || (mode === "recovery" && code.trim().length < 8)}
          className="vf-btn-primary w-full h-[52px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando…
           </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Verificar <ArrowLeft className="w-4 h-4 rotate-180" />
           </span>
          )}
       </button>
     </form>

      <div className="mt-6 flex flex-col gap-2 text-sm">
        {mode !== "email" && (
          <button
            type="button"
            onClick={requestEmailOtp}
            disabled={isSubmitting}
            className="text-primary font-bold hover:underline inline-flex items-center justify-center gap-1"
          >
            <Mail className="w-4 h-4" />
            {emailSent ? "Reenviar código por correo" : "Usar código por correo"}
         </button>
        )}
        {mode !== "recovery" ? (
          <button
            type="button"
            onClick={() => { setMode("recovery"); setCode(""); setError(null); setInfo(null); }}
            className="text-text-secondary hover:text-primary hover:underline inline-flex items-center justify-center gap-1"
          >
            <KeyRound className="w-4 h-4" />
            Usar código de recuperación
         </button>
        ) : (
          <button
            type="button"
            onClick={() => { setMode("totp"); setCode(""); setError(null); setInfo(null); }}
            className="text-text-secondary hover:text-primary hover:underline inline-flex items-center justify-center gap-1"
          >
            <ShieldCheck className="w-4 h-4" />
            Usar código de la app autenticadora
         </button>
        )}
        <button
          type="button"
          onClick={handleCancel}
          className="text-text-secondary/70 hover:text-rose-500 hover:underline text-xs mt-3"
        >
          Cancelar y volver al inicio de sesión
       </button>
     </div>
   </m.div>
  );
};







