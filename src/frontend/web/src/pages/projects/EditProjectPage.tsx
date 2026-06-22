import React from "react";
import { EditProjectForm } from "../../features/projects/components/EditProjectForm";
import { AdminLayout } from "../../shared/components/layout/AdminLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "../../features/projects/api/useProjects";

export const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id || "");

  if (isLoading) return <AdminLayout><div className="p-6">Cargando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-premium mt-6">
        {project && <EditProjectForm project={project} onSuccess={() => navigate(`/p/${id}`)} />}
      </div>
    </AdminLayout>
  );
};
