import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProyectoDto, ProjectStatus } from "../../features/projects/types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { ProjectForm } from "../../features/projects/components/ProjectForm";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";

export const ProjectManagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditing = !!id;

  const [project, setProject] = useState<ProyectoDto | undefined>(undefined);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      const fetchProject = async () => {
        try {
          const data = await projectsApi.getProjectById(id!);
          setProject(data);
        } catch (err) {
          console.error("Error fetching project", err);
          navigate("/projects");
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (data: any) => {
    try {
      if (isEditing) {
        await projectsApi.updateProject(id!, data);
        addToast("Proyecto actualizado exitosamente", "success");
        navigate(`/projects/${id}`);
      } else {
        const newProject = await projectsApi.createProject(data);
        addToast("Proyecto creado exitosamente", "success");
        navigate(`/projects/${newProject.id}`);
      }
    } catch (error) {
      addToast("Error al guardar el proyecto", "error");
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!id) return;
    try {
      await projectsApi.updateProjectStatus(id, status);
      // Reload project
      const data = await projectsApi.getProjectById(id);
      setProject(data);
      addToast("Estado actualizado exitosamente", "success");
    } catch (err) {
      console.error("Error updating status", err);
      addToast("Error al actualizar el estado", "error");
    }
  };

  if (loading)
    return <div className="text-center py-12" style={{ color: 'var(--color-text-main)' }}>Cargando formulario...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-strong)' }}>
          {isEditing ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-main)' }}>
          {isEditing
            ? "Modifica los datos del proyecto existente."
            : "Ingresa los datos básicos para registrar un nuevo proyecto."}
        </p>
      </div>

      <ProjectForm
        initialData={project}
        onSubmit={handleSubmit}
        onCancel={() => navigate(isEditing ? `/projects/${id}` : "/projects")}
      />

      {isEditing && project && (
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
          <div className="clay-card p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-strong)' }}>
              Gestión de Estado
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleStatusChange(ProjectStatus.Draft)}
                className="clay-btn-secondary"
              >
                Borrador
              </button>
              <button
                onClick={() => handleStatusChange(ProjectStatus.InReview)}
                className="clay-btn-secondary"
                style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-highlight)', borderColor: 'var(--color-highlight)' }}
              >
                En Revisión
              </button>
              <button
                onClick={() => handleStatusChange(ProjectStatus.Published)}
                className="clay-btn-secondary"
                style={{ backgroundColor: '#e8ebf4', color: 'var(--color-brand-primary)', borderColor: 'var(--color-info)' }}
              >
                Publicar
              </button>
              <button
                onClick={() => handleStatusChange(ProjectStatus.Observed)}
                className="clay-btn-secondary"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }}
              >
                Observar
              </button>
            </div>
            <p className="text-sm mt-4" style={{ color: 'var(--color-text-main)' }}>
              Estado actual:{" "}
              <strong style={{ color: 'var(--color-text-strong)' }}>{ProjectStatus[project.estadoProyecto]}</strong>
            </p>
          </div>

          <div className="clay-card p-6 flex justify-between items-center" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-strong)' }}>
                Expediente Documental
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-main)' }}>
                Gestiona los documentos asociados a este proyecto.
              </p>
            </div>
            <button
              onClick={() => navigate(`/admin/projects/${id}/documents`)}
              className="clay-btn-primary"
            >
              Gestionar Documentos
            </button>
          </div>

          <div className="clay-card p-6 flex justify-between items-center" style={{ backgroundColor: '#e8ebf4' }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-brand-primary)' }}>
                Validación Interna
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-brand-primary)' }}>
                Revisa el estado de validación del expediente.
              </p>
            </div>
            <button
              onClick={() => navigate(`/admin/projects/${id}/validations`)}
              className="clay-btn-primary"
            >
              Ver Validación
            </button>
          </div>

          <div className="clay-card p-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-strong)' }}>
                Reportes y Auditoría
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-main)' }}>
                Consulta el historial operativo y reportes.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/admin/projects/${id}/reports`)}
                className="clay-btn-primary"
              >
                Ver Reportes
              </button>
              <button
                onClick={() => navigate(`/admin/projects/${id}/audit`)}
                className="clay-btn-secondary"
              >
                Ver Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
