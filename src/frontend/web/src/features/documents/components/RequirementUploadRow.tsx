import React, { useRef, useState } from 'react';
import { useUploadRequirementDocument } from '../api/useDocuments';
import { CheckCircle, UploadCloud, Loader2, AlertCircle } from 'lucide-react';

export interface RequirementUploadRowProps {
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

export const RequirementUploadRow: React.FC<RequirementUploadRowProps> = ({
  projectId,
  requirementCode,
  label,
  description,
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
      // Clear input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div data-testid={`requirement-row-${requirementCode}`} className="group/item relative flex items-start space-x-4 py-4 px-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {label}
        </p>
        <p className="text-sm text-gray-500">
          {description}
        </p>
        
        {errorMsg && (
          <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {isUploaded ? (
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <select
                value={uploadedDocumentId || ""}
                disabled={isAssigning || isPending}
                onChange={async (e) => {
                  const newId = e.target.value;
                  if (onChangeDocument) {
                    await onChangeDocument(newId, uploadedDocumentId);
                  }
                }}
                className="text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded p-1.5 max-w-[200px] truncate outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Quitar asignación --</option>
                {uploadedDocumentId && fileName && (
                  <option value={uploadedDocumentId}>{fileName}</option>
                )}
                {availableDocuments.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
              {isAssigning && <Loader2 className="w-3 h-3 animate-spin text-gray-500" />}
            </div>
            <div className="flex items-center gap-2">
              {documentStatus === 3 ? (
                <div data-testid={`requirement-status-${requirementCode}`} className="flex items-center text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Rechazado</span>
                </div>
              ) : documentStatus === 1 ? (
                <div data-testid={`requirement-status-${requirementCode}`} className="flex items-center text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-sm font-medium">Procesando</span>
                </div>
              ) : (
                <div data-testid={`requirement-status-${requirementCode}`} className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Cargado</span>
                </div>
              )}
              {onUnassignDocument && (
                <button
                  type="button"
                  disabled={isAssigning}
                  onClick={onUnassignDocument}
                  className="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-50"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ) : (
          <div data-testid={`requirement-status-${requirementCode}`} className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-400">Pendiente</span>
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
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                {isPending ? 'Subiendo...' : 'Subir'}
              </button>
            </div>
            
            {availableDocuments.length > 0 && onChangeDocument && (
              <div className="flex items-center gap-2 mt-1">
                <select
                  value=""
                  disabled={isAssigning || isPending}
                  onChange={async (e) => {
                    const newId = e.target.value;
                    if (newId) {
                      await onChangeDocument(newId, undefined);
                    }
                  }}
                  className="text-xs border border-gray-300 rounded p-1.5 max-w-[200px] truncate outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">O asignar existente...</option>
                  {availableDocuments.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
                {isAssigning && <Loader2 className="w-3 h-3 animate-spin text-gray-500" />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
