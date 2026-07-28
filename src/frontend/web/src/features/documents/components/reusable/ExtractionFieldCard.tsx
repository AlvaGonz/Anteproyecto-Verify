import React from "react";
import { FieldStatus, ExtractedField, GeographicResolutionResult } from "../../types";
import { Pencil, Check, X } from "lucide-react";



export interface ExtractionFieldCardProps {
  label: string;
  fieldKey: string;
  field?: ExtractedField;
  isPrimary?: boolean;
  isCedula?: boolean;
  testId?: string;
  
  // Custom display value (pre-formatted if needed)
  displayValue?: string;
  
  // Resolution for geographic fields
  resolution?: GeographicResolutionResult | null;
  
  // Editing state
  isEditing?: boolean;
  editValue?: string;
  isSaving?: boolean;
  
  // Form input specific
  isNumeric?: boolean;
  step?: string;
  
  // Callbacks
  onEditClick?: () => void;
  onEditValueChange?: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onEditAllowed?: boolean;

  // Render prop for custom fields (like selects)
  children?: React.ReactNode;
  
  // Override internal status checks if we have custom children
  isCustomContent?: boolean;
}

export const ExtractionFieldCard: React.FC<ExtractionFieldCardProps> = ({
  label,
  fieldKey,
  field,
  isPrimary = false,
  isCedula = false,
  testId,
  displayValue,
  // resolution prop removed for unused variable fix
  isEditing = false,
  editValue = "",
  isSaving = false,
  isNumeric = false,
  step,
  onEditClick,
  onEditValueChange,
  onSave,
  onCancel,
  onEditAllowed = true,
  children,
  isCustomContent = false
}) => {
  const safeField = field || { rawValue: '', normalizedValue: '', confidence: 0, status: FieldStatus.Missing, sourcePage: 1 };
  const rawValue = safeField.normalizedValue || safeField.rawValue || '';
  const finalDisplayValue = displayValue !== undefined ? displayValue : rawValue;
  const isMissing = safeField.status === FieldStatus.Missing && !finalDisplayValue;
  const isLowConfidence = safeField.status === FieldStatus.LowConfidence || safeField.confidence < 0.8;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSave) onSave();
    if (e.key === 'Escape' && onCancel) onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onEditValueChange) return;
    
    const next = e.target.value;
    if (!isNumeric) {
      onEditValueChange(next);
      return;
    }
    
    // Numeric filtering
    const filtered = next.replace(/[^0-9.]/g, "");
    const sanitized = step === "0.01"
      ? (() => {
          const firstDot = filtered.indexOf(".");
          if (firstDot === -1) return filtered;
          return filtered.slice(0, firstDot + 1) + filtered.slice(firstDot + 1).replace(/\./g, "");
        })()
      : filtered;
      
    onEditValueChange(sanitized);
  };

  return (
    <div 
      className="flex flex-col p-3 rounded-lg bg-white border border-border/40 shadow-sm relative group min-h-[64px]" 
      data-testid={testId || `field-card-${fieldKey}`}
    >
      <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/70 mb-1 break-words">
        {label}
      </span>
      
      <div className="flex items-center justify-between gap-2 min-h-[24px]">
        {isCustomContent ? (
          <div className="flex items-center justify-between w-full gap-2 min-w-0">
            <div className="flex-1 min-w-0">
              {children}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isMissing && (
                <div className={`w-2 h-2 rounded-full ${isLowConfidence ? 'bg-warning' : 'bg-success'}`} title={`Confianza: ${(safeField.confidence * 100).toFixed(0)}%`} />
              )}
            </div>
          </div>
        ) : isEditing ? (
          <div className="flex items-center gap-1 w-full">
            <input
              type={isNumeric ? "number" : "text"}
              inputMode={isNumeric ? "numeric" : undefined}
              pattern={isNumeric ? "[0-9.]*" : undefined}
              step={step}
              min={isNumeric ? "0" : undefined}
              data-testid={`field-input-${fieldKey}`}
              className="flex-1 text-sm border-b border-primary outline-none px-1 py-0.5 bg-transparent min-w-0"
              value={editValue}
              onChange={handleChange}
              autoFocus
              disabled={isSaving}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center shrink-0">
              <button onClick={onSave} disabled={isSaving} className="text-success hover:bg-success/10 p-1.5 rounded transition-colors" title="Guardar">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={onCancel} disabled={isSaving} className="text-error hover:bg-error/10 p-1.5 rounded transition-colors" title="Cancelar">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className={`text-sm font-bold break-all sm:break-words ${isMissing ? 'text-error/60 italic' : (isPrimary || isCedula) ? 'text-primary font-mono' : 'text-secondary'}`}>
              {isMissing ? 'NO DETECTADO' : finalDisplayValue}
            </span>
            <div className="flex items-center gap-2 shrink-0">
               {!isMissing && (
                 <div className={`w-2 h-2 rounded-full ${isLowConfidence ? 'bg-warning' : 'bg-success'}`} title={`Confianza: ${(safeField.confidence * 100).toFixed(0)}%`} />
               )}
               {onEditAllowed && onEditClick && (
                 <button onClick={onEditClick} className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-primary transition-opacity p-1" title="Editar campo">
                   <Pencil className="w-3.5 h-3.5" />
                 </button>
               )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
