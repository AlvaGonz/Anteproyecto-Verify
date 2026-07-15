import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProjectStatus } from "../../features/projects/types";
import { useProjects, useDeleteProject, useUpdateProjectStatus } from "../../features/projects/api/useProjects";
import { Building, FileCheck, Activity } from "lucide-react";
import { AdminProjectsPageLayout } from "./AdminProjectsPageLayout";
import { toUtcDate } from "../../shared/utils/dates";

export const AdminProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = searchParams.get('q');
      if (q !== null) {
        setSearchTerm(q);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const { data: rawProjects = [], isLoading } = useProjects();
  const projects = rawProjects;

  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateStatus } = useUpdateProjectStatus();

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
      (p.createdAtUtc && toUtcDate(p.createdAtUtc)?.toLocaleDateString().includes(searchTerm)) ||
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
    <AdminProjectsPageLayout
      t={t}
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
    />
  );
};

