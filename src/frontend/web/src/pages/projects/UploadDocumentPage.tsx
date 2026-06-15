import React from "react";
import { UploadDocumentForm } from "../../features/documents/components/UploadDocumentForm";
import { AdminLayout } from "../../shared/components/layout/AdminLayout";
import { useParams, useNavigate } from "react-router-dom";

export const UploadDocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-premium mt-6">
        {id && <UploadDocumentForm projectId={id} onSuccess={() => navigate(`/projects/${id}/documents`)} />}
      </div>
    </AdminLayout>
  );
};
