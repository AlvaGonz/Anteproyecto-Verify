import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProjectStatus } from "../../features/projects/types";
import { getStatusLabel } from "../../features/projects/utils/statusUtils";
import { useProjects, useDeleteProject, useUpdateProjectStatus } from "../../features/projects/api/useProjects";
import { useDashboardStats } from "../../features/dashboard/api/useDashboardStats";
import { Plus, Building, FileCheck, Activity } from "lucide-react";
import { AdminProjectsPageLayout } from "./AdminProjectsPageLayout";
import { AdminPublishedProjectsView } from "./AdminPublishedProjectsView";
import { AdminInterestsView } from "./AdminInterestsView";
import { AdminSavedProjectsView } from "./AdminSavedProjectsView";
import { useAuth } from "../../shared/context/AuthContext";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { Download } from "lucide-react";
import { useInterests } from "../../features/projects/api/useProjectsInteractions";
import { ExportInterestsModal } from "./ExportInterestsModal";
import { ExportProjectsModal } from "./ExportProjectsModal";
import { LimitReachedModal } from "../../features/projects/components/LimitReachedModal";
import { useNavigate } from "react-router-dom";

const PLAN_LIMITS: Record<string, number> = {
  "Consultor": 1,
  "Profesional": 5,
  "Empresa": 10,
  "Corporativo": 50,
  "Administrador": 999999
};

type TabType = "proyectos" | "publicados" | "intereses" | "guardados";

export const AdminProjectsPage: React.FC = () => {
    const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || "";

  const initialTab = (searchParams.get('tab') as TabType) || "proyectos";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportProjectsModalOpen, setIsExportProjectsModalOpen] = useState(false);
  const { data: intereses = [] } = useInterests(activeTab === "intereses");

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = searchParams.get('q');
      if (q !== null) {
        setSearchTerm(q);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const estadosParam = useMemo(() => {
    if (selectedStatuses.length > 0) return [...new Set(selectedStatuses)].join(",");
    if (activeFilter === "published") return `${ProjectStatus.Published},${ProjectStatus.Observed}`;
    if (activeFilter === "review") return ProjectStatus.InReview;
    return undefined;
  }, [selectedStatuses, activeFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, estadosParam]);

  const { data: rawProjects = [], totalCount, isLoading } = useProjects(page, pageSize, debouncedSearch || undefined, estadosParam);
  const projects = rawProjects;

  const [showLimitModal, setShowLimitModal] = useState(false);
  const userPlan = user?.plan || "Consultor";
  const maxProjects = PLAN_LIMITS[userPlan] ?? 1;
  const isAtLimit = maxProjects !== 999999 && (totalCount ?? projects.length) >= maxProjects;

  const { data: dashboardStats } = useDashboardStats();

  const { addToast } = useToast();
  const { mutate: deleteProjectMutation } = useDeleteProject();
  const { mutate: updateStatusMutation } = useUpdateProjectStatus();

  const handleUpdateStatus = useCallback(({ id, status }: { id: string; status: ProjectStatus }) => {
    updateStatusMutation(
      { id, status },
      {
        onSuccess: () => {
          addToast(`Estado del proyecto actualizado a «${getStatusLabel(status)}»`, "success");
        },
        onError: (err: any) => {
          addToast(err?.response?.data?.message || err?.message || "Error al actualizar el estado", "error");
        },
      }
    );
  }, [updateStatusMutation, addToast]);

  const handleDeleteProject = useCallback((id: string) => {
    deleteProjectMutation(id, {
      onSuccess: () => {
        addToast("Proyecto eliminado correctamente", "success");
      },
      onError: (err: any) => {
        addToast(err?.response?.data?.message || err?.message || "Error al eliminar el proyecto", "error");
      },
    });
  }, [deleteProjectMutation, addToast]);

  const stats = useMemo(() => ({
    total: dashboardStats?.totalProyectos ?? totalCount ?? projects.length,
    published: dashboardStats?.proyectosAprobados ?? projects.filter(p => p.estadoProyecto === ProjectStatus.Published).length,
    pending: dashboardStats?.proyectosPendientes ?? projects.filter(p => p.estadoProyecto === ProjectStatus.InReview).length
  }), [dashboardStats, totalCount, projects]);

  const metrics = useMemo(() => {
    const totalValue = stats.total || 1;
    return [
      { label: "Total Proyectos", value: stats.total, icon: Building, color: "text-blue-600", bg: "bg-blue-50", barColor: "bg-blue-500", pct: 100 },
      { label: "En Revisión", value: stats.pending, icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50", barColor: "bg-indigo-500", pct: stats.total ? Math.round((stats.pending / totalValue) * 100) : 0 },
      { label: "Publicados", value: stats.published, icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50", barColor: "bg-emerald-500", pct: stats.total ? Math.round((stats.published / totalValue) * 100) : 0 },
    ];
  }, [stats]);

  const filtered = projects;

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight">
            {activeTab === "publicados" ? "Navegación de Expedientes Publicados" :
             activeTab === "intereses" ? "Mis Intereses y Solicitudes" :
             activeTab === "guardados" ? "Proyectos Guardados" : "Gestión de Expedientes"}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {activeTab === "publicados"
              ? "Analiza, investiga y consulta proyectos inmobiliarios en el mercado."
              : activeTab === "intereses"
              ? "Revisa quién está interesado en tus proyectos y aquellos en los que has mostrado interés."
              : activeTab === "guardados"
              ? "Accede rápidamente a los proyectos que has marcado para seguimiento."
              : "Administra, valida y audita la base de datos inmobiliaria institucional."}
          </p>
        </div>
        {activeTab === "proyectos" && (
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <Link
              to="/admin/projects/new"
              onClick={(e) => {
                if (isAtLimit && user?.role !== "admin") {
                  e.preventDefault();
                  setShowLimitModal(true);
                }
              }}
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              Nuevo Expediente
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 gap-4 md:gap-0 pb-2 md:pb-0">
        <div className="flex overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("proyectos")}
            className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "proyectos"
                ? "border-[#223382] text-[#223382]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            Proyectos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("publicados")}
            className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "publicados"
                ? "border-[#223382] text-[#223382]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            Proy. Publicados
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("intereses")}
            className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "intereses"
                ? "border-[#223382] text-[#223382]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            Intereses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guardados")}
            className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "guardados"
                ? "border-[#223382] text-[#223382]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            Proy. Guardados
          </button>
        </div>
        <div className="flex px-4 md:px-0 mb-2 md:mb-1">
          {activeTab === "proyectos" && (
            <button
              type="button"
              onClick={() => setIsExportProjectsModalOpen(true)}
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-5 py-2 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" />
              Exportar Lis. Proy.
            </button>
          )}
          {activeTab === "intereses" && (
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-5 py-2 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          )}
        </div>
      </div>

      {activeTab === "proyectos" ? (
        <AdminProjectsPageLayout
          
          isAdmin={user?.role === "admin" || user?.role === "owner"}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          isFilterDropdownOpen={isFilterDropdownOpen}
          setIsFilterDropdownOpen={setIsFilterDropdownOpen}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          isLoading={isLoading}
          filtered={filtered}
          totalCount={totalCount ?? projects.length}
          metrics={metrics}
          updateStatus={handleUpdateStatus}
          deleteProject={handleDeleteProject}
          page={page}
          pageSize={pageSize}
          onPageChange={goToPage}
        />
      ) : activeTab === "publicados" ? (
        <AdminPublishedProjectsView />
      ) : activeTab === "intereses" ? (
        <AdminInterestsView />
      ) : (
        <AdminSavedProjectsView />
      )}
      <ExportInterestsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        intereses={intereses}
      />
      <ExportProjectsModal
        isOpen={isExportProjectsModalOpen}
        onClose={() => setIsExportProjectsModalOpen(false)}
      />
      
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onViewPlans={() => {
          setShowLimitModal(false);
          navigate("/admin/settings");
        }}
        limitType="projects"
        used={totalCount ?? projects.length}
        max={maxProjects}
      />
    </div>
  );
};
