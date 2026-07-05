import React from "react";
import { AuditLogDto, AuditActionType } from "../../types";
import { 
  History, 
  User, 
  FileUp, 
  ShieldCheck, 
  Activity, 
  Award, 
  MessageSquare, 
  Archive,
  ArrowRight
} from "lucide-react";

interface AuditLogListProps {
  logs: AuditLogDto[];
}

const ACTION_CONFIG = {
  [AuditActionType.DocumentUpload]: {
    icon: FileUp,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "DOCUMENTO SUBIDO"
  },
  [AuditActionType.ValidationRun]: {
    icon: ShieldCheck,
    color: "text-secondary",
    bg: "bg-secondary/10",
    label: "AUDITORÍA EJECUTADA"
  },
  [AuditActionType.StatusChange]: {
    icon: Activity,
    color: "text-info",
    bg: "bg-info/10",
    label: "CAMBIO DE ESTADO"
  },
  [AuditActionType.CertificationIssued]: {
    icon: Award,
    color: "text-success",
    bg: "bg-success/10",
    label: "CERTIFICADO EMITIDO"
  },
  [AuditActionType.ObservationCreated]: {
    icon: MessageSquare,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "OBSERVACIÓN REGISTRADA"
  },
  [AuditActionType.ArchiveDocument]: {
    icon: Archive,
    color: "text-on-surface-variant",
    bg: "bg-surface-container-high",
    label: "DOCUMENTO ARCHIVADO"
  }
};

export const AuditLogList: React.FC<AuditLogListProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-10 opacity-40 italic text-sm">
        No hay registros de actividad para este proyecto.
      </div>
    );
  }

  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.fechaUtc).getTime() - new Date(a.fechaUtc).getTime()
  );

  return (
    <div className="relative">
      {/* Vertical Timeline Line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border/40" />
      
      <div className="space-y-8 relative">
        {sortedLogs.map((log) => {
          const config = ACTION_CONFIG[log.accion] || ACTION_CONFIG[AuditActionType.StatusChange];
          const Icon = config.icon;
          const date = new Date(log.fechaUtc);

          return (
            <div key={log.id} className="flex gap-6 group animate-fade-in-up">
              {/* Icon / Marker */}
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center ring-4 ring-surface shadow-sm transition-transform group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
              </div>

              {/* Content Card */}
              <div className="flex-1 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-black tracking-widest uppercase ${config.color}`}>
                    {config.label}
                  </span>
                  <div className="flex items-center gap-2 text-on-surface-variant/50 text-[10px] font-bold">
                    <History className="w-3 h-3" />
                    {date.toLocaleDateString()} — {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="vf-card !bg-surface-raised/50 border-none hover:!bg-white hover:shadow-premium transition-all">
                  <p className="text-sm font-bold text-secondary mb-3 leading-snug">
                    {log.descripcion}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/5">
                      <User className="w-3 h-3 text-on-surface-variant" />
                      <span className="text-[10px] font-black text-secondary uppercase">
                        {log.usuarioNombre}
                      </span>
                    </div>
                    {log.ipAddress && (
                      <span className="text-[9px] font-mono text-on-surface-variant/40">
                        Node: {log.ipAddress}
                      </span>
                    )}
                    <button type="button" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest">
                       Ver Metadata <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
