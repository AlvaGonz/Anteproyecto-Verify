import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ArrowRight } from "lucide-react";

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlans: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  isOpen,
  onClose,
  onViewPlans,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-secondary/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <m.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          role="dialog"
          aria-modal="true"
          aria-labelledby="limit-modal-title"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 pb-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <AlertTriangle className="w-8 h-8 text-amber-600 -rotate-3" />
            </div>
            
            <h2 id="limit-modal-title" className="text-2xl font-black text-[#223382] mb-3">
              Límite Alcanzado
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Has alcanzado el límite de proyectos permitidos por tu plan actual. Para seguir creando más proyectos y disfrutar de beneficios adicionales, te invitamos a mejorar tu suscripción.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onClose();
                  onViewPlans();
                }}
                className="w-full py-3.5 px-6 bg-[#223382] hover:bg-[#1a2663] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
              >
                Ver planes de suscripción
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 px-6 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </m.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
