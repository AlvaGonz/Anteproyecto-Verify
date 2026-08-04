import React, { useEffect, useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useValidationDisclaimer } from "../api/useValidationDisclaimer";

const DISCLAIMER_BODY =
  "Para extraer los datos de los documentos adjuntos usamos tecnología OCR. Debido a que esta tecnología puede presentar errores, omisiones o interpretaciones incorrectas, la información resultante debe ser revisada por usted antes de enviar la validación. Los datos mostrados y prellenados por el sistema son solo de apoyo.";

interface OcrDisclaimerModalProps {
  projectId: string;
}

export const OcrDisclaimerModal: React.FC<OcrDisclaimerModalProps> = ({ projectId }) => {
  const { accepted, isLoading, accept } = useValidationDisclaimer(projectId);
  const [dismissed, setDismissed] = useState(false);
  const reduceMotion = useReducedMotion();

  const showModal = !isLoading && !accepted && !dismissed;

  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [showModal]);

  const handleAccept = async () => {
    setDismissed(true);
    try {
      await accept();
    } catch {
      // ponytail: if the POST fails, the disclaimer reappears on next visit
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ocr-disclaimer-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-default"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
          >
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600 shrink-0" />

            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-4 shrink-0 bg-amber-50/20">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 ring-1 ring-amber-200/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-amber-600 w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 id="ocr-disclaimer-title" className="text-xl font-extrabold text-slate-900 leading-tight">
                  Aviso sobre los Datos Extraídos
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Extracción automática de documentos mediante tecnología OCR
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto text-sm leading-relaxed scroll-smooth pr-6 scrollbar-thin">
              <div className="p-5 md:p-6 bg-amber-50 border border-amber-100 rounded-2xl shadow-sm">
                <p className="text-sm md:text-[15px] leading-relaxed text-slate-700 max-w-prose">
                  <strong className="font-bold text-amber-900">Importante:</strong> {DISCLAIMER_BODY}
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
              <button
                type="button"
                autoFocus
                onClick={handleAccept}
                className="w-full md:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
              >
                <Check size={16} strokeWidth={3} />
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
