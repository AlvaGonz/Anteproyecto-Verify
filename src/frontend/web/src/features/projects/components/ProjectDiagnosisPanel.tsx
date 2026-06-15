import React, { useState } from "react";
import { useProjectDiagnosis } from "../api/useProjects";
import { DocumentDiagnosisDto } from "../types";
import { Bot, AlertCircle, CheckCircle, RefreshCcw, ShieldAlert, Cpu } from "lucide-react";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";

export const ProjectDiagnosisPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const diagnosisMutation = useProjectDiagnosis();
  const { addToast } = useToast();
  const [result, setResult] = useState<DocumentDiagnosisDto | null>(null);

  const handleDiagnose = async () => {
    try {
      const data = await diagnosisMutation.mutateAsync(projectId);
      setResult(data as DocumentDiagnosisDto);
      addToast("Diagnóstico IA completado exitosamente", "success");
    } catch (error: any) {
      if (error?.response?.status === 429) {
        addToast("Debe esperar 1 minuto antes de solicitar otro diagnóstico", "error");
      } else {
        addToast("Error al generar diagnóstico IA", "error");
      }
    }
  };

  return (
    <div className="vf-card p-6 bg-surface-container-low/30 overflow-hidden relative group" data-testid="diagnosis-panel">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-display font-black text-secondary tracking-tight">Diagnóstico <span className="text-primary italic">IA</span></h3>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mt-1">Análisis por NVIDIA NIM</p>
        </div>
      </div>

      <div className="relative z-10">
        {!result ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-outline-variant/30 rounded-2xl bg-white/50">
            <Cpu className="w-12 h-12 text-on-surface-variant/40 mb-4" />
            <p className="text-sm font-medium text-secondary text-center mb-4 max-w-xs">
              El asistente de IA revisará todos los documentos cargados y emitirá un reporte de cumplimiento y recomendaciones.
            </p>
            <button
              onClick={handleDiagnose}
              disabled={diagnosisMutation.isPending}
              className="vf-btn-primary w-full"
              data-testid="generate-diagnosis-btn"
            >
              {diagnosisMutation.isPending ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" /> Analizando...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" /> Generar Diagnóstico
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4" data-testid="diagnosis-result-view">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-outline-variant/30">
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Score de Integridad</p>
                <div className="flex items-end gap-2">
                  <h4 className="text-4xl font-display font-black text-secondary leading-none" data-testid="diagnosis-score">{result.score}</h4>
                  <span className="text-sm font-bold text-on-surface-variant/50 mb-1">/ 100</span>
                </div>
              </div>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                result.score >= 80 ? 'bg-success/10 text-success' : result.score >= 50 ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
              }`}>
                {result.score >= 80 ? <CheckCircle className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-outline-variant/30">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Resumen Ejecutivo</p>
              <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap" data-testid="diagnosis-summary">{result.summary}</p>
            </div>

            {(result.missingDocuments && result.missingDocuments.length > 0) && (
              <div className="p-4 bg-error-container/30 rounded-2xl border border-error/10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-error" />
                  <p className="text-[10px] font-black text-error uppercase tracking-widest">Faltantes Críticos</p>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {result.missingDocuments.map((doc, idx) => (
                    <li key={idx} className="text-xs font-bold text-secondary">{doc}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleDiagnose}
              disabled={diagnosisMutation.isPending}
              className="mt-4 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:underline disabled:opacity-50"
            >
              <RefreshCcw className={`w-3 h-3 ${diagnosisMutation.isPending ? 'animate-spin' : ''}`} /> 
              {diagnosisMutation.isPending ? 'Re-analizando...' : 'Volver a diagnosticar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
