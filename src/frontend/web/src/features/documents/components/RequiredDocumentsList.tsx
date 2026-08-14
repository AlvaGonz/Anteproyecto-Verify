import React from "react";
import { DocumentType } from "../types";
import { useDocuments, useUpdateDocumentType, useUpdateDocumentStatus } from "../api/useDocuments";
import { useUpdateDocumentFieldReview } from "../api/useDocumentMutations";
import { OcrFieldReviewState } from "../types";
import { DocumentRequirementRow } from "./reusable/DocumentRequirementRow";
import { CedulaExtractionCard } from "./CedulaExtractionCard";
import { CertificadoTituloExtractionCard } from "./CertificadoTituloExtractionCard";
import { PlanoMensuraExtractionCard } from "./PlanoMensuraExtractionCard";
import { EstadoJuridicoExtractionCard } from "./EstadoJuridicoExtractionCard";
import { CertificacionIPIExtractionCard } from "./CertificacionIPIExtractionCard";
import { FileCheck2 } from "lucide-react";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";

// Configuración de documentos obligatorios para el checklist
const REQUIRED_DOCUMENTS = [
  { id: "titulo", label: "Título de Propiedad", category: DocumentType.CertificadoTitulo, categoryLabel: "TITULO", description: "Documento notarial original o copia certificada" },
  { id: "estado_juridico", label: "Estado Jurídico", category: DocumentType.CertificacionEstadoJuridico, categoryLabel: "ESTADO J.", description: "Certificación de estado legal del inmueble" },
  { id: "mensura", label: "Plano de Mensura", category: DocumentType.PlanoMensuraCatastral, categoryLabel: "MENSURA", description: "Plano catastral aprobado por autoridad competente" },
  { id: "cedula", label: "Cédula / Identidad del Titular", category: DocumentType.ID, categoryLabel: "OTROS", description: "Documento de identidad vigente del titular" },
  { id: "certificacion_ipi", label: "Certificación IPI", category: DocumentType.CertificacionIPI, categoryLabel: "CATASTRO", description: "Certificación de Impuesto sobre la Propiedad Inmobiliaria" },
  { id: "poder", label: "Poder Notarial", category: DocumentType.PoderNotarial, categoryLabel: "OTROS", description: "Requerido solo si actúa por representación", optional: true },
  { id: "uso_suelo", label: "Certificado Uso de Suelo", category: DocumentType.CertificadoUsoSuelo, categoryLabel: "USO SUELO", description: "Emitido por el ayuntamiento correspondiente", optional: true },
];

export const RequiredDocumentsList: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: documents = [] } = useDocuments(projectId);
  const typeMutation = useUpdateDocumentType(projectId);
  const statusMutation = useUpdateDocumentStatus(projectId);
  const { mutateAsync: updateField } = useUpdateDocumentFieldReview(projectId);
  const { addToast } = useToast();

  const handleEditField = async (documentId: string, fieldName: string, value: string) => {
    try {
      await updateField({
        documentId,
        fieldName,
        data: { reviewState: OcrFieldReviewState.Corrected, correctedValue: value }
      });
      addToast("Campo actualizado correctamente", "success");
    } catch (err) {
      addToast("Error al actualizar el campo", "error");
      throw err;
    }
  };

  const handleAutoSelectField = async (documentId: string, fieldName: string, resolvedId: string) => {
    try {
      await updateField({
        documentId,
        fieldName,
        data: { reviewState: OcrFieldReviewState.Corrected, correctedValue: resolvedId }
      });
    } catch (err) {
      console.error("Error auto-selecting field:", err);
    }
  };

  const handleUnassignDocument = async (documentId: string) => {
    try {
      await statusMutation.mutateAsync({ documentId, activo: false });
      addToast("Documento archivado exitosamente", "info");
    } catch (err: any) {
      addToast("Error al archivar el documento", "error");
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
    <div className="vf-card p-4 sm:p-6 bg-surface-container-low/30 overflow-hidden relative group">
      <div className="flex items-center gap-3 mb-4 sm:mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
          <FileCheck2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-display font-black text-secondary tracking-tight">Estatus <span className="text-primary italic">Legal</span></h3>
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mt-1">Checklist de Cumplimiento Documental</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const uploadedDoc = documents.find((u: any) => u.tipoDocumento === doc.category && u.activo);
          const isUploaded = !!uploadedDoc;

          const availableDocs = documents
            .filter((d: any) => d.activo && d.tipoDocumento === DocumentType.Other)
            .map((d: any) => ({ id: d.id, name: d.nombreArchivoOriginal }));

          return (
            <div key={doc.id} className="space-y-2">
              <DocumentRequirementRow
                projectId={projectId}
                requirementCode={doc.id}
                label={doc.label}
                description={doc.description}
                categoryLabel={doc.categoryLabel}
                isUploaded={isUploaded}
                uploadedDocumentId={uploadedDoc?.id}
                fileName={uploadedDoc?.nombreArchivoOriginal}
                documentStatus={uploadedDoc?.estadoDocumento as unknown as number}
                availableDocuments={availableDocs}
                onChangeDocument={async (newId, oldId) => {
                  await handleChangeDocument(newId, oldId, doc.category);
                }}
                onUnassignDocument={uploadedDoc ? () => handleUnassignDocument(uploadedDoc.id) : undefined}
                isAssigning={typeMutation.isPending}
              />
              {doc.id === "cedula" && uploadedDoc?.cedulaExtraction && (
                <div className="pl-4 sm:pl-12">
                  <CedulaExtractionCard
                    extraction={uploadedDoc.cedulaExtraction}
                    proyectoId={projectId}
                    documentoId={uploadedDoc.id}
                    onEditField={(f, v) => handleEditField(uploadedDoc.id, f, v)}
                  />
                </div>
              )}
              {doc.id === "titulo" && uploadedDoc?.certificadoTituloExtraction && (
                <div className="pl-4 sm:pl-12">
                  <CertificadoTituloExtractionCard
                    extraction={uploadedDoc.certificadoTituloExtraction}
                    proyectoId={projectId}
                    documentoId={uploadedDoc.id}
                    onEditField={(f, v) => handleEditField(uploadedDoc.id, f, v)}
                    onAutoSelectField={(f, v) => handleAutoSelectField(uploadedDoc.id, f, v)}
                  />
                </div>
              )}
              {doc.id === "mensura" && uploadedDoc?.planoMensuraExtraction && (
                <div className="pl-4 sm:pl-12">
                  <PlanoMensuraExtractionCard
                    extraction={uploadedDoc.planoMensuraExtraction}
                    proyectoId={projectId}
                    documentoId={uploadedDoc.id}
                    onEditField={(f, v) => handleEditField(uploadedDoc.id, f, v)}
                    onAutoSelectField={(f, v) => handleAutoSelectField(uploadedDoc.id, f, v)}
                  />
                </div>
              )}
              {doc.id === "estado_juridico" && uploadedDoc?.estadoJuridicoExtraction && (
                <div className="pl-4 sm:pl-12">
                  <EstadoJuridicoExtractionCard
                    extraction={uploadedDoc.estadoJuridicoExtraction}
                    proyectoId={projectId}
                    documentoId={uploadedDoc.id}
                    onEditField={(f, v) => handleEditField(uploadedDoc.id, f, v)}
                    onAutoSelectField={(f, v) => handleAutoSelectField(uploadedDoc.id, f, v)}
                  />
                </div>
              )}
              {doc.id === "certificacion_ipi" && uploadedDoc?.certificacionIPIExtraction && (
                <div className="pl-4 sm:pl-12">
                  <CertificacionIPIExtractionCard
                    extraction={uploadedDoc.certificacionIPIExtraction}
                    proyectoId={projectId}
                    documentoId={uploadedDoc.id}
                    onEditField={(f, v) => handleEditField(uploadedDoc.id, f, v)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
