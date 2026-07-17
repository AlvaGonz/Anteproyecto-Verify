import React, { useState } from "react";
import { FolderKanban, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import type { ProyectoRecienteDto } from "../../../infrastructure/api/dashboard.api";
import { ProjectCoverImage } from "../../projects/components/ProjectCoverImage";
import { toUtcDate } from "../../../shared/utils/dates";

export interface DashboardProjectListProps {
  loading: boolean;
  recentProjects: ProyectoRecienteDto[];
}

export const DashboardProjectList: React.FC<DashboardProjectListProps> = ({ loading, recentProjects }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(recentProjects.length / itemsPerPage);
  const paginatedProjects = recentProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      Draft: "Creado",
      Edited: "Editado",
      InReview: "En revisión",
      Published: "Publicado",
      Observed: "Con Observaciones",
      Verified: "Verificado",
    };
    return map[status] || status;
  };

  return (
  <m.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.4 }}
    className="xl:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm"
  >
    <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-raised/20">
      <div>
        <h3 className="text-xl font-display font-black text-[#223382] tracking-tight">
          Proyectos <span className="text-[#F98513]">Recientes</span>
        </h3>
        <p className="text-xs text-text-secondary font-medium mt-0.5">Últimas actualizaciones en el sistema</p>
      </div>
    </div>

    <div className="flex-1 min-h-[445px] overflow-hidden relative">
      {loading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223382]" /></div>
      ) : recentProjects.length === 0 ? (
        <div className="py-20 text-sm text-text-secondary opacity-50 text-center flex flex-col items-center gap-3">
          <FolderKanban className="w-10 h-10 opacity-20" />
          No hay proyectos recientes.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <m.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col w-full h-full divide-y divide-border absolute inset-0"
          >
            {Array.from({ length: itemsPerPage }).map((_, idx) => {
              const p = paginatedProjects[idx];
              if (!p) {
                return <div key={`empty-${idx}`} className="h-[89px] pointer-events-none" />;
              }
              return (
                <div key={`${p.nombre}-${idx}`} className="flex items-center justify-between px-8 py-5 hover:bg-surface-raised/20 transition-all group h-[89px]">
                  <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner">
                        <ProjectCoverImage
                          coverUrl={p.imagenUrl}
                          projectName={p.nombre}
                          size="sm"
                          className="grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-text-primary text-lg group-hover:text-[#223382] transition-colors leading-tight">{p.nombre}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-surface-raised text-text-secondary uppercase tracking-tighter">
                            {p.desarrollador}
                          </span>
                          <span className="text-[10px] text-text-secondary opacity-60">
                            {toUtcDate(p.fechaRegistro)?.toLocaleDateString() ?? ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block text-right">
                        <span className={`vf-badge ${p.estado === "Verified" || p.estado === "Published" ? "vf-badge-success" : p.estado === "InReview" ? "vf-badge-warning" : "vf-badge-default"}`}>
                          {translateStatus(p.estado)}
                        </span>
                      </div>
                    </div>
                  </div>
              );
            })}
          </m.div>
        </AnimatePresence>
      )}
    </div>
    
    {!loading && totalPages > 1 && (
      <div className="px-6 py-4 border-t border-border bg-surface-raised/10 flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, recentProjects.length)} de {recentProjects.length}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-surface-raised disabled:opacity-30 transition-colors"
          >
            <ChevronsLeft className="w-4 h-4 text-text-primary" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-surface-raised disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-text-primary" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-surface-raised disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-text-primary" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-surface-raised disabled:opacity-30 transition-colors"
          >
            <ChevronsRight className="w-4 h-4 text-text-primary" />
          </button>
        </div>
      </div>
    )}
  </m.div>
  );
};
