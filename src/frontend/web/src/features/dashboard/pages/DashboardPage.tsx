import React, { useState } from "react";
import { FolderKanban, FileCheck, AlertCircle, TrendingUp, Plus, ArrowRight, Shield, CreditCard, Users, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects } from "../../projects/api/useProjects";
import { ProyectoDto, ProjectStatus, IntegrityStatus } from "../../projects/types";

type DashboardTab = "projects" | "subscriptions";

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("projects");
  const { data: rawProjects = [], isLoading: loading } = useProjects();
  
  const projects = React.useMemo(() => {
    return rawProjects.map((p: any) => ({
      ...p,
      id: String(p.idProyecto || p.id),
      estadoProyecto: p.estadoProyecto as ProjectStatus,
      estadoIntegridad: p.estadoIntegridad as IntegrityStatus,
      createdAtUtc: p.fechaCreacion || p.createdAtUtc || new Date().toISOString()
    })) as unknown as ProyectoDto[];
  }, [rawProjects]);

  const totalProjects = projects.length;
  const inReview = projects.filter((p: any) => p.estadoProyecto === ProjectStatus.InReview).length;
  const observed = projects.filter((p: any) => p.estadoProyecto === ProjectStatus.Observed).length;
  const verified = projects.filter((p: any) => p.estadoIntegridad === IntegrityStatus.Verified).length;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const delta = ((current - previous) / previous) * 100;
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
  };

  const currentTotal = projects.filter((p: any) => new Date(p.createdAtUtc) >= thirtyDaysAgo).length;
  const prevTotal = projects.filter((p: any) => new Date(p.createdAtUtc) >= sixtyDaysAgo && new Date(p.createdAtUtc) < thirtyDaysAgo).length;
  
  const currentInReview = projects.filter((p: any) => p.estadoProyecto === ProjectStatus.InReview && new Date(p.createdAtUtc) >= thirtyDaysAgo).length;
  const prevInReview = projects.filter((p: any) => p.estadoProyecto === ProjectStatus.InReview && new Date(p.createdAtUtc) >= sixtyDaysAgo && new Date(p.createdAtUtc) < thirtyDaysAgo).length;
  
  const currentObserved = projects.filter((p: any) => p.estadoProyecto === ProjectStatus.Observed && new Date(p.createdAtUtc) >= thirtyDaysAgo).length;
  const prevObserved = projects.filter((p: any) => p.estadoProyecto === ProjectStatus.Observed && new Date(p.createdAtUtc) >= sixtyDaysAgo && new Date(p.createdAtUtc) < thirtyDaysAgo).length;
  
  const currentVerified = projects.filter((p: any) => p.estadoIntegridad === IntegrityStatus.Verified && new Date(p.createdAtUtc) >= thirtyDaysAgo).length;
  const prevVerified = projects.filter((p: any) => p.estadoIntegridad === IntegrityStatus.Verified && new Date(p.createdAtUtc) >= sixtyDaysAgo && new Date(p.createdAtUtc) < thirtyDaysAgo).length;

  const stats = [
    {
      name: "Total Proyectos",
      stat: loading ? "..." : totalProjects.toString(),
      delta: calculateGrowth(currentTotal, prevTotal),
      icon: FolderKanban,
      bgColor: "bg-secondary",
    },
    {
      name: "En Revision",
      stat: loading ? "..." : inReview.toString(),
      delta: calculateGrowth(currentInReview, prevInReview),
      icon: FileCheck,
      bgColor: "bg-primary",
    },
    {
      name: "Observados",
      stat: loading ? "..." : observed.toString(),
      delta: calculateGrowth(currentObserved, prevObserved),
      icon: AlertCircle,
      bgColor: "bg-error",
    },
    {
      name: "Verificados",
      stat: loading ? "..." : verified.toString(),
      delta: calculateGrowth(currentVerified, prevVerified),
      icon: TrendingUp,
      bgColor: "bg-success",
    },
  ];

  const trendData = React.useMemo(() => {
    if (!projects || projects.length === 0) {
      return [
        { label: 'L', value: 45 }, { label: 'M', value: 60 }, { label: 'M', value: 40 }, 
        { label: 'J', value: 85 }, { label: 'V', value: 55 }, { label: 'S', value: 75 }, { label: 'D', value: 95 }
      ];
    }

    const result = [];
    const today = new Date();
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - i);
      targetDate.setHours(23, 59, 59, 999);
      
      const dayName = dayNames[targetDate.getDay()];
      
      const verifiedUpToDate = projects.filter((p: any) => 
        p.estadoIntegridad === IntegrityStatus.Verified && 
        new Date(p.createdAtUtc) <= targetDate
      ).length;
      
      const totalUpToDate = projects.filter((p: any) => 
        new Date(p.createdAtUtc) <= targetDate
      ).length;
      
      let score = totalUpToDate > 0 ? (verifiedUpToDate / totalUpToDate) * 100 : 0;
      
      if (totalUpToDate === 0) {
         score = 20 + Math.random() * 30; // 20-50%
      }
      
      result.push({ label: dayName, value: score });
    }
    return result;
  }, [projects]);

  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())
    .slice(0, 5);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h1 className="text-4xl font-display font-black text-[#223382] tracking-tight">
            Dashboard <span className="text-[#F98513] italic">Operativo</span>
          </h1>
          <p className="text-text-secondary font-medium mt-1">Gestión avanzada de proyectos y suscripciones del sistema</p>
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
          Proyectos
        </button>

        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${
            activeTab === "subscriptions"
              ? "border-[#223382] text-[#223382]"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Suscripciones
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
                        <item.icon className={`h-8 w-8 ${item.name === "Observados" ? "text-error" : item.name === "Verificados" ? "text-success" : "text-primary"}`} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1 opacity-70">{item.name}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-display font-black text-text-primary tracking-tighter">{item.stat}</p>
                          <span className={`text-[10px] font-bold flex items-center ${item.delta.startsWith('+') ? 'text-success' : 'text-text-secondary opacity-50'}`}>
                            {item.delta}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-surface-raised">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: loading ? '0%' : '65%' }}
                        transition={{ delay: 0.5 + 0.1 * idx, duration: 1 }}
                        className={`h-full opacity-60 ${item.name === "Observados" ? "bg-error" : item.name === "Verificados" ? "bg-success" : "bg-primary"}`}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Projects - Spans 2 cols on wide screens */}
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
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Salud Promedio</span>
                        <span className="text-lg font-display font-black text-success leading-none">
                          {totalProjects > 0 ? ((verified / totalProjects) * 100).toFixed(1) : "0"}%
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-success/30 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-success" />
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-border flex-1">
                    {recentProjects.length === 0 ? (
                      <div className="py-20 text-sm text-text-secondary opacity-50 text-center flex flex-col items-center gap-3">
                        <FolderKanban className="w-10 h-10 opacity-20" />
                        No hay proyectos registrados aún.
                      </div>
                    ) : (
                      recentProjects.map((p, idx) => (
                        <motion.div
                          key={`${p.id}-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.05) }}
                        >
                          <Link
                            to={`/admin/projects/${p.id}/edit`}
                            className="flex items-center justify-between px-8 py-5 hover:bg-surface-raised/20 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center text-text-primary font-black text-xs group-hover:bg-[#9BACD8]/20 transition-colors">
                                {p.codigoInterno.substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-text-primary text-lg group-hover:text-[#223382] transition-colors leading-tight">{p.nombre}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-surface-raised text-text-secondary uppercase tracking-tighter">
                                    {p.codigoInterno}
                                  </span>
                                  <span className="text-[10px] text-text-secondary opacity-60">
                                    Subido el {new Date(p.createdAtUtc).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="hidden sm:block text-right">
                                <span className={`vf-badge ${p.estadoIntegridad === IntegrityStatus.Verified ? 'vf-badge-success' : 'vf-badge-warning'}`}>
                                  {p.estadoIntegridad}
                                </span>
                              </div>
                              <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-[#223382] group-hover:border-[#223382] group-hover:text-white transition-all text-text-secondary">
                                <ArrowRight className="w-5 h-5" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div className="px-8 py-5 border-t border-border bg-surface-raised/10">
                    <Link to="/admin/projects" className="text-sm font-black text-[#F98513] hover:text-[#F98513]/80 flex items-center justify-center gap-2 group transition-colors">
                      Explorar todos los expedientes <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>

                {/* Quick Actions & Market Pulse */}
                <div className="flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: "800ms" }}>
                  <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-display font-black text-text-primary tracking-tight mb-5 flex items-center gap-2">
                      Accesos Directos
                      <div className="h-px flex-1 bg-border ml-2"></div>
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <Link
                        to="/admin/projects/new"
                        className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-[#223382]/50 hover:bg-[#223382]/[0.02] transition-all group"
                      >
                        <div className="w-12 h-12 bg-[#223382]/10 rounded-xl flex items-center justify-center text-[#223382] group-hover:bg-[#223382] group-hover:text-white transition-all">
                          <Plus className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-text-primary uppercase tracking-tight">Crear Proyecto</p>
                          <p className="text-[10px] text-text-secondary font-medium">Inicia un nuevo expediente</p>
                        </div>
                      </Link>

                      <Link
                        to="/admin/settings"
                        className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-[#F98513]/50 hover:bg-[#F98513]/[0.02] transition-all group"
                      >
                        <div className="w-12 h-12 bg-[#F98513]/10 rounded-xl flex items-center justify-center text-[#F98513] group-hover:bg-[#F98513] group-hover:text-white transition-all">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-text-primary uppercase tracking-tight">Usuarios y Planes</p>
                          <p className="text-[10px] text-text-secondary font-medium">Gestión de usuarios</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[#223382] rounded-2xl p-6 text-white border-none shadow-md relative overflow-hidden flex-1 min-h-[280px] flex flex-col justify-between"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-display font-black tracking-tight">
                          Pulso de <span className="text-[#F98513]">Integridad</span>
                        </h3>
                        <div className="px-2 py-0.5 rounded bg-[#F98513]/20 text-[#F98513] text-[8px] font-black uppercase tracking-widest">En Vivo</div>
                      </div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6">Tendencia de validación semanal</p>

                      <div className="flex items-end gap-2 h-32 mb-6">
                        {trendData.map((point, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${point.value}%` }}
                              transition={{ delay: 0.8 + (i * 0.1), duration: 1, ease: "circOut" }}
                              className={`w-full rounded-t-md relative overflow-hidden ${i === 6 ? 'bg-[#F98513]' : 'bg-white/10 group-hover:bg-white/20 transition-colors'}`}
                            >
                              {i === 6 && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>}
                            </motion.div>
                            <span className="text-[8px] font-bold text-white/20 uppercase">
                              {point.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-4">
                      <div>
                        <p className="text-2xl font-display font-black text-white leading-none">
                          {totalProjects > 0 ? ((verified / totalProjects) * 100).toFixed(1) : "0"}%
                        </p>
                        <p className="text-[8px] font-black text-white/30 uppercase mt-1 tracking-tighter">Convergencia Catastral</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-display font-black text-[#F98513] leading-none">
                          {stats[3].delta}
                        </p>
                        <p className="text-[8px] font-black text-white/30 uppercase mt-1 tracking-tighter">Eficiencia Operativa</p>
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
              <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-8 text-center bg-surface-raised/30 border-b border-border">
                  <div className="w-16 h-16 bg-[#223382]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-[#223382]" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-[#223382]">Panel de Suscripciones</h2>
                  <p className="text-text-secondary mt-2 max-w-lg mx-auto">
                    Gestione los planes de suscripción (Consultation, Professional, Business, Enterprise) de sus usuarios.
                  </p>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                      <h4 className="font-bold text-text-primary mb-1">Enterprise</h4>
                      <p className="text-xs text-text-secondary mb-3">Organizaciones grandes</p>
                      <div className="text-3xl font-black text-[#223382]">Premium</div>
                    </div>
                    <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                      <h4 className="font-bold text-text-primary mb-1">Business</h4>
                      <p className="text-xs text-text-secondary mb-3">Empresas medianas</p>
                      <div className="text-3xl font-black text-[#F98513]">Avanzado</div>
                    </div>
                    <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                      <h4 className="font-bold text-text-primary mb-1">Professional</h4>
                      <p className="text-xs text-text-secondary mb-3">Desarrolladores/Agentes</p>
                      <div className="text-3xl font-black text-blue-600">Estándar</div>
                    </div>
                    <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                      <h4 className="font-bold text-text-primary mb-1">Consultation</h4>
                      <p className="text-xs text-text-secondary mb-3">Uso público y gratuito</p>
                      <div className="text-3xl font-black text-green-600">Gratis</div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link to="/admin/settings" className="vf-btn-primary mx-auto">
                      Ir a Gestionar Usuarios y Suscripciones
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
