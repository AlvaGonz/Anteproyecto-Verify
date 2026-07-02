import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FolderKanban, FileCheck, AlertCircle, TrendingUp, Plus, ArrowRight, Shield, CreditCard, Users, LayoutDashboard, Calendar, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStats } from "../api/useDashboardStats";
import { useProjects } from "../../projects/api/useProjects";
import { ProyectoDto, ProjectStatus, IntegrityStatus } from "../../projects/types";
import { PlanActivatedBanner } from "../../pricing/components/PlanActivatedBanner";
import { PlanCapabilities } from "../../pricing/utils/planCapabilities";

type DashboardTab = "projects" | "subscriptions";

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

  const { data: rawProjects = [], isLoading: loadingProjects } = useProjects();

  const projects = useMemo(() =>
    rawProjects.map((p: any) => ({
      ...p,
      id: String(p.idProyecto || p.id),
      estadoProyecto: p.estadoProyecto as ProjectStatus,
      estadoIntegridad: p.estadoIntegridad as IntegrityStatus,
      createdAtUtc: p.fechaCreacion || p.createdAtUtc || new Date().toISOString()
    })) as unknown as ProyectoDto[],
  [rawProjects]);

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
          <Link to="/admin/projects" className="vf-btn-secondary h-12">
            Ver Listado
          </Link>
          <Link to="/admin/projects/new" className="vf-btn-primary h-12 shadow-md">
            <Plus className="w-5 h-5" />
            Nuevo Proyecto
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mt-4">
        <button
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

        <button
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

      <div className="pt-4">
        <AnimatePresence mode="wait">
          {activeTab === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Stats Section with Premium Gradients */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                {stats.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx, duration: 0.5 }}
                    className="vf-card p-0 overflow-hidden group hover:border-primary/40 transition-all shadow-sm"
                  >
                    <div className="p-6 flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500 overflow-hidden relative`}>
                        <div className={`absolute inset-0 opacity-10 ${item.bgColor}`}></div>
                        <div className={`absolute inset-0 bg-gradient-to-br from-white/40 to-transparent`}></div>
                        <item.icon className={`h-8 w-8 ${item.name === "Rechazados" ? "text-error" : item.name === "Aprobados" ? "text-success" : "text-primary"}`} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1 opacity-70">{item.name}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-display font-black text-text-primary tracking-tighter">{item.stat}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Projects */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="xl:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm"
                >
                  <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-raised/20">
                    <div>
                      <h3 className="text-xl font-display font-black text-[#223382] tracking-tight">
                        Proyectos <span className="text-[#F98513]">Recientes</span>
                      </h3>
                      <p className="text-xs text-text-secondary font-medium mt-0.5">Últimas actualizaciones en el sistema</p>
                    </div>
                  </div>

                  <div className="divide-y divide-border flex-1">
                    {loading ? (
                      <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223382]"></div></div>
                    ) : recentProjects.length === 0 ? (
                      <div className="py-20 text-sm text-text-secondary opacity-50 text-center flex flex-col items-center gap-3">
                        <FolderKanban className="w-10 h-10 opacity-20" />
                        No hay proyectos recientes.
                      </div>
                    ) : (
                      recentProjects.map((p, idx) => (
                        <motion.div
                          key={`${p.nombre}-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.05) }}
                        >
                          <div
                            className="flex items-center justify-between px-8 py-5 hover:bg-surface-raised/20 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center text-text-primary font-black text-xs group-hover:bg-[#9BACD8]/20 transition-colors">
                                {p.nombre.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-text-primary text-lg group-hover:text-[#223382] transition-colors leading-tight">{p.nombre}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-surface-raised text-text-secondary uppercase tracking-tighter">
                                    {p.desarrollador}
                                  </span>
                                  <span className="text-[10px] text-text-secondary opacity-60">
                                    {new Date(p.fechaRegistro).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="hidden sm:block text-right">
                                <span className={`vf-badge ${p.estado === 'Verified' ? 'vf-badge-success' : p.estado === 'InReview' ? 'vf-badge-warning' : 'vf-badge-default'}`}>
                                  {p.estado}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* Integrity Pulse */}
                <div className="flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: "800ms" }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[#223382] rounded-2xl p-6 text-white border-none shadow-md relative overflow-hidden flex-1 flex flex-col justify-between"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-display font-black tracking-tight">
                          Salud del <span className="text-[#F98513]">Sistema</span>
                        </h3>
                        <div className="px-2 py-0.5 rounded bg-[#F98513]/20 text-[#F98513] text-[8px] font-black uppercase tracking-widest">En Vivo</div>
                      </div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6">Proyectos aprobados vs total</p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-4">
                      <div>
                        <p className="text-4xl font-display font-black text-white leading-none">
                          {totalProjects > 0 ? ((verified / totalProjects) * 100).toFixed(1) : "0"}%
                        </p>
                        <p className="text-[8px] font-black text-white/30 uppercase mt-1 tracking-tighter">Convergencia de Aprobación</p>
                      </div>
                    </div>

                    {/* Background design element */}
                    <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12">
                      <Shield className="w-48 h-48" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "subscriptions" && (
            <motion.div
              key="subscriptions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-full bg-[#223382]/10 flex items-center justify-center">
                       <Users className="w-5 h-5 text-[#223382]" />
                     </div>
                     <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">Total Usuarios</p>
                   </div>
                   <p className="text-4xl font-display font-black text-text-primary">{loading ? "..." : statsData?.totalUsuarios}</p>
                </div>
                
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                       <Activity className="w-5 h-5 text-success" />
                     </div>
                     <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">Suscripciones Activas</p>
                   </div>
                   <p className="text-4xl font-display font-black text-text-primary">{loading ? "..." : statsData?.suscripcionesActivas}</p>
                </div>

                <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                       <FileCheck className="w-5 h-5 text-primary" />
                     </div>
                     <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Flujo: Consultas/Proyectos</p>
                   </div>
                   <div className="flex justify-between items-end mt-1">
                     <div>
                       <p className="text-xs text-text-secondary">Consultas</p>
                       <p className="text-2xl font-display font-black text-text-primary">{loading ? "..." : statsData?.totalConsultasRealizadas || 0}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-text-secondary">Proyectos</p>
                       <p className="text-2xl font-display font-black text-text-primary">{loading ? "..." : statsData?.totalProyectosRegistrados || 0}</p>
                     </div>
                   </div>
                </div>
                
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-full bg-[#F98513]/10 flex items-center justify-center">
                       <CreditCard className="w-5 h-5 text-[#F98513]" />
                     </div>
                     <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Flujo Mensual Estimado</p>
                   </div>
                   <p className="text-3xl font-display font-black text-text-primary">${loading ? "..." : statsData?.ingresosMensualesEstimados.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Distribucion de usuarios */}
                <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-border bg-surface-raised/20">
                    <h3 className="text-lg font-display font-black text-[#223382] tracking-tight">Flujo de <span className="text-[#F98513]">Usuarios</span></h3>
                    <p className="text-xs text-text-secondary">Distribución por categoría (Roles)</p>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-center gap-3">
                    {loading ? (
                       <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223382]"></div></div>
                    ) : statsData?.usuariosPorRol && Object.keys(statsData.usuariosPorRol).length > 0 ? (
                       Object.entries(statsData.usuariosPorRol).map(([rol, count]) => (
                         <div key={rol} className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-[#223382]"></div>
                             <span className="text-sm font-medium text-text-primary">{rol}</span>
                           </div>
                           <span className="text-sm font-bold bg-surface-raised px-2 py-0.5 rounded-full">{count}</span>
                         </div>
                       ))
                    ) : (
                      <div className="text-sm text-text-secondary text-center opacity-70">No hay datos de distribución</div>
                    )}
                  </div>
                </div>

                {/* Lista de Suscripciones recientes (2/3 width) */}
                <div className="lg:col-span-2 bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-raised/20">
                  <div>
                    <h3 className="text-xl font-display font-black text-[#223382] tracking-tight">
                      Suscripciones <span className="text-[#F98513]">Recientes</span>
                    </h3>
                    <p className="text-xs text-text-secondary font-medium mt-0.5">Usuarios nuevos en la plataforma</p>
                  </div>
                </div>
                
                <div className="divide-y divide-border">
                  {loading ? (
                      <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223382]"></div></div>
                  ) : recentSubscriptions.length === 0 ? (
                    <div className="py-20 text-sm text-text-secondary opacity-50 text-center flex flex-col items-center gap-3">
                      <Users className="w-10 h-10 opacity-20" />
                      No hay usuarios recientes.
                    </div>
                  ) : (
                    recentSubscriptions.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between px-8 py-5 hover:bg-surface-raised/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center text-text-primary font-black text-lg">
                            {s.correo.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary text-lg leading-tight">{s.correo}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                              <Calendar className="w-3 h-3" />
                              {new Date(s.fechaAlta).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#223382]">{s.plan}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${s.estado === 'Active' ? 'bg-success/20 text-success' : 'bg-surface-raised text-text-secondary'}`}>
                            {s.estado}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
};
