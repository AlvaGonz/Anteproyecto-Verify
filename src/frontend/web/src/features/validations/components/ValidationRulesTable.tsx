import React from "react";
import { ValidationRuleResultDto, RuleStatus } from "../types";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, Shield, Info, ExternalLink } from "lucide-react";

interface ValidationRulesTableProps {
  results: ValidationRuleResultDto[];
}

export const ValidationRulesTable: React.FC<ValidationRulesTableProps> = ({
  results,
}) => {
  const getStatusConfig = (status: RuleStatus) => {
    switch (status) {
      case RuleStatus.Passed:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-success" />,
          label: "CUMPLIDO",
          className: "bg-success/10 text-success border-success/20",
          dots: "bg-success"
        };
      case RuleStatus.Warning:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-warning" />,
          label: "OBSERVACIÓN",
          className: "bg-warning/10 text-warning border-warning/20",
          dots: "bg-warning"
        };
      case RuleStatus.Failed:
        return {
          icon: <XCircle className="w-4 h-4 text-error" />,
          label: "VIOLACIÓN",
          className: "bg-error/10 text-error border-error/20",
          dots: "bg-error"
        };
      case RuleStatus.NotApplicable:
        return {
          icon: <MinusCircle className="w-4 h-4 text-text-secondary" />,
          label: "N/A",
          className: "bg-black/5 text-text-secondary border-black/10",
          dots: "bg-text-secondary"
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-text-secondary" />,
          label: "PENDIENTE",
          className: "bg-black/5 text-text-secondary border-black/10",
          dots: "bg-text-secondary"
        };
    }
  };

  return (
    <div className="w-full">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/5 rounded-lg">
            <Shield className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-secondary">Libro Mayor de Cumplimiento</h3>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-surface-raised rounded-full text-[10px] font-bold text-text-secondary border border-border/50">AUDITORÍA ACTIVA</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-raised/50">
              <th className="px-6 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.15em] border-b border-border/30">Criterio ID</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.15em] border-b border-border/30">Protocolo de Verificación</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.15em] border-b border-border/30">Jurisdicción</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.15em] border-b border-border/30">Estado Inmutable</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-text-secondary uppercase tracking-[0.15em] border-b border-border/30">Evidencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {results.map((result) => {
              const status = getStatusConfig(result.status);
              return (
                <tr key={result.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-text-secondary bg-black/5 px-2 py-0.5 rounded uppercase">{result.ruleCode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-secondary tracking-tight group-hover:text-primary transition-colors">{result.ruleName}</span>
                      <span className="text-xs text-text-secondary line-clamp-1">{result.message}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${status.dots}`} />
                       <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">NACIONAL / DGII</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black tracking-widest ${status.className}`}>
                      {status.icon}
                      {status.label}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-border/50 text-text-secondary hover:text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-surface-raised/30 border-t border-border/30 flex justify-center">
         <button className="text-[10px] font-black text-secondary/40 hover:text-secondary tracking-[0.2em] uppercase transition-colors">
           Ver Protocolo Completo de Auditoría
         </button>
      </div>
    </div>
  );
};
