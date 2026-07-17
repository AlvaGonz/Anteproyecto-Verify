import React, { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, Eye, EyeOff } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { confirmation: string; password: string; deletionReason?: string }) => Promise<void>;
  isProcessing: boolean;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [deletionReason, setDeletionReason] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmText("");
      setPassword("");
      setDeletionReason("");
      setShowPassword(false);
    }
    setPrevIsOpen(isOpen);
  }, [isOpen]);

  // Focus management: focus cancel button on open, trap focus
  useEffect(() => {
    if (isOpen) {
      // Focus cancel button initially (safe default)
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);

      // Focus trap
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }

        if (e.key === "Tab") {
          const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusableElements || focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const canSubmit = confirmText === "ELIMINAR" && password.length > 0 && !isProcessing;

  const handleConfirm = async () => {
    if (!canSubmit) return;
    await onConfirm({
      confirmation: confirmText,
      password,
      deletionReason: deletionReason.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen && !prevIsOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-modal-title"
          aria-describedby="delete-account-modal-description"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <m.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex"
          >
            {/* Left Column - Information & Warning */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-50 to-red-100 p-8 flex-col justify-between border-r border-red-100">
              <div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-600" aria-hidden="true" />
                </div>
                <h2 id="delete-account-modal-title" className="text-2xl font-black text-text-primary mb-3 text-center">
                  ¿Eliminar cuenta?
                </h2>
                <p id="delete-account-modal-description" className="text-sm text-text-secondary mb-6 text-center">
                  Esta acción es permanente y no se puede deshacer.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-xs text-red-800 space-y-1">
                    <p className="font-bold">Esta acción es irreversible después de 14 días.</p>
                    <p>
                      Al confirmar, su suscripción será cancelada al final del período vigente,
                      perderá acceso a todos los proyectos y su información personal será
                      anonimizada irreversiblemente después de 30 días.
                    </p>
                  </div>
                </div>

                <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                  <li>Perderás acceso a tu cuenta.</li>
                  <li>Esta acción no se puede deshacer.</li>
                  <li>Tu información asociada dejará de estar disponible según las reglas del sistema.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-red-200">
                <label htmlFor="del-reason" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Motivo (opcional)
                </label>
                <textarea
                  id="del-reason"
                  className="vf-input w-full min-h-[80px] resize-none"
                  placeholder="¿Por qué decides irte? (opcional)"
                  rows={3}
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column - Form & Actions */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col">
              {/* Close button - only visible on mobile or as backup */}
              <div className="lg:hidden flex justify-end mb-4">
                <button
                  type="button"
                  className="text-text-secondary hover:text-text-primary transition-colors p-1"
                  aria-label="Cerrar modal"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }} className="flex-1 flex flex-col justify-center space-y-6">
                <div>
                  <label htmlFor="del-modal-confirm" className="block text-xs font-bold text-text-secondary uppercase mb-2">
                    Escribe <span className="font-black">ELIMINAR</span> para confirmar
                  </label>
                  <input
                    id="del-modal-confirm"
                    className="vf-input w-full"
                    placeholder="ELIMINAR"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="del-password" className="block text-xs font-bold text-text-secondary uppercase mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      id="del-password"
                      className="vf-input w-full pr-12"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    className="vf-btn-secondary w-full sm:w-auto"
                    onClick={onClose}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="vf-btn-danger w-full sm:w-auto"
                    disabled={!canSubmit}
                  >
                    {isProcessing ? 'Eliminando...' : 'Eliminar cuenta'}
                  </button>
                </div>
              </form>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};