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
import { useDocuments, useDownloadDocument, useUpdateDocumentStatus } from "../../../documents/api/useDocuments";
import { ProjectDocumentsList } from "../../../documents/components/ProjectDocumentsList";
import { useToast } from "../../../../shared/components/ui/Toast/ToastContext";

interface FindingsPanelProps {
  findings: FindingDto[];
  isLoading?: boolean;
  projectId?: string;
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
  isLoading = false,
  projectId
}) => {
  const { data: documents = [], isLoading: isDocsLoading } = useDocuments(projectId || "");
  const downloadMutation = useDownloadDocument(projectId || "");
  const statusMutation = useUpdateDocumentStatus(projectId || "");
  const { addToast } = useToast();

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      await downloadMutation.mutateAsync({ id: documentId, fileName });
    } catch (err: any) {
      addToast("Error al obtener la descarga segura", "error");
    }
  };

  const handleToggleStatus = async (documentId: string, isActive: boolean) => {
    try {
      await statusMutation.mutateAsync({ documentId, activo: isActive });
      addToast(`Estado de certificación ${isActive ? "reanudado" : "suspendido"}`, isActive ? "success" : "info");
    } catch (err: any) {
      addToast("Error al modificar el estado de validez", "error");
    }
  };

  if (isLoading || isDocsLoading) {
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
      <div className="space-y-8">
        <div className="vf-card p-6">
          <div className="vf-card flex flex-col items-center justify-center py-20 text-center animate-fade-in group hover:border-dashed">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success mb-6 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-display font-black text-secondary uppercase tracking-tight">Sin Hallazgos</h4>
            <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-xs mx-auto">
              No se han detectado irregularidades o diferenciales de riesgo en la validación actual.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-display font-black text-secondary tracking-tight mb-4 uppercase">Documentos Asociados</h3>
          <ProjectDocumentsList
            documents={documents}
            onDownload={handleDownload}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>
    );
  }

  // Sort findings by severity (Critical -> Low)
  const sortedFindings = [...findings].sort((a, b) => b.severidad - a.severidad);
  
  // Pagination
  const ITEMS_PER_PAGE = 7;
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(sortedFindings.length / ITEMS_PER_PAGE);
  const paginatedFindings = sortedFindings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {paginatedFindings.map((finding, index) => {
          const config = SEVERITY_CONFIG[finding.severidad] || SEVERITY_CONFIG[FindingSeverity.Low];
          const Icon = config.icon;

          return (
            <m.div
              key={finding.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`vf-card group !p-0 overflow-hidden border transition-all hover:shadow-lg ${config.bg} ${config.border} hover:border-${config.color.split('-')[1]}/50`}
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 border ${config.border} group-hover:scale-105 transition-transform shadow-sm`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${config.bg} ${config.color} border ${config.border}`}>
                        {config.label}
                      </span>
                      <span className="text-[10px] sm:text-xs font-mono text-on-surface-variant/60 bg-surface-container-low px-2 py-0.5 rounded-md border border-border/20">
                        #{finding.codigo}
                      </span>
                      {finding.resuelto && (
                        <span className="text-[10px] sm:text-xs font-black text-success flex items-center gap-1 uppercase tracking-wider ml-auto bg-success/10 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resuelto
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-sm sm:text-base font-bold text-secondary tracking-tight mb-1 group-hover:text-primary transition-colors leading-snug">
                      {finding.titulo}
                    </h4>
                    
                    <p className="text-xs sm:text-sm text-on-surface-variant/80 font-medium leading-relaxed mb-3">
                      {finding.descripcion}
                    </p>

                    {finding.recomendacion && (
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 space-y-1.5 mt-2">
                        <div className="flex items-center gap-1.5 text-primary">
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Recomendación RI</span>
                        </div>
                        <p className="text-xs text-secondary font-semibold italic leading-relaxed">
                          "{finding.recomendacion}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-4 sm:px-5 py-2.5 border-t border-border/10 bg-surface-container-lowest flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-on-surface-variant/60">
                   <Clock className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold tracking-wider">DETECTADO: {toUtcDate(finding.createdAtUtc)?.toLocaleDateString() ?? ''}</span>
                </div>
              </div>
            </m.div>
          );
        })}
      </AnimatePresence>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]/10">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedFindings.length)} de {sortedFindings.length} hallazgos
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)]/30 text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs font-bold px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)]/30 text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-border/30">
        <h3 className="text-lg font-display font-black text-secondary tracking-tight mb-4 uppercase">Documentos Asociados</h3>
        <ProjectDocumentsList
          documents={documents}
          onDownload={handleDownload}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    </div>
  );
};
