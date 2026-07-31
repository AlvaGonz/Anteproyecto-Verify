import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ShieldCheck, AlertTriangle, Clock, FileText, Building2, Gavel } from "lucide-react";
import { DocumentType, DocumentStatus } from "../types";
import { useDocuments } from "../api/useDocuments";

interface DocumentosModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DOCUMENTOS_PRINCIPALES: { type: DocumentType; label: string; entity: string; norm: string }[] = [
  { type: DocumentType.CertificadoTitulo, label: "Título de Propiedad", entity: "Registro de Títulos", norm: "Ley 108-05" },
  { type: DocumentType.CertificacionEstadoJuridico, label: "Estado Jurídico", entity: "Registro de Títulos", norm: "Ley 108-05" },
  { type: DocumentType.PlanoMensuraCatastral, label: "Plano de Mensura", entity: "Tribunal de Tierras", norm: "Ley 108-05" },
  { type: DocumentType.CopiaCedulaIdentidad, label: "Cédula / Identidad del Titular", entity: "Junta Central Electoral", norm: "Ley 8-04" },
  { type: DocumentType.CertificacionIPI, label: "Certificación IPI", entity: "DGII", norm: "Ley 18-88" },
];

const ANEXOS: { type: DocumentType; label: string; entity: string; norm: string }[] = [
  { type: DocumentType.CertificadoUsoSuelo, label: "Uso de Suelo / No Objeción Municipal", entity: "Ayuntamiento", norm: "Ordenanzas" },
  { type: DocumentType.RegistroMercantil, label: "Registro Mercantil", entity: "Cámara de Comercio", norm: "Ley 3-02" },
  { type: DocumentType.RNC, label: "RNC activo", entity: "DGII", norm: "-" },
  { type: DocumentType.CertificadoEIA, label: "Certificado EIA", entity: "Min. Medio Ambiente", norm: "Ley 64-00" },
  { type: DocumentType.NoObjecionINAPACAASD, label: "No objeción INAPA/CAASD", entity: "INAPA / CAASD", norm: "-" },
  { type: DocumentType.PoderNotarial, label: "Poder Notarial (si aplica)", entity: "Notaría Pública", norm: "Ley 301 Notarial" },
];

const getDocStatus = (doc: any) => {
  if (!doc) return "missing";
  if (doc.estadoDocumento === DocumentStatus.Verificado || doc.estadoDocumento === DocumentStatus.Valid) return "verificado";
  if (doc.estadoDocumento === DocumentStatus.Observado) return "observado";
  if (doc.estadoDocumento !== DocumentStatus.Invalid) return "presentado";
  return "missing";
};

const DocumentCard: React.FC<{ typeData: { type: DocumentType; label: string; entity: string; norm: string }; doc: any }> = ({ typeData, doc }) => {
  const status = getDocStatus(doc);

  const statusConfig = {
    verificado: { icon: ShieldCheck, cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", badge: "VERIFICADO", badgeCls: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
    presentado: { icon: Clock, cls: "bg-amber-500/10 text-amber-500 border-amber-500/20", badge: "PRESENTADO", badgeCls: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
    observado: { icon: AlertTriangle, cls: "bg-rose-500/10 text-rose-500 border-rose-500/20", badge: "OBSERVADO", badgeCls: "bg-rose-500/10 text-rose-500 border border-rose-500/20" },
    missing: { icon: Lock, cls: "bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/5", badge: "NO SUMINISTRADO", badgeCls: "bg-on-surface-variant/5 text-on-surface-variant/40 border border-on-surface-variant/5" },
  };

  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <div className={`group relative flex flex-col p-4 rounded-xl transition-all border ${cfg.cls}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.cls}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-[11px] font-black uppercase tracking-tight text-on-surface-variant truncate">{typeData.label}</h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <Building2 className="w-2.5 h-2.5" />
                <span className="text-[8px] font-black uppercase tracking-widest">{typeData.entity}</span>
              </div>
              <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <Gavel className="w-2.5 h-2.5" />
                <span className="text-[8px] font-black uppercase tracking-widest">{typeData.norm}</span>
              </div>
            </div>
            {doc && (
              <span className="text-[9px] font-semibold text-on-surface-variant/60 truncate block max-w-[180px]" title={doc.nombreArchivoOriginal}>
                {doc.nombreArchivoOriginal}
              </span>
            )}
          </div>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${cfg.badgeCls}`}>
          {cfg.badge}
        </div>
      </div>
    </div>
  );
};

export const DocumentosModal: React.FC<DocumentosModalProps> = ({ projectId, isOpen, onClose }) => {
  const { data: documents = [], isLoading } = useDocuments(projectId);

  const findDoc = (type: DocumentType) => documents.find((d: any) => d.tipoDocumento === type && d.activo);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-slate-100 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-black uppercase tracking-tight text-secondary">Documentos del Proyecto</h2>
              </div>
              <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {isLoading ? (
                <div className="py-16 flex flex-col items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cargando documentos...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-primary rounded-full" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-secondary">Documentos Principales</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DOCUMENTOS_PRINCIPALES.map(td => (
                        <DocumentCard key={td.type} typeData={td} doc={findDoc(td.type)} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-on-surface-variant/30 rounded-full" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Anexos</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ANEXOS.map(td => (
                        <DocumentCard key={td.type} typeData={td} doc={findDoc(td.type)} />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Lock className="w-3 h-3 text-on-surface-variant/30" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30">Reporte de integridad encriptado</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
