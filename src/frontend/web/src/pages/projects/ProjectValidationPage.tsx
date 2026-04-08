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
      setError(err.message || "Error al cargar el resultado de validación");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRunValidation = async () => {
    if (!id) return;
    setIsEvaluating(true);
    setError(null);
    try {
      const newResult = await fullValidationApi.runValidation(id);
      setResult(newResult);
      addToast("Validación ejecutada exitosamente", "success");
    } catch (err: any) {
      setError(err.message || "Error al ejecutar la validación completa");
      addToast("Error al ejecutar la validación", "error");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando resultados...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Validación Integral del Proyecto
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            <Link
              to={`/admin/projects/${id}`}
              className="text-blue-600 hover:underline"
            >
              &larr; Volver al Proyecto
            </Link>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <ValidationRunPanel
        result={result}
        isEvaluating={isEvaluating}
        onRunValidation={handleRunValidation}
      />

      {result && (
        <>
          {result.internalValidation && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                1. Validación Interna (Expediente)
              </h2>
              <InternalValidationSummary summary={result.internalValidation} />
              <ValidationRulesTable
                results={result.internalValidation.results}
              />
            </div>
          )}

          {result.externalSources && result.externalSources.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                2. Validación Externa Institucional
              </h2>
              <ValidationSourcesSummary sources={result.externalSources} />
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              3. Certificación
            </h2>
            <CertificationSection projectId={id!} />
          </div>
        </>
      )}
    </div>
  );
};
