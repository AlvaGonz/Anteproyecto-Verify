import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ValidationExecutionResult 
} from "../../features/validations/types";
import { validationsApi } from "../../features/validations/api/validationsApi";
import { ValidationHUD } from "../../features/validations/components/ValidationHUD";
import { ValidationSummary as InternalValidationSummary } from "../../features/validations/components/ValidationSummary";
import { ValidationRulesTable } from "../../features/validations/components/ValidationRulesTable";
import { CertificationSection } from "../../features/certifications/components/CertificationSection";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { ShieldCheck, ArrowLeft, RefreshCw, FileText, CheckCircle, ExternalLink, AlertTriangle, ListTodo, ClipboardList, Database, Cpu, Fingerprint } from "lucide-react";
import { FindingsPanel } from "../../features/validations/components/findings/FindingsPanel";
import { AuditLogList } from "../../features/validations/components/audit/AuditLogList";
import { FindingDto, AuditLogDto } from "../../features/validations/types";

export const ProjectValidationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      const [res, findingsRes, logsRes] = await Promise.all([
        validationsApi.getValidationResult(id),
        validationsApi.getProjectFindings(id),
        validationsApi.getProjectAuditLogs(id)
      ]);

      if (res._tag === "Success") {
        setResult(res.data);
      } else {
        setError(res.error.message);
      }

      if (findingsRes._tag === "Success") {
        setFindings(findingsRes.data);
      }

      if (logsRes._tag === "Success") {
        setAuditLogs(logsRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar el resultado de validación");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRunValidation = () => {
    if (!id) return;
    navigate(`/admin/validations/${id}`);
  };

  const handleScanComplete = async () => {
    try {
      const response = await validationsApi.runFullValidation(id!);
      if (response._tag === "Success") {
        setResult(response.data);
        addToast("Validación integral completada", "success");
        await fetchData(); // Refresh all data
      } else {
        setError(response.error.message);
        addToast("Error al ejecutar la validación", "error");
      }
    } catch (err: any) {
      setError(err.message || "Error al ejecutar la validación completa");
      addToast("Error al ejecutar la validación", "error");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <div className="text-center animate-pulse text-secondary font-display font-black tracking-widest text-xs">
        CONECTANDO CON EL NADO CENTRAL...
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* 🏛️ Institutional DNA Header */}
      <div className="relative mb-12 p-8 rounded-[24px] overflow-hidden bg-secondary shadow-premium group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
           <ShieldCheck size={320} className="text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex flex-col gap-4">
            <nav>
              <Link to={`/admin/projects/${id}/edit`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors group/back">
                <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" /> Volver al Expediente
              </Link>
            </nav>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[20px] bg-primary flex items-center justify-center shadow-premium relative">
                <ShieldCheck className="w-10 h-10 text-white" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-primary">
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
              <button
                onClick={handleRunValidation}
                className="h-14 px-8 rounded-xl bg-white text-secondary font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-3 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> Ejecutar Auditoría Integral
              </button>
            )}
            <button className="h-14 w-14 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center border border-white/10 group/ext">
               <ExternalLink className="w-5 h-5 group-hover/ext:scale-110 transition-transform" />
            </button>
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
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3 ${activeTab === 'analysis' ? 'bg-secondary text-white shadow-premium' : 'text-text-secondary hover:bg-surface-raised'}`}
          >
            <Cpu className="w-3.5 h-3.5" /> 01. Análisis Integral
          </button>
          <button 
            onClick={() => setActiveTab('findings')}
            className={`px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3 ${activeTab === 'findings' ? 'bg-secondary text-white shadow-premium' : 'text-text-secondary hover:bg-surface-raised'}`}
          >
            <Fingerprint className="w-3.5 h-3.5" /> 02. Hallazgos ({findings.length})
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3 ${activeTab === 'audit' ? 'bg-secondary text-white shadow-premium' : 'text-text-secondary hover:bg-surface-raised'}`}
          >
            <Database className="w-3.5 h-3.5" /> 03. Registro Bitácora
          </button>
        </div>
      )}

      {!isEvaluating && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Area */}
          <div className="lg:col-span-3 space-y-12">
            {activeTab === 'analysis' && (
              <>
                {result ? (
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
                        {result.externalSources.map((source, idx) => (
                          <div key={idx} className="vf-card bg-white group hover:border-primary/50 transition-all group overflow-hidden relative">
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
                              <button className="text-[10px] font-black text-primary flex items-center gap-1 group/btn">
                                ANALIZAR <ExternalLink className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                ) : (
                  <div className="vf-card py-32 flex flex-col items-center justify-center border-dashed gap-6 opacity-60 bg-surface-raised/30">
                    <div className="w-20 h-20 rounded-[24px] bg-secondary/5 flex items-center justify-center">
                       <FileText className="w-10 h-10 text-secondary/20" />
                    </div>
                    <div className="text-center">
                      <p className="h2 text-secondary/30 mb-2 uppercase italic tracking-tighter">Sin Protocolo Activo</p>
                      <p className="text-xs font-black text-text-secondary/40 tracking-widest uppercase">Requiere Auditoría para Desplegar Dashboard</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'findings' && (
              <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-error rounded-full" />
                  <h2 className="h2 uppercase tracking-tighter italic">Hallazgos y Diferenciales de Riesgo</h2>
                </div>
                <FindingsPanel findings={findings} />
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Certificación Digital</h2>
              </div>
              <div className="p-1.5 bg-gradient-to-br from-primary via-secondary to-[#0F172A] rounded-[24px] shadow-premium group">
                <div className="bg-white rounded-[20px] p-2 hover:scale-[1.02] transition-transform duration-500">
                  <CertificationSection projectId={id!} />
                </div>
              </div>

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
                  <button className="w-full py-5 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-colors flex items-center justify-center gap-3">
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
