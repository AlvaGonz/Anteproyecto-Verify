import React, { useState } from 'react';
import { Check, Edit2, X, AlertTriangle, Save } from 'lucide-react';
import { OcrField, OcrFieldReviewState, OcrResult, DocumentDto } from '../types';
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
    return null;
  }

  let ocrResult: OcrResult;
  try {
    ocrResult = JSON.parse(document.resultadoOcrJson);
  } catch (e) {
    return <div className="text-red-500 text-sm">Error parsing OCR results.</div>;
  }

  const fields = Object.values(ocrResult.fields || {});

  if (fields.length === 0) {
    return <div className="text-sm text-[var(--color-text-secondary)] p-4 bg-white/5 rounded-xl border border-white/10">No fields extracted.</div>;
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

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revisión OCR</h3>
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/20 text-primary border border-primary/30">
          Requiere acción
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const badge = getReviewStateBadge(field.reviewState);
          const confColor = getConfidenceColor(field.confidence);
          const isEditing = editingField === field.name;

          return (
            <div key={field.name} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{field.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(field.name)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      title="Guardar corrección"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <span className="text-sm font-medium text-white break-all">
                      {field.correctedValue || field.value || <span className="text-white/30 italic">Vacío</span>}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${confColor} ml-2 shrink-0 opacity-80`} title={`Confianza: ${(field.confidence * 100).toFixed(0)}%`}>
                      {(field.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>

              {!isEditing && field.reviewState !== OcrFieldReviewState.Confirmed && field.reviewState !== OcrFieldReviewState.Corrected && (
                <div className="flex gap-2 mt-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleConfirm(field.name)}
                    disabled={isPending}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Confirmar
                  </button>
                  <button
                    onClick={() => handleStartEdit(field)}
                    disabled={isPending}
                    className="flex-1 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Corregir
                  </button>
                  <button
                    onClick={() => handleAbsent(field.name)}
                    disabled={isPending}
                    className="flex-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" /> Ausente
                  </button>
                </div>
              )}
              {!isEditing && (field.reviewState === OcrFieldReviewState.Confirmed || field.reviewState === OcrFieldReviewState.Corrected) && (
                <div className="flex gap-2 mt-2 pt-3 border-t border-white/5">
                    <button
                        onClick={() => handleStartEdit(field)}
                        disabled={isPending}
                        className="flex-1 py-1.5 rounded-lg bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
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
