import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProyectoDto } from "../../features/projects/types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { FolderKanban, Plus, Search } from "lucide-react";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProyectoDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsApi.getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        addToast("Error al cargar los proyectos", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [addToast]);

  const filteredProjects = projects.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigoInterno?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center" style={{ color: 'var(--color-text-strong)' }}>
            <FolderKanban className="mr-3 h-8 w-8" style={{ color: 'var(--color-brand-primary)' }} />
            Gestión de Proyectos
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-main)' }}>
            Lista de todos los proyectos inmobiliarios en el sistema.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/admin/projects/new"
            className="clay-btn-primary"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nuevo Proyecto
          </Link>
        </div>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5" style={{ color: 'var(--color-info)' }} aria-hidden="true" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border rounded-lg leading-5 focus:outline-none sm:text-sm transition-shadow"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-warm)', color: 'var(--color-text-strong)' }}
          placeholder="Buscar por nombre o código público..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12" style={{ color: 'var(--color-text-main)' }}>
          Cargando proyectos...
        </div>
      ) : (
        <div className="clay-card overflow-hidden">
          <ul className="divide-y" style={{ borderColor: 'var(--color-border-warm)' }}>
            {filteredProjects.length === 0 ? (
              <li className="px-6 py-12 text-center" style={{ color: 'var(--color-text-main)' }}>
                No se encontraron proyectos.
              </li>
            ) : (
              filteredProjects.map((project) => (
                <li key={project.id} style={{ borderBottom: '1px solid var(--color-border-warm)' }}>
                  <Link
                    to={`/admin/projects/${project.id}/edit`}
                    className="block transition-colors hover:bg-[var(--color-surface-alt)]"
                  >
                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-semibold truncate" style={{ color: 'var(--color-brand-primary)' }}>
                          {project.nombre}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border 
                            ${
                              project.estadoProyecto === 0
                                ? "bg-[var(--color-surface)] text-[var(--color-text-main)] border-[var(--color-border-warm)]"
                                : project.estadoProyecto === 2
                                  ? "bg-[var(--color-surface-alt)] text-[var(--color-highlight)] border-[var(--color-highlight)]"
                                  : project.estadoProyecto === 4
                                    ? "bg-[#e8ebf4] text-[var(--color-brand-primary)] border-[var(--color-info)]"
                                    : "bg-[var(--color-surface-alt)] text-[var(--color-text-strong)] border-[var(--color-accent-warm)]"
                            }`}
                          >
                            {project.estadoProyecto === 0
                              ? "Draft"
                              : project.estadoProyecto === 1
                                ? "Published"
                                : project.estadoProyecto === 2
                                  ? "In Review"
                                  : project.estadoProyecto === 3
                                    ? "Observed"
                                    : project.estadoProyecto === 4
                                      ? "Validated"
                                      : "Rejected"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm font-mono" style={{ color: 'var(--color-text-main)' }}>
                            Código: {project.codigoInterno || "N/A"}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm font-mono sm:mt-0" style={{ color: 'var(--color-text-main)' }}>
                          <p>
                            Actualizado el{" "}
                            {project.updatedAtUtc
                              ? new Date(
                                  project.updatedAtUtc,
                                ).toLocaleDateString()
                              : new Date(
                                  project.createdAtUtc,
                                ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
