import React from "react";
import { CreateProjectForm } from "../../features/projects/components/CreateProjectForm";
import { AdminLayout } from "../../shared/components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-premium mt-6">
        <CreateProjectForm onSuccess={(id) => navigate(`/projects/${id}`)} />
      </div>
    </AdminLayout>
  );
};
