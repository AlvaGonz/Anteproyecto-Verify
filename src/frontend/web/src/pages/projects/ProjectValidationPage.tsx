import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ValidationExecutionResult } from "../../features/validation/types";
import { fullValidationApi } from "../../features/validation/api/validationApi";
import { ValidationRunPanel } from "../../features/validation/components/ValidationRunPanel";
import { ValidationSourcesSummary } from "../../features/validation/components/ValidationSourcesSummary";
import { ValidationSummary as InternalValidationSummary } from "../../features/validations/components/ValidationSummary";
import { ValidationRulesTable } from "../../features/validations/components/ValidationRulesTable";
import { CertificationSection } from "../../features/certifications/components/CertificationSection";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const ProjectValidationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const [result, setResult] = useState<ValidationExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const latestResult = await fullValidationApi.getValidationResult(id);
      setResult(latestResult);
    } catch (err: any) {
      setError(err.message || "Error al cargar el resultado de validacion");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRunValidation = async () => {
    if (!id) return;
    setIsEvaluating(true);
    setError(null);
    try {
      const newResult = await fullValidationApi.runValidation(id);
      setResult(newResult);
      addToast("Validacion ejecutada exitosamente", "success");
    } catch (err: any) {
      setError(err.message || "Error al ejecutar la validacion completa");
      addToast("Error al ejecutar la validacion", "error");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-[var(--color-text-strong)] opacity-60">Cargando resultados...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-strong)] flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-[var(--color-brand-primary)]" />
            Validacion Integral
          </h1>
          <Link to={`/admin/projects/${id}/edit`} className="text-sm text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1 mt-1">
            <ArrowLeft className="w-3 h-3" /> Volver al Proyecto
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">{error}</div>
      )}

      <ValidationRunPanel result={result} isEvaluating={isEvaluating} onRunValidation={handleRunValidation} />

      {result && (
        <>
          {result.internalValidation && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[var(--color-text-strong)] mb-4">1. Validacion Interna (Expediente)</h2>
              <InternalValidationSummary summary={result.internalValidation} />
              <ValidationRulesTable results={result.internalValidation.results} />
            </div>
          )}

          {result.externalSources && result.externalSources.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[var(--color-text-strong)] mb-4">2. Validacion Externa Institucional</h2>
              <ValidationSourcesSummary sources={result.externalSources} />
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-text-strong)] mb-4">3. Certificacion</h2>
            <CertificationSection projectId={id!} />
          </div>
        </>
      )}
    </div>
  );
};
