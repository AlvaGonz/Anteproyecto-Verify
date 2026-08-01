import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, DollarSign, Building2, AlertCircle, ChevronRight, X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useSavedProjects, useProjectsInteractions } from "../../features/projects/api/useProjectsInteractions";
import { ProjectStatusBadge } from "../../features/public/components/ProjectStatusBadge";
import { getDefaultProjectImage } from "../../features/projects/api/usePublishedProjects";

export const AdminSavedProjectsView: React.FC = () => {
  const { data: savedProjects = [], isLoading } = useSavedProjects();
  const { unsaveProject, isUnsaving } = useProjectsInteractions();
  const [searchQuery, setSearchQuery] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  const filteredProjects = useMemo(() => {
    let result = savedProjects;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p: any) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.rncDesarrollador?.toLowerCase().includes(q) ||
          p.designacionCatastral?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [savedProjects, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-border shadow-sm flex-wrap gap-4">
        <div>
          <h3 className="font-display font-bold text-primary text-lg">Proyectos Guardados</h3>
          <p className="text-sm text-slate-500">
            Los proyectos que has guardado para ver más tarde.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:flex-1 justify-end flex-wrap">
          <div className="relative w-full flex-1 min-w-[200px] md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, RNC, catastro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project: any, idx: number) => (
            <m.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setProjectToDelete(project);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-[#E63946] text-white rounded-full shadow-md flex items-center justify-center hover:bg-red-700 transition-colors z-20"
                >
                  <X size={16} />
                </button>
                <img
                  src={project.imagenUrl || getDefaultProjectImage(project.categoria)}
                  alt={project.nombre}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <ProjectStatusBadge status={project.estadoIntegridad === 1 ? "Verificado" : "Procesando"} />
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <DollarSign size={10} />
                    {project.valorEstimado ? (project.valorEstimado / 1_000_000).toFixed(1) + "M" : "—"}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-slate-900 truncate group-hover:text-primary transition-colors">
                      {project.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wide mt-1">
                      <MapPin size={12} />
                      {project.ubicacionTexto || "Ubicación no especificada"}
                    </div>
                  </div>
                </div>

                {project.designacionCatastral && (
                  <div className="flex items-center gap-1.5 font-mono bg-slate-50 px-3 py-1.5 rounded-md mb-3">
                    <span className="text-xs font-bold text-slate-500">Catastral:</span>
                    <span className="text-xs font-bold text-slate-700">{project.designacionCatastral}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.rncDesarrollador && (
                    <span className="flex items-center gap-1.5 font-mono bg-slate-50 px-2 py-1 rounded-md text-[10px] font-bold text-slate-600">
                      <Building2 size={10} />
                      RNC: {project.rncDesarrollador}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <Link
                    to={`/admin/projects/${project.id}/publicado`}
                    state={{ fromSaved: project.id }}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all group/btn"
                  >
                    Ver Detalles <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </m.div>
          ))}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <div className="col-span-full">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No tienes proyectos guardados</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">
                {searchQuery ? "No hay coincidencias para tu búsqueda." : "Explora los proyectos publicados y guarda los que te interesen."}
              </p>
            </m.div>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {projectToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProjectToDelete(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={32} className="text-[#E63946]" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">¿Quitar de guardados?</h3>
                <p className="text-sm text-slate-500 mb-6">
                  ¿Estás seguro que deseas remover el proyecto <span className="font-bold text-slate-800">{projectToDelete.nombre}</span> de tu lista de guardados?
                </p>
                
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(null)}
                    disabled={isUnsaving}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      unsaveProject(projectToDelete.id);
                      setProjectToDelete(null);
                    }}
                    disabled={isUnsaving}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-[#E63946] text-white hover:bg-red-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {isUnsaving ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    ) : (
                      "Sí, Quitar"
                    )}
                  </button>
                </div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
