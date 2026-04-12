import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ProyectoDto,
  ProjectStatus,
  IntegrityStatus,
  ProjectCategory,
} from "../../features/projects/types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { PublicProjectReport } from "../../features/reports/components/PublicProjectReport";
import { ProjectDocumentStatus } from "../../features/documents/components/ProjectDocumentStatus";
import {
  Shield,
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Tag,
  User,
  CheckCircle2,
  AlertTriangle,
  Timer,
  QrCode,
  Settings,
} from "lucide-react";

const getCategoryLabel = (cat: ProjectCategory) => {
  switch (cat) {
    case ProjectCategory.Residencial: return "Residencial";
    case ProjectCategory.Comercial: return "Comercial";
    case ProjectCategory.Turistico: return "Turistico";
    case ProjectCategory.Mixto: return "Mixto";
    default: return "Otro";
  }
};

const getIntegrityInfo = (status: IntegrityStatus) => {
  switch (status) {
    case IntegrityStatus.Verified: return { label: "Verificado", icon: CheckCircle2, cls: "vf-badge-success", color: "text-emerald-600" };
    case IntegrityStatus.Failed: return { label: "Fallido", icon: AlertTriangle, cls: "vf-badge-error", color: "text-red-600" };
    default: return { label: "Pendiente", icon: Timer, cls: "vf-badge-accent", color: "text-amber-600" };
  }
};

export const ProjectPublicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProyectoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const data = await projectsApi.getProjectById(id);
        setProject(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar el proyecto");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-[var(--color-surface-base)] flex items-center justify-center">
        <p className="text-[var(--color-text-strong)] opacity-60">Cargando detalle...</p>
      </div>
    );

  if (error || !project)
    return (
      <div className="min-h-screen bg-[var(--color-surface-base)] flex flex-col items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-[var(--color-brand-accent)] mb-3" />
        <p className="text-[var(--color-text-strong)] mb-4">{error || "Proyecto no encontrado"}</p>
        <Link to="/projects" className="vf-btn-primary">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>
    );

  const integrityInfo = getIntegrityInfo(project.estadoIntegridad);
  const IntIcon = integrityInfo.icon;

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)]">
      {/* Header */}
      <div className="bg-[var(--color-brand-primary)] pt-8 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-[var(--color-brand-accent-soft)]" />
              <span className="text-lg font-bold text-white">VeriFinca</span>
            </Link>
            <div className="flex gap-3">
              <Link to="/verify" className="vf-btn-secondary text-sm py-2 px-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <QrCode className="w-4 h-4" /> Verificar
              </Link>
              <Link to={`/admin/projects/${project.id}/edit`} className="vf-btn-secondary text-sm py-2 px-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="w-4 h-4" /> Gestionar
              </Link>
            </div>
          </div>

          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al listado
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {project.nombre}
          </h1>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <MapPin className="w-4 h-4" />
            {project.ubicacionTexto}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        {/* Info card */}
        <div className="vf-card p-6 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-strong)] opacity-50 mb-1.5">
                <Tag className="w-3.5 h-3.5" /> Codigo
              </div>
              <div className="text-sm font-mono font-semibold text-[var(--color-text-strong)]">
                {project.codigoInterno}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-strong)] opacity-50 mb-1.5">
                <Building2 className="w-3.5 h-3.5" /> Categoria
              </div>
              <div className="text-sm font-semibold text-[var(--color-text-strong)]">
                {getCategoryLabel(project.categoria)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-strong)] opacity-50 mb-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Valor Estimado
              </div>
              <div className="text-sm font-semibold text-[var(--color-text-strong)]">
                {project.valorEstimado ? `$${project.valorEstimado.toLocaleString()}` : "No especificado"}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-strong)] opacity-50 mb-1.5">
                <IntIcon className="w-3.5 h-3.5" /> Integridad
              </div>
              <div className={`text-sm font-semibold ${integrityInfo.color}`}>
                {integrityInfo.label}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--color-surface-muted)]/50 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-strong)] opacity-50 mb-1.5">
                <User className="w-3.5 h-3.5" /> Desarrollador
              </div>
              <div className="text-sm font-medium text-[var(--color-text-strong)]">
                {project.datosDesarrollador || "No especificado"}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-strong)] opacity-50 mb-1.5">
                <MapPin className="w-3.5 h-3.5" /> GPS
              </div>
              <div className="text-sm font-mono text-[var(--color-text-strong)]">
                {project.ubicacionGps || "No registradas"}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-strong)] opacity-50 mb-1.5">
                Catastro
              </div>
              <div className="text-sm font-mono text-[var(--color-text-strong)]">
                {project.designacionCatastral || "No especificada"}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-strong)] opacity-50 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Fecha Registro
              </div>
              <div className="text-sm font-mono text-[var(--color-text-strong)]">
                {new Date(project.createdAtUtc).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Document Status */}
        <ProjectDocumentStatus projectId={project.id} projectCategory={project.categoria} />

        {/* Public Report */}
        <div className="mt-8 pb-12">
          <PublicProjectReport projectId={project.id} />
        </div>
      </div>
    </div>
  );
};
