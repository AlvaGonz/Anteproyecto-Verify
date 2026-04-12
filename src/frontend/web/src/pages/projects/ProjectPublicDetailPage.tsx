import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ProyectoDto,
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
  CheckCircle2,
  AlertTriangle,
  Timer,
  Fingerprint
} from "lucide-react";

const getCategoryLabel = (cat: ProjectCategory) => {
  switch (cat) {
    case ProjectCategory.Residencial: return "Residencial Premium";
    case ProjectCategory.Comercial: return "Comercial";
    case ProjectCategory.Turistico: return "Turistico";
    case ProjectCategory.Mixto: return "Mixto";
    default: return "Otro";
  }
};

const getIntegrityInfo = (status: IntegrityStatus) => {
  switch (status) {
    case IntegrityStatus.Verified:
      return { label: "Aprobado", icon: CheckCircle2, cls: "bg-primary-container text-on-primary-container", iconFill: true };
    case IntegrityStatus.Failed:
      return { label: "Rechazado", icon: AlertTriangle, cls: "bg-error-container text-on-error-container", iconFill: false };
    default:
      return { label: "En Revisión", icon: Timer, cls: "bg-tertiary-container text-on-tertiary-container", iconFill: false };
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
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar el proyecto";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface opacity-60 font-medium">Cargando expediente...</p>
      </div>
    );

  if (error || !project)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-error mb-4" />
        <p className="text-on-surface font-bold text-lg mb-6">{error || "Proyecto no encontrado"}</p>
        <Link to="/projects" className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
          <ArrowLeft className="w-5 h-5" /> Volver
        </Link>
      </div>
    );

  const integrityInfo = getIntegrityInfo(project.estadoIntegridad);
  const IntIcon = integrityInfo.icon;

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased overflow-x-hidden font-body">
      {/* Top Navigation (Simulated if using internal layout, but added a back button here) */}
      <nav className="w-full flex justify-between items-center px-8 h-20 bg-[#223382] shadow-2xl shadow-[#111144]/10 font-headline font-bold tracking-tight">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="text-2xl font-extrabold text-[#F4F1EC]">VeriFinca</div>
        </div>
        <Link to={`/admin/projects/${project.id}/edit`} className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-bold active:scale-95 duration-200 transition-all hidden md:block">
          Gestionar Proyecto
        </Link>
      </nav>

      <main className="pt-16 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Hero Header */}
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-secondary font-semibold uppercase tracking-widest text-xs mb-3 block">
                Registro Público Institucional
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#223382] mb-4 tracking-tighter font-headline">
                {project.nombre}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-medium">
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{project.ubicacionTexto}</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant hidden sm:block"></span>
                <div className="flex items-center gap-1">
                  <Fingerprint className="w-5 h-5 text-primary" />
                  <span>ID: {project.codigoInterno}</span>
                </div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg ${integrityInfo.cls}`}>
              <IntIcon className={`${integrityInfo.iconFill ? 'fill-current' : ''} w-6 h-6`} />
              <span className="font-bold text-lg">{integrityInfo.label}</span>
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Metadata & Documents */}
          <div className="lg:col-span-7 space-y-12">
            {/* Metadata Section */}
            <section className="bg-surface-container-low p-10 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#223382]/5 rounded-bl-full -mr-10 -mt-10"></div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-8">Información del Proyecto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-6">
                <div>
                  <p className="text-on-surface-variant text-sm mb-1">Desarrollador</p>
                  <p className="text-xl font-bold text-[#223382] font-headline">{project.datosDesarrollador || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm mb-1">Año de Finalización / Registro</p>
                  <p className="text-xl font-bold text-[#223382] font-headline">{new Date(project.createdAtUtc).getFullYear()}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm mb-1">Número de Registro</p>
                  <p className="text-xl font-bold text-[#223382] font-headline">{project.codigoInterno}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm mb-1">Tipo de Propiedad</p>
                  <p className="text-xl font-bold text-[#223382] font-headline">{getCategoryLabel(project.categoria)}</p>
                </div>
              </div>
            </section>

            {/* Documents Checklist component */}
            <ProjectDocumentStatus projectId={project.id} projectCategory={project.categoria} />
          </div>

          {/* Right Column: Validation Card & Timeline */}
          <div className="lg:col-span-5 space-y-12">
            {/* Integrity Score Card */}
            <div className="bg-[#223382] text-white p-8 rounded-lg shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6 font-headline">Resumen de Validación</h3>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full border-8 border-green-500 flex items-center justify-center relative">
                    <span className="text-2xl font-black text-white">{project.estadoIntegridad === IntegrityStatus.Verified ? "100%" : "50%"}</span>
                    <div className="absolute -top-1 -right-1 bg-green-500 p-1 rounded-full border-4 border-[#223382]">
                      <span className="w-4 h-4 block">★</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-70 mb-1">Puntaje de Integridad</p>
                    <p className="text-lg font-bold">
                      Nivel de Riesgo: <span className={project.estadoIntegridad === IntegrityStatus.Verified ? "text-green-400" : "text-yellow-400"}>
                        {project.estadoIntegridad === IntegrityStatus.Verified ? "Mínimo" : "En proceso"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-md">
                  <p className="text-sm font-light leading-relaxed">
                    {project.estadoIntegridad === IntegrityStatus.Verified 
                      ? "Este proyecto ha superado los rigurosos protocolos de cumplimiento normativo y financiero de VeriFinca." 
                      : "Este proyecto se encuentra bajo revisión y auditoría de sus expedientes normativos."}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-[-50px] right-[-30px] opacity-10">
                <Shield className="w-64 h-64" />
              </div>
            </div>

            {/* Validation Timeline component */}
            <PublicProjectReport projectId={project.id} />
          </div>
        </div>

        {/* Official Seal Section */}
        {project.estadoIntegridad === IntegrityStatus.Verified && (
          <section className="mt-24 border-t-2 border-outline-variant/10 pt-24 text-center max-w-3xl mx-auto">
            <div className="mb-12 inline-block">
              <div className="w-32 h-32 mx-auto relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[#223382] rounded-full animate-pulse opacity-5"></div>
                <Shield className="w-20 h-20 text-primary" />
              </div>
              <h2 className="text-4xl font-extrabold text-[#223382] mt-6 font-headline">Sello de Integridad</h2>
              <p className="text-on-surface-variant mt-4 leading-relaxed font-medium">
                "Este proyecto ha sido validado por <span className="text-[#223382] font-bold">VeriFinca</span> bajo los estándares internacionales de transparencia inmobiliaria, garantizando la seguridad jurídica para todos los inversores."
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-6">
              <button className="bg-primary-container text-on-primary-container text-lg font-bold px-12 py-5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all">
                Acceder al expediente completo
              </button>
              <p className="text-sm text-secondary font-semibold italic">Uso exclusivo para usuarios registrados con licencia profesional.</p>
            </div>
          </section>
        )}
      </main>

      {/* Footer (Simplified from design) */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#111144] font-body tracking-wide mt-12">
        <div className="text-lg font-bold text-[#F4F1EC]">VeriFinca</div>
        <div className="flex flex-wrap justify-center gap-8 text-[#F4F1EC]/60">
          <Link to="#" className="hover:text-[#F4F1EC] transition-colors">Términos Legales</Link>
          <Link to="#" className="hover:text-[#F4F1EC] transition-colors">Privacidad</Link>
          <Link to="#" className="hover:text-[#F4F1EC] transition-colors">Conexiones Institucionales</Link>
          <Link to="#" className="hover:text-[#F4F1EC] transition-colors">Soporte</Link>
        </div>
        <div className="text-xs text-[#F4F1EC]/40 text-center md:text-right">
          © {new Date().getFullYear()} VeriFinca. Institutional Authority in Real Estate.
        </div>
      </footer>
    </div>
  );
};

