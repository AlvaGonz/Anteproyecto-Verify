import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProjectStatus, IntegrityStatus } from "../../features/projects/types";
import { getStatusLabel } from "../../features/projects/utils/statusUtils";
import { ProjectCoverImage } from "../../features/projects/components/ProjectCoverImage";
import { AdminProjectContextMenu } from "./AdminProjectContextMenu";
import { FolderKanban, ArrowRight, CheckCircle2, AlertTriangle, Timer, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toUtcDate } from "../../shared/utils/dates";

const getStatusBadge = (status: ProjectStatus, t: any) => {
  const label = getStatusLabel(status, t);
  switch (status) {
    case ProjectStatus.Draft: return { label, cls: "bg-gray-100 text-gray-600 border-gray-200" };
    case ProjectStatus.Edited: return { label, cls: "bg-indigo-50 text-indigo-600 border-indigo-100" };
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

interface AdminProjectListProps {
  t: any;
  isAdmin: boolean;
  isLoading: boolean;
  filtered: any[];
  openMenuId: string | null;
  setOpenMenuId: (v: string | null) => void;
  updateStatus: (params: { id: string; status: ProjectStatus }) => void;
  deleteProject: (id: string) => void;
}

export const AdminProjectList: React.FC<AdminProjectListProps> = ({
  t,
  isAdmin,
  isLoading,
  filtered,
  openMenuId,
  setOpenMenuId,
  updateStatus,
  deleteProject,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedProjects = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse"
          >
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
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="bg-white py-20 px-6 text-center rounded-3xl border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderKanban className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No se encontraron expedientes</h3>
        <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
          Intenta ajustar los criterios de búsqueda o filtros aplicados actualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 min-h-[1000px]">
        {Array.from({ length: itemsPerPage }).map((_, idx) => {
          const project = paginatedProjects[idx];
          
          if (!project) {
            return (
              <div
                key={`empty-${idx}`}
                className="p-5 rounded-3xl border border-transparent flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-0 pointer-events-none"
              >
                <div className="flex items-start gap-5 min-w-0 w-full">
                  <div className="w-14 h-14 rounded-2xl flex-shrink-0" />
                  <div className="min-w-0 space-y-3 w-full max-w-md">
                    <div className="h-5 rounded-md w-3/4" />
                    <div className="flex gap-4">
                      <div className="h-4 rounded-md w-24" />
                      <div className="h-4 rounded-md w-24" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto">
                  <div className="h-6 rounded-full w-24" />
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-xl" />
                    <div className="w-10 h-10 rounded-xl" />
                  </div>
                </div>
              </div>
            );
          }

          const badge = getStatusBadge(project.estadoProyecto, t);
          return (
            <div
              key={`${project.id}-${idx}`}
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
                      {isAdmin && project.planNombre && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#223382]/10 text-[#223382] border border-[#223382]/20 shrink-0">
                          Plan: {project.planNombre}
                        </span>
                      )}
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
                        Act: {toUtcDate(project.updatedAtUtc || project.createdAtUtc)?.toLocaleDateString() ?? ''}
                        {isAdmin && project.registradoPor?.nombreCompleto && (
                          <span className="text-gray-500">· {project.registradoPor.nombreCompleto}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${badge.cls}`}>
                    {badge.label}
                  </span>

                  <div className="flex items-center gap-2 relative">
                    <AdminProjectContextMenu
                      project={project}
                      isOpen={openMenuId === project.id}
                      onToggle={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                      onClose={() => setOpenMenuId(null)}
                      updateStatus={updateStatus}
                      deleteProject={deleteProject}
                    />
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
        })}
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

