import React, { useState } from "react";
import { Lock, Loader2, ChevronDown } from "lucide-react";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { useUpdateMyProfile } from "../api/useSettings";

export const ChangePasswordSection: React.FC = () => {
  const { addToast } = useToast();
  const updateProfile = useUpdateMyProfile();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast("Todos los campos son obligatorios", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("Las contraseñas no coinciden", "error");
      return;
    }
    if (newPassword.length < 8) {
      addToast("La nueva contraseña debe tener al menos 8 caracteres", "error");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      addToast("La contraseña debe contener mayúscula, minúscula y número", "error");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        nombre: "",
        apellido: "",
        currentPassword,
        newPassword,
      });
      addToast("Contraseña actualizada correctamente", "success");
      reset();
      setOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al cambiar la contraseña";
      addToast(msg, "error");
    }
  };

  return (
    <section className="bg-white border border-border rounded-lg p-6 space-y-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Cambiar Contraseña</h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <p className="text-sm text-text-secondary">
            Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="cp-current" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Contraseña actual
              </label>
              <input
                id="cp-current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="vf-input w-full"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label htmlFor="cp-new" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Nueva contraseña
              </label>
              <input
                id="cp-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="vf-input w-full"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="cp-confirm" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                id="cp-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="vf-input w-full"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="vf-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                "Cambiar contraseña"
              )}
            </button>
          </form>
        </>
      )}
    </section>
  );
};