import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ProyectoDto,
  CreateProyectoDto,
  UpdateProyectoDto
} from "../../features/projects/types";
import { useProject, useCreateProject } from "../../features/projects/api/useProjects";
import { LimitReachedModal } from "../../features/projects/components/LimitReachedModal";
import { PlansModal } from "../../features/settings/components/PlansModal";
import { useAuth } from "../../shared/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../infrastructure/api/client";
import { ProjectForm } from "../../features/projects/components/ProjectForm";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { useProjectActionBar } from "../../features/projects/components/ProjectActionBarContext";

const validateProjectData = (data: CreateProyectoDto | UpdateProyectoDto) => {
  if (!data) {
    throw new Error("Invalid project data");
  }
};



export const ProjectManagePage: React.FC = React.memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditing = !!id;

  const { data: rawProject, isLoading: loading } = useProject(isEditing ? id! : "");
  const project = rawProject;

  const createMutation = useCreateProject();

  const { user } = useAuth();
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);

  const qc = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) =>
      apiClient.put<ProyectoDto>(`/projects/${data.id}`, data.payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: ["projects", variables.id] });
      qc.invalidateQueries({ queryKey: ["projectStatusEligibility", variables.id] });
    }
  });

  const { setIsSaveDisabled, setIsSaving } = useProjectActionBar();

  useEffect(() => {
    setIsSaveDisabled(false);
    return () => {
      setIsSaveDisabled(true);
    };
  }, [setIsSaveDisabled]);

  const handleSubmit = async (data: CreateProyectoDto | UpdateProyectoDto) => {
    try {
      validateProjectData(data);
      if (isEditing) {
        if (data.categoriaId == null) {
          throw new Error("Missing required field: categoriaId");
        }
        setIsSaving(true);
        await updateMutation.mutateAsync({ id: id as string, payload: data });
        addToast("Proyecto actualizado exitosamente", "success");
        // stay on current page per user request
      } else {
        if (!("usuarioCreadorId" in data) || !data.usuarioCreadorId) {
          throw new Error("Missing required field: usuarioCreadorId");
        }
        setIsSaving(true);
        await createMutation.mutateAsync({
          nombre: data.nombre,
          ubicacionTexto: data.ubicacionTexto || "",
          categoriaId: data.categoriaId,
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
    } catch (error: any) {
      if (error?.response?.data?.code === "LIMIT_REACHED" || error.name === "LimitReachedError") {
        setIsLimitModalOpen(true);
      } else {
        addToast(error.message || "Error al guardar el proyecto", "error");
      }
      throw error;
    } finally {
      setIsSaving(false);
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

      {/* Status bar moved to ProjectManageLayout */}

      {/* Title moved to layout */}
      <ProjectForm
        key={project?.id || 'new'}
        initialData={project}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/projects")}
      />

      <LimitReachedModal 
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onViewPlans={() => setIsPlansModalOpen(true)}
        limitType="projects"
      />

      <PlansModal 
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        source="project_limit_reached"
        currentPlan={user?.plan}
      />
    </div>
  );
});
