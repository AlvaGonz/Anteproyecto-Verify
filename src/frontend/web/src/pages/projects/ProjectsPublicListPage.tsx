import React, { useEffect, useState } from "react";
import { ProyectoDto, ProjectStatus, IntegrityStatus, ProjectCategory } from "../../features/projects/types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Search,
  QrCode,
  ChevronLeft,
} from "lucide-react";

const getCategoryLabel = (cat: ProjectCategory) => {
  switch (cat) {
    case ProjectCategory.Residencial: return "Residencial";
    case ProjectCategory.Comercial: return "Comercial";
    case ProjectCategory.Turistico: return "Turístico";
    case ProjectCategory.Mixto: return "Mixto";
    default: return "Otro";
  }
};

const getStatusInfo = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.Published:  return { label: "Publicado",    cls: "bg-primary-container text-on-primary-container" };
    case ProjectStatus.InReview:   return { label: "En Revisión",  cls: "bg-secondary-container text-on-secondary-container" };
    case ProjectStatus.Observed:   return { label: "Observado",    cls: "bg-error-container text-on-error-container" };
    case ProjectStatus.Validated:  return { label: "Validado",     cls: "bg-primary-container text-on-primary-container" };
    case ProjectStatus.Rejected:   return { label: "Rechazado",    cls: "bg-error-container text-on-error-container" };
    default:                       return { label: "Borrador",     cls: "bg-surface-container text-on-surface-variant" };
  }
};

const getIntegrityInfo = (status: IntegrityStatus) => {
  switch (status) {
    case IntegrityStatus.Verified: return { label: "Verificado", icon: CheckCircle2, color: "text-emerald-600" };
    case IntegrityStatus.Failed:   return { label: "Fallido",    icon: AlertTriangle, color: "text-red-600" };
    default:                       return { label: "Pendiente",  icon: Timer,         color: "text-amber-600" };
  }
};

/* ─── Shared Nav ─── */
const PageNav: React.FC = () => (
  <nav className="w-full flex justify-between items-center px-8 h-20 bg-[#223382] shadow-2xl shadow-[#111144]/10 font-['Manrope'] font-bold tracking-tight">
    <div className="flex items-center gap-4">
      <Link to="/" className="text-white/70 hover:text-white transition-colors">
        <ChevronLeft className="w-6 h-6" />
      </Link>
      <Link to="/" className="text-2xl font-extrabold text-[#F4F1EC]">VeriFinca</Link>
    </div>
    <Link
      to="/verify"
      className="hidden md:flex items-center gap-2 bg-[#F98513] text-[#5d2d00] px-6 py-2.5 rounded-full font-bold active:scale-95 duration-200 shadow-md hover:shadow-lg text-sm"
    >
      <QrCode className="w-4 h-4" /> Verificar Sello
    </Link>
  </nav>
);

/* ─── Hero banner ─── */
const PageHero: React.FC = () => (
  <div className="bg-[#223382] py-20 px-8 relative overflow-hidden">
    <div className="absolute -right-24 -top-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    <div className="max-w-7xl mx-auto relative z-10">
      <span className="text-[#F98513] font-bold uppercase tracking-widest text-xs mb-4 block">Directorio Público</span>
      <h1 className="text-4xl md:text-5xl font-['Manrope'] font-extrabold text-[#F4F1EC] leading-tight mb-4">
        Proyectos Inmobiliarios
      </h1>
      <p className="text-[#F4F1EC]/60 text-lg max-w-xl font-light">
        Directorio público de proyectos registrados en la plataforma VeriFinca.
      </p>
    </div>
  </div>
);

/* ─── Skeleton card ─── */
const SkeletonCard: React.FC = () => (
  <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-6 h-[300px] animate-pulse">
    <div className="h-5 w-24 bg-surface-container rounded-full mb-4" />
    <div className="h-6 w-3/4 bg-surface-container rounded mb-2" />
    <div className="h-4 w-1/2 bg-surface-container rounded" />
  </div>
);

/* ─── Project card ─── */
const ProjectCard: React.FC<{ project: ProyectoDto }> = ({ project }) => {
  const statusInfo = getStatusInfo(project.estadoProyecto);
  const integrityInfo = getIntegrityInfo(project.estadoIntegridad);
  const IntIcon = integrityInfo.icon;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-6 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusInfo.cls}`}>
          {statusInfo.label}
        </span>
        <span className="text-xs font-mono text-outline opacity-60">{project.codigoInterno}</span>
      </div>

      {/* Name & location */}
      <h3 className="text-lg font-bold text-[#223382] mb-1 font-['Manrope'] group-hover:text-[#F98513] transition-colors">
        {project.nombre}
      </h3>
      <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mb-4">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        {project.ubicacionTexto}
      </div>

      <div className="flex-1" />

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface-container-low rounded-lg px-3 py-2">
          <div className="text-xs text-on-surface-variant/60 mb-0.5">Categoría</div>
          <div className="text-sm font-semibold text-on-surface">{getCategoryLabel(project.categoria)}</div>
        </div>
        <div className="bg-surface-container-low rounded-lg px-3 py-2">
          <div className="text-xs text-on-surface-variant/60 mb-0.5">Valor</div>
          <div className="text-sm font-semibold text-on-surface">
            {project.valorEstimado ? `$${(project.valorEstimado / 1_000_000).toFixed(1)}M` : "N/D"}
          </div>
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
        <div className={`flex items-center gap-1.5 text-sm font-semibold ${integrityInfo.color}`}>
          <IntIcon className="w-4 h-4" />
          {integrityInfo.label}
        </div>
        <span className="text-sm font-medium text-secondary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          Detalle <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};

/* ─── Main Page ─── */
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al cargar proyectos";
        setError(msg);
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
    <div className="min-h-screen bg-surface font-['Inter'] text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <PageNav />
      <PageHero />

      {/* Content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search bar */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-full flex items-center gap-3 px-6 py-3 mb-10 shadow-md focus-within:ring-2 focus-within:ring-primary-container transition-all">
          <Search className="w-5 h-5 text-outline flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre, ubicación o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-on-surface placeholder:text-outline/60 text-base"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <span className="sr-only">Cargando proyectos...</span>
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
            <p className="text-on-surface font-semibold">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-14 h-14 text-outline mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium text-on-surface-variant">No se encontraron proyectos.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#111144] text-[#F4F1EC] py-10 px-8 flex flex-col md:flex-row justify-between items-center gap-6 font-light tracking-wide">
        <div className="text-lg font-bold text-[#F4F1EC]">VeriFinca</div>
        <div className="flex flex-wrap justify-center gap-8 text-[#F4F1EC]/60 text-sm">
          <Link to="#" className="hover:text-[#F4F1EC] transition-colors">Términos Legales</Link>
          <Link to="#" className="hover:text-[#F4F1EC] transition-colors">Privacidad</Link>
          <Link to="#" className="hover:text-[#F4F1EC] transition-colors">Soporte</Link>
        </div>
        <div className="text-xs text-[#F4F1EC]/40">© {new Date().getFullYear()} VeriFinca.</div>
      </footer>
    </div>
  );
};
