import { useState } from "react";
import { Loader2, ShieldOff, AlertCircle } from "lucide-react";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { TwoFactorService } from "../../auth/services/TwoFactorService";
import { sanitizeDigits } from "../../auth/utils/sanitizeDigits";

export interface DisableTwoFactorDialogProps {
  onDisabled: () => void;
  onCancel: () => void;
}

export const DisableTwoFactorDialog: React.FC<DisableTwoFactorDialogProps> = ({ onDisabled, onCancel }) => {
  const { addToast } = useToast();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || code.length !== 6) {
      setError("Ingrese su contraseña y un código de 6 dígitos.");
      return;
    }
    setIsBusy(true);
    try {
      await TwoFactorService.disable(password, code);
      addToast("Verificación en dos pasos desactivada.", "success");
      onDisabled();
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message ?? err?.message ?? "No se pudo desactivar.";
      setError(status === 423 || status === 429 ? "Demasiados intentos. Espere unos minutos." : msg);
    } finally {
      setIsBusy(false);
    }
  };

  const errorMessage = error;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
        <ShieldOff className="w-5 h-5 text-rose-700 mt-0.5 shrink-0" />
        <div className="text-sm text-rose-900 leading-relaxed">
          <strong>¿Está seguro</strong> Desactivar la verificación reduce la seguridad de su cuenta. Necesitará
          su contraseña y un código actual de la app autenticadora.
     </div>
   </div>

      <div>
        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest" htmlFor="disable-password">
          Contraseña
     </label>
        <input
          id="disable-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          className="vf-input w-full mt-1 h-[44px]"
          disabled={isBusy}
        />
   </div>

      <div>
        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest" htmlFor="disable-code">
          Código de la app autenticadora
     </label>
        <input
          id="disable-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={code}
          maxLength={6}
          onChange={(e) => { setCode(sanitizeDigits(e.target.value, 6)); setError(null); }}
          className="vf-input w-full mt-1 text-center tracking-[0.4em] font-mono h-[44px]"
          disabled={isBusy}
        />
   </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium flex items-start gap-2" role="alert">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
       </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={isBusy} className="vf-btn-danger">
          {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Desactivar
     </button>
        <button type="button" onClick={onCancel} className="vf-btn-ghost">Cancelar</button>
   </div>
 </form>
  );
};
