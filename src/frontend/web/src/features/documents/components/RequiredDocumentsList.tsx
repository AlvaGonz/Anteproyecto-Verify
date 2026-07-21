import React from "react";
import { DocumentType } from "../types";
import { useDocuments, useUpdateDocumentType } from "../api/useDocuments";
import { RequirementUploadRow } from "./RequirementUploadRow";
import { FileCheck2 } from "lucide-react";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";

// Configuración de documentos obligatorios para el checklist
const REQUIRED_DOCUMENTS = [
  { id: "titulo", label: "Título de Propiedad", category: DocumentType.CertificadoTitulo, categoryLabel: "TITULO", description: "Documento notarial original o copia certificada" },
  { id: "estado_juridico", label: "Estado Jurídico", category: DocumentType.CertificacionEstadoJuridico, categoryLabel: "ESTADO J.", description: "Certificación de estado legal del inmueble" },
  { id: "mensura", label: "Plano de Mensura", category: DocumentType.PlanoMensuraCatastral, categoryLabel: "MENSURA", description: "Plano catastral aprobado por autoridad competente" },
  { id: "cedula", label: "Cédula / Identidad del Titular", category: DocumentType.ID, categoryLabel: "OTROS", description: "Documento de identidad vigente del titular" },
  { id: "poder", label: "Poder Notarial (si aplica)", category: DocumentType.PoderNotarial, categoryLabel: "OTROS", description: "Requerido solo si actúa por representación", optional: true },
];

export const RequiredDocumentsList: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: documents = [] } = useDocuments(projectId);
  const typeMutation = useUpdateDocumentType(projectId);
  const { addToast } = useToast();

  const handleUnassignDocument = async (documentId: string) => {
    try {
      await typeMutation.mutateAsync({ documentId, tipoDocumento: DocumentType.Other });
      addToast("Documento desasignado", "info");
    } catch (err: any) {
      addToast("Error al desasignar el documento", "error");
    }
  };

  const handleChangeDocument = async (newDocumentId: string, oldDocumentId: string | undefined, tipoDocumento: DocumentType) => {
    try {
      if (oldDocumentId) {
        await typeMutation.mutateAsync({ documentId: oldDocumentId, tipoDocumento: DocumentType.Other });
      }
      if (newDocumentId) {
        await typeMutation.mutateAsync({ documentId: newDocumentId, tipoDocumento });
      }
      addToast(newDocumentId ? "Documento asignado correctamente" : "Documento desasignado", "success");
    } catch (err: any) {
      addToast("Error al cambiar el documento", "error");
    }
  };

  return (
    <div className="vf-card p-6 bg-surface-container-low/30 overflow-hidden relative group">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
          <FileCheck2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-display font-black text-secondary tracking-tight">Estatus <span className="text-primary italic">Legal</span></h3>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mt-1">Checklist de Cumplimiento RI</p>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const uploadedDoc = documents.find(u => u.tipoDocumento === doc.category && u.activo);
          const isUploaded = !!uploadedDoc;
          
          const availableDocs = documents
            .filter(d => d.activo && d.tipoDocumento === DocumentType.Other)
            .map(d => ({ id: d.id, name: d.nombreArchivoOriginal }));

          return (
            <RequirementUploadRow
              key={doc.id}
              projectId={projectId}
              requirementCode={doc.id}
              label={doc.label}
              description={doc.description}
              categoryLabel={doc.categoryLabel}
              isUploaded={isUploaded}
              uploadedDocumentId={uploadedDoc?.id}
              fileName={uploadedDoc?.nombreArchivoOriginal}
              documentStatus={uploadedDoc?.estadoDocumento}
              availableDocuments={availableDocs}
              onChangeDocument={async (newId, oldId) => {
                await handleChangeDocument(newId, oldId, doc.category);
              }}
              onUnassignDocument={uploadedDoc ? () => handleUnassignDocument(uploadedDoc.id) : undefined}
              isAssigning={typeMutation.isPending}
            />
          );
        })}
      </div>
    </div>
  );
};
