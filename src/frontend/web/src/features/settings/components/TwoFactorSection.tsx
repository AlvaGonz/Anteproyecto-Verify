import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { TwoFactorService, type TwoFactorStatus } from "../../auth/services/TwoFactorService";
import { EnrollmentWizard } from "./EnrollmentWizard";
import { DisableTwoFactorDialog } from "./DisableTwoFactorDialog";

export const TwoFactorSection: React.FC = () => {
  const { addToast } = useToast();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"idle" | "enrolling" | "disabling">("idle");

  const load = async () => {
    setLoading(true);
    try {
      const s = await TwoFactorService.getStatus();
      setStatus(s);
    } catch (err: any) {
      addToast(err?.response?.data?.message ?? "No se pudo cargar el estado de 2FA.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <section className="bg-white border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Cargando verificación en dos pasos…</span>
       </div>
    </section>
    );
  }

  const enabled = status?.enabled ?? false;

  if (mode === "enrolling") {
    return (
      <section className="bg-white border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Activar verificación en dos pasos
    </h2>
        <EnrollmentWizard onCompleted={() => { setMode("idle"); load(); }} onCancel={() => setMode("idle")} />
    </section>
    );
  }

  if (mode === "disabling") {
    return (
      <section className="bg-white border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-700">
          <ShieldOff className="w-5 h-5" />
          Desactivar verificación en dos pasos
    </h2>
        <DisableTwoFactorDialog
          onDisabled={() => { setMode("idle"); load(); }}
          onCancel={() => setMode("idle")}
        />
    </section>
    );
  }

  return (
    <section className="bg-white border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">Verificación en dos pasos (2FA</h2>
  </div>

      <p className="text-sm text-text-secondary">
        Añade una segunda capa de seguridad con códigos de un solo uso generados por una app autenticadora.
        Compatible con Google Authenticator, Authy, 1Password y Microsoft Authenticator.
  </p>

      {enabled ? (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
          <div className="text-sm text-emerald-900">
            <strong>Activada</strong> Su cuenta requiere un código de 6 dígitos además de su contraseña al iniciar sesión.
            {status?.hasRecoveryCodes === false && (
              <p className="mt-1 text-amber-700">
                ⚠ No le quedan códigos de recuperación. Le recomendamos desactivar y volver a activar para regenerarlos.
             </p>
            )}
       </div>
     </div>
      ) : (
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/15 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-text-primary">
            <strong>Desactivada</strong> Le recomendamos activarla para proteger su cuenta.
       </div>
     </div>
      )}

      <div className="flex gap-3">
        {enabled ? (
          <button onClick={() => setMode("disabling")} className="vf-btn-ghost text-rose-700 border-rose-200 hover:bg-rose-50">
            <ShieldOff className="w-4 h-4" />
            Desactivar 2FA
       </button>
        ) : (
          <button onClick={() => setMode("enrolling")} className="vf-btn-primary">
            <ShieldCheck className="w-4 h-4" />
            Activar 2FA
       </button>
        )}
     </div>
  </section>
  );
};
