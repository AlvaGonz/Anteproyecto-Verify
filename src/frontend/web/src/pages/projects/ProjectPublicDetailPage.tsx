import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  IntegrityStatus,
} from "../../features/projects/types";
import { useProject } from "../../features/projects/api/useProjects";
import { useProjectsInteractions, useInterests, useSavedProjects } from "../../features/projects/api/useProjectsInteractions";
import { useAuth } from "../../shared/context/AuthContext";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { useQueryClient } from "@tanstack/react-query";
import { PublicProjectReport } from "../../features/reports/components/PublicProjectReport";
import { ProjectDocumentStatus } from "../../features/documents/components/ProjectDocumentStatus";
import { LandingFooter } from "../../features/public/components/LandingFooter";
import { toUtcDate } from "../../shared/utils/dates";
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Fingerprint,
  ShieldCheck,
  Calendar,
  Layers,
  ExternalLink,
  Landmark,
  Mail,
  Phone,
  Info,
  User,
  ArrowRight,
  Loader2,
  FileText,
  Building2,
  MapIcon,
} from "lucide-react";
import { m } from "framer-motion";
import { LimitReachedModal } from "../../features/projects/components/LimitReachedModal";
import { usePlanLimits } from "../../features/settings/api/useSettings";
import { DocumentosModal } from "../../features/documents/components/DocumentosModal";
import { BackToTopButton } from "../../shared/components/ui/BackToTopButton";
import { MiniMap } from "../../shared/components/ui/MiniMap";



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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isInterested, setIsInterested] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [showDocumentos, setShowDocumentos] = React.useState(false);
  const [hasQuota, setHasQuota] = React.useState<boolean | null>(null);

  
  const queryClient = useQueryClient();
  const { registerInterest, isRegisteringInterest, unregisterInterest, isUnregisteringInterest, saveProject, unsaveProject, isSaving, isUnsaving } = useProjectsInteractions();
  const { data: interestsList } = useInterests(isAuthenticated);
  const { data: savedList } = useSavedProjects(isAuthenticated);
  const [localSaved, setLocalSaved] = React.useState(false);
  const { addToast } = useToast();

  React.useEffect(() => {
    if (isAuthenticated && interestsList && identifier) {
      setIsInterested(interestsList.some(i => i.id?.toLowerCase() === identifier.toLowerCase() || (i as any).proyectoId?.toLowerCase() === identifier.toLowerCase()));
    } else {
      setIsInterested(false);
    }
  }, [isAuthenticated, interestsList, identifier]);

  React.useEffect(() => {
    if (isAuthenticated && savedList && project) {
      setLocalSaved(savedList.some((s: any) => s.id?.toLowerCase() === project.id?.toLowerCase() || s.proyectoId?.toLowerCase() === project.id?.toLowerCase()));
    } else {
      setLocalSaved(false);
    }
  }, [isAuthenticated, savedList, project]);

  const [showQuotaModal, setShowQuotaModal] = React.useState(false);
  const [quotaError, setQuotaError] = React.useState<{ used?: number; max?: number } | null>(null);
  const isAdmin = user?.role === "admin" || user?.role === "owner";
  const { planLimits, isLoading: planLimitsLoading } = usePlanLimits();
  const quotaHandledRef = React.useRef(false);

  // Parse GPS coordinates
  let gpsLat: number | null = null;
  let gpsLng: number | null = null;
  if (project?.ubicacionGps) {
    const parts = project.ubicacionGps.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      gpsLat = parts[0];
      gpsLng = parts[1];
    }
  }

  React.useEffect(() => {
    async function consumeBg() {
      try {
        const { projectsApi } = await import("../../features/projects/api/projectsApi");
        const result = await projectsApi.consumeQuota({ projectId: identifier });
        if (result._tag === 'Success') {
          queryClient.invalidateQueries({ queryKey: ["subscription", "my-status"], refetchType: 'all' });
        }
      } catch (e) {
        console.error("Error consumiendo cuota (no bloqueante):", e);
      }
    }

    if (authLoading) return;
    if (quotaHandledRef.current) return;

    if (isAdmin || !isAuthenticated || !identifier) {
      setHasQuota(true);
      quotaHandledRef.current = true;
      return;
    }

    if (planLimitsLoading) {
      const timer = setTimeout(() => {
        if (!quotaHandledRef.current) {
          quotaHandledRef.current = true;
          setHasQuota(true);
          consumeBg();
        }
      }, 1000);
      return () => { clearTimeout(timer); };
    }

    quotaHandledRef.current = true;
    if (planLimits && planLimits.maxConsultas !== -1 && planLimits.consultasUsadas >= planLimits.maxConsultas) {
      setQuotaError({ used: planLimits.consultasUsadas, max: planLimits.maxConsultas });
      setShowQuotaModal(true);
      setHasQuota(false);
      return;
    }

    setHasQuota(true);
    consumeBg();
  }, [identifier, isAuthenticated, isAdmin, planLimits, planLimitsLoading, authLoading]);

  React.useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "my-status"], refetchType: 'all' });
    };
  }, []);

  const handleCloseQuotaModal = () => {
    setShowQuotaModal(false);
    setQuotaError(null);
  };

  const handleViewPlans = () => {
    setShowQuotaModal(false);
    setQuotaError(null);
    window.location.href = "/pricing";
  };

  // ponytail: el usuario puede gestionar si es el creador directo, o si es el titular del grupo y el creador es su invitado
  const canManage = user && project && (
    user.id === project.usuarioCreadorId ||
    user.id === project.registradoPor?.id ||
    user.inviteesList?.some(i => i.id === project.usuarioCreadorId) ||
    (user.titularId && user.titularId === project.usuarioCreadorId) ||
    (user.titularId && project.registradoPor?.titularId === user.titularId)
  );

  // If we don't have quota, we can't render the details.
  if (loading || hasQuota === null)
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
          {hasQuota === null ? "Verificando acceso..." : "Cargando proyecto..."}
        </p>
      </div>
    );

  if (hasQuota === false)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10">
        <div className="vf-card !p-12 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-6" />
          <h2 className="text-3xl font-display font-black text-secondary mb-4 tracking-tighter uppercase italic">Error de Acceso</h2>
          <p className="text-on-surface-variant font-medium mb-12">Límite de consultas alcanzado. Mejora tu plan para continuar.</p>
          <Link to="/projects" className="vf-btn-primary w-full h-14 !rounded-2xl">
            <ArrowLeft className="w-5 h-5 mr-3" /> VOLVER AL DIRECTORIO
          </Link>
        </div>
        
        {/* Consultation Limit Modal */}
        <LimitReachedModal
          isOpen={showQuotaModal}
          onClose={handleCloseQuotaModal}
          onViewPlans={handleViewPlans}
          limitType="consultations"
          used={quotaError?.used}
          max={quotaError?.max}
        />
      </div>
    );

  if (!project || error)
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

  // Gather all unique images
  const allImgs = [
    project.imagenUrl,
    project.imagenAdicional1,
    project.imagenAdicional2,
    project.imagenAdicional3,
    project.imagenAdicional4,
    project.imagenAdicional5,
    ...(project.fotoUrls || [])
  ].filter(Boolean) as string[];

  const uniqueImgs = Array.from(new Set(allImgs));


  return (
    <div className="min-h-screen bg-background font-body text-on-surface antialiased overflow-x-hidden selection:bg-primary-container">

      {/* Dynamic Nav */}
      <nav className="fixed top-0 z-50 w-full flex justify-between items-center px-4 md:px-10 h-24 bg-secondary shadow-2xl">
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
          {canManage && (
            <Link to={`/admin/projects/${project.id}/edit`} className="vf-btn-primary h-12 !rounded-2xl px-8 ml-4 text-xs font-black tracking-widest border-none bg-primary text-white shadow-xl shadow-primary/20">
              GESTIONAR ACTIVO
            </Link>
          )}
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
                <h1 className="text-5xl md:text-5xl xl:text-8xl font-display font-black text-secondary leading-[0.85] tracking-[-0.05em] uppercase italic break-words">
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

            {/* Project Photos Gallery — Interactive Hero + Thumbnails */}
            {uniqueImgs.length > 0 && (
              <m.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3 md:space-y-4"
              >
                {/* Main Display — 16/9 container, contain preserves full image */}
                <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-surface-container-lowest shadow-sm aspect-video">
                  <img
                    src={uniqueImgs[selectedImageIndex]}
                    alt={`${project.nombre} foto ${selectedImageIndex + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain object-center transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Thumbnail Strip */}
                {uniqueImgs.length > 1 && (
                  <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1">
                    {uniqueImgs.map((url, i) => {
                      const isActive = i === selectedImageIndex;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedImageIndex(i)}
                          className={`relative shrink-0 w-[72px] md:w-20 aspect-square rounded-xl md:rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                            }`}
                          aria-label={`${project.nombre} foto ${i + 1}`}
                        >
                          <img
                            src={url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover object-center"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </m.section>
            )}

            {/* Asset Details Grid */}
            <section className="bg-surface-container-lowest p-4 md:p-5 rounded-[1.5rem] md:rounded-[3.5rem] border border-surface-container-high/50 relative overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[1.25rem] bg-secondary flex items-center justify-center text-white shadow-lg">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/40">Especificaciones Técnicas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                <div className="space-y-1 group">
                  <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Landmark className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#223382]">Entidad Desarrolladora</span>
                  </div>
                  <p className="text-lg md:text-xl font-black text-secondary leading-none tracking-tight font-display italic break-words">
                    {project.datosDesarrollador || "CORPORACIÓN NO ESPECIFICADA"}
                  </p>
                </div>
                <div className="space-y-1 group">
                  <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#223382]">Cronología de Registro</span>
                  </div>
                  <p className="text-lg md:text-xl font-black text-secondary leading-none tracking-tight font-display italic">
                    {toUtcDate(project.createdAtUtc)?.toLocaleDateString("es-ES", { year: "numeric", month: "long" }).toUpperCase() ?? ''}
                  </p>
                </div>
                <div className="space-y-1 group">
                  <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#223382]">Clasificación de Activo</span>
                  </div>
                  <p className="text-lg md:text-xl font-black text-secondary leading-none tracking-tight font-display italic break-words">
                    {project.categoriaNombre?.toUpperCase() || "SIN CLASIFICACIÓN"}
                  </p>
                </div>
                <div className="space-y-1 group">
                  <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#223382]">Valor Registral Estimado</span>
                  </div>
                  <p className="text-lg md:text-xl font-black text-primary leading-none tracking-tight font-display italic">
                    {project.valorEstimado ? `RD$ ${(project.valorEstimado).toLocaleString()}` : "SUJETO A TASACIÓN"}
                  </p>
                </div>
                <div className="space-y-1 group">
                  <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#223382]">Superficie M²</span>
                  </div>
                  <p className="text-lg md:text-xl font-black text-secondary leading-none tracking-tight font-display italic">
                    {project.superficieM2 != null ? `${project.superficieM2.toLocaleString()} m²` : "VER EXPEDIENTE"}
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
              <ProjectDocumentStatus projectId={project.id} categoriaId={project.categoriaId} />
            </div>
          </div>

          {/* Right Column: Registrant, Integrity, Historial */}
          <div className="xl:col-span-4 flex flex-col gap-8 xl:gap-10">
            {/* Registrant Data Card — toggleable */}
            {project.registradoPor && (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", damping: 20 }}
                className="bg-secondary text-white p-6 md:p-8 rounded-[3rem] md:rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(34,51,130,0.35)] relative overflow-hidden border border-white/5"
              >
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10 space-y-6 md:space-y-8">

                  {/* Registrant header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {project.registradoPor.avatarUrl ? (
                        <img
                          src={project.registradoPor.avatarUrl}
                          alt={`Avatar de ${project.registradoPor.nombreCompleto}`}
                          loading="lazy"
                          decoding="async"
                          className="w-14 h-14 rounded-[1.25rem] object-cover border border-white/20 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-white/70 bg-white/10 border border-white/20 shrink-0">
                          <User className="w-7 h-7" />
                        </div>
                      )}
                      <div className="font-display min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 block mb-0.5">Responsable Registral</span>
                        <span className="text-xl md:text-2xl font-black leading-tight tracking-tighter italic block break-words">
                          {project.registradoPor.nombreCompleto}
                        </span>
                        {project.registradoPor.razonSocial && (
                          <span className="text-xs font-medium text-primary mt-1 block break-words">
                            {project.registradoPor.razonSocial}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {project.registradoPor.verificado && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Verificado</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registrant details */}
                  <div className="space-y-6 md:space-y-8">
                        <div className="p-4 md:p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                          {project.registradoPor.email && (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-0.5">Correo Electrónico</span>
                                <a href={`mailto:${project.registradoPor.email}`} className="text-sm font-medium text-white/90 hover:text-white break-words block">
                                  {project.registradoPor.email}
                                </a>
                              </div>
                            </div>
                          )}
                          {project.registradoPor.telefono && (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
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
                          {(project.cedulaRncPropietario || project.rncDesarrollador) && (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                <Fingerprint className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-0.5">RNC/Cédula</span>
                                <span className="text-sm font-medium text-white/90 break-words block">
                                  {project.cedulaRncPropietario || project.rncDesarrollador}
                                </span>
                              </div>
                            </div>
                          )}
                          {project.ubicacionTexto && (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-0.5">Ubicación</span>
                                <span className="text-sm font-medium text-white/90 break-words block">
                                  {project.ubicacionTexto}
                                </span>
                              </div>
                            </div>
                          )}
                          {project.registradoPor.direccion && (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-0.5">Dirección</span>
                                <span className="text-sm font-medium text-white/90 break-words block">
                                  {project.registradoPor.direccion}
                                </span>
                              </div>
                            </div>
                          )}
                          {project.registradoPor.telefono && (
                            <a
                              href={`https://wa.me/${project.registradoPor.telefono.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/80 block mb-0.5">WhatsApp</span>
                                <span className="text-sm font-medium text-emerald-300 break-words block">
                                  {project.registradoPor.telefono}
                                </span>
                              </div>
                            </a>
                          )}
                        </div>

                        {/* Me Interesa / Guardado Button */}
                        <button
                          type="button"
                          disabled={isRegisteringInterest || isUnregisteringInterest || isSaving || isUnsaving}
                          onClick={() => {
                            if (!isAuthenticated) {
                              addToast("Debe iniciar sesión para registrar su interés en el proyecto.", "info");
                              return;
                            }
                            if (canManage) {
                              addToast("Esta acción no es posible porque usted es el vendedor o representante de este proyecto.", "error");
                              return;
                            }
                            if (isInterested) {
                              // Toggle off: unregister interest + unsave
                              setIsInterested(false);
                              setLocalSaved(false);
                              unregisterInterest(project.id, {
                                onError: () => { setIsInterested(true); setLocalSaved(true); }
                              });
                              unsaveProject(project.id, {
                                onError: () => setLocalSaved(true)
                              });
                            } else {
                              setIsInterested(true);
                              setLocalSaved(true);
                              registerInterest(project.id, {
                                onError: () => { setIsInterested(false); setLocalSaved(false); }
                              });
                              saveProject(project.id, {
                                onError: () => setLocalSaved(false)
                              });
                            }
                          }}
                          className={`w-full relative overflow-hidden group font-black text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.25em] uppercase py-3.5 px-4 rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 cursor-pointer ${
                            isInterested
                              ? "bg-emerald-600 text-white shadow-[0_0_40px_-10px_rgba(5,150,105,0.5)] scale-[1.02] hover:bg-emerald-700"
                              : "bg-white text-secondary hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] hover:scale-[1.02]"
                          } disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                          {!isInterested && !isRegisteringInterest && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                          )}
                          <span className="relative z-10 text-center leading-tight">
                            {(isRegisteringInterest || isUnregisteringInterest || isSaving || isUnsaving)
                              ? "Procesando..."
                              : isInterested
                              ? "Guardado en tus registros"
                              : "Me interesa el proyecto"}
                          </span>
                          {(isRegisteringInterest || isUnregisteringInterest || isSaving || isUnsaving) ? (
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0 relative z-10" />
                          ) : isInterested ? (
                            <CheckCircle2 className="w-5 h-5 relative z-10 shrink-0" />
                          ) : (
                            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform shrink-0" />
                          )}
                        </button>

                        {/* Ver Documentos */}
                        <button
                          type="button"
                          onClick={() => setShowDocumentos(true)}
                          className="w-full relative overflow-hidden group font-black text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.25em] uppercase py-3.5 px-4 rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 cursor-pointer bg-white/10 text-white border border-white/10 hover:bg-white/15 hover:border-white/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <FileText className="w-4 h-4 relative z-10 shrink-0" />
                          <span className="relative z-10 text-center leading-tight">Ver Documentos</span>
                        </button>

                        {/* Map */}
                        <div className="w-full h-48 border border-white/10 rounded-3xl overflow-hidden bg-white/5">
                          {gpsLat !== null && gpsLng !== null ? (
                            <MiniMap lat={gpsLat} lng={gpsLng} />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
                              <MapIcon size={24} className="mb-2" />
                              <span className="text-[10px] font-bold uppercase">Sin coordenadas</span>
                            </div>
                          )}
                        </div>
                    </div>

                </div>
              </m.div>
            )}

            {/* Save button */}
            <button
                type="button"
                disabled={isSaving || isUnsaving}
                onClick={() => {
                  if (canManage) {
                    addToast("Esta acción no es posible porque usted es el vendedor o representante de este proyecto.", "error");
                    return;
                  }
                  if (localSaved) {
                    setLocalSaved(false);
                    unsaveProject(project.id, {
                      onError: () => setLocalSaved(true)
                    });
                  } else {
                    setLocalSaved(true);
                    saveProject(project.id, {
                      onError: () => setLocalSaved(false)
                    });
                  }
                }}
                className={`text-xs font-bold px-4 py-2 rounded shadow-sm transition-all duration-300 disabled:opacity-70 flex items-center gap-2 cursor-pointer ${
                  localSaved ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_0_10px_rgba(5,150,105,0.4)]" : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {isSaving || isUnsaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : localSaved ? (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Guardado</span>
                  </>
                ) : (
                  <span>Guardar</span>
                )}
              </button>

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
    
    {/* Documentos Modal */}
    <DocumentosModal projectId={project.id} isOpen={showDocumentos} onClose={() => setShowDocumentos(false)} />

    {/* Consultation Limit Modal */}
    <LimitReachedModal
      isOpen={showQuotaModal}
      onClose={handleCloseQuotaModal}
      onViewPlans={handleViewPlans}
      limitType="consultations"
      used={quotaError?.used}
      max={quotaError?.max}
    />

    <BackToTopButton />
    </div>
  );
};

