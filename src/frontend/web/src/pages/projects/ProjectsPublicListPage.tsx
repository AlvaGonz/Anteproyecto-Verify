import React, { useEffect, useState } from "react";
import { ProyectoDto } from "../../features/projects/types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { ProjectList } from "../../features/projects/components/ProjectList";
import { Link } from "react-router-dom";

export const ProjectsPublicListPage: React.FC = () => {
  const [projects, setProjects] = useState<ProyectoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsApi.getProjects();
        setProjects(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar proyectos");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text-strong)' }}>
          Proyectos Inmobiliarios
        </h1>
        <Link
          to="/admin/projects/new"
          className="clay-btn-primary"
        >
          Crear Proyecto (Admin)
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--color-text-main)' }}>Cargando proyectos...</div>
      ) : error ? (
        <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-highlight)', border: '1px solid var(--color-highlight)' }}>{error}</div>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
};
