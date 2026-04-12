import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProyectoDto, ProjectStatus } from "../../features/projects/types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { ProjectForm } from "../../features/projects/components/ProjectForm";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { FileText, ShieldCheck, ClipboardList, ArrowRight } from "lucide-react";

export const ProjectManagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditing = !!id;

  const [project, setProject] = useState<ProyectoDto | undefined>(undefined);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      (async () => {
        try {
          const data = await projectsApi.getProjectById(id!);
          setProject(data);
        } catch {
          navigate("/admin/projects");
        } finally {
          setLoading(false);
        }
      })();
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
    } catch {
      addToast("Error al guardar el proyecto", "error");
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!id) return;
    try {
      await projectsApi.updateProjectStatus(id, status);
      const data = await projectsApi.getProjectById(id);
      setProject(data);
      addToast("Estado actualizado exitosamente", "success");
    } catch {
      addToast("Error al actualizar el estado", "error");
    }
  };

  if (loading)
    return <div className="text-center py-12 text-[var(--color-text-strong)] opacity-60">Cargando formulario...</div>;

  return (
    <div>
      <div className="max-w-2xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
          {isEditing ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
        </h1>
        <p className="text-sm mt-1 text-[var(--color-text-strong)] opacity-60">
          {isEditing ? "Modifica los datos del proyecto existente." : "Ingresa los datos basicos para registrar un nuevo proyecto."}
        </p>
      </div>

      <ProjectForm
        initialData={project}
        onSubmit={handleSubmit}
        onCancel={() => navigate(isEditing ? `/projects/${id}` : "/admin/projects")}
      />

      {isEditing && project && (
        <div className="max-w-2xl mx-auto mt-8 space-y-4">
          {/* Status management */}
          <div className="vf-card p-5">
            <h2 className="text-base font-bold text-[var(--color-text-strong)] mb-3">
              Gestion de Estado
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { status: ProjectStatus.Draft, label: "Borrador" },
                { status: ProjectStatus.InReview, label: "En Revision" },
                { status: ProjectStatus.Published, label: "Publicar" },
                { status: ProjectStatus.Observed, label: "Observar" },
              ].map((s) => (
                <button
                  key={s.status}
                  onClick={() => handleStatusChange(s.status)}
                  className="vf-btn-secondary text-sm py-2 px-4"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-strong)] opacity-50">
              Estado actual: <strong>{ProjectStatus[project.estadoProyecto]}</strong>
            </p>
          </div>

          {/* Quick nav cards */}
          {[
            {
              icon: FileText,
              title: "Expediente Documental",
              desc: "Gestiona los documentos asociados a este proyecto.",
              href: `/admin/projects/${id}/documents`,
              label: "Gestionar Documentos",
            },
            {
              icon: ShieldCheck,
              title: "Validacion Integral",
              desc: "Revisa el estado de validacion del expediente.",
              href: `/admin/projects/${id}/validations`,
              label: "Ver Validacion",
            },
            {
              icon: ClipboardList,
              title: "Reportes y Auditoria",
              desc: "Consulta el historial operativo y reportes.",
              href: `/admin/projects/${id}/reports`,
              label: "Ver Reportes",
            },
          ].map((item) => (
            <div
              key={item.href}
              className="vf-card p-5 flex items-center justify-between gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform"
              onClick={() => navigate(item.href)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[var(--color-brand-primary)]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-strong)]">{item.title}</h3>
                  <p className="text-xs text-[var(--color-text-strong)] opacity-50">{item.desc}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--color-surface-muted)]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
