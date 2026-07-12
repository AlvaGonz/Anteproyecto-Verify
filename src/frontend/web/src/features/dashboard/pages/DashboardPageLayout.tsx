import React, { useEffect } from "react";
import { Plus, LayoutDashboard, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import { PlanActivatedBanner } from "../../pricing/components/PlanActivatedBanner";
import type { PlanCapabilities } from "../../pricing/utils/planCapabilities";
import type { DashboardStatsDto, ProyectoRecienteDto, SuscripcionRecienteDto } from "../../../infrastructure/api/dashboard.api";
import { DashboardStatsRow } from "./DashboardStatsRow";
import { DashboardCharts } from "./DashboardCharts";
import { DashboardProjectList } from "./DashboardProjectList";
import { DashboardRecentActivity } from "./DashboardRecentActivity";
import type { StatItem } from "./DashboardStatsRow";
import { useAuth } from "../../../shared/context/AuthContext";

export type DashboardTab = "projects" | "subscriptions";

interface DashboardPageLayoutProps {
  showBanner: boolean;
  activatedPlan: PlanCapabilities | undefined;
  handleDismissBanner: () => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  stats: StatItem[];
  loading: boolean;
  recentProjects: ProyectoRecienteDto[];
  recentSubscriptions: SuscripcionRecienteDto[];
  totalProjects: number;
  verified: number;
  statsData: DashboardStatsDto | undefined;
}

export const DashboardPageLayout: React.FC<DashboardPageLayoutProps> = ({
  showBanner,
  activatedPlan,
  handleDismissBanner,
  activeTab,
  setActiveTab,
  stats,
  loading,
  recentProjects,
  recentSubscriptions,
  totalProjects,
  verified,
  statsData,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  // ponytail: Auto fallback to projects tab if a non-admin has activeTab set to subscriptions
  useEffect(() => {
    if (!isAdmin && activeTab === "subscriptions") {
      setActiveTab("projects");
    }
  }, [isAdmin, activeTab, setActiveTab]);

  return (
    <div className="animate-fade-in">
      {showBanner && activatedPlan && (
        <div className="max-w-4xl mx-auto px-4 pt-4 mb-4">
          <PlanActivatedBanner plan={activatedPlan} onDismiss={handleDismissBanner} />
        </div>
      )}
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <h1 className="text-4xl font-display font-black text-[#223382] tracking-tight">
              Dashboard <span className="text-[#F98513] italic">Operativo</span>
            </h1>
            <p className="text-text-secondary font-medium mt-1">Gestión avanzada de proyectos y usuarios del sistema</p>
          </div>
          <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {activeTab === "projects" ? (
              <>
                <Link to="/admin/projects" className="vf-btn-secondary h-12">
                  Ver Listado
                </Link>
                <Link to="/admin/projects/new" className="vf-btn-primary h-12 shadow-md">
                  <Plus className="w-5 h-5" />
                  Nuevo Proyecto
                </Link>
              </>
            ) : (
              <Link to="/admin/settings" state={{ tab: "users" }} className="vf-btn-secondary h-12 mx-auto">
                <Users className="w-5 h-5 mr-2 inline" />
                Ver Lista de Usuarios
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        {isAdmin && (
          <div className="flex border-b border-border mt-4">
            <button type="button"
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${
                activeTab === "projects"
                  ? "border-[#223382] text-[#223382]"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Flujo de Proyectos
            </button>

            <button type="button"
              onClick={() => setActiveTab("subscriptions")}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${
                activeTab === "subscriptions"
                  ? "border-[#223382] text-[#223382]"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Users className="w-4 h-4" />
              Flujo de Usuarios
            </button>
          </div>
        )}

        <div className="pt-4">
          <AnimatePresence mode="wait">
            {activeTab === "projects" && (
              <m.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DashboardStatsRow stats={stats} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <DashboardProjectList loading={loading} recentProjects={recentProjects} />
                  <DashboardCharts totalProjects={totalProjects} verified={verified} />
                </div>
              </m.div>
            )}

            {activeTab === "subscriptions" && isAdmin && (
              <m.div
                key="subscriptions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DashboardRecentActivity
                  loading={loading}
                  statsData={statsData}
                  recentSubscriptions={recentSubscriptions}
                />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
