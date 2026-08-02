import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FolderKanban, FileCheck, AlertCircle, TrendingUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useDashboardStats } from "../api/useDashboardStats";

import { DashboardPageLayout, DashboardTab } from "./DashboardPageLayout";
import type { ProyectoRecienteDto } from "../../../infrastructure/api/dashboard.api";

const TAB_STORAGE_KEY = "adminDashboardTab";

export const DashboardPage: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    const stored = localStorage.getItem(TAB_STORAGE_KEY);
    return stored === "subscriptions" ? "subscriptions" : "projects";
  });
  useEffect(() => { localStorage.setItem(TAB_STORAGE_KEY, activeTab); }, [activeTab]);
  const location = useLocation();
  const [showBanner, setShowBanner] = useState<boolean>(!!(location.state as any)?.planJustActivated);
  const activatedPlan = (location.state as any)?.activatedPlan as string | undefined;
  const handleDismissBanner = useCallback(() => setShowBanner(false), []);

  useEffect(() => {
    if ((location.state as any)?.planJustActivated) {
      window.history.replaceState({}, '', window.location.href);
    }
  }, [location.state]);

  const { data: statsData, isLoading: loading } = useDashboardStats();

  const { totalProjects, inReview, verified, offers, recentProjects } = useMemo(() => {
    if (!statsData) return { totalProjects: 0, inReview: 0, verified: 0, offers: 0, recentProjects: [] as ProyectoRecienteDto[] };
    return {
      totalProjects: statsData.totalProyectos || 0,
      inReview: statsData.proyectosPendientes || 0,
      verified: statsData.proyectosAprobados || 0,
      offers: statsData.totalOfertas || 0,
      recentProjects: statsData.proyectosRecientes || [],
    };
  }, [statsData]);

  const stats = useMemo(() => [
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
      name: "Publicados",
      stat: loading ? "..." : verified.toString(),
      icon: TrendingUp,
      bgColor: "bg-success",
    },
    {
      name: "Ofertas",
      stat: loading ? "..." : offers.toString(),
      icon: AlertCircle,
      bgColor: "bg-warning",
    },
  ], [loading, totalProjects, inReview, verified, offers]);

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
});
