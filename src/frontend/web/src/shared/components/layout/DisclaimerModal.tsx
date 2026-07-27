import React, { useState, useEffect } from "react";
import { ShieldAlert, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/Toast/ToastContext";
import { apiClient } from "../../../infrastructure/api/client";

export const DisclaimerModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is not logged in or has already accepted the disclaimer, do not render anything
  const showModal = !!user && !user.aceptoDescargo;

  // Prevent closing the modal via Escape key
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
    setIsSubmitting(true);
    try {
      await apiClient.post("/account/descargo");
      updateUser({ aceptoDescargo: true });
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Error al guardar el descargo";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 overflow-hidden">
          {/* Overlay - clicking does NOT close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-default"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
          >
            {/* Top Indicator bar */}
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600 shrink-0" />

            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-4 shrink-0 bg-amber-50/20">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="text-amber-600 w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  Descargo de Responsabilidad Legal
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Términos y condiciones de uso del servicio de consulta VeriFinca
                </p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-4 scroll-smooth pr-6 scrollbar-thin">
              <p className="font-semibold text-slate-800">
                Por favor, lea atentamente los siguientes términos antes de proceder con el uso de la plataforma:
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 space-y-3">
                <p>
                  El contenido que se proporciona a través de este servicio es exclusivamente para fines informativos generales. En consecuencia, toda información brindada es suministrada de buena fe, sin embargo, se advierte no existe garantía de ningún tipo con relación al estado, exactitud, disponibilidad, integridad, vigencia, y cualquier otra cualidad que pretenda establecer certeza de los datos aquí publicados, por lo cual, a los fines de obtener información actualizada y/o certificada, le invitamos a realizar los procedimientos instaurados por las vías correspondientes. Asimismo, no debe considerarse la consulta de información realizada a través de este servicio como un asesoramiento profesional.
                </p>
                <p>
                  Verifinca no se hace responsable del contenido proporcionado a través de este servicio ni de las consecuencias de cualquier acción realizada en base a la información proporcionada en la consulta, a menos que la misma sea confirmada posteriormente por escrito. En consecuencia, el usuario reconoce el carácter referencial de la consulta y libera de responsabilidad a la institución.
                </p>
              </div>

              <div className="space-y-2">
                <p>Al hacer clic en <strong>"Aceptar y Continuar"</strong>, usted declara que:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                  <li>Comprende el carácter referencial e informativo de los datos presentados.</li>
                  <li>Exime a VeriFinca de cualquier responsabilidad legal por decisiones tomadas en base a estas consultas.</li>
                  <li>Reconoce la importancia de realizar las validaciones correspondientes por las vías institucionales oficiales para certificaciones formales.</li>
                </ul>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={handleAccept}
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-70 disabled:pointer-events-none hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  "Procesando..."
                ) : (
                  <>
                    <Check size={16} strokeWidth={3} />
                    Aceptar y Continuar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
