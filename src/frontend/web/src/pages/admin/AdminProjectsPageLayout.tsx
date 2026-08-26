import React from "react";
import { ProjectStatus } from "../../features/projects/types";
import { AdminProjectMetricsBar } from "./AdminProjectMetricsBar";
import { AdminProjectToolbar } from "./AdminProjectToolbar";
import { AdminProjectList } from "./AdminProjectList";

interface AdminProjectsPageLayoutProps {
  isAdmin: boolean;
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
  totalCount: number;
  metrics: Array<{ label: string; value: number; icon: React.ComponentType<any>; color: string; bg: string; barColor: string; pct: number }>;
  updateStatus: (params: { id: string; status: ProjectStatus }) => void;
  deleteProject: (id: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
}

export const AdminProjectsPageLayout: React.FC<AdminProjectsPageLayoutProps> = React.memo(({  isAdmin,
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
  totalCount,
  metrics,
  updateStatus,
  deleteProject,
  page,
  pageSize,
  onPageChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  return (
    <div className="space-y-6">
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
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <AdminProjectList
        
        isAdmin={isAdmin}
        isLoading={isLoading}
        filtered={filtered}
        totalCount={totalCount}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        updateStatus={updateStatus}
        deleteProject={deleteProject}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
});
