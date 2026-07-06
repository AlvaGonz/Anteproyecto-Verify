import React from "react";
import { Share2, Printer, Download } from "lucide-react";

export const VerificationResultCardActions: React.FC = () => {
  return (
    <div className="flex justify-end gap-3 mb-6 print:hidden">
      <button
        type="button"
        className="h-10 px-4 flex items-center gap-2 rounded-xl bg-surface border border-outline-variant/10 text-on-surface-variant text-xs font-bold hover:bg-surface-raised transition-colors"
      >
        <Share2 className="w-4 h-4" /> Compartir
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="h-10 px-4 flex items-center gap-2 rounded-xl bg-secondary text-[#F4F1EC] text-xs font-bold hover:shadow-floating transition-all active:scale-95"
      >
        <Printer className="w-4 h-4" /> Imprimir
      </button>
      <button
        type="button"
        className="h-10 px-4 flex items-center gap-2 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-floating transition-all active:scale-95"
      >
        <Download className="w-4 h-4" /> Capturar Constancia
      </button>
    </div>
  );
};
