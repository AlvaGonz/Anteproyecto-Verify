import React, { useState } from 'react';
import { Check, Edit2, X, AlertTriangle, Save, ScanText } from 'lucide-react';
import { OcrField, OcrFieldReviewState, OcrResult, DocumentDto, DocumentStatus } from '../types';
import { getConfidenceColor, getReviewStateBadge } from '../utils/ocrReviewUtils';
import { useUpdateDocumentFieldReview } from '../api/useDocumentMutations';
import { useVerifyDocument } from '../../gobernanza/api/useGobernanza';
import { VerificationFeedbackCard } from '../../gobernanza/components/VerificationFeedbackCard';
import { mapDocumentToVerificationPayload } from '../../gobernanza/utils/mapper';
import { ShieldCheck } from 'lucide-react';

interface OcrReviewPanelProps {
  document: DocumentDto;
}

export const OcrReviewPanel: React.FC<OcrReviewPanelProps> = ({ document }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const { mutate: updateField, isPending } = useUpdateDocumentFieldReview(document.proyectoId);
  const { mutate: verifyDocument, data: verificationResponse, isPending: isVerifying, error: verificationError } = useVerifyDocument();


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

  if (ocrResult.success === false || ocrResult.error) {
    return (
      <div className="mt-6 p-6 rounded-2xl bg-red-50/80 backdrop-blur-sm border border-red-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <h4 className="text-sm font-bold uppercase tracking-wider">Error en Procesamiento OCR</h4>
        </div>
        <div className="text-sm text-red-700/80 mb-4">
          Hubo un problema al procesar este documento. El equipo técnico ha sido notificado.
        </div>
      </div>
    );
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
    let valueToSave = editValue;
    // Auto-formatear Designación Catastral
    if (fieldName.toLowerCase().includes('designacioncatastral') || fieldName.toLowerCase().includes('designación catastral')) {
      const digitsOnly = valueToSave.replace(/[^0-9]/g, '');
      if (digitsOnly.length >= 4 && !valueToSave.includes(':')) {
        valueToSave = digitsOnly.slice(0, -4) + ':' + digitsOnly.slice(-4);
      }
    }

    updateField(
      { documentId: document.id, fieldName, data: { reviewState: OcrFieldReviewState.Corrected, correctedValue: valueToSave } },
      { onSuccess: () => setEditingField(null) }
    );
  };

  const isReviewable = document.estadoDocumento === DocumentStatus.EnRevision;
  
  const mappingInfo = mapDocumentToVerificationPayload(document, fields);
  const isVerifiable = mappingInfo !== null;

  const handleVerifyGobernanza = () => {
    if (mappingInfo) {
      verifyDocument({ 
        documentType: mappingInfo.apiDocType, 
        payload: mappingInfo.payload,
        proyectoId: document.proyectoId,
        documentoId: document.id 
      });
    }
  };

  const getValidationIcon = (uiValue: string) => {
    if (!verificationResponse?.matchedData) return null;
    
    // Normalizar valores para comparación
    const normalizedUi = String(uiValue || '').trim().toLowerCase();
    
    // Buscar en todos los valores devueltos por Gobernanza
    const matchedValues = Object.values(verificationResponse.matchedData).map(v => String(v || '').trim().toLowerCase());
    
    if (normalizedUi === '') {
      return <div title="Dato vacío enviado a revisión"><X className="w-5 h-5 text-rose-500 bg-rose-50 rounded-full p-0.5" /></div>;
    }

    // Match exacto
    if (matchedValues.includes(normalizedUi)) {
      return <div title="Coincide exactamente"><Check className="w-5 h-5 text-emerald-500 bg-emerald-50 rounded-full p-0.5" /></div>;
    }

    // Match parcial o vacío en DB (pero el usuario mandó algo)
    const hasPartialMatch = matchedValues.some(v => v !== '' && (v.includes(normalizedUi) || normalizedUi.includes(v)));
    const hasEmptyInDb = matchedValues.includes('');

    if (hasPartialMatch || hasEmptyInDb) {
      return <div title="Coincidencia parcial o vacío en BD"><AlertTriangle className="w-5 h-5 text-amber-500 bg-amber-50 rounded-full p-0.5" /></div>;
    }

    return <div title="Dato diferente a Gobernanza"><X className="w-5 h-5 text-rose-500 bg-rose-50 rounded-full p-0.5" /></div>;
  };

  const getPlaceholder = (fieldName: string) => {
    const lower = fieldName.toLowerCase();
    if (lower.includes('designacion catastral') || lower.includes('designación catastral')) return 'Ej: 120182783414:0083';
    if (lower.includes('matricula') || lower.includes('matrícula')) return 'Ej: 010023456';
    if (lower.includes('fecha')) return 'Ej: 2024-01-30';
    if (lower.includes('rnc')) return 'Ej: 130123456';
    if (lower.includes('cedula') || lower.includes('cédula') || lower.includes('cedulanumber')) return 'Ej: 001-1234567-8';
    if (lower.includes('certificacion') || lower.includes('certificación')) return 'Ej: C0121952878225';
    if (lower.includes('inmueble')) return 'Ej: 136400513193';
    if (lower.includes('parcela')) return 'Ej: 309466754512:4-A';
    if (lower.includes('provincia') || lower.includes('oficina')) return 'Ej: SANTO DOMINGO';
    if (lower.includes('municipio') || lower.includes('lugar') || lower.includes('seccion')) return 'Ej: SANTO DOMINGO ESTE';
    if (lower.includes('departamento')) return 'Ej: NORTE';
    if (lower.includes('operacion')) return 'Ej: DESLINDE';
    if (lower.includes('viene')) return 'Ej: 010023455';
    if (lower.includes('superficie') || lower.includes('area') || lower.includes('área')) return 'Ej: 1500.00';
    if (lower.includes('nombre') || lower.includes('firstname') || lower.includes('titular')) return 'Ej: JUAN CARLOS';
    if (lower.includes('apellido') || lower.includes('lastname')) return 'Ej: PEREZ GOMEZ';
    return 'Ej: Ingrese el dato correcto';
  };

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
                <div className="flex items-center gap-2">
                  {getValidationIcon(field.correctedValue || field.value || '')}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center min-h-[2.5rem]">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)]/30 rounded-lg px-3 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-primary/50 shadow-inner placeholder:text-gray-400 placeholder:text-xs"
                      value={editValue}
                      placeholder={getPlaceholder(field.name)}
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
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${confColor} ml-2 shrink-0 opacity-80`} title={`Confianza: ${(field.confidence * 100).toFixed(0)}%`}>
                        {(field.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
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
      
      {isVerifiable && fields.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[var(--color-border)]/10">
          <div className="flex justify-end">
            <button
              onClick={handleVerifyGobernanza}
              disabled={isVerifying || isPending}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold tracking-wide shadow-md hover:bg-primary/90 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-5 h-5" />
              {isVerifying ? "Verificando..." : "Validar contra Estado/Gobernanza"}
            </button>
          </div>
          
          <VerificationFeedbackCard 
            response={verificationResponse || null} 
            isLoading={isVerifying} 
            error={verificationError}
          />
        </div>
      )}
    </div>
  );
};
