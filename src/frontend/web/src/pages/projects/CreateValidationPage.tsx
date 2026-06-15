import React from "react";
import { CreateValidationForm } from "../../features/validations/components/CreateValidationForm";
import { AdminLayout } from "../../shared/components/layout/AdminLayout";
import { useParams, useNavigate } from "react-router-dom";

export const CreateValidationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-premium mt-6">
        {id && <CreateValidationForm projectId={id} onSuccess={() => navigate(`/projects/${id}/validations`)} />}
      </div>
    </AdminLayout>
  );
};
