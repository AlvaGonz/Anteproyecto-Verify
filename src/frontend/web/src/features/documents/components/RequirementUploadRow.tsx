import React, { useRef } from "react";
import { DocumentDto } from "../types";
import { RequirementStatus, RequirementCode } from "../requirementCatalog";
import { UploadCloud, CheckCircle2, AlertCircle, Clock, FileText, Trash2, RefreshCcw } from "lucide-react";
import { clsx } from "clsx";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface RequirementUploadRowProps {
  requirementCode: RequirementCode;
  title: string;
  description: string;
  required: boolean;
  status: RequirementStatus;
  uploadedDocument?: DocumentDto;
  acceptedTypes: string;
  maxSizeBytes?: number;
  onUpload: (file: File) => void;
  onReplace?: (file: File) => void;
  onRemove?: () => void;
  isUploading: boolean;
  uploadError?: string;
}

export const RequirementUploadRow: React.FC<RequirementUploadRowProps> = ({
  requirementCode,
  title,
  description,
  required,
  status,
  uploadedDocument,
  acceptedTypes,
  maxSizeBytes = 10 * 1024 * 1024,
  onUpload,
  onReplace,
  onRemove,
  isUploading,
  uploadError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeBytes) {
      alert(`El archivo excede el límite permitido de ${formatBytes(maxSizeBytes)}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (status === "uploaded" && onReplace) {
      onReplace(file);
    } else {
      onUpload(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const renderStatus = () => {
    if (isUploading) {
      return (
        <div className="flex items-center gap-2 text-primary" data-testid={`requirement-status-${requirementCode}`}>
          <RefreshCcw className="w-4 h-4 animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest">Subiendo...</span>
        </div>
      );
    }
    
    if (status === "error" || uploadError) {
      return (
        <div className="flex items-center gap-2 text-error" data-testid={`requirement-status-${requirementCode}`}>
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">{uploadError || "Error"}</span>
        </div>
      );
    }

    if (status === "invalid") {
      return (
        <div className="flex items-center gap-2 text-error" data-testid={`requirement-status-${requirementCode}`}>
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">Inválido</span>
        </div>
      );
    }

    if (status === "uploaded" && uploadedDocument) {
      return (
        <div className="flex items-center justify-between w-full p-3 bg-success/5 rounded-xl border border-success/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center text-success">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-secondary truncate max-w-[200px]" title={uploadedDocument.nombreArchivoOriginal}>
                {uploadedDocument.nombreArchivoOriginal}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                <span className="flex items-center gap-1 text-success font-black">
                  <CheckCircle2 className="w-3 h-3" />
                  Cargado
                </span>
                <span>•</span>
                <span>{formatBytes(uploadedDocument.tamanoBytes)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleButtonClick}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="Reemplazar archivo"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            {onRemove && (
              <button 
                onClick={onRemove}
                className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                title="Eliminar archivo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      );
    }

    if (status === "optional") {
      return (
        <div className="flex items-center gap-2 text-on-surface-variant/50" data-testid={`requirement-status-${requirementCode}`}>
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-surface-container-high rounded-full">
            Opcional
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-warning" data-testid={`requirement-status-${requirementCode}`}>
        <Clock className="w-4 h-4" />
        <span className="text-xs font-black uppercase tracking-widest">Pendiente</span>
      </div>
    );
  };

  return (
    <div 
      className={clsx(
        "flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-2xl border transition-all duration-300",
        status === "uploaded" ? "border-success/30 shadow-sm" : 
        status === "error" || status === "invalid" ? "border-error/30 bg-error/5" :
        "border-outline-variant/30 hover:border-outline-variant/60"
      )}
      data-testid={`requirement-row-${requirementCode}`}
    >
      <div className="flex-1 mb-4 md:mb-0 md:pr-6">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-black text-secondary">{title}</h4>
          {required && status !== "uploaded" && (
            <span className="w-1.5 h-1.5 rounded-full bg-error" title="Requerido" />
          )}
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>

      <div className="w-full md:w-[320px] flex-shrink-0 flex items-center justify-end">
        {status === "uploaded" ? (
          renderStatus()
        ) : (
          <div className="flex items-center gap-4 w-full justify-between md:justify-end">
            {renderStatus()}
            
            <button
              onClick={handleButtonClick}
              disabled={isUploading}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                isUploading 
                  ? "bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed" 
                  : status === "error" || status === "invalid"
                    ? "bg-error text-white hover:bg-error/90 shadow-sm hover:shadow-md"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              <UploadCloud className="w-4 h-4" />
              {status === "error" ? "Reintentar" : "Adjuntar"}
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes}
        className="hidden"
        data-testid={`requirement-file-input-${requirementCode}`}
      />
    </div>
  );
};
