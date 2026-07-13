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
import { ProjectStatusBar } from "../../features/projects/components/ProjectStatusBar";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";

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
        addToast("Proyecto actualizado exitosamente", "success");
        navigate("/admin/projects");
      } else {
        if (!("usuarioCreadorId" in data) || !data.usuarioCreadorId) {
          throw new Error("Missing required field: usuarioCreadorId");
        }
        await createMutation.mutateAsync({
          nombre: data.nombre,
          ubicacionTexto: data.ubicacionTexto || "",
          categoria: data.categoria,
          usuarioCreadorId: data.usuarioCreadorId,
          datosDesarrollador: data.datosDesarrollador,
          rncDesarrollador: data.rncDesarrollador,
          designacionCatastral: data.designacionCatastral,
          ubicacionGps: data.ubicacionGps,
          matricula: data.matricula,
          propietario: data.propietario,
          cedulaRncPropietario: data.cedulaRncPropietario,
          ipi: data.ipi,
          estatusIpi: data.estatusIpi,
          superficieM2: data.superficieM2,
          imagenUrl: data.imagenUrl,
          imagenAdicional1: data.imagenAdicional1,
          imagenAdicional2: data.imagenAdicional2,
          imagenAdicional3: data.imagenAdicional3,
          imagenAdicional4: data.imagenAdicional4,
          imagenAdicional5: data.imagenAdicional5
        });
        addToast("Proyecto creado exitosamente", "success");
        navigate("/admin/projects");
      }
    } catch (error) {
      addToast("Error al guardar el proyecto", "error");
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

      {isEditing && project && (
        <ProjectStatusBar projectId={project.id} currentStatus={project.estadoProyecto} />
      )}

      {/* Title moved to layout */}
      <ProjectForm
        key={project?.id || 'new'}
        initialData={project}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/projects")}
        onDelete={handleDelete}
      />
    </div>
  );
};
