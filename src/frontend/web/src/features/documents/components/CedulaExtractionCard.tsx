import React from "react";
import { CedulaRdExtractionV1, ExtractionStatus, FieldStatus, ExtractedField } from "../types";
import { CheckCircle2, AlertTriangle, Fingerprint, Loader2, Info } from "lucide-react";

interface CedulaExtractionCardProps {
  extraction: CedulaRdExtractionV1;
}

export const CedulaExtractionCard: React.FC<CedulaExtractionCardProps> = ({ extraction }) => {
  const isProcessing = extraction.extractionStatus === ExtractionStatus.Queued || extraction.extractionStatus === ExtractionStatus.Processing;
  const isError = extraction.extractionStatus === ExtractionStatus.Failed;
  
  if (isProcessing) {
    return (
      <div className="w-full mt-2 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-3 animate-pulse">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="text-xs font-bold text-primary tracking-widest uppercase">Procesando IA OCR...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full mt-2 p-4 rounded-xl border border-error/20 bg-error/5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-error mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-error uppercase">Error de Extracción OCR</h4>
          <p className="text-xs text-error/80 mt-1">No se pudieron extraer los datos del documento con la claridad requerida. Verifique la calidad de la imagen.</p>
        </div>
      </div>
    );
  }

  const renderField = (label: string, field: ExtractedField, isCedula = false) => {
    if (!field) return null;
    const isMissing = field.status === FieldStatus.Missing;
    const isLowConfidence = field.status === FieldStatus.LowConfidence || field.confidence < 0.8;
    
    return (
      <div className="flex flex-col p-3 rounded-lg bg-white border border-border/40 shadow-sm relative group">
        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/70 mb-1">
          {label}
        </span>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-bold ${isMissing ? 'text-error/60 italic' : isCedula ? 'text-primary font-mono' : 'text-text-primary'}`}>
            {isMissing ? 'NO DETECTADO' : field.normalizedValue}
          </span>
          {!isMissing && (
            <div className={`w-2 h-2 rounded-full ${isLowConfidence ? 'bg-warning' : 'bg-success'}`} title={`Confianza: ${(field.confidence * 100).toFixed(0)}%`} />
          )}
        </div>
        {!isMissing && field.rawValue !== field.normalizedValue && (
           <div className="absolute top-full left-0 z-10 mt-1 hidden group-hover:block w-max max-w-[200px] p-2 bg-secondary text-white text-[10px] rounded shadow-xl border border-white/10">
             <div className="text-white/60 mb-0.5 uppercase tracking-widest text-[8px]">OCR Original</div>
             <div className="font-mono">{field.rawValue}</div>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full mt-2 p-4 sm:p-5 rounded-xl border border-border/50 bg-surface-container-low shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Fingerprint className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-secondary tracking-tight">Extracción de Identidad</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">{extraction.processorName} {extraction.processorVersion}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
           {extraction.extractionStatus === ExtractionStatus.Completed ? (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-success/10 text-success border border-success/20">
                <CheckCircle2 className="w-3 h-3" /> Extracción Exitosa
              </span>
           ) : (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-warning/10 text-warning border border-warning/20">
                <AlertTriangle className="w-3 h-3" /> Extracción Parcial
              </span>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {renderField("Cédula / ID", extraction.cedulaNumber, true)}
        {renderField("Nombres", extraction.firstNames)}
        {renderField("Apellidos", extraction.lastNames)}
        {renderField("Fecha Nacimiento", extraction.birthDate)}
        {renderField("Fecha Expiración", extraction.expiryDate)}
      </div>
      
      {extraction.warnings && extraction.warnings.length > 0 && (
         <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2 text-warning text-xs">
           <Info className="w-4 h-4 shrink-0 mt-0.5" />
           <ul className="list-disc list-inside space-y-1">
             {extraction.warnings.map((w, i) => <li key={i}>{w}</li>)}
           </ul>
         </div>
      )}
    </div>
  );
};
