import React from "react";
import { useParams } from "react-router-dom";
import { ReportExportPanel } from "../../features/reports/components/ReportExportPanel";
import { StatusHistory } from "../../features/reports/components/StatusHistory";

export const ProjectReportsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      {id && (
        <>
          <StatusHistory projectId={id} />
          <ReportExportPanel projectId={id} />
        </>
      )}
    </div>
  );
};
