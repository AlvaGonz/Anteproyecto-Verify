import React, { useRef, useState } from "react";
import { Trash2, AlertCircle, UploadCloud, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { useUploadRequirementDocument } from "../../api/useDocuments";

export interface DocumentRequirementRowProps {
  projectId: string;
  requirementCode: string;
  label: string;
  description: string;
  categoryLabel: string;
  isUploaded: boolean;
  uploadedDocumentId?: string;
  fileName?: string;
  documentStatus?: number; // 6 = Verificado, 3 = Rechazado, 1 = Procesando
  availableDocuments?: { id: string; name: string }[];
  onChangeDocument?: (newDocumentId: string, oldDocumentId?: string) => Promise<void>;
  onUnassignDocument?: () => void;
  isAssigning?: boolean;
}

export const DocumentRequirementRow: React.FC<DocumentRequirementRowProps> = ({
  projectId,
  requirementCode,
  label,
  description,
  categoryLabel,
  isUploaded,
  uploadedDocumentId,
  fileName,
  documentStatus,
  availableDocuments = [],
  onChangeDocument,
  onUnassignDocument,
  isAssigning
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutateAsync: uploadDocument, isPending } = useUploadRequirementDocument(projectId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    try {
      await uploadDocument({
        requirementCode,
        file
      });
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Error al subir el documento');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isRequired = requirementCode !== "poder";

  let containerStyle = "border-border/30 bg-surface hover:border-border/60";
  if (isUploaded && documentStatus === 6) {
    containerStyle = "border-success/30 bg-success/5 shadow-sm";
  } else if (isUploaded) {
    containerStyle = "border-primary/30 bg-primary/5 shadow-sm";
  } else if (isRequired) {
    containerStyle = "border-warning/30 bg-warning/5 hover:border-warning/50";
  }

  return (
    <div data-testid={`requirement-row-${requirementCode}`} className={`w-full group rounded-2xl border transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center relative overflow-hidden ${containerStyle}`}>

      {/* Decorative gradient for uploaded state */}
      {isUploaded && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none" />
      )}

      {/* Icon and Info */}
      <div className="flex-1 flex items-start gap-4 z-10 w-full min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${documentStatus === 6 ? 'bg-success/10 text-success' :
            documentStatus === 3 ? 'bg-error/10 text-error' :
              isUploaded ? 'bg-primary/10 text-primary' :
                'bg-surface-container-high text-secondary/60'
          }`}>
          {documentStatus === 6 ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : documentStatus === 3 ? (
            <AlertCircle className="w-6 h-6" />
          ) : isUploaded ? (
            <FileText className="w-6 h-6" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-secondary truncate">{label}</h3>
            {isRequired ? (
              <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Requerido</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary/70 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Opcional</span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider whitespace-nowrap">{categoryLabel}</span>
          </div>

          <p className="text-xs sm:text-sm text-secondary/70 mt-1 line-clamp-2 sm:line-clamp-1">{description}</p>

          {errorMsg && (
            <div className="mt-2 flex items-center text-xs text-error font-medium">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errorMsg}
            </div>
          )}


        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto z-10 sm:ml-auto">
        {!isUploaded ? (
          <div className="flex flex-col gap-2 w-full sm:w-auto items-end">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                data-testid="inline-file-upload"
                accept=".pdf,application/pdf"
              />
              <button
                type="button"
                disabled={isPending || isAssigning}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center bg-primary text-primary-foreground cursor-pointer w-full sm:w-auto justify-center text-sm py-2 px-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-10 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <UploadCloud className="w-4 h-4 mr-2" />
                )}
                {isPending ? 'Subiendo...' : 'Subir'}
              </button>
            </div>

            {availableDocuments.length > 0 && onChangeDocument && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value=""
                  disabled={isAssigning || isPending}
                  onChange={async (e) => {
                    const newId = e.target.value;
                    if (newId) {
                      await onChangeDocument(newId, undefined);
                    }
                  }}
                  className="text-xs font-medium text-secondary bg-surface border border-border/50 rounded-lg p-2 max-w-[200px] truncate outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
                >
                  <option value="">O asignar existente...</option>
                  {availableDocuments.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
                {isAssigning && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-full sm:w-auto gap-2 items-center">
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <select
                value={uploadedDocumentId || ""}
                disabled={isAssigning || isPending}
                onChange={async (e) => {
                  const newId = e.target.value;
                  if (onChangeDocument) {
                    await onChangeDocument(newId, uploadedDocumentId);
                  }
                }}
                className="text-xs font-medium text-secondary bg-surface-container border border-border/50 rounded-lg p-2 max-w-[200px] truncate outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
              >
                <option value="">-- Quitar asignación --</option>
                {uploadedDocumentId && fileName && (
                  <option value={uploadedDocumentId}>{fileName}</option>
                )}
                {availableDocuments.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
              {isAssigning && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
            </div>

            {onUnassignDocument && (
              <button
                type="button"
                disabled={isAssigning}
                onClick={onUnassignDocument}
                className="h-10 w-10 shrink-0 rounded-lg bg-surface-container border border-border/50 text-error hover:bg-error/10 hover:border-error/30 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Quitar asignación"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

