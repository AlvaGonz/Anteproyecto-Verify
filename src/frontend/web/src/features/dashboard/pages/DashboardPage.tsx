import React from "react";
import { FolderKanban, FileCheck, AlertCircle, TrendingUp, Plus, ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProjects } from "../../projects/api/useProjects";
import { ProyectoDto, ProjectStatus, IntegrityStatus } from "../../projects/types";

export const DashboardPage: React.FC = () => {
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

  const calculateGrowth = (currentNew: number, allTime: number) => {
    const previous = allTime - currentNew;
    if (previous === 0) return currentNew > 0 ? "+100%" : "0%";
    const delta = (currentNew / previous) * 100;
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
  };

  const newTotal = projects.filter((p: any) => new Date(p.createdAtUtc) >= thirtyDaysAgo).length;
  const newInReview = projects.filter((p: any) => p.estadoProyecto === ProjectStatus.InReview && new Date(p.createdAtUtc) >= thirtyDaysAgo).length;
  const newObserved = projects.filter((p: any) => p.estadoProyecto === ProjectStatus.Observed && new Date(p.createdAtUtc) >= thirtyDaysAgo).length;
  const newVerified = projects.filter((p: any) => p.estadoIntegridad === IntegrityStatus.Verified && new Date(p.createdAtUtc) >= thirtyDaysAgo).length;

  const stats = [
    {
      name: "Total Proyectos",
      stat: loading ? "..." : totalProjects.toString(),
      delta: calculateGrowth(newTotal, totalProjects),
      icon: FolderKanban,
      bgColor: "bg-secondary",
    },
    {
      name: "En Revision",
      stat: loading ? "..." : inReview.toString(),
      delta: calculateGrowth(newInReview, inReview),
      icon: FileCheck,
      bgColor: "bg-primary",
    },
    {
      name: "Observados",
      stat: loading ? "..." : observed.toString(),
      delta: calculateGrowth(newObserved, observed),
      icon: AlertCircle,
      bgColor: "bg-error",
    },
    {
      name: "Verificados",
      stat: loading ? "..." : verified.toString(),
      delta: calculateGrowth(newVerified, verified),
      icon: TrendingUp,
      bgColor: "bg-success",
    },
  ];

  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h1 className="text-4xl font-display font-black text-secondary tracking-tight">
            Dashboard <span className="text-primary italic">Operativo</span>
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">Gestión avanzada de integridad y transparencia inmobiliaria</p>
        </div>
        <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <Link to="/admin/projects" className="vf-btn-secondary h-12">
            Ver Listado
          </Link>
          <Link to="/admin/projects/new" className="vf-btn-primary h-12 shadow-premium">
            <Plus className="w-5 h-5" />
            Nuevo Proyecto
          </Link>
        </div>
      </div>

      {/* Stats Section with Premium Gradients */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((item, idx) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx, duration: 0.5 }}
            className="vf-card p-0 overflow-hidden group hover:border-primary/40 transition-all"
          >
            <div className="p-6 flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500 overflow-hidden relative`}>
                <div className={`absolute inset-0 opacity-20 ${item.bgColor}`}></div>
                <div className={`absolute inset-0 bg-gradient-to-br from-white/40 to-transparent`}></div>
                <item.icon className={`h-8 w-8 ${item.name === "Observados" ? "text-error" : item.name === "Verificados" ? "text-success" : "text-primary"}`} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1 opacity-70">{item.name}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-display font-black text-secondary tracking-tighter">{item.stat}</p>
                  <span className={`text-[10px] font-bold flex items-center ${item.delta.startsWith('+') ? 'text-success' : 'text-on-surface-variant opacity-50'}`}>
                    {item.delta}
                  </span>
                </div>
              </div>
            </div>
            <div className="h-1 w-full bg-surface-muted/30">
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
          className="xl:col-span-2 vf-card p-0 overflow-hidden flex flex-col"
        >
          <div className="px-8 py-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/30">
            <div>
              <h3 className="text-xl font-display font-black text-secondary tracking-tight">
                Proyectos <span className="text-primary">Recientes</span>
              </h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">Últimas actualizaciones en el sistema</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Salud Promedio</span>
                <span className="text-lg font-display font-black text-success leading-none">94.2%</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-success/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/10 flex-1">
            {recentProjects.length === 0 ? (
              <div className="py-20 text-sm text-on-surface-variant opacity-50 text-center flex flex-col items-center gap-3">
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
                    className="flex items-center justify-between px-8 py-5 hover:bg-primary/[0.03] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary font-black text-xs group-hover:bg-primary/10 transition-colors">
                        {p.codigoInterno.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-secondary text-lg group-hover:text-primary transition-colors leading-tight">{p.nombre}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant uppercase tracking-tighter`}>
                            {p.codigoInterno}
                          </span>
                          <span className="text-[10px] text-on-surface-variant opacity-60">
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
                      <div className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all text-outline">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          <div className="px-8 py-5 border-t border-outline-variant/20 bg-surface-container-lowest">
            <Link to="/admin/projects" className="text-sm font-black text-primary hover:text-primary-hover flex items-center justify-center gap-2 group transition-colors">
              Explorar todos los expedientes <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions & Market Pulse */}
        <div className="flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: "800ms" }}>
          <div className="vf-card p-6">
            <h3 className="text-lg font-display font-black text-secondary tracking-tight mb-5 flex items-center gap-2">
              Accesos Directos
              <div className="h-px flex-1 bg-outline-variant/20 ml-2"></div>
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/admin/projects/new"
                className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/50 hover:bg-primary/[0.02] transition-all group"
              >
                <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-secondary uppercase tracking-tight">Crear Proyecto</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Inicia un nuevo expediente</p>
                </div>
              </Link>

              <Link
                to="/admin/rules"
                className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/20 hover:border-secondary/50 hover:bg-secondary/[0.02] transition-all group"
              >
                <div className="w-12 h-12 bg-secondary-container/20 rounded-xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-secondary uppercase tracking-tight">Reglas de Control</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Configura normativas RI</p>
                </div>
              </Link>

              <Link
                to="/projects"
                className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/20 hover:border-success/50 hover:bg-success/[0.02] transition-all group"
              >
                <div className="w-12 h-12 bg-success-container/20 rounded-xl flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-all">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-secondary uppercase tracking-tight">Vista Pública</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Sitio de consulta ciudadana</p>
                </div>
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="vf-card p-6 bg-secondary text-white border-none shadow-premium relative overflow-hidden flex-1 min-h-[280px] flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-display font-black tracking-tight">
                  Pulso de <span className="text-primary">Integridad</span>
                </h3>
                <div className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">En Vivo</div>
              </div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6">Tendencia de validación semanal</p>

              <div className="flex items-end gap-2 h-32 mb-6">
                {[45, 60, 40, 85, 55, 75, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.8 + (i * 0.1), duration: 1, ease: "circOut" }}
                      className={`w-full rounded-t-md relative overflow-hidden ${i === 6 ? 'bg-primary' : 'bg-white/10 group-hover:bg-white/20 transition-colors'}`}
                    >
                      {i === 6 && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>}
                    </motion.div>
                    <span className="text-[8px] font-bold text-white/20 uppercase">
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
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
                <p className="text-2xl font-display font-black text-primary leading-none">
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
    </div>
  );
};
