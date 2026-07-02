import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProjectStatus, IntegrityStatus } from "../../features/projects/types";
import { getStatusLabel } from "../../features/projects/utils/statusUtils";
import { ProjectCoverImage } from "../../features/projects/components/ProjectCoverImage";
import { useProjects, useDeleteProject, useUpdateProjectStatus } from "../../features/projects/api/useProjects";
import { 
  FolderKanban, 
  Plus, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Timer, 
  Filter,
  MoreVertical,
  Activity,
  FileCheck,
  Building,
  Trash2
} from "lucide-react";

const getStatusBadge = (status: ProjectStatus, t: any) => {
  const label = getStatusLabel(status, t);
  switch (status) {
    case ProjectStatus.Draft: return { label, cls: "bg-gray-100 text-gray-600 border-gray-200" };
    case ProjectStatus.Published: return { label, cls: "bg-blue-50 text-blue-600 border-blue-100" };
    case ProjectStatus.InReview: return { label, cls: "bg-indigo-50 text-indigo-600 border-indigo-100" };
    case ProjectStatus.Observed: return { label, cls: "bg-amber-50 text-amber-600 border-amber-100" };
    case ProjectStatus.Validated: return { label, cls: "bg-emerald-50 text-emerald-600 border-emerald-100" };
    case ProjectStatus.Rejected: return { label, cls: "bg-rose-50 text-rose-600 border-rose-100" };
    default: return { label, cls: "bg-gray-100 text-gray-600 border-gray-200" };
  }
};

const getIntegrityBadge = (status: IntegrityStatus) => {
  switch (status) {
    case IntegrityStatus.Verified: 
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
          <CheckCircle2 className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Verificado</span>
        </div>
      );
    case IntegrityStatus.Failed: 
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-100">
          <AlertTriangle className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Invalido</span>
        </div>
      );
    default: 
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
          <Timer className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Pendiente</span>
        </div>
      );
  }
};

export const AdminProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || "";
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const { data: rawProjects = [], isLoading } = useProjects();
  const projects = rawProjects;

  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateStatus } = useUpdateProjectStatus();

  const ALL_STATUSES = [
    { value: ProjectStatus.Draft, label: "Borrador" },
    { value: ProjectStatus.Published, label: "Publicado" },
    { value: ProjectStatus.InReview, label: "En Revisión" },
    { value: ProjectStatus.Observed, label: "Observado" },
    { value: ProjectStatus.Validated, label: "Validado" },
    { value: ProjectStatus.Rejected, label: "Rechazado" },
  ];

  const stats = {
    total: projects.length,
    validated: projects.filter(p => p.estadoProyecto === ProjectStatus.Validated).length,
    pending: projects.filter(p => p.estadoProyecto === ProjectStatus.InReview).length
  };

  const totalValue = stats.total || 1;
  const metrics = [
    { label: "Total Proyectos", value: stats.total, icon: Building, color: "text-blue-600", bg: "bg-blue-50", barColor: "bg-blue-500", pct: 100 },
    { label: "Validados (RD)", value: stats.validated, icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50", barColor: "bg-emerald-500", pct: stats.total ? Math.round((stats.validated / totalValue) * 100) : 0 },
    { label: "En Revisión", value: stats.pending, icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50", barColor: "bg-indigo-500", pct: stats.total ? Math.round((stats.pending / totalValue) * 100) : 0 },
  ];

  const filtered = projects.filter((p) => {
    const matchesSearch = 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.codigoInterno && p.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.designacionCatastral && p.designacionCatastral.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.matricula && p.matricula.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.ubicacionTexto && p.ubicacionTexto.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.ubicacionGps && p.ubicacionGps.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.datosDesarrollador && p.datosDesarrollador.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.rncDesarrollador && p.rncDesarrollador.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.createdAtUtc && new Date(p.createdAtUtc).toLocaleDateString().includes(searchTerm)) ||
      (p.valorEstimado && String(p.valorEstimado).includes(searchTerm));
    
    if (selectedStatuses.length > 0) {
      return matchesSearch && selectedStatuses.includes(p.estadoProyecto);
    }
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "validated") return matchesSearch && p.estadoProyecto === ProjectStatus.Validated;
    if (activeFilter === "review") return matchesSearch && p.estadoProyecto === ProjectStatus.InReview;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight">
            Gestión de Expedientes
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Administra, valida y audita la base de datos inmobiliaria institucional.
          </p>
        </div>
        <Link 
          to="/admin/projects/new" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Expediente
        </Link>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {metrics.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-5 mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-display font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${stat.barColor}`} 
                style={{ width: `${stat.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o folio..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl">
          {[
            { id: "all", label: "Todos" },
            { id: "validated", label: "Validados" },
            { id: "review", label: "En Revisión" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilter(f.id);
                if (f.id === "all") {
                  setSelectedStatuses([]);
                } else if (f.id === "validated") {
                  setSelectedStatuses([ProjectStatus.Validated]);
                } else if (f.id === "review") {
                  setSelectedStatuses([ProjectStatus.InReview]);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                (activeFilter === f.id || 
                 (f.id === "all" && selectedStatuses.length === 0) ||
                 (f.id === "validated" && selectedStatuses.length === 1 && selectedStatuses[0] === ProjectStatus.Validated) ||
                 (f.id === "review" && selectedStatuses.length === 1 && selectedStatuses[0] === ProjectStatus.InReview))
                  ? "bg-white text-primary shadow-sm border border-gray-100" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={`p-3 rounded-2xl transition-all ${
              selectedStatuses.length > 0 
                ? "text-primary bg-primary/10 hover:bg-primary/20" 
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="Filtrar por estados"
          >
            <Filter className="w-5 h-5" />
          </button>
          
          {isFilterDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsFilterDropdownOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 z-20 p-4 space-y-2.5">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Filtrar por estado</p>
                {ALL_STATUSES.map((status) => {
                  const isChecked = selectedStatuses.includes(status.value);
                  return (
                    <label key={status.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors w-full">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          let next;
                          if (isChecked) {
                            next = selectedStatuses.filter(s => s !== status.value);
                          } else {
                            next = [...selectedStatuses, status.value];
                          }
                          setSelectedStatuses(next);
                          
                          if (next.length === 0) {
                            setActiveFilter("all");
                          } else if (next.length === 1 && next[0] === ProjectStatus.Validated) {
                            setActiveFilter("validated");
                          } else if (next.length === 1 && next[0] === ProjectStatus.InReview) {
                            setActiveFilter("review");
                          } else {
                            setActiveFilter("custom");
                          }
                        }}
                        className="rounded text-primary focus:ring-primary w-4 h-4 border-gray-300"
                      />
                      <span className="text-xs font-bold text-gray-700">{status.label}</span>
                    </label>
                  );
                })}
                {selectedStatuses.length > 0 && (
                  <button 
                    onClick={() => {
                      setSelectedStatuses([]);
                      setActiveFilter("all");
                      setIsFilterDropdownOpen(false);
                    }}
                    className="w-full text-center text-xs font-black text-red-500 hover:text-red-700 pt-2 border-t border-gray-100 block"
                  >
                    Limpiar Filtros
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
              <div className="flex items-start gap-5 min-w-0 w-full">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex-shrink-0" />
                <div className="min-w-0 space-y-3 w-full max-w-md">
                  <div className="h-5 bg-gray-100 rounded-md w-3/4" />
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-100 rounded-md w-24" />
                    <div className="h-4 bg-gray-100 rounded-md w-24" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto">
                <div className="h-6 bg-gray-100 rounded-full w-24" />
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                  <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.length === 0 ? (
            <div className="bg-white py-20 px-6 text-center rounded-3xl border border-dashed border-gray-200">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderKanban className="w-8 h-8 text-gray-300" />
               </div>
               <h3 className="text-lg font-bold text-gray-900">No se encontraron expedientes</h3>
               <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
                 Intenta ajustar los criterios de búsqueda o filtros aplicados actualmente.
               </p>
            </div>
          ) : (
            filtered.map((project, index) => {
              const badge = getStatusBadge(project.estadoProyecto, t);
              return (
                <div 
                  key={`${project.id}-${index}`}
                  className="vf-card bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5 min-w-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner">
                        <ProjectCoverImage
                          coverUrl={project.imagenUrl}
                          projectName={project.nombre}
                          size="sm"
                          className="grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                            {project.nombre}
                          </h3>
                          {getIntegrityBadge(project.estadoIntegridad)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-medium">
                          <span className="flex items-center gap-1.5 font-mono bg-gray-50 px-2 py-0.5 rounded-md">
                            ID: {project.codigoInterno}
                          </span>
                          {project.matricula && (
                            <span className="flex items-center gap-1.5 font-mono bg-blue-50/50 text-blue-600 px-2 py-0.5 rounded-md">
                              Matrícula: {project.matricula}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5" />
                            Act: {new Date(project.updatedAtUtc || project.createdAtUtc).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${badge.cls}`}>
                        {badge.label}
                      </span>
                      
                      <div className="flex items-center gap-2 relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenMenuId(openMenuId === project.id ? null : project.id);
                          }}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Opciones"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {openMenuId === project.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={(e) => { e.preventDefault(); setOpenMenuId(null); }} 
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2">
                              <Link
                                to={`/admin/projects/${project.id}/edit`}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <FileCheck className="w-4 h-4 text-gray-400" />
                                Validaciones
                              </Link>
                              <Link
                                to={`/admin/projects/${project.id}/documents`}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <FolderKanban className="w-4 h-4 text-gray-400" />
                                Documentos
                              </Link>
                              <Link
                                to={`/admin/projects/${project.id}/audit`}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Activity className="w-4 h-4 text-gray-400" />
                                Auditoría
                              </Link>
                              
                              <div className="my-1 border-t border-gray-100"></div>
                              
                              {project.estadoProyecto === ProjectStatus.Draft && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateStatus({ id: project.id, status: ProjectStatus.InReview });
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center gap-3 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors w-full"
                                >
                                  <Activity className="w-4 h-4" />
                                  Enviar a Revisión
                                </button>
                              )}
                              
                              {project.estadoProyecto === ProjectStatus.InReview && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      updateStatus({ id: project.id, status: ProjectStatus.Validated });
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors w-full"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Aprobar (Validado)
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      updateStatus({ id: project.id, status: ProjectStatus.Observed });
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors w-full"
                                  >
                                    <AlertTriangle className="w-4 h-4" />
                                    Observar
                                  </button>
                                </>
                              )}

                              {project.estadoProyecto === ProjectStatus.Validated && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateStatus({ id: project.id, status: ProjectStatus.Published });
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors w-full"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Publicar (Terminado)
                                </button>
                              )}
                              
                              <div className="my-1 border-t border-gray-100"></div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (window.confirm(`¿Eliminar "${project.nombre}"? Esta acción no se puede deshacer.`)) {
                                    deleteProject(project.id);
                                  }
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            </div>
                          </>
                        )}
                        <Link
                          to={`/admin/projects/${project.id}/edit`}
                          className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

