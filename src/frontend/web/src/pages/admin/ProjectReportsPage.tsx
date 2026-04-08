import React from "react";
import { useParams } from "react-router-dom";
import { ReportsList } from "../../features/reports/components/ReportsList";

export const ProjectReportsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Historial de Reportes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Listado de reportes generados a partir de validaciones del proyecto.
          </p>
        </div>
      </div>

      {id && <ReportsList projectId={id} />}
    </div>
  );
};
