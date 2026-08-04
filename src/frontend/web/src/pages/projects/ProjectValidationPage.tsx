import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ValidationExecutionResult 
} from "../../features/validations/types";
import { useValidationResult, useFindings, useRunFullValidation } from "../../features/validations/api/useValidations";
import { AdminErrorFallback } from "../../components/ui/AdminErrorFallback";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { FindingDto } from "../../features/validations/types";
import { ProjectValidationPageLayout } from "./ProjectValidationPageLayout";
import { useProject } from "../../features/projects/api/useProjects";

export const ProjectValidationPage: React.FC = React.memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'analysis' | 'findings'>('analysis');
  const projectId = id || "";
  const { data: rawResult, isLoading: isResultLoading, error: resultError } = useValidationResult(projectId);
  const { data: rawFindings = [], isLoading: isFindingsLoading } = useFindings(projectId);
  const { data: project } = useProject(projectId);

  const runFullValidationMutation = useRunFullValidation(projectId);

  const [error, setError] = useState<string | null>(null);

  const findings = React.useMemo(() => {
    return rawFindings.map((f: any) => ({
      ...f,
      id: String(f.idHallazgo || f.id),
      validacionId: String(f.idValidacion || f.validacionId),
    })) as unknown as FindingDto[];
  }, [rawFindings]);

  if (resultError) {
    return <AdminErrorFallback error={resultError} />;
  }

  const result = React.useMemo(() => rawResult ? {
    ...rawResult,
    internalValidation: rawResult.internalValidation ? {
      ...rawResult.internalValidation,
      validacionId: String(rawResult.internalValidation.idValidacion || rawResult.internalValidation.validacionId),
      proyectoId: String(projectId),
    } : undefined,
    externalSources: rawResult.externalSources || []
  } as unknown as ValidationExecutionResult : null, [rawResult, projectId]);

  const isLoading = isResultLoading || isFindingsLoading;
  const isEvaluating = runFullValidationMutation.isPending;

  const handleRunValidation = () => {
    if (!id) return;
    navigate(`/admin/validations/${id}`);
  };

  const handleScanComplete = async () => {
    setError(null);
    try {
      await runFullValidationMutation.mutateAsync();
      addToast("Validación integral completada", "success");
    } catch (err: any) {
      setError(err.message || "Error al ejecutar la validación completa");
      addToast("Error al ejecutar la validación", "error");
    }
  };

  if (isLoading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <div className="text-center animate-pulse text-secondary font-display font-black tracking-widest text-xs">
        CONECTANDO CON EL NADO CENTRAL...
      </div>
    </div>
  );

  return (
    <ProjectValidationPageLayout
      id={id}
      error={error}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isEvaluating={isEvaluating}
      handleRunValidation={handleRunValidation}
      findings={findings}
      result={result}
      handleScanComplete={handleScanComplete}
      projectStatus={(project as any)?.estadoProyecto}
    />
  );
});
