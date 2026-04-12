import React from "react";
import { useParams } from "react-router-dom";
import { ReportsList } from "../../features/reports/components/ReportsList";
import { ReportExportPanel } from "../../features/reports/components/ReportExportPanel";
import { FileText } from "lucide-react";

export const ProjectReportsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-strong)] flex items-center gap-3">
          <FileText className="w-7 h-7 text-[var(--color-brand-primary)]" />
          Historial de Reportes
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-strong)] opacity-60">
          Listado de reportes generados a partir de validaciones del proyecto.
        </p>
      </div>

      {id && (
        <>
          <ReportsList projectId={id} />
          <ReportExportPanel projectId={id} />
        </>
      )}
    </div>
  );
};
