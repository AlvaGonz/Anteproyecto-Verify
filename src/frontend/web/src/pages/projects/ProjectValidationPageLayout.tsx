import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowLeft, RefreshCw, FileText, CheckCircle,
  ExternalLink, AlertTriangle, Database, Cpu, Fingerprint, Loader2
} from "lucide-react";
import { ValidationHUD } from "../../features/validations/components/ValidationHUD";
import type { ValidationExecutionResult, FindingDto } from "../../features/validations/types";

const ValidationSummary = lazy(() => import("../../features/validations/components/ValidationSummary").then(m => ({ default: m.ValidationSummary })));
const ValidationRulesTable = lazy(() => import("../../features/validations/components/ValidationRulesTable").then(m => ({ default: m.ValidationRulesTable })));
const FindingsPanel = lazy(() => import("../../features/validations/components/findings/FindingsPanel").then(m => ({ default: m.FindingsPanel })));
const RequiredDocumentsList = lazy(() => import("../../features/documents/components/RequiredDocumentsList").then(m => ({ default: m.RequiredDocumentsList })));
const OcrDisclaimerModal = lazy(() => import("../../features/validations/components/OcrDisclaimerModal").then(m => ({ default: m.OcrDisclaimerModal })));
const CertificationSection = lazy(() => import("../../features/certifications/components/CertificationSection").then(m => ({ default: m.CertificationSection })));

const TabFallback = () => <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

interface ProjectValidationPageLayoutProps {
  id: string | undefined;
  error: string | null;
  activeTab: "analysis" | "findings";
  setActiveTab: (tab: "analysis" | "findings") => void;
  isEvaluating: boolean;
  handleRunValidation: () => void;
  findings: FindingDto[];
  result: ValidationExecutionResult | null;
  handleScanComplete: () => Promise<void>;
  projectStatus?: string;
}

export const ProjectValidationPageLayout: React.FC<ProjectValidationPageLayoutProps> = ({
  id,
  error,
  activeTab,
  setActiveTab,
  isEvaluating,
  handleRunValidation,
  findings,
  result,
  handleScanComplete,
  projectStatus,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

      {/* Header Premium — oculto hasta nuevo aviso */}
      {false && (
      <div className="mb-6 sm:mb-10 p-5 sm:p-8 lg:p-10 rounded-[24px] sm:rounded-[32px] bg-secondary relative overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-black/60 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0 flex-1">
            <Link 
              to={`/admin/projects/${id}/edit`}
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-primary transition-all duration-300 hover:shadow-premium hover:-translate-x-1 backdrop-blur-sm border border-white/10 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <div className="hidden sm:flex w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 items-center justify-center backdrop-blur-md shadow-inner relative shrink-0">
                 <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white relative z-10" />
                 <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                 <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                 </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-black text-white mb-1 sm:mb-2 leading-tight truncate">CENTRO DE VALIDACIÓN</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white/70 font-mono text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] uppercase">
                  <span>Prot: VERIFINCA-ALPHA</span>
                  <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/30" />
                  <span className="truncate">Hash: {id?.substring(0, 8).toUpperCase()}...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 shrink-0">
            {!isEvaluating && (
              <button type="button"
                onClick={handleRunValidation}
                className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-white text-secondary font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 active:scale-95 w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">Auditoría Integral</span>
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-error/10 text-error rounded-2xl border border-error/20 flex items-center gap-4 animate-in slide-in-from-top duration-300">
          <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm uppercase">Fallo en el Protocolo</div>
            <div className="text-xs opacity-80">{error}</div>
          </div>
        </div>
      )}

      {/* HUD Scanner Section */}
      <ValidationHUD isScanning={isEvaluating} onComplete={handleScanComplete} />

      {/* Tabs Navigation Premium */}
      {!isEvaluating && (
        <div className="flex flex-col sm:flex-row sm:flex-nowrap items-stretch sm:items-center gap-1.5 sm:gap-2 mb-10 p-1.5 bg-white rounded-[20px] w-full border border-border/30 shadow-raised shadow-transparent hover:shadow-floating transition-all duration-500">
          <button type="button"
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 px-4 sm:px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 ${activeTab === 'analysis' ? 'bg-secondary text-white shadow-premium' : 'text-text-secondary hover:bg-surface-raised'}`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" /> 01. Análisis Integral
          </button>
          <button type="button"
            onClick={() => setActiveTab('findings')}
            className={`flex-1 px-4 sm:px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 ${activeTab === 'findings' ? 'bg-secondary text-white shadow-premium' : 'text-text-secondary hover:bg-surface-raised'}`}
          >
            <Fingerprint className="w-3.5 h-3.5 shrink-0" /> 02. Hallazgos ({findings.length})
          </button>
        </div>
      )}

{!isEvaluating && (
        <div className={`grid grid-cols-1 ${result ? 'lg:grid-cols-4' : ''} gap-8`}>

          {/* Main Area */}
          <div className={`${result ? 'lg:col-span-3' : ''} space-y-12`}>
            {activeTab === 'analysis' && (
              <Suspense fallback={<TabFallback />}>
              <>
                {id && <OcrDisclaimerModal projectId={id} />}
                <RequiredDocumentsList projectId={id || ""} />
                {result && (
                  <>
                    {/* Integrated Summary & Metrics */}
                    {result.internalValidation && (
                      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ValidationSummary summary={result.internalValidation} />
                        <div className="mt-8 vf-card p-0 overflow-hidden ring-1 ring-border/30 hover:ring-primary/30 transition-shadow">
                          <ValidationRulesTable results={result.internalValidation.results} />
                        </div>
                      </section>
                    )}

                    {/* External Evidence Section */}
                    <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h2 className="h2 uppercase tracking-tighter italic">Cruce de Fuentes Institucionales</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.externalSources.map((source) => (
                          <div key={source.sourceName} className="vf-card bg-white group hover:border-primary/50 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                               <Database className="w-12 h-12 text-secondary" />
                            </div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                              <span className="text-[10px] font-black text-secondary tracking-widest uppercase bg-secondary/5 px-2 py-1 rounded">ESTADO: {source.sourceName}</span>
                              {source.isMatch ? (
                                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-success" /></div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center"><AlertTriangle className="w-3.5 h-3.5 text-warning" /></div>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-secondary mb-2">{source.sourceName} Official Portal</h3>
                            <p className="text-xs text-text-secondary leading-relaxed mb-6 group-hover:text-text-primary transition-colors">{source.summary}</p>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-[9px] font-mono text-text-secondary/50">TRACK_ID: {source.referenceCode || '8X-990-21'}</span>
                              <button type="button" className="text-[10px] font-black text-primary flex items-center gap-1 group/btn">
                                ANALIZAR <ExternalLink className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                              </button>
                            </div>
</div>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </>
              </Suspense>
            )}

            {activeTab === 'findings' && (
              <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-error rounded-full" />
                  <h2 className="h2 uppercase tracking-tighter italic">Hallazgos y Diferenciales de Riesgo</h2>
                </div>
                <FindingsPanel findings={findings} projectId={id} />
              </section>
            )}
          </div>

          {/* Side Info Panel */}
          <div className="space-y-8">
            <section className="sticky top-8 space-y-8">
              {/* Dynamic Status Display */}
              {result && (
                <div className="vf-card bg-surface overflow-hidden relative border-none shadow-premium ring-1 ring-border/30">
                  <div className="p-6">
                    <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-6">Estado de Validación</h3>
                    <div className="flex items-center gap-4 mb-8">
                       <div className={`w-3 h-3 rounded-full ${result.isFullyValid ? 'bg-success shadow-[0_0_10px_rgba(46,125,50,0.5)]' : 'bg-error shadow-[0_0_10px_rgba(198,40,40,0.5)]'}`} />
                       <div className="text-3xl font-display font-black text-secondary leading-none uppercase tracking-tighter">
                          {result.isFullyValid ? 'CERTIFICADO' : 'CON REPLICAS'}
                       </div>
                    </div>
                    <div className="space-y-3 pt-6 border-t border-border/30">
                      <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary">
                        <span className="uppercase tracking-widest">Bloqueo de Red</span>
                        <span className="text-secondary uppercase tracking-widest">ACTIVO</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary">
                        <span className="uppercase tracking-widest">Nivel de Confianza</span>
                        <span className="text-success uppercase tracking-widest">CRÍTICO</span>
                      </div>
                    </div>
                  </div>
                  <button type="button" className="w-full py-5 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-colors flex items-center justify-center gap-3">
                    <FileText className="w-4 h-4" /> Exportar Ledger Maestro
                  </button>
                </div>
              )}
            </section>
          </div>

        </div>
      )}

      {id && <Suspense fallback={<TabFallback />}>
        <CertificationSection projectId={id} projectStatus={projectStatus} />
      </Suspense>}
    </div>
  );
};
