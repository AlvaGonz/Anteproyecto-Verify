import React, { useState } from "react";
import { AlertTriangle, ChevronDown, Eye, EyeOff, Trash2 } from "lucide-react";
import { useDeleteAccount } from "../api/useAccountDeletion";
import { useToast } from "@/shared/components/ui/Toast/ToastContext";
import { useAuth } from "@/shared/context/AuthContext";

export const DeleteAccountSection: React.FC = () => {
  const { addToast } = useToast();
  const { logout } = useAuth();
  const deleteAccount = useDeleteAccount();

  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [deletionReason, setDeletionReason] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit =
    confirmation === "ELIMINAR" && password.length > 0 && !deleteAccount.isPending;

  const handleDelete = async () => {
    if (!canSubmit) return;

    try {
      await deleteAccount.mutateAsync({
        confirmation,
        password,
        deletionReason: deletionReason.trim() || undefined,
      });
      addToast("Cuenta marcada para eliminación. Tiene 14 días para recuperarla.", "success");
      // Server already cleared jwt + refreshToken cookies via Set-Cookie
      logout();
      window.location.hash = "#/login";
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Error al solicitar eliminación de cuenta";
      addToast(msg, "error");
    }
  };

  return (
    <div className="border border-red-200 rounded-2xl overflow-hidden">
      {/* Collapsible header — always visible */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-red-700 hover:bg-red-50/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-500" />
          Eliminar Cuenta
        </span>
        <ChevronDown
          className={`w-4 h-4 text-red-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 space-y-4 border-t border-red-100 bg-red-50/30">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 space-y-1">
              <p className="font-bold">Esta acción es irreversible después de 14 días.</p>
              <p>
                Al confirmar, su suscripción será cancelada al final del período vigente,
                perderá acceso a todos los proyectos y su información personal será
                anonimizada irreversiblemente después de 30 días.
              </p>
            </div>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-xs font-bold text-red-700 uppercase mb-1">
              Escriba <span className="font-black">ELIMINAR</span> para confirmar
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="vf-input w-full"
              placeholder="ELIMINAR"
              autoComplete="off"
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="vf-input w-full pr-9"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Optional reason */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Motivo (opcional)
            </label>
            <textarea
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              className="vf-input w-full min-h-[60px] resize-none"
              placeholder="¿Por qué decides irte? (opcional)"
              rows={2}
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canSubmit}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {deleteAccount.isPending ? "Procesando..." : "Sí, Eliminar mi Cuenta"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
