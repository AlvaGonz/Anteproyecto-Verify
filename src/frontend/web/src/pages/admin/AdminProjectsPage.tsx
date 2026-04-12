import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProyectoDto, ProjectStatus, IntegrityStatus } from "../../features/projects/types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { FolderKanban, Plus, Search, ArrowRight, CheckCircle2, AlertTriangle, Timer } from "lucide-react";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";

const getStatusBadge = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.Draft: return { label: "Borrador", cls: "vf-badge-neutral" };
    case ProjectStatus.Published: return { label: "Publicado", cls: "vf-badge-success" };
    case ProjectStatus.InReview: return { label: "En Revision", cls: "vf-badge-warning" };
    case ProjectStatus.Observed: return { label: "Observado", cls: "vf-badge-accent" };
    case ProjectStatus.Validated: return { label: "Validado", cls: "vf-badge-primary" };
    case ProjectStatus.Rejected: return { label: "Rechazado", cls: "vf-badge-error" };
    default: return { label: "Desconocido", cls: "vf-badge-neutral" };
  }
};

const getIntegrityIcon = (status: IntegrityStatus) => {
  switch (status) {
    case IntegrityStatus.Verified: return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case IntegrityStatus.Failed: return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default: return <Timer className="w-4 h-4 text-amber-600" />;
  }
};

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProyectoDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await projectsApi.getProjects();
        setProjects(data);
      } catch {
        addToast("Error al cargar los proyectos", "error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [addToast]);

  const filtered = projects.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigoInterno?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-[var(--color-text-strong)]">
            <FolderKanban className="h-7 w-7 text-[var(--color-brand-primary)]" />
            Gestion de Proyectos
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-strong)] opacity-60">
            {projects.length} proyectos en el sistema.
          </p>
        </div>
        <Link to="/admin/projects/new" className="vf-btn-primary mt-4 sm:mt-0">
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </Link>
      </div>

      {/* Search */}
      <div className="vf-card-flat flex items-center gap-3 px-4 py-3 mb-6">
        <Search className="h-5 w-5 text-[var(--color-surface-muted)]" />
        <input
          type="text"
          className="vf-input border-0 bg-transparent p-0 focus:ring-0 focus:shadow-none"
          placeholder="Buscar por nombre o codigo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[var(--color-text-strong)] opacity-60">
          Cargando proyectos...
        </div>
      ) : (
        <div className="vf-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-[var(--color-text-strong)] opacity-60">
              No se encontraron proyectos.
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-surface-muted)]/30">
              {filtered.map((project) => {
                const badge = getStatusBadge(project.estadoProyecto);
                return (
                  <Link
                    key={project.id}
                    to={`/admin/projects/${project.id}/edit`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-[var(--color-surface-base)]/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getIntegrityIcon(project.estadoIntegridad)}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text-strong)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                          {project.nombre}
                        </p>
                        <p className="text-xs text-[var(--color-text-strong)] opacity-50 font-mono">
                          {project.codigoInterno} - Actualizado: {(project.updatedAtUtc ? new Date(project.updatedAtUtc) : new Date(project.createdAtUtc)).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      <span className={`vf-badge ${badge.cls}`}>{badge.label}</span>
                      <ArrowRight className="w-4 h-4 text-[var(--color-surface-muted)] group-hover:text-[var(--color-brand-primary)] transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
