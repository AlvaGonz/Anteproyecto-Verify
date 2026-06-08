import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ProyectoDto, 
  ProjectStatus, 
  CreateProyectoDto, 
  UpdateProyectoDto
} from "../../features/projects/types";
import { useProject, useCreateProject } from "../../features/projects/api/useProjects";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/client";
import { ProjectForm } from "../../features/projects/components/ProjectForm";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { FileText, ShieldCheck, ClipboardList, ArrowRight } from "lucide-react";

const validateProjectData = (data: CreateProyectoDto | UpdateProyectoDto) => {
  if (!data) {
    throw new Error("Invalid project data");
  }
};

const sanitizeStatus = (status: ProjectStatus) => {
  if (!Object.values(ProjectStatus).includes(status)) {
    throw new Error("Invalid project status");
  }
  return status;
};

export const ProjectManagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditing = !!id;

  const { data: rawProject, isLoading: loading } = useProject(Number(id));
  const project = rawProject;
  
  const createMutation = useCreateProject();
  
  const qc = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: any }) => 
      apiClient.put<ProyectoDto>(`/projects/${data.id}`, data.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: number; status: string }) => 
      apiClient.patch<ProyectoDto>(`/projects/${data.id}/status`, { status: data.status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const handleSubmit = async (data: CreateProyectoDto | UpdateProyectoDto) => {
    try {
      validateProjectData(data);
      if (isEditing) {
        if (data.categoria == null) {
          throw new Error("Missing required field: categoria");
        }
        await updateMutation.mutateAsync({ id: Number(id), payload: data });
        addToast("Proyecto actualizado exitosamente", "success");
        navigate(`/projects/${id}`);
      } else {
        if (!("usuarioCreadorId" in data) || !data.usuarioCreadorId) {
          throw new Error("Missing required field: usuarioCreadorId");
        }
        const created = await createMutation.mutateAsync({
          nombre: data.nombre,
          ubicacionTexto: data.ubicacionTexto || "",
          categoria: data.categoria,
          usuarioCreadorId: data.usuarioCreadorId
        });
        addToast("Proyecto creado exitosamente", "success");
        navigate(`/projects/${created.id}`);
      }
    } catch (error) {
      addToast("Error al guardar el proyecto", "error");
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!id) return;
    try {
      sanitizeStatus(status);
      const apiStatus = status === ProjectStatus.Published ? "Activo" : "Pendiente";
      await updateStatusMutation.mutateAsync({ id: Number(id), status: apiStatus });
      addToast("Estado actualizado exitosamente", "success");
    } catch {
      addToast("Error al actualizar el estado", "error");
    }
  };

  if (isEditing && loading) {
    return (
      <div className="text-center py-12 text-[var(--color-text-strong)] opacity-60">
        Cargando formulario...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text-strong)]">
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
        <div className="mt-8 space-y-4">
          {/* Status management */}
          <div className="bg-[var(--color-surface-primary)] p-5 rounded-lg">
            <h2 className="text-base font-bold text-[var(--color-text-strong)] mb-3">
              Gestion de Estado
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {[ProjectStatus.Draft, ProjectStatus.InReview, ProjectStatus.Published, ProjectStatus.Observed].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="bg-[var(--color-brand-primary)]/10 hover:bg-[var(--color-brand-primary)]/20 text-[var(--color-text-strong)] py-2 px-4 rounded-lg"
                >
                  {ProjectStatus[status]}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-strong)] opacity-50">
              Estado actual: <strong>{ProjectStatus[project.estadoProyecto]}</strong>
            </p>
          </div>

          {/* Quick nav cards */}
          {[{
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
          }].map((item) => (
            <div
              key={item.href}
              className="bg-[var(--color-surface-primary)] p-5 rounded-lg flex items-center justify-between gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform"
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
