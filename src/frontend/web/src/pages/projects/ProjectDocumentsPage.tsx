import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DocumentDto, DocumentType } from "../../features/documents/types";
import { useDocuments, useDownloadDocument, useUpdateDocumentStatus } from "../../features/documents/api/useDocuments";
import { ProjectDocumentsList } from "../../features/documents/components/ProjectDocumentsList";
import { ProjectDiagnosisPanel } from "../../features/projects/components/ProjectDiagnosisPanel";
import { RequirementUploadRow } from "../../features/documents/components/RequirementUploadRow";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { m } from "framer-motion";
import { 
  ArrowLeft, 
  ShieldCheck, 
  LayoutDashboard,
  Files,
  MoreVertical,
  Clock,
  HardDrive,
  Search,
  Filter,
  FileCheck2
} from "lucide-react";

// Configuración de documentos obligatorios para el checklist
const REQUIRED_DOCUMENTS = [
  { id: "titulo", label: "Título de Propiedad", category: DocumentType.CertificadoTitulo, categoryLabel: "TITULO", description: "Documento notarial original o copia certificada" },
  { id: "estado_juridico", label: "Estado Jurídico", category: DocumentType.CertificacionEstadoJuridico, categoryLabel: "ESTADO J.", description: "Certificación de estado legal del inmueble" },
  { id: "mensura", label: "Plano de Mensura", category: DocumentType.PlanoMensuraCatastral, categoryLabel: "MENSURA", description: "Plano catastral aprobado por autoridad competente" },
  { id: "cedula", label: "Cédula / Identidad del Titular", category: DocumentType.CopiaCedulaIdentidad, categoryLabel: "OTROS", description: "Documento de identidad vigente del titular" },
  { id: "poder", label: "Poder Notarial (si aplica)", category: DocumentType.PoderNotarial, categoryLabel: "OTROS", description: "Requerido solo si actúa por representación", optional: true },
];

const RequiredDocumentsList: React.FC<{ projectId: string, documents: DocumentDto[] }> = ({ projectId, documents }) => {
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
          const isUploaded = documents.some(u => u.tipoDocumento === doc.category && u.activo);
          
          return (
            <RequirementUploadRow
              key={doc.id}
              projectId={projectId}
              requirementCode={doc.id}
              label={doc.label}
              description={doc.description}
              categoryLabel={doc.categoryLabel}
              isUploaded={isUploaded}
            />
          );
        })}
      </div>
    </div>
  );
};

export const ProjectDocumentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id || "";
  const { addToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rawDocuments = [], isLoading: loading, error: fetchError } = useDocuments(projectId);
  const error = fetchError ? (fetchError as Error).message : null;

  const downloadMutation = useDownloadDocument(projectId);
  const statusMutation = useUpdateDocumentStatus(projectId);

  const documents = rawDocuments;

  const handleDownload = async (documentId: string) => {
    if (!id) return;
    try {
      await downloadMutation.mutateAsync(documentId);
    } catch (err: any) {
      addToast("Error al obtener la descarga segura", "error");
    }
  };

  const handleToggleStatus = async (documentId: string, isActive: boolean) => {
    if (!id) return;
    try {
      await statusMutation.mutateAsync({ documentId, activo: isActive });
      addToast(`Estado de certificación ${isActive ? "reanudado" : "suspendido"}`, isActive ? "success" : "info");
    } catch (err: any) {
      addToast("Error al modificar el estado de validez", "error");
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.nombreArchivoOriginal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-6"></div>
        <p className="text-sm font-black text-secondary uppercase tracking-[0.3em]">Validando Credenciales...</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
             <Link to="/admin/projects" className="text-on-surface-variant hover:text-primary transition-colors">
                <LayoutDashboard className="w-4 h-4" />
             </Link>
             <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
             <Link to={`/admin/projects/${id}/edit`} className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors">
                PROYECTO DETALLE
             </Link>
             <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">EXPEDIENTES</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-black text-secondary tracking-tighter leading-none mb-4">
            Gestión de <span className="text-primary italic">Documentos</span>
          </h1>
          <p className="text-base text-on-surface-variant font-medium max-w-2xl">
            Repositorio centralizado de evidencias legales y técnicas. Cada archivo es sellado con una huella inmutable para auditorías de cumplimiento.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to={`/admin/projects/${id}/edit`} className="vf-btn-secondary h-12">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <button type="button" className="h-12 w-12 rounded-2xl bg-secondary/5 text-secondary hover:bg-secondary hover:text-white transition-all flex items-center justify-center">
             <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Archivos', value: documents.length, icon: Files, color: 'text-primary' },
          { label: 'Sellados Hoy', value: documents.filter(d => new Date(d.createdAtUtc).toDateString() === new Date().toDateString()).length, icon: ShieldCheck, color: 'text-success' },
          { label: 'Archivados', value: documents.filter(d => !d.activo).length, icon: Clock, color: 'text-warning' },
          { label: 'Storage', value: `${(documents.reduce((acc, d) => acc + d.tamanoBytes, 0) / (1024 * 1024)).toFixed(2)} MB`, icon: HardDrive, color: 'text-secondary' },
        ].map((stat, i) => (
          <m.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="vf-card relative overflow-hidden group hover:scale-[1.02] transition-transform"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700">
               <stat.icon className="w-20 h-20" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-2xl font-display font-black text-secondary tracking-tighter leading-none">{stat.value}</h3>
              </div>
            </div>
          </m.div>
        ))}
      </div>

      {error && (
        <div className="mb-8 p-5 bg-error-container/30 border-2 border-error/10 text-error rounded-3xl flex items-center gap-4 animate-shake">
           <ShieldCheck className="w-6 h-6" />
           <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Column Left: Checklist + Upload Form */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <ProjectDiagnosisPanel projectId={projectId} />
          
          <RequiredDocumentsList projectId={projectId} documents={documents} />


        </div>

        {/* Column Right: Document Explorer */}
        <div className="xl:col-span-8 space-y-6 lg:min-h-[800px]">
          <div className="vf-card !p-3 flex flex-col sm:flex-row items-center gap-3">
             <div className="relative flex-1 group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar en el repositorio..."
                  aria-label="Buscar documentos"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-bold text-secondary outline-none placeholder:text-on-surface-variant/40"
                />
             </div>
             <div className="h-10 w-[2px] bg-outline-variant/10 hidden sm:block"></div>
             <button type="button" className="h-12 px-6 rounded-2xl bg-surface-container-high hover:bg-secondary hover:text-white text-secondary font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 group w-full sm:w-auto">
                <Filter className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Filtros Avanzados
             </button>
          </div>

          <div className="vf-card p-6 lg:min-h-[800px]">
            <ProjectDocumentsList
              documents={filteredDocuments}
              onDownload={handleDownload}
              onToggleStatus={handleToggleStatus}
            />
          </div>
          
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                   <Files className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-secondary tracking-widest uppercase">
                   Mostrando {filteredDocuments.length} de {documents.length} archivos
                </p>
             </div>
             <div className="flex items-center gap-2">
                <button type="button" className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant disabled:opacity-30" disabled>
                   <ArrowLeft className="w-4 h-4 rotate-0" />
                </button>
                <div className="px-3 h-8 rounded-lg bg-primary text-white text-[10px] font-black flex items-center justify-center">1</div>
                <button type="button" className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant disabled:opacity-30" disabled>
                   <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
