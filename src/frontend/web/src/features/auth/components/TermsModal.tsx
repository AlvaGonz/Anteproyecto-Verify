import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Check } from "lucide-react";

export interface TermsModalProps {
  modalType: "terms" | "privacy" | null;
  closeModal: () => void;
  acceptAndCloseModal: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ modalType, closeModal, acceptAndCloseModal }) => (
  <AnimatePresence>
    {modalType && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-premium border border-border overflow-hidden"
        >
          {/* Modal Header */}
          <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-[#223382] text-white">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#22c55e]" />
              <h3 className="text-xl font-display font-bold text-white">
                {modalType === "terms"
                  ? "Términos de Uso y EULA"
                  : "Política de Privacidad de Datos"}
              </h3>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus:outline-none"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Modal Content Scroll Area */}
          <div className="p-8 overflow-y-auto space-y-6 text-sm text-text-secondary leading-relaxed font-sans scrollbar-thin">
            {modalType === "terms" ? (
              <>
                <p className="font-semibold text-text-primary">
                  Acuerdo de Licencia de Usuario Final (EULA) y Condiciones Generales de Uso de VeriFinca.
                </p>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#223382] text-base">1. Aceptación del Acuerdo</h4>
                  <p>
                    Al registrarse y utilizar los servicios de VeriFinca, usted acepta expresamente quedar vinculado por los términos de este Acuerdo de Licencia de Usuario Final (EULA). Si no está de acuerdo con estos términos, no podrá crear una cuenta ni utilizar la plataforma.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#223382] text-base">2. Licencia de Uso Limitada</h4>
                  <p>
                    VeriFinca otorga al usuario una licencia personal, revocable, no exclusiva y no transferible para utilizar la plataforma únicamente con fines profesionales de evaluación, gestión y validación de proyectos inmobiliarios. Queda estrictamente prohibida la ingeniería inversa, copia o distribución comercial no autorizada del software.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#223382] text-base">3. Uso Aceptable y Restricciones</h4>
                  <p>
                    Como usuario, usted se compromete a no proporcionar información falsa, alterada o no autorizada. Toda documentación catastral, planos, certificados de título y cédulas de identidad subidas a la plataforma deben ser legítimos y contar con la debida autorización de los titulares correspondientes.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#223382] text-base">4. Veracidad de las Consultas Institucionales</h4>
                  <p>
                    La plataforma realiza integraciones con bases de datos externas (DGII, Catastro Nacional, Ayuntamientos). El usuario reconoce que VeriFinca procesa e indexa estos datos con propósitos informativos de validación de m² y solvencia fiscal, y que cualquier discrepancia legal deberá ser resuelta directamente ante el organismo correspondiente.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#223382] text-base">5. Limitación de Responsabilidad</h4>
                  <p>
                    VeriFinca se ofrece "tal cual" y no se hace responsable por pérdidas financieras, retrasos en aprobaciones de construcción o daños directos/indirectos resultantes del uso o la imposibilidad de uso de la plataforma.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-text-primary">
                  Declaración de Privacidad de Datos y Confidencialidad de la Información.
                </p>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#223382] text-base">1. Información que Recopilamos</h4>
                  <p>
                    Para habilitar el acceso institucional y la validación de proyectos inmobiliarios, recopilamos información de contacto (nombres, apellidos, correo electrónico, teléfono) y datos de identificación fiscal y legal del usuario (número de Cédula de Identidad y Electoral).
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#223382] text-base">2. Uso Obligatorio de los Datos</h4>
                  <p>
                    Los datos personales recopilados se utilizan estrictamente para:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Validar la identidad del profesional ante los portales gubernamentales.</li>
                    <li>Hashear y almacenar credenciales de acceso bajo estándares de criptografía industrial (BCrypt).</li>
                    <li>Emitir sellos digitales de integridad y generar reportes analíticos de m² y cumplimiento.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#223382] text-base">3. Medidas de Seguridad de la Información</h4>
                  <p>
                    Toda información confidencial, incluyendo claves, documentos de identidad y planos, se almacena en bases de datos protegidas y servidores seguros con cifrado de extremo a extremo (AES-256) y canales de comunicación cifrados mediante HTTPS. Sus contraseñas se almacenan únicamente como hashes irreversibles.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#223382] text-base">4. Compartición de Datos con Terceros</h4>
                  <p>
                    VeriFinca no vende, alquila ni comparte datos de carácter personal con anunciantes o empresas externas. Las consultas a la DGII o Catastro se realizan a través de APIs cifradas únicamente para la ejecución de las validaciones solicitadas por el usuario.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-5 border-t border-border bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 h-[44px] rounded-xl border border-border bg-white text-sm font-semibold text-text-primary hover:bg-slate-100 transition-colors focus:outline-none"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={acceptAndCloseModal}
              className="px-6 h-[44px] rounded-xl bg-[#223382] text-sm font-bold text-white hover:bg-[#1a2663] transition-colors shadow-sm flex items-center justify-center gap-2 focus:outline-none"
            >
              <Check className="w-4 h-4 font-bold" /> Aceptar y Continuar
            </button>
          </div>
        </m.div>
      </div>
    )}
  </AnimatePresence>
);
