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
      bgColor: "bg-[var(--color-brand-primary)]",
    },
    {
      name: "En Revision",
      stat: loading ? "..." : inReview.toString(),
      icon: FileCheck,
      bgColor: "bg-[var(--color-brand-accent-soft)]",
    },
    {
      name: "Observados",
      stat: loading ? "..." : observed.toString(),
      icon: AlertCircle,
      bgColor: "bg-[var(--color-brand-secondary)]",
    },
    {
      name: "Verificados",
      stat: loading ? "..." : verified.toString(),
      icon: TrendingUp,
      bgColor: "bg-emerald-600",
    },
  ];

  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
          Dashboard Operativo
        </h1>
        <Link to="/admin/projects/new" className="vf-btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => (
          <div key={item.name} className="vf-card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
              <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-strong)] opacity-60">{item.name}</p>
              <p className="text-2xl font-bold text-[var(--color-text-strong)]">{item.stat}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="vf-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-surface-muted)]/50">
            <h3 className="text-base font-bold text-[var(--color-text-strong)]">
              Proyectos Recientes
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-surface-muted)]/30">
            {recentProjects.length === 0 ? (
              <div className="p-5 text-sm text-[var(--color-text-strong)] opacity-50 text-center">
                No hay proyectos recientes.
              </div>
            ) : (
              recentProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/admin/projects/${p.id}/edit`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[var(--color-surface-base)]/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-strong)]">{p.nombre}</p>
                    <p className="text-xs text-[var(--color-text-strong)] opacity-50">
                      {new Date(p.createdAtUtc).toLocaleDateString()} - {p.codigoInterno}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--color-surface-muted)]" />
                </Link>
              ))
            )}
          </div>
          <div className="px-5 py-3 border-t border-[var(--color-surface-muted)]/50 bg-[var(--color-surface-base)]/30">
            <Link to="/admin/projects" className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="vf-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-surface-muted)]/50">
            <h3 className="text-base font-bold text-[var(--color-text-strong)]">
              Acciones Rapidas
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/admin/projects/new"
              className="vf-card-flat p-4 flex items-center gap-3 hover:bg-[var(--color-surface-muted)]/30 transition-colors group"
            >
              <FolderKanban className="w-5 h-5 text-[var(--color-brand-primary)]" />
              <span className="text-sm font-medium text-[var(--color-text-strong)]">Nuevo Proyecto</span>
            </Link>
            <Link
              to="/admin/projects"
              className="vf-card-flat p-4 flex items-center gap-3 hover:bg-[var(--color-surface-muted)]/30 transition-colors group"
            >
              <FileCheck className="w-5 h-5 text-[var(--color-brand-secondary)]" />
              <span className="text-sm font-medium text-[var(--color-text-strong)]">Revisar Expedientes</span>
            </Link>
            <Link
              to="/admin/rules"
              className="vf-card-flat p-4 flex items-center gap-3 hover:bg-[var(--color-surface-muted)]/30 transition-colors group"
            >
              <AlertCircle className="w-5 h-5 text-[var(--color-brand-accent)]" />
              <span className="text-sm font-medium text-[var(--color-text-strong)]">Reglas de Validacion</span>
            </Link>
            <Link
              to="/projects"
              className="vf-card-flat p-4 flex items-center gap-3 hover:bg-[var(--color-surface-muted)]/30 transition-colors group"
            >
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-[var(--color-text-strong)]">Ver Sitio Publico</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
