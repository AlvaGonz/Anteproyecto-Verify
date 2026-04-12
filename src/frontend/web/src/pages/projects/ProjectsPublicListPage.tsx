import React, { useEffect, useState } from "react";
import { ProyectoDto, ProjectStatus, IntegrityStatus, ProjectCategory } from "../../features/projects/types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { Link } from "react-router-dom";
import {
  Shield,
  Building2,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Search,
  QrCode,
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

const getStatusInfo = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.Published: return { label: "Publicado", cls: "vf-badge-success" };
    case ProjectStatus.InReview: return { label: "En Revision", cls: "vf-badge-warning" };
    case ProjectStatus.Observed: return { label: "Observado", cls: "vf-badge-accent" };
    case ProjectStatus.Validated: return { label: "Validado", cls: "vf-badge-primary" };
    case ProjectStatus.Rejected: return { label: "Rechazado", cls: "vf-badge-error" };
    default: return { label: "Borrador", cls: "vf-badge-neutral" };
  }
};

const getIntegrityInfo = (status: IntegrityStatus) => {
  switch (status) {
    case IntegrityStatus.Verified: return { label: "Verificado", icon: CheckCircle2, color: "text-emerald-600" };
    case IntegrityStatus.Failed: return { label: "Fallido", icon: AlertTriangle, color: "text-red-600" };
    default: return { label: "Pendiente", icon: Timer, color: "text-amber-600" };
  }
};

export const ProjectsPublicListPage: React.FC = () => {
  const [projects, setProjects] = useState<ProyectoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await projectsApi.getProjects();
        setProjects(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar proyectos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.ubicacionTexto.toLowerCase().includes(search.toLowerCase()) ||
      p.codigoInterno?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)]">
      {/* Header bar */}
      <div className="bg-[var(--color-brand-primary)] pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-[var(--color-brand-accent-soft)]" />
              <span className="text-lg font-bold text-white">VeriFinca</span>
            </Link>
            <Link to="/verify" className="vf-btn-accent text-sm py-2 px-4">
              <QrCode className="w-4 h-4" /> Verificar Sello
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Proyectos Inmobiliarios
          </h1>
          <p className="text-base text-white/60 max-w-xl">
            Directorio publico de proyectos registrados en la plataforma VeriFinca.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Search */}
        <div className="vf-card p-4 mb-8 flex items-center gap-3">
          <Search className="w-5 h-5 text-[var(--color-surface-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nombre, ubicacion o codigo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="vf-input border-0 bg-transparent focus:ring-0 focus:shadow-none p-0"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="vf-card-flat p-6 h-[280px] animate-pulse">
                <div className="h-5 w-24 bg-[var(--color-surface-muted)] rounded-full mb-4" />
                <div className="h-6 w-3/4 bg-[var(--color-surface-muted)] rounded mb-2" />
                <div className="h-4 w-1/2 bg-[var(--color-surface-muted)] rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="vf-card p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-[var(--color-brand-accent)] mx-auto mb-3" />
            <p className="text-[var(--color-text-strong)]">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-[var(--color-surface-muted)] mx-auto mb-4" />
            <p className="text-lg font-medium text-[var(--color-text-strong)] opacity-70">
              No se encontraron proyectos.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filtered.map((project) => {
              const statusInfo = getStatusInfo(project.estadoProyecto);
              const integrityInfo = getIntegrityInfo(project.estadoIntegridad);
              const IntIcon = integrityInfo.icon;
              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="vf-card p-6 flex flex-col h-full hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`vf-badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                    <span className="text-xs font-mono text-[var(--color-text-strong)] opacity-40">
                      {project.codigoInterno}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text-strong)] mb-1 group-hover:text-[var(--color-brand-primary)] transition-colors">
                    {project.nombre}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-strong)] opacity-60 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {project.ubicacionTexto}
                  </div>
                  <div className="flex-1" />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[var(--color-surface-base)] rounded-lg px-3 py-2">
                      <div className="text-xs text-[var(--color-text-strong)] opacity-50 mb-0.5">Categoria</div>
                      <div className="text-sm font-semibold text-[var(--color-text-strong)]">{getCategoryLabel(project.categoria)}</div>
                    </div>
                    <div className="bg-[var(--color-surface-base)] rounded-lg px-3 py-2">
                      <div className="text-xs text-[var(--color-text-strong)] opacity-50 mb-0.5">Valor</div>
                      <div className="text-sm font-semibold text-[var(--color-text-strong)]">
                        {project.valorEstimado ? `$${(project.valorEstimado / 1_000_000).toFixed(1)}M` : "N/D"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-surface-muted)]/50">
                    <div className={`flex items-center gap-1.5 text-sm font-semibold ${integrityInfo.color}`}>
                      <IntIcon className="w-4 h-4" />
                      {integrityInfo.label}
                    </div>
                    <span className="text-sm font-medium text-[var(--color-brand-primary)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Detalle <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
