import { DocumentDto, DocumentType } from "../types";
import { toUtcDate } from "../../../shared/utils/dates";
import { 
  FileText, 
  Download, 
  Trash2, 
  RefreshCcw, 
  History,
  Info,
  ExternalLink,
} from "lucide-react";
import { OcrReviewPanel } from "./OcrReviewPanel";
import { CedulaExtractionCard } from "./CedulaExtractionCard";
import { CertificadoTituloExtractionCard } from "./CertificadoTituloExtractionCard";

interface ProjectDocumentsListProps {
  documents: DocumentDto[];
  onDownload: (documentId: string) => Promise<void>;
  onToggleStatus: (documentId: string, isActive: boolean) => Promise<void>;
}

const DOCUMENT_TYPE_NAMES: Record<string, string> = {
  [DocumentType.TITLE]: "Certificado de Título",
  [DocumentType.LEGAL_STATUS]: "Estado Jurídico",
  [DocumentType.SURVEY]: "Plano Mensura",
  [DocumentType.ID]: "Copia Cédula",
  [DocumentType.NOTARIAL_POWER]: "Poder Notarial",
  [DocumentType.CertificadoTitulo]: "Certificado de Título",
  [DocumentType.CertificacionEstadoJuridico]: "Estado Jurídico",
  [DocumentType.PlanosArquitectonicos]: "Planos Arquitectónicos",
  [DocumentType.PlanoMensuraCatastral]: "Plano Mensura",
  [DocumentType.PermisoConstruccion]: "Permiso de Construcción",
  [DocumentType.CertificadoUsoSuelo]: "Uso de Suelo",
  [DocumentType.FormularioFIDVB009]: "FI-DVB-009",
  [DocumentType.CertificacionIPI]: "IPI",
  [DocumentType.RegistroMercantil]: "Reg. Mercantil",
  [DocumentType.ActaConstitutiva]: "Acta Constitutiva",
  [DocumentType.PoderNotarial]: "Poder Notarial",
  [DocumentType.RNC]: "RNC",
  [DocumentType.EstadosFinancieros]: "Estados Fin.",
  [DocumentType.CertificacionesBancarias]: "Cert. Bancarias",
  [DocumentType.FormularioKYCAML]: "KYC/AML",
  [DocumentType.DeclaracionPEP]: "Declaración PEP",
  [DocumentType.CertificadoEIA]: "EIA",
  [DocumentType.NoObjecionINAPACAASD]: "INAPA/CAASD",
  [DocumentType.DocumentosNotariales]: "Doc. Notariales",
  [DocumentType.DocumentosSupletorios]: "Doc. Supletorios",
  [DocumentType.Other]: "Otro",
};

export const ProjectDocumentsList: React.FC<ProjectDocumentsListProps> = ({
  documents,
  onDownload,
  onToggleStatus,
}) => {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in group hover:border-dashed">
        <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant/40 mb-6 group-hover:scale-110 transition-transform">
          <FileText className="w-10 h-10" />
        </div>
        <h4 className="text-xl font-display font-black text-secondary uppercase tracking-tight">Repositorio Vacío</h4>
        <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-xs mx-auto">
          Aún no se han digitalizado evidencias para este proyecto. Comience subiendo un documento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-black text-secondary flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          EXPEDIENTES DIGITALIZADOS ({documents.length})
        </h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <span className="text-[10px] font-bold text-on-surface-variant">ACTIVO</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error"></span>
            <span className="text-[10px] font-bold text-on-surface-variant">DEPRECIADO</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {documents.map((doc, idx) => (
          <div
            key={doc.id}
            className="vf-card group !p-0 overflow-hidden border-l-4 transition-all duration-300 animate-fade-in-up"
            style={{
              animationDelay: `${idx * 100}ms`,
              borderLeftColor: doc.activo ? "var(--color-success)" : "var(--color-error)"
            }}
          >
            <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center relative flex-shrink-0 border transition-colors ${doc.activo ? "bg-success/[0.03] border-success/10 text-success ring-4 ring-success/[0.02]" : "bg-error/[0.03] border-error/10 text-error ring-4 ring-error/[0.02]"}`}>
                  <FileText className="w-7 h-7" />
                  <span className="text-[8px] font-black absolute bottom-1 uppercase">v{doc.version}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${doc.activo ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                      {DOCUMENT_TYPE_NAMES[doc.tipoDocumento] || "DESCONOCIDO"}
                    </span>
                  </div>
                  <h5 className="text-sm sm:text-base font-black text-secondary truncate group-hover:text-primary transition-colors max-w-[200px] sm:max-w-none">
                    {doc.nombreArchivoOriginal}
                  </h5>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1.5">
                      <History className="w-3 h-3" /> {toUtcDate(doc.createdAtUtc)?.toLocaleDateString() ?? ''}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1.5 uppercase">
                      <Info className="w-3 h-3" /> {(doc.tamanoBytes / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center w-full md:w-auto">
                <button type="button"
                  onClick={() => onDownload(doc.id)}
                  className="flex-1 md:flex-none h-10 px-4 rounded-xl bg-surface-container-high hover:bg-primary hover:text-white text-secondary font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar
                </button>

                <button type="button"
                  onClick={() => onToggleStatus(doc.id, !doc.activo)}
                  className={`flex-1 md:flex-none h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${doc.activo
                      ? "bg-error/10 text-error hover:bg-error hover:text-white"
                      : "bg-success/10 text-success hover:bg-success hover:text-white"
                    }`}
                >
                  {doc.activo ? (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Archivar
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-3.5 h-3.5" />
                      Restaurar
                    </>
                  )}
                </button>

                <button type="button" className="h-10 w-10 rounded-xl bg-secondary/5 text-secondary hover:bg-secondary hover:text-white transition-all flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Include OCR Review Panel */}
            <div className="border-t border-[var(--color-border)]/10 bg-surface-container-lowest">
              {doc.tipoDocumento === DocumentType.ID 
                ? (doc.cedulaExtraction ? <CedulaExtractionCard extraction={doc.cedulaExtraction} /> : null)
                : (doc.tipoDocumento === DocumentType.CertificadoTitulo || doc.tipoDocumento === DocumentType.TITLE)
                ? (doc.certificadoTituloExtraction ? <CertificadoTituloExtractionCard extraction={doc.certificadoTituloExtraction} /> : null)
                : <OcrReviewPanel document={doc} />
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
