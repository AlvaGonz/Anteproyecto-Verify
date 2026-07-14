import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  IntegrityStatus,
  ProjectCategory,
} from "../../features/projects/types";
import { useProject } from "../../features/projects/api/useProjects";
import { PublicProjectReport } from "../../features/reports/components/PublicProjectReport";
import { ProjectDocumentStatus } from "../../features/documents/components/ProjectDocumentStatus";
import { LandingFooter } from "../../features/public/components/LandingFooter";
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Fingerprint,
  Share2,
  Download,
  ShieldCheck,
  Calendar,
  Layers,
  ExternalLink,
  Landmark,
  Mail,
  Phone,
  Info,
  User
} from "lucide-react";
import { m } from "framer-motion";

const getCategoryLabel = (cat: ProjectCategory) => {
  switch (cat) {
    case ProjectCategory.Residencial: return "Residencial Premium";
    case ProjectCategory.Comercial: return "Comercial";
    case ProjectCategory.Turistico: return "Turístico";
    case ProjectCategory.Mixto: return "Mixto";
    default: return "Otro";
  }
};

const getIntegrityInfo = (status: IntegrityStatus) => {
  switch (status) {
    case IntegrityStatus.Verified:
      return { label: "VERIFICADO", icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20", iconFill: true };
    case IntegrityStatus.Failed:
      return { label: "RECHAZADO", icon: AlertTriangle, cls: "bg-rose-500/10 text-rose-500 border border-rose-500/20", iconFill: false };
    default:
      return { label: "AUDITORÍA", icon: Timer, cls: "bg-amber-500/10 text-amber-500 border border-amber-500/20", iconFill: false };
  }
};

export const ProjectPublicDetailPage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const identifier = slug || id || "";
  const { data: project, isLoading: loading, error: fetchError } = useProject(identifier);
  const error = fetchError ? (fetchError as Error).message : null;

  if (loading)
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/40 font-black uppercase tracking-[0.4em] text-xs">Descifrando Expediente...</p>
        </div>
      </div>
    );

  if (error || !project)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10">
        <div className="vf-card !p-12 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-6" />
          <h2 className="text-3xl font-display font-black text-secondary mb-4 tracking-tighter uppercase italic">Error de Acceso</h2>
          <p className="text-on-surface-variant font-medium mb-12">{error || "El activo solicitado no se encuentra en nuestro registro central."}</p>
          <Link to="/projects" className="vf-btn-primary w-full h-14 !rounded-2xl">
            <ArrowLeft className="w-5 h-5 mr-3" /> VOLVER AL DIRECTORIO
          </Link>
        </div>
      </div>
    );

  const integrityInfo = getIntegrityInfo(project.estadoIntegridad);
  const IntIcon = integrityInfo.icon;

  return (
    <div className="min-h-screen bg-background font-body text-on-surface antialiased overflow-x-hidden selection:bg-primary-container">

      {/* Dynamic Nav */}
      <nav className="fixed top-0 z-50 w-full flex justify-between items-center px-10 h-24 bg-secondary shadow-2xl">
        <div className="flex items-center gap-6">
          <Link to="/projects" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="text-2xl font-display font-black text-white tracking-tighter">
            Veri<span className="text-primary italic">Finca</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button type="button" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
          <button type="button" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <Download className="w-5 h-5" />
          </button>
          <Link to={`/admin/projects/${project.id}/edit`} className="vf-btn-primary h-12 !rounded-2xl px-8 ml-4 text-xs font-black tracking-widest border-none bg-primary text-white shadow-xl shadow-primary/20">
            GESTIONAR ACTIVO
          </Link>
        </div>
      </nav>

      <main className="pt-32 md:pt-40 pb-32 px-6 md:px-10 max-w-[90rem] mx-auto">
        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-16">
          
          {/* Left Column: Header, Specs, Documents */}
          <div className="xl:col-span-8 flex flex-col gap-12 xl:gap-16">
            <header>
              <m.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-px h-4 bg-primary"></div>
                  <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.5em] block">
                    EXPEDIENTE INSTITUCIONAL #{project.codigoInterno}
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl xl:text-8xl font-display font-black text-secondary leading-[0.85] tracking-[-0.05em] uppercase italic break-words">
                  {project.nombre}
                </h1>
                <div className="flex flex-wrap items-center gap-6 xl:gap-8 pt-4">
                  <div className="flex items-center gap-3 group translate-y-0 hover:-translate-y-1 transition-transform cursor-default">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.1em] block">Ubicación Registral</span>
                      <span className="text-sm font-black text-secondary uppercase tracking-tight">{project.ubicacionTexto}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group translate-y-0 hover:-translate-y-1 transition-transform cursor-default">
                    <div className="w-10 h-10 rounded-2xl bg-secondary-container/10 flex items-center justify-center text-secondary">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.1em] block">Token ID</span>
                      <span className="text-sm font-black text-secondary uppercase tracking-tight">{project.id.split("-")[0].toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </m.div>
            </header>

            {/* Project Photos Gallery */}
            {((project.fotoUrls && project.fotoUrls.length > 0) || project.imagenUrl) && (
              <m.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 aspect-video"
              >
                {/* Main Image */}
                <div className={`rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative shadow-sm group ${project.fotoUrls && project.fotoUrls.length > 1 ? 'md:col-span-2' : 'md:col-span-3'}`}>
                  <img 
                    src={project.imagenUrl || (project.fotoUrls ? project.fotoUrls[0] : '')} 
                    alt={project.nombre} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Additional Images (if any) */}
                {project.fotoUrls && project.fotoUrls.length > 1 && (
                  <div className="hidden md:flex flex-col gap-4 md:gap-6">
                    <div className="rounded-[2rem] overflow-hidden relative shadow-sm flex-1 group">
                      <img 
                        src={project.fotoUrls[1] || project.fotoUrls[0]} 
                        alt={`${project.nombre} 2`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    {project.fotoUrls.length > 2 ? (
                      <div className="rounded-[2rem] overflow-hidden relative shadow-sm flex-1 group">
                        <img 
                          src={project.fotoUrls[2]} 
                          alt={`${project.nombre} 3`} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {project.fotoUrls.length > 3 && (
                          <div className="absolute inset-0 bg-secondary/70 backdrop-blur-sm flex flex-col items-center justify-center text-white cursor-pointer hover:bg-secondary/80 transition-colors">
                            <span className="font-display font-black text-3xl italic tracking-tighter">+{project.fotoUrls.length - 3}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Fotos</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-[2rem] overflow-hidden relative shadow-sm flex-1 group bg-surface-container-high flex items-center justify-center">
                        <img 
                           src={project.imagenUrl || project.fotoUrls[0]} 
                           alt={`${project.nombre} alt`} 
                           className="w-full h-full object-cover opacity-50 blur-sm scale-110"
                        />
                         <div className="absolute inset-0 bg-secondary/50 backdrop-blur-md flex items-center justify-center">
                             <div className="w-12 h-12 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                                 <div className="w-2 h-2 rounded-full bg-white"></div>
                             </div>
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </m.section>
            )}

            {/* Asset Details Grid */}
            <section className="bg-surface-container-lowest p-8 md:p-12 rounded-[3.5rem] border border-surface-container-high/50 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="flex items-center gap-4 mb-10 md:mb-12">
                <div className="w-12 h-12 rounded-[1.25rem] bg-secondary flex items-center justify-center text-white shadow-lg">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-secondary/40">Especificaciones Técnicas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 md:gap-y-12">
                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Landmark className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#223382]">Entidad Desarrolladora</span>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-secondary leading-none tracking-tight font-display italic">
                    {project.datosDesarrollador || "CORPORACIÓN NO ESPECIFICADA"}
                  </p>
                </div>

                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#223382]">Cronología de Registro</span>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-secondary leading-none tracking-tight font-display italic">
                    {new Date(project.createdAtUtc).toLocaleDateString("es-ES", { year: "numeric", month: "long" }).toUpperCase()}
                  </p>
                </div>

                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#223382]">Clasificación de Activo</span>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-secondary leading-none tracking-tight font-display italic">
                    {getCategoryLabel(project.categoria).toUpperCase()}
                  </p>
                </div>

                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#223382]">Valor Registral Estimado</span>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-primary leading-none tracking-tight font-display italic">
                    {project.valorEstimado ? `$${(project.valorEstimado).toLocaleString()}` : "SUJETO A TASACIÓN"}
                  </p>
                </div>
              </div>
            </section>

            {/* Documents component */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 px-4 md:px-0">
                <div className="w-2 h-8 bg-primary rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-display font-black text-secondary italic tracking-tighter uppercase">Estatus de Expediente</h2>
              </div>
              <ProjectDocumentStatus projectId={project.id} projectCategory={project.categoria} />
            </div>
          </div>

          {/* Right Column: Registrant, Integrity, Historial */}
          <div className="xl:col-span-4 flex flex-col gap-8 xl:gap-10">
            {/* Registrant Data Card */}
            {project.registradoPor && (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", damping: 20 }}
                className="bg-secondary text-white p-8 md:p-10 rounded-[3rem] md:rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(34,51,130,0.35)] relative overflow-hidden border border-white/5"
              >
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="relative z-10 space-y-10">
                  <div className="flex items-center justify-between">
                    {project.registradoPor.avatarUrl ? (
                      <img
                        src={project.registradoPor.avatarUrl}
                        alt={`Avatar de ${project.registradoPor.nombreCompleto}`}
                        className="w-16 h-16 rounded-[1.25rem] object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white/70 bg-white/10 border border-white/20">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 text-right">Responsable Registral</span>
                      <div className="flex gap-1 mt-1">
                        {project.registradoPor.verificado && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Verificado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-2">Desarrollador / Representante</h3>
                    <div className="font-display">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black leading-none tracking-tighter italic block break-words">
                        {project.registradoPor.nombreCompleto}
                      </span>
                      {project.registradoPor.razonSocial && (
                        <span className="text-xs md:text-sm font-medium text-primary mt-2 block break-words">
                          {project.registradoPor.razonSocial}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 md:p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                    {project.registradoPor.email && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-0.5">Correo Electrónico</span>
                          <a href={`mailto:${project.registradoPor.email}`} className="text-sm font-medium text-white/90 hover:text-white truncate block">
                            {project.registradoPor.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {project.registradoPor.telefono && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-0.5">Teléfono Directo</span>
                          <a href={`tel:${project.registradoPor.telefono.replace(/\s+/g, '')}`} className="text-sm font-medium text-white/90 hover:text-white truncate block">
                            {project.registradoPor.telefono}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </m.div>
            )}

            {/* Integrity Status Card */}
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className={`flex items-center gap-4 px-6 md:px-8 py-5 rounded-[2rem] shadow-2xl ${integrityInfo.cls}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center scale-110 shrink-0">
                <IntIcon className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-0.5">Estado de Integridad</span>
                <span className="font-display font-black text-xl md:text-2xl tracking-tighter italic truncate block">{integrityInfo.label}</span>
              </div>
            </m.div>

            {/* Validation Timeline / Reports */}
            <div className="space-y-6 md:space-y-8 mt-4 xl:mt-8">
              <div className="flex items-center gap-4 px-4 md:px-0">
                <div className="w-2 h-8 bg-on-surface-variant/20 rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-display font-black text-secondary italic tracking-tighter uppercase opacity-60">Historial</h2>
              </div>
              <PublicProjectReport projectId={project.id} />
            </div>
          </div>
        </div>

        {/* Global Seal / Trust Bar */}
        {project.estadoIntegridad === IntegrityStatus.Verified && (
          <m.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-24 md:mt-40 text-center space-y-8 md:space-y-12"
          >
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-surface-container-high/50 bg-gradient-to-b from-white to-surface-container-lowest shadow-sm">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25"></div>
                <div className="absolute inset-0 bg-primary/5 rounded-full scale-150"></div>
                <ShieldCheck className="w-16 h-16 md:w-20 md:h-20 text-primary relative lg:scale-125" />
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-black text-secondary tracking-tighter italic uppercase">Sello de Integridad VeriFinca</h2>
              <p className="text-on-surface-variant text-base md:text-xl leading-relaxed font-medium max-w-2xl mx-auto opacity-70">
                "Este activo inmobiliario cuenta con el respaldo institucional de <span className="text-secondary font-black">VeriFinca</span>, certificando la autenticidad de sus títulos y la transparencia de su estructura legal."
              </p>
              <div className="pt-6 md:pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
                <button type="button" className="vf-btn-primary w-full sm:w-auto h-14 !rounded-2xl px-8 md:px-12 text-[10px] font-black uppercase tracking-[0.3em]">DESCARGAR EXPEDIENTE</button>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 italic">Expediente firmado digitalmente por autoridad central</p>
              </div>
            </div>
          </m.section>
        )}
      </main>

      {/* Institutional Footer */}
      <LandingFooter />
    </div>
  );
};

