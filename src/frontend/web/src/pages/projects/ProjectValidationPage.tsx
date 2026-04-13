import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ValidationExecutionResult 
} from "../../features/validations/types";
import { validationsApi } from "../../features/validations/api/validationsApi";
import { ValidationHUD } from "../../features/validations/components/ValidationHUD";
import { ValidationSummary as InternalValidationSummary } from "../../features/validations/components/ValidationSummary";
import { ValidationRulesTable } from "../../features/validations/components/ValidationRulesTable";
import { CertificationSection } from "../../features/certifications/components/CertificationSection";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { ShieldCheck, ArrowLeft, RefreshCw, FileText, CheckCircle, ExternalLink, AlertTriangle, AlertCircle, ListTodo, ClipboardList } from "lucide-react";
import { FindingsPanel } from "../../features/validations/components/findings/FindingsPanel";
import { AuditLogList } from "../../features/validations/components/audit/AuditLogList";
import { FindingDto, AuditLogDto } from "../../features/validations/types";

export const ProjectValidationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const [result, setResult] = useState<ValidationExecutionResult | null>(null);
  const [findings, setFindings] = useState<FindingDto[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDto[]>([]);
  const [activeTab, setActiveTab] = useState<'analysis' | 'findings' | 'audit'>('analysis');
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [latestResult, projectFindings, logs] = await Promise.all([
        validationsApi.getValidationResult(id),
        validationsApi.getProjectFindings(id),
        validationsApi.getProjectAuditLogs(id)
      ]);
      setResult(latestResult);
      setFindings(projectFindings);
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err.message || "Error al cargar el resultado de validación");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRunValidation = () => {
    if (!id) return;
    setIsEvaluating(true);
    setError(null);
  };

  const handleScanComplete = async () => {
    try {
      const newResult = await validationsApi.runFullValidation(id!);
      setResult(newResult);
      addToast("Validación integral completada", "success");
    } catch (err: any) {
      setError(err.message || "Error al ejecutar la validación completa");
      addToast("Error al ejecutar la validación", "error");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse text-secondary/40 font-display font-medium">CONECTANDO CON EL NÚCLEO...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-8 border-b border-border/50">
        <div>
          <nav className="mb-4">
            <Link to={`/admin/projects/${id}/edit`} className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver a Detalles del Proyecto
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shadow-premium">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="h1 text-secondary uppercase tracking-tight">Centro de Validación</h1>
              <p className="body text-text-secondary">Protocolo de Auditoría Institucional VeriFinca</p>
            </div>
          </div>
        </div>
        
        {!isEvaluating && (
          <button
            onClick={handleRunValidation}
            className="vf-btn-primary h-12 px-8 flex items-center gap-3 vf-glow-primary"
          >
            <RefreshCw className={`w-5 h-5 ${isEvaluating ? 'animate-spin' : ''}`} />
            Nueva Auditoría Integral
          </button>
        )}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-error/5 text-error rounded-xl border border-error/20 flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="label-lg">{error}</span>
        </div>
      )}

      {/* HUD Scanner Section */}
      <ValidationHUD isScanning={isEvaluating} onComplete={handleScanComplete} />

      {/* Tabs Navigation */}
      {!isEvaluating && (
        <div className="flex items-center gap-1 mb-8 p-1 bg-surface-container-low rounded-2xl w-fit mx-auto sm:mx-0 border border-border/30">
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-2.5 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'analysis' ? 'bg-secondary text-white shadow-lg' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Análisis Integral
          </button>
          <button 
            onClick={() => setActiveTab('findings')}
            className={`px-6 py-2.5 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'findings' ? 'bg-secondary text-white shadow-lg' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <ListTodo className="w-4 h-4" /> Hallazgos ({findings.length})
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-2.5 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'audit' ? 'bg-secondary text-white shadow-lg' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <ClipboardList className="w-4 h-4" /> Bitácora ({auditLogs.length})
          </button>
        </div>
      )}

      {!isEvaluating && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Main Content Area (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-10">
            {activeTab === 'analysis' && (
              <>
                {result ? (
                  <>
                    {/* 1. Internal Validation */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-6 bg-primary rounded-full" />
                          <h2 className="h2 italic">01. Análisis de Expediente</h2>
                        </div>
                        <span className="text-[10px] font-black p-1.5 bg-black/5 rounded uppercase">Inmutable</span>
                      </div>
                      {result.internalValidation && (
                        <div className="vf-card p-0 overflow-hidden shadow-premium border-none ring-1 ring-border/50">
                          <div className="p-6 bg-surface">
                            <InternalValidationSummary summary={result.internalValidation} />
                          </div>
                          <div className="bg-surface-raised border-t border-border/50">
                            <ValidationRulesTable results={result.internalValidation.results} />
                          </div>
                        </div>
                      )}
                    </section>

                    {/* 2. External Sources */}
                    <section>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h2 className="h2 italic">02. Cruce Institucional</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {result.externalSources.map((source, idx) => (
                          <div key={idx} className="vf-card hover:bg-surface-raised transition-all group overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                              <span className="label-lg text-secondary font-bold tracking-widest uppercase">{source.sourceName}</span>
                              {source.isMatch ? (
                                <CheckCircle className="w-5 h-5 text-success" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-warning" />
                              )}
                            </div>
                            <p className="text-sm text-text-secondary mb-4">{source.summary}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono p-1 bg-black/5 rounded">{source.referenceCode || 'REF_PENDING'}</span>
                              <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 font-bold">
                                DETALLES <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                ) : (
                  <div className="vf-card py-20 flex flex-col items-center justify-center border-dashed gap-4 opacity-60">
                    <FileText className="w-16 h-16 text-border" />
                    <div className="text-center">
                      <p className="h2 text-text-secondary">Sin Auditoría Reciente</p>
                      <p className="body text-sm">Ejecute una nueva validación para ver los resultados institucionales.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'findings' && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-error rounded-full" />
                    <h2 className="h2 italic">04. Hallazgos y Discrepancias</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-error/10 text-error uppercase">Audit Mode</span>
                  </div>
                </div>
                <FindingsPanel findings={findings} />
              </section>
            )}

            {activeTab === 'audit' && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-6 bg-secondary rounded-full" />
                  <h2 className="h2 italic">05. Bitácora de Inmutabilidad</h2>
                </div>
                <div className="vf-card bg-surface p-8 sm:p-10 border-none shadow-sm ring-1 ring-border/50">
                  <AuditLogList logs={auditLogs} />
                </div>
              </section>
            )}
          </div>

          {/* Side Panel (Col 3) - Remains constant or updates based on state */}
          <div className="space-y-8">
            <section className="sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h2 className="h2 italic">03. Certificación</h2>
              </div>
              <div className="p-1 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-premium">
                <div className="bg-white rounded-[14px]">
                  <CertificationSection projectId={id!} />
                </div>
              </div>

              {/* Validation Status Summary Card */}
              {result && (
                <div className="vf-card mt-8 bg-secondary border-none text-white shadow-premium overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="label-lg font-bold mb-4 opacity-70 uppercase tracking-widest">Estado Consolidado</h3>
                    <div className="text-4xl font-display font-bold mb-2">
                       {result.isFullyValid ? 'CERTIFICADO' : 'OBSERVADO'}
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-xs opacity-80">Hash: 8A24F...D92</span>
                    </div>
                    <button className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-sm uppercase tracking-widest border border-white/20">
                      Exportar Reporte Maestro
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

        </div>
      )}
    </div>
  );
};
