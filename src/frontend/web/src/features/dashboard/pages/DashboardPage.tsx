import React, { useEffect, useState } from "react";
import { FolderKanban, FileCheck, AlertCircle, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { projectsApi } from "../../projects/api/projectsApi";
import { ProyectoDto, ProjectStatus, IntegrityStatus } from "../../projects/types";

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<ProyectoDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await projectsApi.getProjects();
        setProjects(data);
      } catch (e) {
        console.error("Error loading projects", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalProjects = projects.length;
  const inReview = projects.filter(p => p.estadoProyecto === ProjectStatus.InReview).length;
  const observed = projects.filter(p => p.estadoProyecto === ProjectStatus.Observed).length;
  const verified = projects.filter(p => p.estadoIntegridad === IntegrityStatus.Verified).length;

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
      name: "Observados",
      stat: loading ? "..." : observed.toString(),
      icon: AlertCircle,
      bgColor: "bg-error",
    },
    {
      name: "Verificados",
      stat: loading ? "..." : verified.toString(),
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
          <div 
            key={item.name} 
            className="vf-card p-0 overflow-hidden group hover:border-primary/40 transition-all animate-fade-in-up"
            style={{ animationDelay: `${300 + idx * 100}ms` }}
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
                  <span className="text-[10px] font-bold text-success flex items-center">+5%</span>
                </div>
              </div>
            </div>
            <div className="h-1 w-full bg-surface-muted/30">
              <div 
                className={`h-full opacity-60 ${item.name === "Observados" ? "bg-error" : item.name === "Verificados" ? "bg-success" : "bg-primary"}`}
                style={{ width: loading ? '0%' : '65%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Projects - Spans 2 cols on wide screens */}
        <div className="xl:col-span-2 vf-card p-0 overflow-hidden flex flex-col animate-fade-in-up" style={{ animationDelay: "700ms" }}>
          <div className="px-8 py-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/30">
            <div>
              <h3 className="text-xl font-display font-black text-secondary tracking-tight">
                Proyectos <span className="text-primary">Recientes</span>
              </h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">Últimas actualizaciones en el sistema</p>
            </div>
            <div className="flex gap-2">
              <span className="vf-badge vf-badge-neutral">Último mes</span>
            </div>
          </div>
          
          <div className="divide-y divide-outline-variant/10 flex-1">
            {recentProjects.length === 0 ? (
              <div className="py-20 text-sm text-on-surface-variant opacity-50 text-center flex flex-col items-center gap-3">
                <FolderKanban className="w-10 h-10 opacity-20" />
                No hay proyectos registrados aún.
              </div>
            ) : (
              recentProjects.map((p) => (
                  <Link
                    key={p.id}
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
              ))
            )}
          </div>
          
          <div className="px-8 py-5 border-t border-outline-variant/20 bg-surface-container-lowest">
            <Link to="/admin/projects" className="text-sm font-black text-primary hover:text-primary-hover flex items-center justify-center gap-2 group transition-colors">
              Explorar todos los expedientes <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

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

          <div className="vf-card p-6 bg-secondary text-white border-none shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Shield className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-display font-black tracking-tight mb-2">
                Sello de Integridad
              </h3>
              <p className="text-white/60 text-xs font-medium mb-6 leading-relaxed">
                El algoritmo de VeriFinca asegura que todas las propiedades cumplan con la Ley 126-02 de Comercio Electrónico y Firmas Digitales.
              </p>
              <div className="flex items-center gap-3">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-secondary bg-surface-variant flex items-center justify-center text-[10px] font-bold text-secondary">
                        {i}
                      </div>
                    ))}
                 </div>
                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Verificadores activos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
