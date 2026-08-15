import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Discrepancy } from "../hooks/useDiscrepancyCheck";

interface Props {
  isOpen: boolean;
  discrepancies: Discrepancy[];
  onCancel: () => void;
  onProceed: () => void;
}

export const DiscrepancyAlertDialog: React.FC<Props> = ({ isOpen, discrepancies, onCancel, onProceed }) => {
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-text-primary/60 backdrop-blur-md" 
          role="alertdialog" 
          aria-modal="true"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            className="bg-surface border border-outline-variant/30 rounded-[28px] md:rounded-[32px] shadow-modal w-full max-w-xl overflow-hidden max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-4rem)] flex flex-col"
          >
            
            {/* Header - Fijo */}
            <div className="flex justify-between items-start p-5 md:p-6 bg-error/5 border-b border-error/10 relative shrink-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface shadow-sm border border-error/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-error" />
                </div>
                <div className="pr-2">
                  <h2 className="text-lg md:text-xl font-display font-black text-text-primary mb-1">Discrepancias Detectadas</h2>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                    Hemos detectado diferencias críticas entre los datos declarados y los extraídos del documento oficial.
                  </p>
                </div>
              </div>
              <button onClick={onCancel} className="p-2 -mr-2 -mt-1 text-text-secondary hover:bg-surface-raised hover:text-error rounded-full transition-all active:scale-95 shrink-0" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content - Scrollable */}
            <div className="p-5 md:p-6 overflow-y-auto bg-surface scrollbar-hide flex-1">
              <div className="space-y-4">
                {discrepancies.map((d, idx) => (
                  <div key={idx} className="bg-surface-raised rounded-2xl p-4 md:p-5 border border-outline-variant/30 shadow-raised transition-all hover:shadow-floating hover:border-error/30 group">
                    <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-error/60"></span>
                      {d.field}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm bg-surface rounded-xl p-3 md:p-4 border border-outline-variant/20">
                      <div className="space-y-1.5">
                        <div className="text-text-secondary text-[11px] font-bold uppercase tracking-wider">Dato Declarado</div>
                        <div className="font-mono text-error text-xs md:text-sm font-medium break-all bg-error/5 px-2.5 py-1.5 rounded-md border border-error/10">
                          {d.projectValue}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-text-secondary text-[11px] font-bold uppercase tracking-wider">Dato del Documento</div>
                        <div className="font-mono text-warning text-xs md:text-sm font-medium break-all bg-warning/5 px-2.5 py-1.5 rounded-md border border-warning/20">
                          {d.documentValue}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advertencia movida abajo */}
              <div className="mt-6 p-4 md:p-5 bg-error/5 rounded-2xl border border-error/10 flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                 <p className="text-sm font-medium text-text-primary leading-relaxed">
                   ¿Desea validar de todas formas? <span className="text-text-secondary font-normal block mt-1">Ignorar estas alertas podría resultar en la aprobación de información fraudulenta.</span>
                 </p>
              </div>
            </div>

            {/* Footer - Fijo */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-5 md:p-6 border-t border-outline-variant/20 bg-surface-variant/50 shrink-0">
              <button
                onClick={onCancel}
                className="w-full sm:w-auto h-[48px] px-6 flex items-center justify-center rounded-xl font-bold text-[15px] text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-transparent hover:border-outline-variant/50 transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                onClick={onProceed}
                className="w-full sm:w-auto h-[48px] px-6 flex items-center justify-center gap-2 rounded-xl font-bold text-[15px] bg-error text-white shadow-raised hover:bg-red-700 hover:shadow-floating transition-all active:scale-[0.98]"
              >
                Proceder con Riesgo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render via portal to escape stacking contexts
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
