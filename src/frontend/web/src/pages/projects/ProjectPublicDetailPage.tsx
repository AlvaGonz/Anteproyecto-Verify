import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ProyectoDto,
  IntegrityStatus,
  ProjectCategory,
  getProjectErrorMessage,
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
  Fingerprint,
  Share2,
  Download,
  ShieldCheck,
  Calendar,
  Layers,
  Info,
  ExternalLink,
  Lock,
  Landmark
} from "lucide-react";
import { motion } from "framer-motion";

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
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProyectoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const result = await projectsApi.getProjectById(id);
        if (result._tag === "Success") {
          setProject(result.data);
        } else {
          setError(getProjectErrorMessage(result.error));
        }
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
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
               <Share2 className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
               <Download className="w-5 h-5" />
            </button>
            <Link to={`/admin/projects/${project.id}/edit`} className="vf-btn-primary h-12 !rounded-2xl px-8 ml-4 text-xs font-black tracking-widest border-none bg-primary text-white shadow-xl shadow-primary/20">
               GESTIONAR ACTIVO
            </Link>
         </div>
      </nav>

      <main className="pt-40 pb-32 px-10 max-w-7xl mx-auto">
        <header className="mb-20">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
            <motion.div 
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
              <h1 className="text-7xl md:text-8xl font-display font-black text-secondary leading-[0.85] tracking-[ -0.05em] uppercase italic">
                {project.nombre}
              </h1>
              <div className="flex flex-wrap items-center gap-8 pt-4">
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
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-2xl ${integrityInfo.cls}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center scale-110">
                <IntIcon className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-0.5">Estado de Integridad</span>
                <span className="font-display font-black text-2xl tracking-tighter italic">{integrityInfo.label}</span>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
          
          {/* Detailed Info Column */}
          <div className="xl:col-span-8 space-y-16">
            
            {/* Asset Details Grid */}
            <section className="bg-surface-container-lowest p-12 rounded-[3.5rem] border border-surface-container-high/50 relative overflow-hidden shadow-sm">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-secondary flex items-center justify-center text-white shadow-lg">
                     <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-secondary/40">Especificaciones Técnicas</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                  <div className="space-y-2 group">
                    <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Landmark className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#223382]">Entidad Desarrolladora</span>
                    </div>
                    <p className="text-2xl font-black text-secondary leading-none tracking-tight font-display italic">
                      {project.datosDesarrollador || "CORPORACIÓN NO ESPECIFICADA"}
                    </p>
                  </div>

                  <div className="space-y-2 group">
                    <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#223382]">Cronología de Registro</span>
                    </div>
                    <p className="text-2xl font-black text-secondary leading-none tracking-tight font-display italic">
                      {new Date(project.createdAtUtc).toLocaleDateString("es-ES", { year: "numeric", month: "long" }).toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-2 group">
                    <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#223382]">Clasificación de Activo</span>
                    </div>
                    <p className="text-2xl font-black text-secondary leading-none tracking-tight font-display italic">
                      {getCategoryLabel(project.categoria).toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-2 group">
                    <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#223382]">Valor Registral Estimado</span>
                    </div>
                    <p className="text-2xl font-black text-primary leading-none tracking-tight font-display italic">
                      {project.valorEstimado ? `$${(project.valorEstimado).toLocaleString()}` : "SUJETO A TASACIÓN"}
                    </p>
                  </div>
               </div>
            </section>

            {/* Documents component (needs to match this level of aesthetics internally, or we wrapper it) */}
            <div className="space-y-8">
               <div className="flex items-center gap-4 px-4">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  <h2 className="text-3xl font-display font-black text-secondary italic tracking-tighter uppercase">Estatus de Expediente</h2>
               </div>
               <ProjectDocumentStatus projectId={project.id} projectCategory={project.categoria} />
            </div>
          </div>

          {/* Institutional Compliance Column */}
          <div className="xl:col-span-4 space-y-12">
            
            {/* Integrity Certificate Card */}
            <div className="bg-secondary text-white p-10 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(34,51,130,0.35)] relative overflow-hidden border border-white/5">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
               <div className="relative z-10 space-y-10">
                  <div className="flex items-center justify-between">
                     <ShieldCheck className="w-12 h-12 text-primary" />
                     <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Security Protocol</span>
                        <div className="flex gap-1">
                           {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>)}
                        </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-2">Puntaje de Integridad</h3>
                     <div className="flex items-end gap-3 font-display">
                        <span className="text-8xl font-black leading-none tracking-tighter italic">
                           {project.estadoIntegridad === IntegrityStatus.Verified ? "100" : "45"}
                        </span>
                        <span className="text-4xl font-black text-primary mb-2">%</span>
                     </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                     <p className="text-sm font-medium leading-relaxed text-white/70">
                        {project.estadoIntegridad === IntegrityStatus.Verified 
                          ? "Este activo ha sido sometido a un análisis de 360° logrando el Sello de Integridad Suprema." 
                          : "EXPEDIENTE EN REVISIÓN: El sistema está analizando los vectores de riesgo jurídico y financiero."}
                     </p>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F98513]">
                        <Lock className="w-3 h-3" /> Conexión Auditora Encriptada
                     </div>
                  </div>

                  <button className="w-full bg-[#F98513] hover:bg-[#ff962b] text-white h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 active:scale-95 duration-200">
                     VER CERTIFICADO OFICIAL
                  </button>
               </div>
            </div>

            {/* Validation Timeline / Reports */}
            <div className="space-y-8">
               <div className="flex items-center gap-4 px-4">
                  <div className="w-2 h-8 bg-on-surface-variant/20 rounded-full"></div>
                  <h2 className="text-3xl font-display font-black text-secondary italic tracking-tighter uppercase opacity-60">Historial</h2>
               </div>
               <PublicProjectReport projectId={project.id} />
            </div>
          </div>
        </div>

        {/* Global Seal / Trust Bar */}
        {project.estadoIntegridad === IntegrityStatus.Verified && (
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-40 text-center space-y-12"
          >
            <div className="max-w-4xl mx-auto space-y-8 p-16 rounded-[4rem] border border-surface-container-high/50 bg-gradient-to-b from-white to-surface-container-lowest shadow-sm">
               <div className="w-32 h-32 mx-auto relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25"></div>
                  <div className="absolute inset-0 bg-primary/5 rounded-full scale-150"></div>
                  <ShieldCheck className="w-20 h-20 text-primary relative lg:scale-125" />
               </div>
               <h2 className="text-5xl font-display font-black text-secondary tracking-tighter italic uppercase">Sello de Integridad VeriFinca</h2>
               <p className="text-on-surface-variant text-xl leading-relaxed font-medium max-w-2xl mx-auto opacity-70">
                 "Este activo inmobiliario cuenta con el respaldo institucional de <span className="text-secondary font-black">VeriFinca</span>, certificando la autenticidad de sus títulos y la transparencia de su estructura legal."
               </p>
               <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-6">
                  <button className="vf-btn-primary h-14 !rounded-2xl px-12 text-[10px] font-black uppercase tracking-[0.3em]">DESCARGAR EXPEDIENTE</button>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 italic">Expediente firmado digitalmente por autoridad central</p>
               </div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-secondary text-white pt-24 pb-12 px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
              <span>© {new Date().getFullYear()} VeriFinca Institutional</span>
              <div className="flex items-center gap-2">
                 <Shield className="w-4 h-4 text-primary" />
                 PROTECCIÓN INSTITUCIONAL ACTIVA
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

