import React, { useState } from 'react';
import { Check, Edit2, X, AlertTriangle, Save, ScanText } from 'lucide-react';
import { OcrField, OcrFieldReviewState, OcrResult, DocumentDto, DocumentStatus } from '../types';
import { getConfidenceColor, getReviewStateBadge } from '../utils/ocrReviewUtils';
import { useUpdateDocumentFieldReview } from '../api/useDocumentMutations';

interface OcrReviewPanelProps {
  document: DocumentDto;
}

export const OcrReviewPanel: React.FC<OcrReviewPanelProps> = ({ document }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const { mutate: updateField, isPending } = useUpdateDocumentFieldReview(document.proyectoId);

  if (!document.resultadoOcrJson) {
    return (
      <div className="p-6 bg-surface-container-lowest border-t border-[var(--color-border)]/10">
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ScanText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-secondary tracking-tight">Datos <span className="text-primary italic">Extraídos</span> (OCR)</h3>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mt-1">Revisión Automática</p>
          </div>
        </div>
        <div className="p-8 rounded-3xl bg-surface-container-low/30 border border-outline-variant/30 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/5 flex items-center justify-center mb-4 text-on-surface-variant/50">
            <ScanText className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-secondary mb-2">Validación Pendiente</h4>
          <p className="text-sm font-medium text-on-surface-variant max-w-sm">No se han extraído datos de este documento aún. Cargue el archivo o espere a que finalice el procesamiento.</p>
        </div>
      </div>
    );
  }

  let ocrResult: OcrResult;
  try {
    ocrResult = JSON.parse(document.resultadoOcrJson);
  } catch (e) {
    return <div className="text-red-500 text-sm mt-4 p-4 bg-red-50 rounded-xl border border-red-100">Error parsing OCR results.</div>;
  }

  const fields = Object.values(ocrResult.fields || {});

  if (fields.length === 0) {
    return (
      <div className="mt-6 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-[var(--color-border)]/30 shadow-sm">
        <div className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
          <ScanText className="w-4 h-4" />
          No se extrajeron datos de este documento.
        </div>
      </div>
    );
  }

  const handleConfirm = (fieldName: string) => {
    updateField({ documentId: document.id, fieldName, data: { reviewState: OcrFieldReviewState.Confirmed } });
  };

  const handleAbsent = (fieldName: string) => {
    updateField({ documentId: document.id, fieldName, data: { reviewState: OcrFieldReviewState.Absent } });
  };

  const handleStartEdit = (field: OcrField) => {
    setEditingField(field.name);
    setEditValue(field.correctedValue || field.value);
  };

  const handleSaveEdit = (fieldName: string) => {
    updateField(
      { documentId: document.id, fieldName, data: { reviewState: OcrFieldReviewState.Corrected, correctedValue: editValue } },
      { onSuccess: () => setEditingField(null) }
    );
  };

  const isReviewable = document.estadoDocumento === DocumentStatus.EnRevision;

  return (
    <div className="mt-6 p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[var(--color-border)]/20 shadow-sm space-y-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border)]/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <ScanText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Datos Extraídos (OCR)</h3>
          {isReviewable ? (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-widest">
              Requiere revisión
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-widest">
              Verificado
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field) => {
          const badge = getReviewStateBadge(field.reviewState);
          const confColor = getConfidenceColor(field.confidence);
          const isEditing = editingField === field.name;

          return (
            <div key={field.name} className="p-4 rounded-xl bg-white border border-[var(--color-border)]/20 shadow-sm flex flex-col gap-3 group hover:border-[var(--color-border)]/40 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{field.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center min-h-[2.5rem]">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)]/30 rounded-lg px-3 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-primary/50 shadow-inner"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveEdit(field.name);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(field.name)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-200"
                      title="Guardar corrección"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] break-all">
                      {field.correctedValue || field.value || <span className="text-[var(--color-text-secondary)]/50 italic">Vacío</span>}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${confColor} ml-2 shrink-0 opacity-80`} title={`Confianza: ${(field.confidence * 100).toFixed(0)}%`}>
                      {(field.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>

              {isReviewable && !isEditing && field.reviewState !== OcrFieldReviewState.Confirmed && field.reviewState !== OcrFieldReviewState.Corrected && (
                <div className="flex gap-2 mt-2 pt-3 border-t border-[var(--color-border)]/10">
                  <button
                    onClick={() => handleConfirm(field.name)}
                    disabled={isPending}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-3 h-3" /> Confirmar
                  </button>
                  <button
                    onClick={() => handleStartEdit(field)}
                    disabled={isPending}
                    className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Edit2 className="w-3 h-3" /> Corregir
                  </button>
                  <button
                    onClick={() => handleAbsent(field.name)}
                    disabled={isPending}
                    className="flex-1 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <AlertTriangle className="w-3 h-3" /> Ausente
                  </button>
                </div>
              )}
              {isReviewable && !isEditing && (field.reviewState === OcrFieldReviewState.Confirmed || field.reviewState === OcrFieldReviewState.Corrected) && (
                <div className="flex gap-2 mt-2 pt-3 border-t border-[var(--color-border)]/10">
                    <button
                        onClick={() => handleStartEdit(field)}
                        disabled={isPending}
                        className="flex-1 py-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                        <Edit2 className="w-3 h-3" /> Editar de nuevo
                    </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
