import React from "react";
import { CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VerificationResultCardValidationProps {
  validationItems: Array<{ label: string; checked: boolean }>;
}

export const VerificationResultCardValidation: React.FC<
  VerificationResultCardValidationProps
> = ({ validationItems }) => {
  return (
    <>
      <div className="bg-surface-raised rounded-3xl p-8 border border-outline-variant/10 shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-black font-['Manrope'] text-secondary uppercase tracking-tighter">
            Resumen de Validación
          </h3>
        </div>

        <div className="space-y-4">
          {validationItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors",
                    item.checked
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-white border-outline-variant/40",
                  )}
                >
                  {item.checked && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-bold transition-opacity",
                    item.checked
                      ? "text-on-surface"
                      : "text-on-surface-variant opacity-40 line-through",
                  )}
                >
                  {item.label}
                </span>
              </div>
              <span
                className={cn(
                  "text-[9px] font-black italic",
                  item.checked ? "text-emerald-600" : "text-error opacity-60",
                )}
              >
                {item.checked ? "PASÓ" : "FALLÓ"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-secondary/10">
          <div className="flex items-center justify-between text-[10px] font-bold mb-4 opacity-40 uppercase tracking-widest">
            <span>Firma Digital</span>
            <span>vf-sig-v1.2</span>
          </div>
          <div className="font-mono text-[9px] p-3 rounded-lg bg-white border border-secondary/5 text-secondary/30 break-all">
            6F3B20C9223382F98513DA7D32C62828F9A825F4F1EC1111445C5C5CFFFFFFC8BFB5E07610FEF0E0
          </div>
        </div>
      </div>

      {/* Compliance Message */}
      <div className="text-center px-4">
        <p className="text-[10px] font-medium text-on-surface-variant/40 leading-relaxed italic">
          Certificación dinámica generada por el Nodo Central de
          VeriFinca. Consulte el registro histórico en
          blockchain.verifinca.do/archive
        </p>
      </div>
    </>
  );
};
