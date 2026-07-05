import React from "react";
import { Link } from "react-router-dom";
import { ProjectStatus } from "../../features/projects/types";
import { Plus } from "lucide-react";
import { AdminProjectMetricsBar } from "./AdminProjectMetricsBar";
import { AdminProjectToolbar } from "./AdminProjectToolbar";
import { AdminProjectList } from "./AdminProjectList";

interface AdminProjectsPageLayoutProps {
  t: any;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  activeFilter: string;
  setActiveFilter: (v: string) => void;
  selectedStatuses: ProjectStatus[];
  setSelectedStatuses: (v: ProjectStatus[]) => void;
  isFilterDropdownOpen: boolean;
  setIsFilterDropdownOpen: (v: boolean) => void;
  openMenuId: string | null;
  setOpenMenuId: (v: string | null) => void;
  isLoading: boolean;
  filtered: any[];
  metrics: Array<{ label: string; value: number; icon: React.ComponentType<any>; color: string; bg: string; barColor: string; pct: number }>;
  updateStatus: (params: { id: string; status: ProjectStatus }) => void;
  deleteProject: (id: string) => void;
}

export const AdminProjectsPageLayout: React.FC<AdminProjectsPageLayoutProps> = ({
  t,
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  selectedStatuses,
  setSelectedStatuses,
  isFilterDropdownOpen,
  setIsFilterDropdownOpen,
  openMenuId,
  setOpenMenuId,
  isLoading,
  filtered,
  metrics,
  updateStatus,
  deleteProject,
}) => {
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

      <AdminProjectMetricsBar metrics={metrics} />

      <AdminProjectToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        isFilterDropdownOpen={isFilterDropdownOpen}
        setIsFilterDropdownOpen={setIsFilterDropdownOpen}
      />

      <AdminProjectList
        t={t}
        isLoading={isLoading}
        filtered={filtered}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        updateStatus={updateStatus}
        deleteProject={deleteProject}
      />
    </div>
  );
};
