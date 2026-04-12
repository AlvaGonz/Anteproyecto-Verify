import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DocumentDto, UploadDocumentDto } from "../../features/documents/types";
import { documentsApi } from "../../features/documents/api/documentsApi";
import { DocumentUploadForm } from "../../features/documents/components/DocumentUploadForm";
import { ProjectDocumentsList } from "../../features/documents/components/ProjectDocumentsList";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { FileText, ArrowLeft } from "lucide-react";

export const ProjectDocumentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await documentsApi.getProjectDocuments(id);
      setDocuments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar los documentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, [id]);

  const handleUpload = async (dto: UploadDocumentDto, file: File) => {
    if (!id) return;
    try {
      await documentsApi.uploadDocument(id, dto, file);
      addToast("Documento subido exitosamente", "success");
      await fetchDocuments();
    } catch (err: any) {
      addToast(err.message || "Error al subir el documento", "error");
    }
  };

  const handleDownload = async (documentId: string) => {
    if (!id) return;
    try {
      await documentsApi.downloadDocument(id, documentId);
    } catch (err: any) {
      addToast(err.message || "Error al descargar el documento", "error");
    }
  };

  const handleToggleStatus = async (documentId: string, isActive: boolean) => {
    if (!id) return;
    try {
      await documentsApi.updateDocumentStatus(id, documentId, { activo: isActive });
      addToast(`Documento ${isActive ? "activado" : "desactivado"} exitosamente`, "success");
      await fetchDocuments();
    } catch (err: any) {
      addToast(err.message || "Error al actualizar el estado", "error");
    }
  };

  if (loading) return <div className="text-center py-12 text-[var(--color-text-strong)] opacity-60">Cargando documentos...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-strong)] flex items-center gap-3">
            <FileText className="w-7 h-7 text-[var(--color-brand-primary)]" />
            Gestion Documental
          </h1>
          <p className="text-sm text-[var(--color-text-strong)] opacity-60 mt-1">
            Administra los documentos asociados a este proyecto.
          </p>
        </div>
        <Link to={`/admin/projects/${id}/edit`} className="vf-btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DocumentUploadForm projectId={id!} onUpload={handleUpload} />
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-base font-bold text-[var(--color-text-strong)] mb-4">
            Documentos del Proyecto ({documents.length})
          </h3>
          <ProjectDocumentsList
            documents={documents}
            onDownload={handleDownload}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>
    </div>
  );
};
