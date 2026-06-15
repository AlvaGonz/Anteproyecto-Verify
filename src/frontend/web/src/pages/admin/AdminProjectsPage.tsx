import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProjectStatus, IntegrityStatus } from "../../features/projects/types";
import { useProjects } from "../../features/projects/api/useProjects";
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
  Building
} from "lucide-react";

const getStatusBadge = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.Draft: return { label: "Borrador", cls: "bg-gray-100 text-gray-600 border-gray-200" };
    case ProjectStatus.Published: return { label: "Publicado", cls: "bg-blue-50 text-blue-600 border-blue-100" };
    case ProjectStatus.InReview: return { label: "En Revision", cls: "bg-indigo-50 text-indigo-600 border-indigo-100" };
    case ProjectStatus.Observed: return { label: "Observado", cls: "bg-amber-50 text-amber-600 border-amber-100" };
    case ProjectStatus.Validated: return { label: "Validado", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" };
    case ProjectStatus.Rejected: return { label: "Rechazado", cls: "bg-rose-50 text-rose-600 border-rose-100" };
    default: return { label: "Desconocido", cls: "bg-gray-100 text-gray-600 border-gray-200" };
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
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || "";
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const { data: rawProjects = [], isLoading } = useProjects();
  const projects = rawProjects;

  const stats = {
    total: projects.length,
    validated: projects.filter(p => p.estadoProyecto === ProjectStatus.Validated).length,
    pending: projects.filter(p => p.estadoProyecto === ProjectStatus.InReview).length
  };

  const filtered = projects.filter((p) => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.codigoInterno?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        {[
          { label: "Total Proyectos", value: stats.total, icon: Building, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Validados (RD)", value: stats.validated, icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "En Revisión", value: stats.pending, icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-display font-black text-gray-900">{stat.value}</p>
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
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === f.id 
                  ? "bg-white text-primary shadow-sm border border-gray-100" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Sincronizando Base de Datos...</p>
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
              const badge = getStatusBadge(project.estadoProyecto);
              return (
                <div 
                  key={`${project.id}-${index}`}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5 min-w-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner">
                        <img 
                          src={project.imagenUrl || "https://images.unsplash.com/photo-1590019158224-399dc0f9fc31?q=80&w=200&auto=format&fit=crop"} 
                          alt={project.nombre}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
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
                      
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/projects/${project.id}/edit`}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Editar Expediente"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </Link>
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

