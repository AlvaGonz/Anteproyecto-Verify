import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Phone,
  MapIcon,
  CheckCircle2,
  Camera,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { useProject } from "../../features/projects/api/useProjects";
import { useCategories } from "../../features/projects/api/useCategories";
import { useProjectsInteractions, useInterests, useSavedProjects } from "../../features/projects/api/useProjectsInteractions";
import { getDefaultProjectImage } from "../../features/projects/api/usePublishedProjects";
import { useAuth } from "../../shared/context/AuthContext";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { LimitReachedModal } from "../../features/projects/components/LimitReachedModal";
import { usePlanLimits } from "../../features/settings/api/useSettings";
import { DocumentosModal } from "../../features/documents/components/DocumentosModal";
import { MiniMap } from "../../shared/components/ui/MiniMap";

export const PublishedProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: project, isLoading, error } = useProject(id || "");

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [hasQuota, setHasQuota] = useState<boolean | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showDocumentos, setShowDocumentos] = useState(false);
  const [quotaError, setQuotaError] = useState<{ used?: number; max?: number } | null>(null);
  const isAdmin = user?.role === "admin" || user?.role === "owner";
  // const _fromSaved = (location.state as any)?.fromSaved;
  const { planLimits, isLoading: planLimitsLoading } = usePlanLimits();
  const quotaHandledRef = useRef(false);

  React.useEffect(() => {
    async function consumeBg() {
      try {
        const { projectsApi } = await import("../../features/projects/api/projectsApi");
        const result = await projectsApi.consumeQuota({ projectId: id || "" });
        if (result._tag === 'Success') {
          queryClient.invalidateQueries({ queryKey: ["subscription", "my-status"], refetchType: 'all' });
        } else if (result._tag === 'Failure' && result.error._tag === 'LimitReached') {
          setQuotaError({ used: result.error.used, max: result.error.max });
          setShowQuotaModal(true);
          setHasQuota(false);
        } else if (result._tag === 'Failure') {
          console.error("Error consumiendo cuota:", result.error);
        }
      } catch (e) {
        console.error("Error consumiendo cuota (no bloqueante):", e);
      }
    }

    if (authLoading) return;
    if (quotaHandledRef.current) return;

    const isSaved = location.state?.fromSaved === id;
    if (isAdmin || isSaved || !isAuthenticated) {
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
  }, [id, location.state?.fromSaved, isAuthenticated, isAdmin, planLimits, planLimitsLoading, authLoading]);

  React.useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "my-status"], refetchType: 'all' });
    };
  }, []);
  const [localSaved, setLocalSaved] = useState(false);
  const [localInterested, setLocalInterested] = useState(false);

  const { registerInterest, isRegisteringInterest, unregisterInterest, isUnregisteringInterest, saveProject, unsaveProject, isSaving, isUnsaving } = useProjectsInteractions();
  const { data: savedProjectsList } = useSavedProjects(isAuthenticated);
  const { data: interestsList } = useInterests(isAuthenticated);

  React.useEffect(() => {
    if (isAuthenticated && savedProjectsList && id) {
      setLocalSaved(savedProjectsList.some(p => p.id?.toLowerCase() === id.toLowerCase() || (p as any).proyectoId?.toLowerCase() === id.toLowerCase()));
    } else {
      setLocalSaved(false);
    }
  }, [isAuthenticated, savedProjectsList, id]);

  React.useEffect(() => {
    if (isAuthenticated && interestsList && id) {
      setLocalInterested(interestsList.some(i => i.id?.toLowerCase() === id.toLowerCase() || (i as any).proyectoId?.toLowerCase() === id.toLowerCase()));
    } else {
      setLocalInterested(false);
    }
  }, [isAuthenticated, interestsList, id]);

  const saved = localSaved;
  const interested = localInterested;

  const { data: categorias = [] } = useCategories();
  // ponytail: categoriaNombre arrives empty on the wire (repo GetByIdAsync has no Include(CategoriaProyecto)); resolve the name from the cached catalog by id instead
  const categoriaNombre = categorias.find(c => c.id === project?.categoriaId)?.nombre ?? project?.categoriaNombre ?? "N/D";

  // Gather all available images
  const allImgs = [
    project?.imagenUrl,
    project?.imagenAdicional1,
    project?.imagenAdicional2,
    project?.imagenAdicional3,
    project?.imagenAdicional4,
    project?.imagenAdicional5,
    ...(project?.fotoUrls || []),
  ].filter(Boolean) as string[];

  const uniqueImgs = allImgs.length > 0
    ? Array.from(new Set(allImgs))
    : [getDefaultProjectImage(project?.categoriaId as number)];

  // Parse GPS coordinates
  let gpsLat: number | null = null;
  let gpsLng: number | null = null;
  if (project?.ubicacionGps) {
    const parts = project.ubicacionGps.split(",").map((s: any) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      gpsLat = parts[0];
      gpsLng = parts[1];
    }
  }

  const getIntegrityLabel = () => {
    if (!project || !project.integridadValidada || project.integridadValidada === 0) return "Proyecto dummy sin Integridad";
    return `${project.integridadValidada}%`;
  };

  if (isLoading || hasQuota === null) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {hasQuota === null ? "Verificando acceso..." : "Cargando proyecto..."}
          </p>
        </div>
      </div>
    );
  }

  if (hasQuota === false) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Límite de Consultas Alcanzado
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-md">
          Has alcanzado el límite de consultas de tu plan actual. Mejora tu plan para continuar consultando proyectos.
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin/projects?tab=publicados")}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors"
        >
          Volver a proyectos
        </button>

        <LimitReachedModal
          isOpen={showQuotaModal}
          onClose={() => {
            setShowQuotaModal(false);
            navigate("/admin/projects?tab=publicados");
          }}
          onViewPlans={() => navigate("/plans")}
          limitType="consultations"
          used={quotaError?.used}
          max={quotaError?.max}
        />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          No se pudo cargar el proyecto
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-md">
          {error instanceof Error ? error.message : "Proyecto no encontrado"}
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin/projects?tab=publicados")}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors"
        >
          Volver a proyectos
        </button>
      </div>
    );
  }  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => navigate("/admin/projects?tab=publicados")}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors mb-4 uppercase tracking-widest"
      >
        <ChevronLeft size={14} />
        Volver a proyectos
      </button>

      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-100 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight break-words">
            {project.nombre}
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Expediente #{project.id.substring(0, 8).toUpperCase()} · Publicado
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-left md:text-right">
          <span className="text-2xl font-black text-slate-900">
            {project.valorEstimado
              ? `RD$ ${project.valorEstimado.toLocaleString("es-DO")}`
              : "Valor no especificado"}
          </span>
        </div>
      </div>

      {/* 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: IMAGES (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2 min-w-0">
          {uniqueImgs.length > 0 ? (
            <div className="flex flex-col gap-4 items-center w-full">
              {/* Main Image (100% width) */}
              <div 
                className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden rounded border border-slate-200 shadow-sm cursor-pointer group"
                onClick={() => {
                  setSelectedImageIndex(0);
                  setIsLightboxOpen(true);
                }}
              >
                <img
                  src={uniqueImgs[0]}
                  alt={`${project.nombre} - Foto principal`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Stacked Vertical Thumbnails (Smaller & Centered) */}
              {uniqueImgs.length > 1 && (
                <div className="w-[55%] flex flex-col gap-3">
                  {uniqueImgs.slice(1).map((url, i) => (
                    <button
                      key={i + 1}
                      type="button"
                      onClick={() => {
                        setSelectedImageIndex(i + 1);
                        setIsLightboxOpen(true);
                      }}
                      className="w-full aspect-[4/3] overflow-hidden bg-slate-100 rounded border border-slate-200 hover:opacity-80 transition-all shadow-sm"
                    >
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-slate-50 flex items-center justify-center text-slate-300 flex-col gap-3 border border-slate-100">
              <Camera size={40} />
              <span className="text-[11px] font-black uppercase tracking-widest">Sin imágenes</span>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: DETAILS (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 min-w-0">
          
          {/* Top Info block (Transmision, Traccion style) */}
          <div className="pb-6 border-b border-slate-100">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">Clasificación: <span className="font-bold">{categoriaNombre}</span></p>
                <p className="text-sm font-semibold text-slate-700">Integridad: <span className="font-bold">{getIntegrityLabel()}</span></p>
                <p className="text-sm font-semibold text-slate-700">Ubicación: <span className="font-bold">{project.ubicacionTexto || "N/D"}</span></p>
              </div>
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login");
                    return;
                  }
                  if (!id) return;
                  
                  const isOwner = 
                    user?.id?.toLowerCase() === project.usuarioCreadorId?.toLowerCase() || 
                    (project.registradoPor?.id && user?.id?.toLowerCase() === project.registradoPor.id.toLowerCase());
                    
                  if (isOwner) {
                    addToast("Esta acción no es posible porque usted es el vendedor de este proyecto", "error");
                    return;
                  }
                  if (saved) {
                    setLocalSaved(false);
                    unsaveProject(id, {
                      onError: () => setLocalSaved(true)
                    });
                  } else {
                    setLocalSaved(true);
                    saveProject(id, {
                      onError: () => setLocalSaved(false)
                    });
                  }
                }}
                disabled={isSaving || isUnsaving}
                className={`text-xs font-bold px-4 py-2 rounded shadow-sm transition-all duration-300 disabled:opacity-70 flex items-center gap-2 ${
                  saved ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_0_10px_rgba(5,150,105,0.4)]" : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {isSaving || isUnsaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Guardado</span>
                  </>
                ) : (
                  <span>Guardar</span>
                )}
              </button>
            </div>
          </div>



          {/* Datos Generales Table */}
          <div>
            <h3 className="text-primary font-bold text-sm mb-3">Datos Generales</h3>
            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div className="min-w-0 border-b border-slate-200 pb-1.5">
                  <span className="block font-bold text-slate-700">Desarrollador:</span>
                  <span className="block break-words text-slate-600">{project.datosDesarrollador || "N/D"}</span>
                </div>
                <div className="min-w-0 border-b border-slate-200 pb-1.5">
                  <span className="block font-bold text-slate-700">RNC/Cédula:</span>
                  <span className="block break-words text-slate-600">{project.rncDesarrollador || project.cedulaRncPropietario || "N/D"}</span>
                </div>
                <div className="min-w-0 border-b border-slate-200 pb-1.5">
                  <span className="block font-bold text-slate-700">Categoría:</span>
                  <span className="block break-words text-slate-600">{categoriaNombre}</span>
                </div>
                <div className="min-w-0 border-b border-slate-200 pb-1.5">
                  <span className="block font-bold text-slate-700">Superficie M²:</span>
                  <span className="block break-words text-slate-600">{project.superficieM2 != null ? `${project.superficieM2.toLocaleString("es-DO")} m²` : "N/D"}</span>
                </div>
                <div className="min-w-0 border-b border-slate-200 pb-1.5">
                  <span className="block font-bold text-slate-700">Estado:</span>
                  <span className="block text-slate-600">{(project as any).estado === 1 ? "Activo" : "Inactivo"}</span>
                </div>

                <div className="min-w-0 border-b border-slate-200 pb-1.5">
                  <span className="block font-bold text-slate-700">Ubicación:</span>
                  <span className="block break-words text-slate-600">{project.ubicacionTexto || "N/D"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <h3 className="text-primary font-bold text-sm mb-3">Observaciones</h3>
            <div className="text-sm text-slate-600 space-y-4">
              <p className="font-bold">¿Por qué verificar este proyecto en VeriFinca?</p>
              <p>
                • ESTADO DE INTEGRIDAD | {getIntegrityLabel().toUpperCase()}
                <br/>
                La evaluación de integridad de este proyecto permite a los inversionistas conocer el estatus legal y registral del inmueble.
              </p>
              <p>
                • SEGURIDAD FINANCIERA
                <br/>
                Consulta los reportes asociados y documentos legales en nuestra plataforma para obtener las mejores garantías antes de invertir.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PUBLISHER & MAP (3 cols) */}
        <div className="lg:col-span-3 min-w-0">
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg overflow-hidden max-w-full">
            <h2 className="text-xl font-bold text-secondary mb-4 border-b border-slate-200 pb-2">
              Publicado por
            </h2>

            {/* Seller Info Container */}
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-4 mb-6 min-w-0">
              
              {/* Name & Title */}
              <div className="col-span-1 min-w-0">
                <h3 className="font-bold text-primary text-sm leading-tight break-words" data-testid="registrant-name">
                  {project.registradoPor?.presentacionPublica?.nombreMostrado ?? (project.registradoPor?.nombreCompleto || "Usuario Desconocido")}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Responsable Registral
                </p>
              </div>

              {/* Avatar */}
              <div className="col-start-2 row-span-2 lg:row-span-1 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-16 lg:h-16 bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden rounded-md shadow-sm self-start">
                {project.registradoPor?.avatarUrl ? (
                  <img src={project.registradoPor.avatarUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="text-slate-300 w-1/2 h-1/2 lg:w-3/4 lg:h-3/4" />
                )}
              </div>

              {/* Details List */}
              <div className="col-span-1 lg:col-span-2 min-w-0">
                <ul className="space-y-2 text-[11px] text-slate-700 min-w-0">
                  <li className="flex gap-2 items-start min-w-0">
                    <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                    <span className="font-bold shrink-0">RNC/Cédula:</span> 
                    <span className="break-all min-w-0" data-testid="registrant-identification">
                      {project.registradoPor?.presentacionPublica
                        ? (project.registradoPor.presentacionPublica.identificacionMostrada || "N/D")
                        : (project.cedulaRncPropietario || project.rncDesarrollador || "N/D")}
                    </span>
                  </li>
                  {project.registradoPor?.presentacionPublica ? (
                    project.registradoPor.presentacionPublica.razonSocialMostrada && (
                      <li className="flex gap-2 items-start min-w-0">
                        <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                        <span className="font-bold shrink-0">R. Social:</span> 
                        <span className="break-words min-w-0" data-testid="registrant-razon-social">
                          {project.registradoPor.presentacionPublica.razonSocialMostrada}
                        </span>
                      </li>
                    )
                  ) : (
                    <li className="flex gap-2 items-start min-w-0">
                      <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                      <span className="font-bold shrink-0">R. Social:</span> 
                      <span className="break-words min-w-0" data-testid="registrant-razon-social">
                        {project.registradoPor?.razonSocial || project.datosDesarrollador || "N/D"}
                      </span>
                    </li>
                  )}
                  <li className="flex gap-2 items-start min-w-0">
                    <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                    <span className="font-bold shrink-0">Tel:</span> 
                    <a href={project.registradoPor?.telefono ? `tel:${project.registradoPor.telefono.replace(/\s+/g, '')}` : undefined} className="text-primary hover:underline break-all min-w-0">
                      {project.registradoPor?.telefono || "N/D"}
                    </a>
                  </li>
                  <li className="flex gap-2 items-start min-w-0">
                    <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                    <span className="font-bold shrink-0">Email:</span> 
                    <a href={project.registradoPor?.email ? `mailto:${project.registradoPor.email}` : undefined} className="text-primary hover:underline break-all min-w-0">
                      {project.registradoPor?.email || "N/D"}
                    </a>
                  </li>
                  <li className="flex gap-2 items-start min-w-0">
                    <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                    <span className="font-bold shrink-0">Ubicación:</span> 
                    <span className="break-words min-w-0">{project.ubicacionTexto || "N/D"}</span>
                  </li>
                  <li className="flex gap-2 items-start min-w-0">
                    <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                    <span className="font-bold shrink-0">Dirección:</span> 
                    <span className="break-words min-w-0">{project.registradoPor?.direccion || "N/D"}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* WhatsApp badges */}
            {project.registradoPor?.telefono && (
              <div className="space-y-2 mb-6 min-w-0">
                <a href={`https://wa.me/${project.registradoPor.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline break-all">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                    <Phone size={10} />
                  </div>
                  <span className="min-w-0">WhatsApp: {project.registradoPor.telefono}</span>
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 mb-6 min-w-0">
              <button 
                type="button" 
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login");
                    return;
                  }
                  if (!id) return;
                  
                  const isOwner = 
                    user?.id?.toLowerCase() === project.usuarioCreadorId?.toLowerCase() || 
                    (project.registradoPor?.id && user?.id?.toLowerCase() === project.registradoPor.id.toLowerCase());
                    
                  if (isOwner) {
                    addToast("Esta acción no es posible porque usted es el vendedor de este proyecto", "error");
                    return;
                  }
                  
                  if (interested) {
                    setLocalInterested(false);
                    unregisterInterest(id, {
                      onError: () => setLocalInterested(true)
                    });
                  } else {
                    setLocalInterested(true);
                    registerInterest(id, {
                      onError: () => setLocalInterested(false)
                    });
                  }
                }}
                disabled={isRegisteringInterest || isUnregisteringInterest}
                className={`w-full py-2.5 rounded text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  interested ? "bg-emerald-600 text-white shadow-[0_0_10px_rgba(5,150,105,0.4)] hover:bg-emerald-700" : "bg-[#E63946] text-white hover:bg-red-700"
                } disabled:opacity-70`}
              >
                {isRegisteringInterest || isUnregisteringInterest ? (
                  <>
                    <Loader2 size={16} className="animate-spin shrink-0" />
                    <span>Procesando...</span>
                  </>
                ) : interested ? (
                  <>
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>Interés Registrado</span>
                  </>
                ) : (
                  <span>Contactar Responsable</span>
                )}
              </button>
              <button type="button" onClick={() => setShowDocumentos(true)} className="w-full bg-[#E63946] hover:bg-red-700 text-white py-2.5 rounded text-sm font-bold transition-colors">
                Ver Documentos
              </button>
            </div>

            {/* Map */}
            <div className="w-full h-48 border border-slate-300 rounded overflow-hidden bg-slate-100">
              {gpsLat !== null && gpsLng !== null ? (
                <MiniMap lat={gpsLat} lng={gpsLng} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <MapIcon size={24} className="mb-2" />
                  <span className="text-[10px] font-bold uppercase">Sin coordenadas</span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Documentos Modal */}
      <DocumentosModal projectId={project.id} isOpen={showDocumentos} onClose={() => setShowDocumentos(false)} />

      {/* Lightbox Modal via Portal */}
      {isLightboxOpen && uniqueImgs.length > 0 && createPortal(
        <div className="fixed inset-0 z-[100000] flex flex-col bg-[#1a1a1a]">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 z-[100001] bg-[#E63946] text-white p-3 rounded-full hover:bg-red-700 transition-transform hover:scale-110 shadow-lg"
            title="Cerrar"
          >
            <X size={24} />
          </button>

          {/* Main Content Area */}
          <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
            {/* Prev Button */}
            {uniqueImgs.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : uniqueImgs.length - 1))}
                className="absolute left-6 z-[100001] bg-primary text-white p-3 rounded-full hover:opacity-90 transition-transform hover:scale-110 shadow-lg"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Image */}
            <img
              src={uniqueImgs[selectedImageIndex]}
              alt={`${project.nombre} - Foto ampliada`}
              loading="lazy"
              decoding="async"
              className="max-w-full max-h-full object-contain"
            />

            {/* Next Button */}
            {uniqueImgs.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedImageIndex((prev) => (prev < uniqueImgs.length - 1 ? prev + 1 : 0))}
                className="absolute right-6 z-[100001] bg-primary text-white p-3 rounded-full hover:opacity-90 transition-transform hover:scale-110 shadow-lg"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {uniqueImgs.length > 1 && (
            <div className="h-32 bg-[#0a0a0a] p-4 flex gap-3 overflow-x-auto justify-center items-center shrink-0 border-t border-white/10">
              {uniqueImgs.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative h-full aspect-[4/3] shrink-0 overflow-hidden rounded-md transition-all ${
                    i === selectedImageIndex ? "border-2 border-primary scale-110 shadow-[0_0_15px_rgba(249,133,19,0.5)] z-10" : "opacity-40 hover:opacity-100 border border-slate-700"
                  }`}
                >
                  <img src={url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
