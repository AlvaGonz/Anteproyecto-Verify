import React, { useState, useEffect, useCallback } from "react";
import { FolderKanban, FileCheck, AlertCircle, TrendingUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useDashboardStats } from "../api/useDashboardStats";
import { useProjects } from "../../projects/api/useProjects";
import { PlanCapabilities } from "../../pricing/utils/planCapabilities";
import { DashboardPageLayout, DashboardTab } from "./DashboardPageLayout";

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("projects");
  const location = useLocation();
  const [showBanner, setShowBanner] = useState<boolean>(!!(location.state as any)?.planJustActivated);
  const activatedPlan = (location.state as any)?.activatedPlan as PlanCapabilities | undefined;
  const handleDismissBanner = useCallback(() => setShowBanner(false), []);

  useEffect(() => {
    if ((location.state as any)?.planJustActivated) {
      window.history.replaceState({}, '', window.location.href);
    }
  }, [location.state]);

  useProjects();

  const { data: statsData, isLoading: loading } = useDashboardStats();

  const totalProjects = statsData?.totalProyectos || 0;
  const inReview = statsData?.proyectosPendientes || 0;
  const observed = statsData?.proyectosRechazados || 0;
  const verified = statsData?.proyectosAprobados || 0;

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

  const recentProjects = statsData?.proyectosRecientes || [];
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
