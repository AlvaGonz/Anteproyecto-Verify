import React from "react";
import { DocumentType, DocumentStatus, DocumentDto } from "../types";
import { canonicalType } from "../utils/documentTypes";
import { useDocuments, useDownloadDocument } from "../api/useDocuments";

import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck2,
  Lock,
  Building2,
  Gavel,
  Download
} from "lucide-react";

import { m, AnimatePresence } from "framer-motion";

interface ProjectDocumentStatusProps {
  projectId: string;
  categoriaId?: number;
  preloadedDocuments?: DocumentDto[];
}

const DOCUMENT_INFO: Record<string, { name: string; entity: string; norm: string }> = {
  [DocumentType.CertificadoTitulo]: { name: "Certificado de Título de Propiedad", entity: "Registro de Títulos", norm: "Ley 108-05" },
  [DocumentType.CertificacionEstadoJuridico]: { name: "Certificación de Estado Jurídico", entity: "Registro de Títulos", norm: "Ley 108-05" },
  [DocumentType.PlanoMensuraCatastral]: { name: "Plano de Mensura Catastral", entity: "Tribunal de Tierras", norm: "Ley 108-05" },
  [DocumentType.CopiaCedulaIdentidad]: { name: "Cédula / Identidad del Titular", entity: "Junta Central Electoral", norm: "Ley 8-04" },
  [DocumentType.CertificadoUsoSuelo]: { name: "Certificado de Uso de Suelo", entity: "Ayuntamiento", norm: "Ordenanzas" },
  [DocumentType.CertificacionIPI]: { name: "Certificación IPI al día", entity: "DGII", norm: "Ley 18-88" },
  [DocumentType.RegistroMercantil]: { name: "Registro Mercantil activo", entity: "Cámara de Comercio", norm: "Ley 3-02" },
  [DocumentType.PoderNotarial]: { name: "Poder Notarial", entity: "Notaría Pública", norm: "Ley 301 Notarial" },
  [DocumentType.RNC]: { name: "RNC activo", entity: "DGII", norm: "-" },
  [DocumentType.CertificadoEIA]: { name: "Certificado EIA", entity: "Min. Medio Ambiente", norm: "Ley 64-00" },
};

const ESSENTIAL_TYPES: DocumentType[] = [
  DocumentType.CertificadoTitulo,
  DocumentType.CertificacionEstadoJuridico,
  DocumentType.PlanoMensuraCatastral,
  DocumentType.CopiaCedulaIdentidad,
  DocumentType.CertificacionIPI,
];

const ANEXO_TYPES: DocumentType[] = [
  DocumentType.CertificadoUsoSuelo,
  DocumentType.RegistroMercantil,
  DocumentType.PoderNotarial,
  DocumentType.RNC,
  DocumentType.CertificadoEIA,
];

// ponytail: only these 2 anexos are shown publicly; the rest are hidden but kept in ANEXO_TYPES for completeness calculation
const VISIBLE_ANEXO_TYPES: DocumentType[] = [
  DocumentType.CertificadoUsoSuelo,
  DocumentType.PoderNotarial,
];

export const ProjectDocumentStatus: React.FC<ProjectDocumentStatusProps> = ({ projectId, preloadedDocuments }) => {
  const { data: fetchedDocuments = [], isLoading: loading } = useDocuments(projectId || "");
  const { mutate: downloadDoc, isPending: isDownloading } = useDownloadDocument(projectId || "");

  const documents = preloadedDocuments ?? fetchedDocuments;

  if (loading && !preloadedDocuments) return (
    <div className="py-20 flex flex-col items-center gap-4 text-secondary/20">
      <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
      <span className="text-[10px] font-black uppercase tracking-widest">Auditoría Digital en curso...</span>
    </div>
  );

  const uploadedEssentials = documents.filter((d: any) => d.estadoDocumento !== DocumentStatus.Invalid && ESSENTIAL_TYPES.includes(canonicalType(d.tipoDocumento)));
  const uploadedAnexos = documents.filter((d: any) => d.estadoDocumento !== DocumentStatus.Invalid && ANEXO_TYPES.includes(canonicalType(d.tipoDocumento)));

  const missingCount = ESSENTIAL_TYPES.length - new Set(uploadedEssentials.map((d: any) => canonicalType(d.tipoDocumento))).size;

  // Nivel de Confianza: 5 esenciales valen 80% (16% c/u), 2 anexos visibles valen 20% (10% c/u).
  // Se cuentan TIPOS ÚNICOS cubiertos — varios documentos del mismo tipo no suman más.
  const ESSENTIAL_WEIGHT = 80;
  const ANEXO_WEIGHT = 20;
  const essentialPercent = ESSENTIAL_TYPES.length > 0
    ? Math.round((new Set(uploadedEssentials.map((d: any) => canonicalType(d.tipoDocumento))).size / ESSENTIAL_TYPES.length) * ESSENTIAL_WEIGHT)
    : ESSENTIAL_WEIGHT;
  const anexoPercent = VISIBLE_ANEXO_TYPES.length > 0
    ? Math.round((new Set(uploadedAnexos.map((d: any) => canonicalType(d.tipoDocumento))).size / VISIBLE_ANEXO_TYPES.length) * ANEXO_WEIGHT)
    : ANEXO_WEIGHT;
  const progressPercent = Math.min(100, essentialPercent + anexoPercent);


  const renderDocItem = (typeId: DocumentType, index: number) => {
    const info = DOCUMENT_INFO[typeId];
    if (!info) return null;

    const doc = documents.find((d: any) => d.tipoDocumento === typeId || canonicalType(d.tipoDocumento) === typeId);
    const isVerificado = doc?.estadoDocumento === DocumentStatus.Verificado || doc?.estadoDocumento === DocumentStatus.Valid;
    const isPending = doc && doc.estadoDocumento !== DocumentStatus.Invalid && !isVerificado;
    const isObservado = doc?.estadoDocumento === DocumentStatus.Observado;

    return (
      <m.div
        key={typeId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`group relative flex flex-col p-6 rounded-[2rem] transition-all border ${(isVerificado || isObservado)
          ? "bg-emerald-500/[0.03] border-emerald-500/10 hover:border-emerald-500/30"
          : isPending
            ? "bg-amber-500/[0.03] border-amber-500/10 hover:border-amber-500/30"
            : "bg-on-surface-variant/[0.02] border-on-surface-variant/5 grayscale opacity-60"
          }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${(isVerificado || isObservado)
              ? "bg-emerald-500/10 text-emerald-500"
              : isPending
                ? "bg-amber-500/10 text-amber-500"
                : "bg-on-surface-variant/10 text-on-surface-variant"
              }`}>
              {(isVerificado || isObservado) ? <ShieldCheck className="w-5 h-5" /> : isPending ? <Clock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>

            <div className="space-y-1">
              <h4 className={`text-sm font-black uppercase tracking-tight ${(isVerificado || isObservado) ? "text-secondary" : "text-on-surface-variant"}`}>
                {info.name}
              </h4>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                  <Building2 className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{info.entity}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                  <Gavel className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{info.norm}</span>
                </div>
              </div>

              {/* Show related file name if doc exists */}
              {doc && (
                <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-secondary/5 border border-secondary/10 rounded-xl w-fit group-hover:bg-secondary/10 transition-colors">
                  <FileCheck2 className="w-3.5 h-3.5 text-secondary/60" />
                  <span className="text-[11px] font-bold text-secondary/70 truncate max-w-[200px] md:max-w-[300px]" title={doc.nombreArchivoOriginal}>
                    {doc.nombreArchivoOriginal}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {(isVerificado || isObservado) && (
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                SUMINISTRADO
              </div>
            )}
            {!isVerificado && !isPending && !isObservado && (
              <div className="px-3 py-1 rounded-full bg-on-surface-variant/5 text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest border border-on-surface-variant/5 italic">
                NO SUMINISTRADO
              </div>
            )}
            {isPending && !isObservado && doc?.estadoDocumento === DocumentStatus.EnRevision && (
              <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                EN REVISIÓN OCR
              </div>
            )}
            {isPending && !isObservado && doc?.estadoDocumento !== DocumentStatus.EnRevision && (
              <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                EN PROCESO
              </div>
            )}

            {(isVerificado || isPending || isObservado) && doc?.id && (
              <button
                onClick={() => downloadDoc({ id: doc.id, fileName: doc.nombreArchivoOriginal })}
                disabled={isDownloading}
                className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                title="Descargar Documento"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </m.div>
    );
  };

  return (
    <section className="space-y-10">
      <div className="vf-card !bg-secondary !text-white !p-12 !rounded-[3.5rem] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div className="space-y-6">
            <p className="text-4xl font-display font-black tracking-trough uppercase italic leading-none max-w-sm">
              Protocolo de Auditoría <span className="text-primary italic">Documental</span>
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-white/60 bg-white/5 py-3 px-6 rounded-2xl border border-white/5 inline-flex">
              <FileCheck2 className="w-4 h-4 text-primary" />
              Criterio de Validación: <strong className="text-white ml-2">Contraste de Información</strong>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle
                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * progressPercent) / 100}
                  strokeLinecap="round" className="text-primary transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-display">
                <span className="text-4xl font-black">{progressPercent}</span>
                <span className="text-[10px] font-black uppercase opacity-40">%</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Nivel de Confianza</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {missingCount > 0 && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-8 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 flex gap-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-600 mb-1 italic">Advertencia de Integridad</h4>
              <p className="text-secondary/70 text-sm leading-relaxed font-medium">
                Se detectaron <strong>{missingCount} documentos esenciales</strong> ausentes o fuera de norma.
                Este expediente requiere atención inmediata para alcanzar el Sello de Integridad Suprema.
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-widest text-secondary">Documentos Principales</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {ESSENTIAL_TYPES.map((typeId, idx) => renderDocItem(typeId, idx))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-on-surface-variant/30 rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Anexos</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {VISIBLE_ANEXO_TYPES.map((typeId, idx) => renderDocItem(typeId, idx + ESSENTIAL_TYPES.length))}
          </div>
        </div>
      </div>
    </section>
  );
};
