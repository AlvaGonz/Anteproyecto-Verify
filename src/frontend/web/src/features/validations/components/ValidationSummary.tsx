import React from "react";
import { InternalValidationSummaryDto } from "../types";
import { ShieldCheck, CheckCircle, AlertTriangle, AlertCircle, Activity, Lock } from "lucide-react";

interface ValidationSummaryProps {
  summary: InternalValidationSummaryDto;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  summary,
}) => {
  const totalRules = summary.passedCount + summary.warningCount + summary.failedCount;
  const healthScore = totalRules > 0 ? Math.round((summary.passedCount / totalRules) * 100) : 0;
  
  return (
    <div className="space-y-6">
      {/* Bento Grid: Summary Score & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Trust Score Panel */}
        <div className="md:col-span-2 vf-card bg-secondary border-none overflow-hidden relative group">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <ShieldCheck size={200} className="text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-white/60 tracking-[0.2em] uppercase">Security DNA Analysis</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-6">Puntaje de Integridad</h3>
            </div>
            
            <div className="flex items-end gap-6">
              <div className="text-7xl font-display font-black text-white leading-none tracking-tighter">
                {healthScore}%
              </div>
              <div className="pb-2">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${summary.esLegitimo ? "bg-primary text-white" : "bg-error text-white"}`}>
                  {summary.esLegitimo ? "EXPEDIENTE ÍNTEGRO" : "RIESGO DETECTADO"}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-secondary flex items-center justify-center">
                    <Lock size={12} className="text-white/40" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-mono text-white/40">ENC_V4_RSA_4096</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="vf-card bg-white hover:bg-surface-raised transition-all">
            <div className="p-2 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="text-success" size={20} />
            </div>
            <div className="text-3xl font-display font-black text-secondary">{summary.passedCount}</div>
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Reglas Limpias</div>
          </div>
          
          <div className="vf-card bg-white hover:bg-surface-raised transition-all">
            <div className="p-2 w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
              <AlertTriangle className="text-warning" size={20} />
            </div>
            <div className="text-3xl font-display font-black text-secondary">{summary.warningCount}</div>
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Alertas Moderadas</div>
          </div>
          
          <div className="vf-card bg-white hover:bg-surface-raised transition-all">
            <div className="p-2 w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center mb-4">
              <AlertCircle className="text-error" size={20} />
            </div>
            <div className="text-3xl font-display font-black text-secondary">{summary.failedCount}</div>
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Violaciones Críticas</div>
          </div>
          
          <div className="vf-card bg-white hover:bg-surface-raised transition-all">
            <div className="p-2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Activity className="text-primary" size={20} />
            </div>
            <div className="text-3xl font-display font-black text-secondary">{totalRules}</div>
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Protocolos Ejecutados</div>
          </div>
        </div>

      </div>
    </div>
  );
};
