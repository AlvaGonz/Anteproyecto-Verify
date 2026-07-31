import { useState, useRef } from "react";
import { m } from "framer-motion";
import { Copy, ShieldCheck, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { TwoFactorService } from "../../auth/services/TwoFactorService";

type Phase = "begin" | "verify" | "recovery" | "done";

export interface EnrollmentWizardProps {
  onCompleted?: () => void;
  onCancel?: () => void;
}

export const EnrollmentWizard: React.FC<EnrollmentWizardProps> = ({ onCompleted, onCancel }) => {
  const { addToast } = useToast();
  const [phase, setPhase] = useState<Phase>("begin");
  const [secret, setSecret] = useState<string | null>(null);
  const [otpAuthUri, setOtpAuthUri] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [codesConfirmed, setCodesConfirmed] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const startEnrollment = async () => {
    setError(null);
    setIsBusy(true);
    try {
      const result = await TwoFactorService.beginEnrollment();
      setSecret(result.secret);
      setOtpAuthUri(result.otpAuthUri);
      setPhase("verify");
      setCode("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo iniciar la activación.");
    } finally {
      setIsBusy(false);
    }
  };

  const confirmEnrollment = async () => {
    setError(null);
    if (code.length !== 6) {
      setError("Ingrese los 6 dígitos del código.");
      return;
    }
    setIsBusy(true);
    try {
      const result = await TwoFactorService.confirmEnrollment(code);
      setRecoveryCodes(result.recoveryCodes);
      setPhase("recovery");
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message ?? err?.message ?? "Código inválido.";
      setError(status === 423 || status === 429 ? "Demasiados intentos. Espere unos minutos." : msg);
    } finally {
      setIsBusy(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast("Copiado al portapapeles.", "success");
    } catch {
      addToast("No se pudo copiar.", "error");
    }
  };

  if (phase === "begin") {
    return (
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-text-secondary leading-relaxed">
            Añada una capa extra de seguridad. Le pediremos un código de 6 dígitos de su aplicación autenticadora
            cada vez que inicie sesión. Compatible con Google Authenticator, Authy, 1Password y Microsoft Authenticator.
         </p>
      </div>

        {error && (
          <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium" role="alert">
            {error}
        </div>
        )}

        <div className="flex gap-3">
          <button onClick={startEnrollment} disabled={isBusy} className="vf-btn-primary">
            {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Activar verificación
        </button>
          {onCancel && (
            <button onClick={onCancel} className="vf-btn-ghost">Cancelar</button>
          )}
      </div>
    </m.div>
    );
  }

  if (phase === "verify" && secret) {
    return (
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/15 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-text-primary leading-relaxed">
            <strong>Paso 1 de 3</strong> escanee el código QR con su app autenticadora, o copie la clave secreta e ingrésela manualmente.
        </div>
      </div>

        {otpAuthUri && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Clave secreta</label>
            <div className="flex items-stretch gap-2">
              <input
                readOnly
                value={secret}
                className="vf-input flex-1 font-mono text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button onClick={() => copy(secret)} className="vf-btn-ghost px-3" aria-label="Copiar clave">
                <Copy className="w-4 h-4" />
             </button>
          </div>
            {otpAuthUri && (
              <button onClick={() => copy(otpAuthUri)} className="text-xs text-primary font-bold hover:underline">
                o copiar URI otpauth completo
             </button>
            )}
        </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-widest" htmlFor="totp-code">
            Paso 2 de 3: ingrese el código de 6 dígitos
         </label>
          <input
            ref={codeInputRef}
            id="totp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            maxLength={6}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(null); }}
            className="vf-input w-full text-center tracking-[0.4em] font-mono h-[52px]"
            disabled={isBusy}
          />
      </div>

        {error && (
          <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium flex items-start gap-2" role="alert">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{"error"}</span>
        </div>
        )}

        <div className="flex gap-3">
          <button onClick={confirmEnrollment} disabled={isBusy || code.length !== 6} className="vf-btn-primary">
            {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Confirmar
         </button>
          <button onClick={() => { setPhase("begin"); setCode(""); setError(null); setSecret(null); setOtpAuthUri(null); }} className="vf-btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            Volver
         </button>
       </div>
    </m.div>
    );
  }

  if (phase === "recovery") {
    return (
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900 leading-relaxed">
            <strong>Paso 3 de 3: guarde estos códigos de recuperación</strong> Son su única forma de entrar si pierde
            el acceso a la app autenticadora. <strong>No se vuelven a mostrar</strong>
        </div>
      </div>

        <div className="grid grid-cols-2 gap-2 p-4 bg-surface-variant/40 border border-border rounded-xl font-mono text-sm">
          {recoveryCodes.map((c) => (
            <code key={c} className="px-2 py-1 bg-white/60 rounded select-all">{c}</code>
          ))}
      </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={() => copy(recoveryCodes.join("\n"))} className="vf-btn-ghost">
            <Copy className="w-4 h-4" />
            Copiar todos
         </button>
          <button onClick={() => copy(otpAuthUri ?? "")} disabled={!otpAuthUri} className="vf-btn-ghost">
            Copiar URI otpauth
         </button>
      </div>

        <label className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/15 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={codesConfirmed}
            onChange={(e) => setCodesConfirmed(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm text-text-primary">
            Confirmo que he guardado mis códigos de recuperación en un lugar seguro.
        </span>
      </label>

        <div className="flex gap-3">
          <button
            onClick={() => { setPhase("done"); onCompleted?.(); }}
            disabled={!codesConfirmed}
            className="vf-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalizar activación
         </button>
      </div>
    </m.div>
    );
  }

  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 text-center">
      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
      <h4 className="font-display font-bold text-lg">Verificación activada</h4>
      <p className="text-sm text-text-secondary">A partir de ahora le pediremos un código de 6 dígitos al iniciar sesión</p>
   </m.div>
  );
};
