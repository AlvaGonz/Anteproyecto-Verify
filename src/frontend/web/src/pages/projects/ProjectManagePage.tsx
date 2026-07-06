import React, { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ProyectoDto, 
  ProjectStatus, 
  CreateProyectoDto, 
  UpdateProyectoDto
} from "../../features/projects/types";
import { getStatusLabel } from "../../features/projects/utils/statusUtils";
import { useProject, useCreateProject, useDeleteProject } from "../../features/projects/api/useProjects";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../infrastructure/api/client";
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditing = !!id;

  const { data: rawProject, isLoading: loading } = useProject(id || "");
  const project = rawProject;
  
  const createMutation = useCreateProject();
  const deleteMutation = useDeleteProject();
  
  const qc = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) => 
      apiClient.put<ProyectoDto>(`/projects/${data.id}`, data.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: ProjectStatus }) => 
      apiClient.patch<ProyectoDto>(`/projects/${data.id}/status`, data.status, {
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const handleDelete = () => {
    if (!id) return;
    deleteDialogRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    deleteDialogRef.current?.close();
    try {
      await deleteMutation.mutateAsync(id as string);
      addToast("Proyecto eliminado exitosamente", "success");
      navigate("/admin/projects");
    } catch (error) {
      addToast("Error al eliminar el proyecto", "error");
    }
  };

  const handleSubmit = async (data: CreateProyectoDto | UpdateProyectoDto) => {
    try {
      validateProjectData(data);
      if (isEditing) {
        if (data.categoria == null) {
          throw new Error("Missing required field: categoria");
        }
        await updateMutation.mutateAsync({ id: id as string, payload: data });
        if ("fotosNuevas" in data && data.fotosNuevas && data.fotosNuevas.length > 0) {
          await Promise.all(data.fotosNuevas.map((file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("tipoDocumento", "1");
            return apiClient.post(`/projects/${id}/documents`, formData, { headers: { "Content-Type": "multipart/form-data" } });
          }));
          qc.invalidateQueries({ queryKey: ["projects"] });
        }
        addToast("Proyecto actualizado exitosamente", "success");
        navigate("/admin/projects");
      } else {
        if (!("usuarioCreadorId" in data) || !data.usuarioCreadorId) {
          throw new Error("Missing required field: usuarioCreadorId");
        }
        const newProj = await createMutation.mutateAsync({
          nombre: data.nombre,
          ubicacionTexto: data.ubicacionTexto || "",
          categoria: data.categoria,
          usuarioCreadorId: data.usuarioCreadorId,
          datosDesarrollador: data.datosDesarrollador,
          rncDesarrollador: data.rncDesarrollador,
          designacionCatastral: data.designacionCatastral,
          ubicacionGps: data.ubicacionGps
        });
        const fotos = (data as any).fotosNuevas as File[];
        if (fotos && fotos.length > 0) {
          await Promise.all(fotos.map((file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("tipoDocumento", "1");
            return apiClient.post(`/projects/${newProj.id}/documents`, formData, { headers: { "Content-Type": "multipart/form-data" } });
          }));
          qc.invalidateQueries({ queryKey: ["projects"] });
        }
        addToast("Proyecto creado exitosamente", "success");
        navigate("/admin/projects");
      }
    } catch (error) {
      addToast("Error al guardar el proyecto", "error");
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!id) return;
    try {
      sanitizeStatus(status);
      await updateStatusMutation.mutateAsync({ id: id as string, status });
      addToast("Estado actualizado exitosamente", "success");
    } catch {
      addToast("Error al actualizar el estado", "error");
    }
  };

  if (isEditing && loading) {
    return (
      <div data-testid="project-form-skeleton" className="max-w-4xl mx-auto p-4 animate-pulse">
        <div className="mb-6 space-y-3">
          <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
        </div>
        <div className="vf-card p-6 space-y-5">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* ── Delete Confirmation Dialog ── */}
      <dialog
        ref={deleteDialogRef}
        className="rounded-2xl shadow-2xl max-w-md w-[90vw] p-0 border-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        aria-labelledby="delete-dialog-title"
        onClose={() => deleteDialogRef.current?.close()}
      >
        <div className="p-8 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <div>
              <h2 id="delete-dialog-title" className="text-lg font-black text-gray-900">Eliminar Proyecto</h2>
              <p className="text-sm text-gray-500 mt-0.5">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            ¿Está seguro de que desea eliminar este proyecto permanentemente? Todos los datos asociados serán borrados.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => deleteDialogRef.current?.close()}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </div>
        </div>
      </dialog>

      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-strong)] tracking-tight">
          {isEditing ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
        </h1>
        <p className="text-base mt-2 text-[var(--color-text-strong)] opacity-70">
          {isEditing ? "Modifica los datos del proyecto existente." : "Ingresa los datos básicos para registrar un nuevo proyecto."}
        </p>
      </div>

      <ProjectForm
        key={project?.id || 'new'}
        initialData={project}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/projects")}
        onDelete={handleDelete}
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
                <button type="button"
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="bg-[var(--color-brand-primary)]/10 hover:bg-[var(--color-brand-primary)]/20 text-[var(--color-text-strong)] py-2 px-4 rounded-lg"
                >
                  {getStatusLabel(status, t)}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-strong)] opacity-50">
              Estado actual: <strong>{getStatusLabel(project.estadoProyecto, t)}</strong>
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
            <button
              type="button"
              key={item.href}
              className="bg-[var(--color-surface-primary)] p-5 rounded-lg flex items-center justify-between gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform w-full text-left"
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
