import React, { useState } from "react";
import { Loader2, AlertTriangle, FileText, Info, ChevronDown, ChevronUp } from "lucide-react";

export interface DocumentExtractionPanelProps {
  title: string;
  processorName?: string;
  processorVersion?: string;
  isProcessing?: boolean;
  isError?: boolean;
  testId?: string;
  icon?: React.ReactNode;
  warnings?: string[];
  children?: React.ReactNode;
  
  // Custom grid classes if standard 1-2-3 col layout needs overriding
  gridClassName?: string;
}

export const DocumentExtractionPanel: React.FC<DocumentExtractionPanelProps> = ({
  title,
  processorName,
  processorVersion,
  isProcessing = false,
  isError = false,
  testId,
  icon = <FileText className="w-4 h-4 text-primary" />,
  warnings = [],
  children,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start"
}) => {
  
  const [isExpanded, setIsExpanded] = useState(true);

  if (isProcessing) {
    return (
      <div className="w-full mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-3 animate-pulse" data-testid={testId}>
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="text-xs font-bold text-primary tracking-widest uppercase">Procesando IA OCR...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full mt-4 p-4 rounded-xl border border-error/20 bg-error/5 flex items-start gap-3" data-testid={testId}>
        <AlertTriangle className="w-5 h-5 text-error mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-error uppercase">Error de Extracción OCR</h4>
          <p className="text-xs text-error/80 mt-1">No se pudieron extraer los datos del documento con la claridad requerida. Verifique la calidad de la imagen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-4 p-4 sm:p-5 rounded-xl border border-border/50 bg-surface-container-low shadow-sm transition-all" data-testid={testId}>
      <div className={`flex flex-wrap items-center justify-between gap-4 ${isExpanded ? 'mb-5' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="text-sm sm:text-base font-bold text-secondary tracking-tight leading-tight">{title}</h4>
            {processorName && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary leading-tight">
                  {processorName} {processorVersion}
                </span>
              </div>
            )}
          </div>
        </div>
        <button 
          type="button" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-full hover:bg-secondary/10 text-secondary transition-colors"
          title={isExpanded ? "Ocultar detalles" : "Mostrar detalles"}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={gridClassName}>
            {children}
          </div>
          
          {warnings.length > 0 && (
             <div className="mt-5 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2.5 text-warning text-xs leading-relaxed">
               <Info className="w-4 h-4 shrink-0 mt-0.5" />
               <ul className="list-disc list-inside space-y-1 w-full min-w-0">
                 {warnings.map((w, i) => <li key={i} className="break-words">{w}</li>)}
               </ul>
             </div>
          )}
        </div>
      )}
    </div>
  );
};
