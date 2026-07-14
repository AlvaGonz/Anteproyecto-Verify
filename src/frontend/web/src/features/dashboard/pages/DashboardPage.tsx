import React, { useState, useEffect, useCallback } from "react";
import { FolderKanban, FileCheck, AlertCircle, TrendingUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useDashboardStats } from "../api/useDashboardStats";
import { useProjects } from "../../projects/api/useProjects";
import { PlanCapabilities } from "../../pricing/utils/planCapabilities";
import { DashboardPageLayout, DashboardTab } from "./DashboardPageLayout";
import { useAuth } from "../../../shared/context/AuthContext";
import { ProjectStatus } from "../../projects/types";
import type { ProyectoRecienteDto } from "../../../infrastructure/api/dashboard.api";
import { toUtcDate } from "../../../shared/utils/dates";

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("projects");
  const location = useLocation();
  const [showBanner, setShowBanner] = useState<boolean>(!!(location.state as any)?.planJustActivated);
  const activatedPlan = (location.state as any)?.activatedPlan as PlanCapabilities | undefined;
  const handleDismissBanner = useCallback(() => setShowBanner(false), []);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  useEffect(() => {
    if ((location.state as any)?.planJustActivated) {
      window.history.replaceState({}, '', window.location.href);
    }
  }, [location.state]);

  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const { data: statsData, isLoading: loadingStats } = useDashboardStats();

  const loading = isAdmin ? loadingStats : loadingProjects;

  let totalProjects = 0;
  let inReview = 0;
  let observed = 0;
  let verified = 0;
  let recentProjects: ProyectoRecienteDto[] = [];

  if (isAdmin && statsData) {
    totalProjects = statsData.totalProyectos || 0;
    inReview = statsData.proyectosPendientes || 0;
    observed = statsData.proyectosRechazados || 0;
    verified = statsData.proyectosAprobados || 0;
    recentProjects = statsData.proyectosRecientes || [];
  } else if (!isAdmin && projectsData) {
    totalProjects = projectsData.length;
    inReview = projectsData.filter(p => p.estadoProyecto === ProjectStatus.InReview).length;
    observed = projectsData.filter(p => p.estadoProyecto === ProjectStatus.Observed).length;
    verified = projectsData.filter(p => p.estadoProyecto === ProjectStatus.Validated).length;
    recentProjects = [...projectsData]
      .sort((a, b) => (toUtcDate(b.createdAtUtc)?.getTime() ?? 0) - (toUtcDate(a.createdAtUtc)?.getTime() ?? 0))
      .slice(0, 5)
      .map(p => ({
        fechaRegistro: p.createdAtUtc,
        nombre: p.nombre,
        desarrollador: p.rncDesarrollador || "",
        estado: p.estadoProyecto === ProjectStatus.Validated ? "Aprobado" : p.estadoProyecto === ProjectStatus.Observed ? "Rechazado" : "En Revisión"
      }));
  }

  const stats = [
    {
      name: "Total Proyectos",
      stat: loading ? "..." : totalProjects.toString(),
      icon: FolderKanban,
      bgColor: "bg-secondary",
    },
    {
      name: "En Revision",
      stat: loading ? "..." : inReview.toString(),
      icon: FileCheck,
      bgColor: "bg-primary",
    },
    {
      name: "Rechazados",
      stat: loading ? "..." : observed.toString(),
      icon: AlertCircle,
      bgColor: "bg-error",
    },
    {
      name: "Aprobados",
      stat: loading ? "..." : verified.toString(),
      icon: TrendingUp,
      bgColor: "bg-success",
    },
  ];

  const recentSubscriptions = statsData?.suscripcionesRecientes || [];

  return (
    <DashboardPageLayout
      showBanner={showBanner}
      activatedPlan={activatedPlan}
      handleDismissBanner={handleDismissBanner}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      stats={stats}
      loading={loading}
      recentProjects={recentProjects}
      recentSubscriptions={recentSubscriptions}
      totalProjects={totalProjects}
      verified={verified}
      statsData={statsData}
    />
  );
};
