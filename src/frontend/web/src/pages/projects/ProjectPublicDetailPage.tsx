import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ProyectoDto,
  ProjectStatus,
  IntegrityStatus,
} from "../../features/projects/types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { PublicProjectReport } from "../../features/reports/components/PublicProjectReport";
import { ProjectDocumentStatus } from "../../features/documents/components/ProjectDocumentStatus";
import { documentsApi } from "../../features/documents/api/documentsApi";
import { DocumentStatus } from "../../features/documents/types";

export const ProjectPublicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProyectoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allVerified, setAllVerified] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectAndDocs = async () => {
      try {
        if (!id) return;
        const data = await projectsApi.getProjectById(id);
        setProject(data);
        
        const docs = await documentsApi.getProjectDocuments(id);
        const isAllVerified = docs.length >= 20 && docs.every(d => d.estadoDocumento === DocumentStatus.Valid);
        setAllVerified(isAllVerified);
      } catch (err: any) {
        setError(err.message || "Error al cargar el proyecto");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndDocs();
  }, [id]);

  if (loading)
    return <div className="text-center py-12">Cargando detalle...</div>;
  if (error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      </div>
    );
  if (!project)
    return <div className="text-center py-12">Proyecto no encontrado</div>;

  const displayStatus = project.estadoProyecto === ProjectStatus.Validated
    ? (allVerified ? "Verified" : "Pending Verification")
    : ProjectStatus[project.estadoProyecto];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/projects" className="font-medium hover:underline" style={{ color: 'var(--color-brand-primary)' }}>
          &larr; Volver al listado
        </Link>
        <Link
          to={`/admin/projects/${project.id}/edit`}
          className="clay-btn-secondary"
        >
          Editar (Admin)
        </Link>
      </div>

      <div className="clay-card overflow-hidden">
        <div className="px-8 py-6 border-b" style={{ borderColor: 'var(--color-border-warm)' }}>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-strong)' }}>{project.nombre}</h1>
          <p className="text-sm mt-2 font-mono" style={{ color: 'var(--color-text-main)' }}>
            Código: {project.codigoInterno}
          </p>
        </div>

        <div className="px-8 py-6">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>Ubicación</dt>
              <dd className="mt-1 text-base font-medium" style={{ color: 'var(--color-text-strong)' }}>
                {project.ubicacionTexto}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                Coordenadas GPS
              </dt>
              <dd className="mt-1 text-base font-mono" style={{ color: 'var(--color-text-strong)' }}>
                {project.ubicacionGps || "No registradas"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                Desarrollador
              </dt>
              <dd className="mt-1 text-base font-medium" style={{ color: 'var(--color-text-strong)' }}>
                {project.datosDesarrollador || "No especificado"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                Designación Catastral
              </dt>
              <dd className="mt-1 text-base font-mono" style={{ color: 'var(--color-text-strong)' }}>
                {project.designacionCatastral || "No especificada"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                Estado del Proyecto
              </dt>
              <dd className="mt-1 text-base font-semibold" style={{ color: 'var(--color-brand-primary)' }}>
                {displayStatus}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                Estado de Integridad
              </dt>
              <dd className="mt-1 text-base font-semibold" style={{ color: 'var(--color-accent-cool)' }}>
                {IntegrityStatus[project.estadoIntegridad]}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                Valor Estimado
              </dt>
              <dd className="mt-1 text-base font-mono" style={{ color: 'var(--color-text-strong)' }}>
                {project.valorEstimado
                  ? `$${project.valorEstimado.toLocaleString()}`
                  : "No especificado"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                Fecha de Registro
              </dt>
              <dd className="mt-1 text-base font-mono" style={{ color: 'var(--color-text-strong)' }}>
                {new Date(project.createdAtUtc).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <ProjectDocumentStatus projectId={project.id} projectCategory={project.categoria} />

      <div className="mt-10">
        <PublicProjectReport projectId={project.id} />
      </div>
    </div>
  );
};
