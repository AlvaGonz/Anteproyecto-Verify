import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { FindingDto, FindingSeverity } from "../../types";
import { toUtcDate } from "../../../../shared/utils/dates";
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Clock
} from "lucide-react";

interface FindingsPanelProps {
  findings: FindingDto[];
  isLoading?: boolean;
}

const SEVERITY_CONFIG = {
  [FindingSeverity.Critical]: {
    icon: ShieldAlert,
    color: "text-error",
    bg: "bg-error/10",
    border: "border-error/20",
    label: "CRÍTICO",
    glow: "shadow-error/10"
  },
  [FindingSeverity.High]: {
    icon: AlertCircle,
    color: "text-error",
    bg: "bg-error/5",
    border: "border-error/10",
    label: "ALTO",
    glow: "shadow-error/5"
  },
  [FindingSeverity.Medium]: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    label: "MEDIO",
    glow: "shadow-warning/10"
  },
  [FindingSeverity.Low]: {
    icon: Info,
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
    label: "BAJO",
    glow: "shadow-info/10"
  }
};

export const FindingsPanel: React.FC<FindingsPanelProps> = ({ 
  findings, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-3xl bg-surface-container-low animate-pulse" />
        ))}
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="vf-card py-16 flex flex-col items-center justify-center border-dashed gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-display font-black text-secondary uppercase tracking-tight">Sin Hallazgos Adversos</h3>
          <p className="text-sm text-on-surface-variant font-medium mt-1">El expediente cumple con todos los criterios institucionales.</p>
        </div>
      </div>
    );
  }

  // Sort findings by severity (Critical -> Low)
  const sortedFindings = [...findings].sort((a, b) => b.severidad - a.severidad);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {sortedFindings.map((finding, index) => {
          const config = SEVERITY_CONFIG[finding.severidad] || SEVERITY_CONFIG[FindingSeverity.Low];
          const Icon = config.icon;

          return (
            <m.div
              key={finding.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`vf-card group !p-0 overflow-hidden border-none ring-1 transition-all hover:ring-2 ${config.bg} ${config.border} hover:shadow-xl ${config.glow}`}
            >
              <div className="p-6">
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center flex-shrink-0 ring-1 ${config.border} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-[0.1em] ${config.bg} ${config.color} ring-1 ${config.border}`}>
                        {config.label}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant/40">#{finding.codigo}</span>
                      {finding.resuelto && (
                        <span className="text-[10px] font-black text-success flex items-center gap-1 uppercase tracking-wider ml-auto">
                          <CheckCircle2 className="w-3 h-3" /> Resuelto
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-black text-secondary tracking-tight mb-2 group-hover:text-primary transition-colors">
                      {finding.titulo}
                    </h4>
                    
                    <p className="text-sm text-on-surface-variant/80 font-medium leading-relaxed mb-4">
                      {finding.descripcion}
                    </p>

                    {finding.recomendacion && (
                      <div className="bg-white/40 rounded-2xl p-4 border border-white/60 space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                          <ArrowRight className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Recomendación RI</span>
                        </div>
                        <p className="text-xs text-secondary font-bold italic">
                          "{finding.recomendacion}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-3 border-t border-black/5 bg-black/2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface-variant/60">
                   <Clock className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold">DETECTADO: {toUtcDate(finding.createdAtUtc)?.toLocaleDateString() ?? ''}</span>
                </div>
                <button type="button" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-1 transition-all hover:gap-2">
                   Ver Evidencia Asociada <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
