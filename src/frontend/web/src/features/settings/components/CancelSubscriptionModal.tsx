import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw, X } from "lucide-react";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (feedback?: string) => void;
  isCanceling: boolean;
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCanceling,
}) => {
  const [feedback, setFeedback] = useState("");

  // Clear feedback when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Use setTimeout to avoid setting state during render
      const timer = setTimeout(() => setFeedback(""), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={!isCanceling ? onClose : undefined}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-raised">
              <h3 className="text-lg font-bold text-[#223382] flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Cancelar Suscripción
              </h3>
              <button
                type="button"
                onClick={onClose}
                disabled={isCanceling}
                className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 flex flex-col">
              <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                ¿Estás seguro de que deseas cancelar tu suscripción? Tu plan actual y sus beneficios se mantendrán activos hasta el <strong>final del período facturado</strong>. Después de eso, tu cuenta pasará automáticamente al plan gratuito.
              </p>

              <div className="space-y-2 mb-2">
                <label htmlFor="cancel-feedback" className="block text-sm font-semibold text-text-primary">
                  ¿Podrías decirnos por qué nos dejas? <span className="text-text-tertiary font-normal">(Opcional)</span>
                </label>
                <textarea
                  id="cancel-feedback"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Escribe tus comentarios aquí..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  disabled={isCanceling}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-border flex flex-col-reverse sm:flex-row gap-3 sm:justify-end bg-surface-raised shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isCanceling}
                className="vf-btn-secondary h-11 px-6 font-semibold"
              >
                Mantener mi plan
              </button>
              <button
                type="button"
                onClick={() => onConfirm(feedback)}
                disabled={isCanceling}
                className="vf-btn-secondary h-11 px-6 font-bold text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {isCanceling ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Sí, cancelar suscripción
                </span>
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
