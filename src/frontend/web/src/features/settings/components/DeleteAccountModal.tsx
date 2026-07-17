import React, { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isProcessing: boolean;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset confirmation text when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmText("");
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

  const canSubmit = confirmText === "ELIMINAR" && !isProcessing;

  const handleConfirm = async () => {
    if (!canSubmit) return;
    await onConfirm();
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>

            {/* Title */}
            <h2
              id="delete-account-modal-title"
              className="text-xl font-black text-text-primary mb-2"
            >
              ¿Eliminar cuenta?
            </h2>

            {/* Description */}
            <p
              id="delete-account-modal-description"
              className="text-sm text-text-secondary mb-6"
            >
              Esta acción es permanente y no se puede deshacer.
            </p>

            {/* Warning bullets */}
            <div className="text-left mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
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

              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                <li>Perderás acceso a tu cuenta.</li>
                <li>Esta acción no se puede deshacer.</li>
                <li>Tu información asociada dejará de estar disponible según las reglas del sistema.</li>
              </ul>
            </div>

            {/* Confirmation input */}
            <div className="text-left mb-6">
              <label
                htmlFor="del-modal-confirm"
                className="block text-xs font-bold text-text-secondary uppercase mb-1"
              >
                Escribe <span className="font-black">ELIMINAR</span> para confirmar
              </label>
              <input
                ref={confirmInputRef}
                id="del-modal-confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="vf-input w-full"
                placeholder="ELIMINAR"
                autoComplete="off"
                aria-describedby="delete-account-modal-description"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="vf-btn-secondary w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canSubmit}
                className="vf-btn-danger w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Eliminando..." : "Eliminar cuenta"}
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};