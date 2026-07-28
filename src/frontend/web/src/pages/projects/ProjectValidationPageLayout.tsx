import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowLeft, RefreshCw, FileText, CheckCircle,
  ExternalLink, AlertTriangle, Database, Cpu, Fingerprint
} from "lucide-react";
import { ValidationHUD } from "../../features/validations/components/ValidationHUD";
import { ValidationSummary as InternalValidationSummary } from "../../features/validations/components/ValidationSummary";
import { ValidationRulesTable } from "../../features/validations/components/ValidationRulesTable";
import { FindingsPanel } from "../../features/validations/components/findings/FindingsPanel";
import { AuditLogList } from "../../features/validations/components/audit/AuditLogList";
import type { ValidationExecutionResult, FindingDto, AuditLogDto } from "../../features/validations/types";
import { RequiredDocumentsList } from "../../features/documents/components/RequiredDocumentsList";

interface ProjectValidationPageLayoutProps {
  id: string | undefined;
  error: string | null;
  activeTab: "analysis" | "findings" | "audit";
  setActiveTab: (tab: "analysis" | "findings" | "audit") => void;
  isEvaluating: boolean;
  handleRunValidation: () => void;
  findings: FindingDto[];
  auditLogs: AuditLogDto[];
  result: ValidationExecutionResult | null;
  handleScanComplete: () => Promise<void>;
}

export const ProjectValidationPageLayout: React.FC<ProjectValidationPageLayoutProps> = ({
  id,
  error,
  activeTab,
  setActiveTab,
  isEvaluating,
  handleRunValidation,
  findings,
  auditLogs,
  result,
  handleScanComplete,
}) => {
  return (
    <div className="max-w-7xl mx-auto">

      {/* Header Premium */}
      <div className="mb-10 p-8 rounded-[32px] bg-secondary relative overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <Link 
              to={`/admin/projects/${id}/edit`}
              className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-primary transition-all duration-300 hover:shadow-premium hover:-translate-x-1 backdrop-blur-sm border border-white/10 shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 items-center justify-center backdrop-blur-md shadow-inner relative">
                 <ShieldCheck className="w-8 h-8 text-white relative z-10" />
                 <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                 <div className="absolute top-2 right-2 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                 </div>
              </div>
              <div>
                <h1 className="display-lg text-white mb-1 leading-none">CENTRO DE VALIDACIÓN</h1>
                <div className="flex items-center gap-4 text-white/60 font-mono text-[10px] tracking-[0.2em] uppercase">
                  <span>Protocolo: VERIFINCA-ALPHA-98</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>Hash: {id?.substring(0, 8).toUpperCase()}...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isEvaluating && (
              <button type="button"
                onClick={handleRunValidation}
                className="h-14 px-8 rounded-xl bg-white text-secondary font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-3 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> Ejecutar Auditoría Integral
              </button>
            )}
          </div>
        </div>
      </div>

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
        <div className="flex flex-wrap items-center gap-2 mb-10 p-1.5 bg-white rounded-[20px] w-fit border border-border/30 shadow-raised shadow-transparent hover:shadow-floating transition-all duration-500">
          <button type="button"
            onClick={() => setActiveTab('analysis')}
            className={`px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3 ${activeTab === 'analysis' ? 'bg-secondary text-white shadow-premium' : 'text-text-secondary hover:bg-surface-raised'}`}
          >
            <Cpu className="w-3.5 h-3.5" /> 01. Análisis Integral
          </button>
          <button type="button"
            onClick={() => setActiveTab('findings')}
            className={`px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3 ${activeTab === 'findings' ? 'bg-secondary text-white shadow-premium' : 'text-text-secondary hover:bg-surface-raised'}`}
          >
            <Fingerprint className="w-3.5 h-3.5" /> 02. Hallazgos ({findings.length})
          </button>
          <button type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3 ${activeTab === 'audit' ? 'bg-secondary text-white shadow-premium' : 'text-text-secondary hover:bg-surface-raised'}`}
          >
            <Database className="w-3.5 h-3.5" /> 03. Registro Bitácora
          </button>
        </div>
      )}

{!isEvaluating && (
        <div className={`grid grid-cols-1 ${result ? 'lg:grid-cols-4' : ''} gap-8`}>

          {/* Main Area */}
          <div className={`${result ? 'lg:col-span-3' : ''} space-y-12`}>
            {activeTab === 'analysis' && (
              <>
                <RequiredDocumentsList projectId={id || ""} />
                {result && (
                  <>
                    {/* Integrated Summary & Metrics */}
                    {result.internalValidation && (
                      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <InternalValidationSummary summary={result.internalValidation} />
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

            {activeTab === 'audit' && (
              <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-secondary rounded-full" />
                  <h2 className="h2 uppercase tracking-tighter italic">Bitácora de Eventos e Inmutabilidad</h2>
                </div>
                <div className="vf-card bg-white p-8 sm:p-10 border-none shadow-premium ring-1 ring-border/30">
                  <AuditLogList logs={auditLogs} />
                </div>
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
    </div>
  );
};
