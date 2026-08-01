import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProjectStatus } from "../../features/projects/types";
import { useProjects, useDeleteProject, useUpdateProjectStatus } from "../../features/projects/api/useProjects";
import { useDashboardStats } from "../../features/dashboard/api/useDashboardStats";
import { Plus, Building, FileCheck, Activity } from "lucide-react";
import { AdminProjectsPageLayout } from "./AdminProjectsPageLayout";
import { AdminPublishedProjectsView } from "./AdminPublishedProjectsView";
import { AdminInterestsView } from "./AdminInterestsView";
import { AdminSavedProjectsView } from "./AdminSavedProjectsView";
import { toUtcDate } from "../../shared/utils/dates";
import { useAuth } from "../../shared/context/AuthContext";
import { Download } from "lucide-react";
import { useInterests } from "../../features/projects/api/useProjectsInteractions";
import { ExportInterestsModal } from "./ExportInterestsModal";
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
  const { t } = useTranslation();
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
  const [pageSize] = useState(1000);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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

  const { data: rawProjects = [], totalCount, isLoading } = useProjects(page, pageSize);
  const projects = rawProjects;

  const [showLimitModal, setShowLimitModal] = useState(false);
  const userPlan = user?.plan || "Consultor";
  const maxProjects = PLAN_LIMITS[userPlan] ?? 1;
  const isAtLimit = maxProjects !== 999999 && (totalCount ?? projects.length) >= maxProjects;

  const { data: dashboardStats } = useDashboardStats();

  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateStatus } = useUpdateProjectStatus();

  const stats = {
    total: dashboardStats?.totalProyectos ?? totalCount ?? projects.length,
    published: dashboardStats?.proyectosAprobados ?? projects.filter(p => p.estadoProyecto === ProjectStatus.Published).length,
    pending: dashboardStats?.proyectosPendientes ?? projects.filter(p => p.estadoProyecto === ProjectStatus.InReview).length
  };

  const totalValue = stats.total || 1;
  const metrics = [
    { label: "Total Proyectos", value: stats.total, icon: Building, color: "text-blue-600", bg: "bg-blue-50", barColor: "bg-blue-500", pct: 100 },
    { label: "En Revisión", value: stats.pending, icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50", barColor: "bg-indigo-500", pct: stats.total ? Math.round((stats.pending / totalValue) * 100) : 0 },
    { label: "Publicados", value: stats.published, icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50", barColor: "bg-emerald-500", pct: stats.total ? Math.round((stats.published / totalValue) * 100) : 0 },
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
      (p.createdAtUtc && toUtcDate(p.createdAtUtc)?.toLocaleDateString().includes(searchTerm)) ||
      (p.valorEstimado && String(p.valorEstimado).includes(searchTerm));

    if (selectedStatuses.length > 0) {
      return matchesSearch && selectedStatuses.includes(p.estadoProyecto);
    }

    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "published") return matchesSearch && p.estadoProyecto === ProjectStatus.Published;
    if (activeFilter === "review") return matchesSearch && p.estadoProyecto === ProjectStatus.InReview;
    return matchesSearch;
  });

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
          <Link
            to="/admin/projects/new"
            onClick={(e) => {
              if (isAtLimit && user?.role !== "admin") {
                e.preventDefault();
                setShowLimitModal(true);
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nuevo Expediente
          </Link>
        )}
        {activeTab === "intereses" && (
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
        )}
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab("proyectos");
            window.history.replaceState(null, '', '/#/admin/projects?tab=proyectos');
          }}
          className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "proyectos"
              ? "border-[#223382] text-[#223382]"
              : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
        >
          Proyectos
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("publicados");
            window.history.replaceState(null, '', '/#/admin/projects?tab=publicados');
          }}
          className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "publicados"
              ? "border-[#223382] text-[#223382]"
              : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
        >
          Proy. Publicados
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("intereses");
            window.history.replaceState(null, '', '/#/admin/projects?tab=intereses');
          }}
          className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "intereses"
              ? "border-[#223382] text-[#223382]"
              : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
        >
          Intereses
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("guardados");
            window.history.replaceState(null, '', '/#/admin/projects?tab=guardados');
          }}
          className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "guardados"
              ? "border-[#223382] text-[#223382]"
              : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
        >
          Proy. Guardados
        </button>
      </div>

      {activeTab === "proyectos" ? (
        <AdminProjectsPageLayout
          t={t}
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
          metrics={metrics}
          updateStatus={updateStatus}
          deleteProject={deleteProject}
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
