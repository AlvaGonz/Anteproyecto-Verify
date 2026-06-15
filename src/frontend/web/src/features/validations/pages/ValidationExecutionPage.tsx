import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, Cpu, Activity, Lock, Globe, Terminal, ArrowRight, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { useRunFullValidation } from "../api/useValidations";
import { ValidationHUD } from "../components/ValidationHUD";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { ValidationExecutionResult } from "../types";

export const ValidationExecutionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { addToast } = useToast();
  
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ValidationExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uptime, setUptime] = useState(0);

  // Stats for the "Control Center" feel
  const systemStats = [
    { label: "Core Security", value: "Level 7", icon: ShieldCheck, color: "text-primary" },
    { label: "Neural Load", value: "O-Sync", icon: Activity, color: "text-success" },
    { label: "Network", value: "Gov-Net", icon: Globe, color: "text-secondary" },
    { label: "Encryption", value: "AES-512", icon: Lock, color: "text-text-primary" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const runFullValidationMutation = useRunFullValidation(projectId || "");

  const startValidation = () => {
    if (!projectId) return;
    setError(null);
    setIsScanning(true);
  };

  const handleValidationComplete = async () => {
    try {
      const data = await runFullValidationMutation.mutateAsync();
      setResult(data);
      addToast("Auditoría integral finalizada con éxito", "success");
    } catch (err: any) {
      setError(err.message || "Fallo crítico en el protocolo de validación");
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EC] p-4 lg:p-8 flex flex-col font-sans relative overflow-hidden">
      {/* 🧬 Background Bio-Grid */}
      <div className="vf-hud-grid opacity-20" />
      
      {/* 🏗️ Header Nav */}
      <div className="relative z-10 flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top duration-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shadow-premium">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Centro de Operaciones Digitales</h1>
            <div className="flex items-center gap-2 text-[9px] font-mono text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              STATUS: ESTACIÓN_ACTIVA // SESSION_TIME: {uptime}s
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to={`/admin/projects/${projectId}/validations`}
            className="px-4 py-2 rounded-lg border border-border/30 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-white transition-all"
          >
            Volver
          </Link>
          <div className="px-4 py-2 rounded-lg bg-white border border-border/30 shadow-raised text-[10px] font-mono text-secondary">
            HASH: {projectId?.substring(0, 12).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 📟 Left Column: HUD & Terminal */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 bg-white rounded-[32px] border border-border/20 shadow-premium overflow-hidden flex flex-col relative group">
            {/* Header of the Main Module */}
            <div className="p-6 border-b border-border/10 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Cpu size={18} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest text-secondary">Protocolo VeriFinca Alpha-1</h2>
              </div>
              <div className="flex items-center gap-2">
                 <div className="h-1 w-12 bg-border/20 rounded-full overflow-hidden">
                   <div className="h-full bg-primary animate-[shimmer_2s_infinite]" style={{width: '60%'}} />
                 </div>
              </div>
            </div>

            {/* The Actual HUD or Initial State */}
            <div className="flex-1 relative flex flex-col">
              {!isScanning && !result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-700">
                  <div className="w-24 h-24 rounded-[32px] bg-secondary/5 flex items-center justify-center mb-8 relative">
                    <Layers className="w-10 h-10 text-secondary/20" />
                    <div className="absolute inset-0 border-2 border-secondary/10 rounded-[32px] animate-ping duration-[3s]" />
                  </div>
                  <h3 className="display-lg text-secondary mb-4 italic">Auditoría Requerida</h3>
                  <p className="max-w-md text-xs text-text-secondary leading-relaxed mb-10 font-medium">
                    Inicie el protocolo de validación para contrastar los metadatos del proyecto con las bases de datos gubernamentales y el motor de reglas institucional.
                  </p>
                  <button 
                    onClick={startValidation}
                    className="vf-btn-primary group"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                    ACTIVAR PROTOCOLO INTEGRAL
                  </button>
                </div>
              ) : (
                <div className="flex-1 bg-secondary/5 backdrop-blur-[2px] overflow-hidden">
                   <ValidationHUD 
                     isScanning={isScanning && !result} 
                     onComplete={handleValidationComplete} 
                   />
                   
                   {result && (
                     <div className="absolute inset-0 bg-white p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-1000">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-premium ${result.isFullyValid ? 'bg-success/10' : 'bg-error/10'}`}>
                           <ShieldCheck size={48} className={result.isFullyValid ? 'text-success' : 'text-error'} />
                        </div>
                        <h3 className="display-lg text-secondary mb-2 uppercase italic tracking-tighter">
                          {result.isFullyValid ? 'Certificación Completa' : 'Alerta de Discrepancia'}
                        </h3>
                        <p className="text-xs font-black text-text-secondary tracking-[0.2em] uppercase mb-12">
                          Auditoría finalizada // {result.internalValidation?.results?.length ?? 0} reglas analizadas
                        </p>
                        
                        <div className="flex gap-4">
                          <Link 
                            to={`/admin/projects/${projectId}/validations`}
                            className="h-14 px-8 rounded-xl bg-secondary text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all duration-300 shadow-xl"
                          >
                            Ver Dashboard de Resultados <ArrowRight size={14} />
                          </Link>
                          <button 
                            onClick={() => { setResult(null); setIsScanning(false); }}
                            className="h-14 px-8 rounded-xl bg-white border border-border/30 text-secondary font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:border-primary transition-all"
                          >
                            <RefreshCw size={14} /> Reiniciar
                          </button>
                        </div>
                     </div>
                   )}
                </div>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="p-4 bg-secondary text-white/50 flex items-center justify-between text-[8px] font-mono tracking-[0.2em] uppercase">
               <span>LATENCY: 5ms // JITTER: 0.2ms</span>
               <div className="flex items-center gap-3">
                 <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-success" /> DB_CONNECT</span>
                 <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-success" /> AI_ENGINE_LINK</span>
               </div>
            </div>
          </div>
        </div>

        {/* 📊 Right Column: System Status */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* System Telemetry */}
          <section className="animate-in slide-in-from-right duration-700 delay-200">
            <h3 className="text-[10px] font-black text-secondary tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
              <Activity size={14} className="text-primary" /> Telemetría del Sistema
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {systemStats.map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-border/20 shadow-raised flex items-center justify-between group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <div className="text-[8px] font-black text-text-secondary uppercase tracking-widest">{stat.label}</div>
                      <div className="text-sm font-display font-black text-secondary">{stat.value}</div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Infrastructure Health */}
          <section className="animate-in slide-in-from-right duration-700 delay-300">
             <div className="vf-card bg-secondary p-8 border-none relative overflow-hidden group">
                {/* HUD Grid Overlay for the card */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <h3 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase mb-8">Nodos de Red</h3>
                
                <div className="space-y-6">
                  {[
                    { node: "CENTRAL_HUB", load: 24, status: "UP" },
                    { node: "REGISTRY_API", load: 67, status: "BUSY" },
                    { node: "GEO_SAT_V4", load: 12, status: "UP" }
                  ].map((n, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-mono text-white/80">{n.node}</span>
                        <span className={`text-[10px] font-mono ${n.status === 'UP' ? 'text-success' : 'text-primary'}`}>{n.status}</span>
                      </div>
                      <div className="h-1 px-0.5 bg-white/10 rounded-full flex items-center">
                         <div className={`h-0.5 rounded-full ${n.status === 'UP' ? 'bg-success' : 'bg-primary'} transition-all duration-1000`} style={{width: `${n.load}%`}} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Terminal size={12} className="text-primary" />
                    <span className="text-[9px] font-mono text-white/40 uppercase">Awaiting instruction...</span>
                  </div>
                  {error && (
                    <div className="p-3 bg-error/20 border border-error/50 rounded-lg flex items-start gap-2 animate-pulse">
                      <AlertCircle size={14} className="text-error mt-0.5" />
                      <span className="text-[9px] font-mono text-error uppercase leading-tight">{error}</span>
                    </div>
                  )}
                </div>
             </div>
          </section>

          {/* Quick Help / Tooltip */}
          <div className="mt-auto p-6 bg-primary/10 rounded-2xl border border-primary/20 flex gap-4">
             <AlertCircle className="text-primary shrink-0" size={20} />
             <p className="text-[10px] text-text-primary leading-relaxed font-medium">
               <strong className="block mb-1 text-primary lowercase tracking-wider font-black uppercase">Nota de Seguridad:</strong> 
               Cada ejecución consume créditos de API y queda registrada permanentemente en el Ledger Institucional para trazabilidad total.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};
