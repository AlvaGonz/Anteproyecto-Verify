import React from "react";
import { PlanoMensuraCatastralRdExtractionV1, ExtractionStatus, FieldStatus, ExtractedField } from "../types";
import { AlertTriangle, FileText, Loader2, Info, Pencil, Check, X } from "lucide-react";

interface PlanoMensuraExtractionCardProps {
  extraction: PlanoMensuraCatastralRdExtractionV1;
  onEditField?: (fieldName: string, value: string) => Promise<void>;
}

export const PlanoMensuraExtractionCard: React.FC<PlanoMensuraExtractionCardProps> = ({ extraction, onEditField }) => {
  const isProcessing = extraction.extractionStatus === ExtractionStatus.Queued || extraction.extractionStatus === ExtractionStatus.Processing;
  const isError = extraction.extractionStatus === ExtractionStatus.Failed;
  
  if (isProcessing) {
    return (
      <div className="w-full mt-2 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-3 animate-pulse" data-testid="plano-mensura-extraction-card">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="text-xs font-bold text-primary tracking-widest uppercase">Procesando IA OCR...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full mt-2 p-4 rounded-xl border border-error/20 bg-error/5 flex items-start gap-3" data-testid="plano-mensura-extraction-card">
        <AlertTriangle className="w-5 h-5 text-error mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-error uppercase">Error de Extracción OCR</h4>
          <p className="text-xs text-error/80 mt-1">No se pudieron extraer los datos del documento con la claridad requerida. Verifique la calidad de la imagen.</p>
        </div>
      </div>
    );
  }

  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleEditClick = (fieldName: string, currentValue: string) => {
    setEditingField(fieldName);
    setEditValue(currentValue);
  };

  const handleSave = async (fieldName: string) => {
    if (!onEditField) return;
    try {
      setIsSaving(true);
      await onEditField(fieldName, editValue);
      setEditingField(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const renderField = (label: string, fieldKey: string, field?: ExtractedField, isPrimary = false, testId?: string) => {
    const safeField = field || { rawValue: '', normalizedValue: '', confidence: 0, status: FieldStatus.Missing, sourcePage: 1 };
    const isMissing = safeField.status === FieldStatus.Missing;
    const isLowConfidence = safeField.status === FieldStatus.LowConfidence || safeField.confidence < 0.8;
    const isEditing = editingField === fieldKey;
    const displayValue = safeField.normalizedValue || safeField.rawValue || '';
    
    return (
      <div className="flex flex-col p-3 rounded-lg bg-white border border-border/40 shadow-sm relative group" data-testid={testId}>
        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/70 mb-1">
          {label}
        </span>
        <div className="flex items-center justify-between gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1 w-full">
               <input 
                 type="text" 
                 className="flex-1 text-sm border-b border-primary outline-none px-1 py-0.5 bg-transparent" 
                 value={editValue} 
                 onChange={(e) => setEditValue(e.target.value)}
                 autoFocus
                 disabled={isSaving}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave(fieldKey);
                    if (e.key === 'Escape') handleCancel();
                 }}
               />
               <button onClick={() => handleSave(fieldKey)} disabled={isSaving} className="text-success hover:bg-success/10 p-1 rounded transition-colors"><Check className="w-3 h-3" /></button>
               <button onClick={handleCancel} disabled={isSaving} className="text-error hover:bg-error/10 p-1 rounded transition-colors"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <>
              <span className={`text-sm font-bold ${isMissing ? 'text-error/60 italic' : isPrimary ? 'text-primary font-mono' : 'text-text-primary'}`}>
                {isMissing ? 'NO DETECTADO' : displayValue}
              </span>
              <div className="flex items-center gap-2">
                 {!isMissing && (
                   <div className={`w-2 h-2 rounded-full ${isLowConfidence ? 'bg-warning' : 'bg-success'}`} title={`Confianza: ${(safeField.confidence * 100).toFixed(0)}%`} />
                 )}
                 {onEditField && (
                   <button onClick={() => handleEditClick(fieldKey, displayValue)} className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-primary transition-opacity p-0.5" title="Editar campo">
                     <Pencil className="w-3 h-3" />
                   </button>
                 )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mt-2 p-4 sm:p-5 rounded-xl border border-border/50 bg-surface-container-low shadow-sm" data-testid="plano-mensura-extraction-card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-secondary tracking-tight">Extracción de Plano de Mensura</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">{extraction.processorName} {extraction.processorVersion}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {renderField("Departamento", "departamento", extraction.departamento, false, "field-departamento")}
        {renderField("Operación", "operacion", extraction.operacion, false, "field-operacion")}
        {renderField("Desig. Catastral Posicional", "designacionCatastralPosicional", extraction.designacionCatastralPosicional, true, "field-dcp")}
        {renderField("Desig. Catastral Origen", "designacionCatastralOrigen", extraction.designacionCatastralOrigen, false, "field-dco")}
        {renderField("Provincia", "provincia", extraction.provincia, false, "field-provincia")}
        {renderField("Municipio", "municipio", extraction.municipio, false, "field-municipio")}
        {renderField("Sección", "seccion", extraction.seccion, false, "field-seccion")}
        {renderField("Lugar", "lugar", extraction.lugar, false, "field-lugar")}
        {renderField("Superficie A. Regist.", "superficieARegistrarParcelaM2", extraction.superficieARegistrarParcelaM2, true, "field-superficie")}
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
