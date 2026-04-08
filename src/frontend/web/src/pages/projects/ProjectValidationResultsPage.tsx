import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  InternalValidationSummaryDto,
  FindingDto,
} from "../../features/validations/types";
import { validationsApi } from "../../features/validations/api/validationsApi";
import { ValidationSummary } from "../../features/validations/components/ValidationSummary";
import { ValidationRulesTable } from "../../features/validations/components/ValidationRulesTable";
import { FindingsList } from "../../features/validations/components/FindingsList";

export const ProjectValidationResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<InternalValidationSummaryDto | null>(
    null,
  );
  const [findings, setFindings] = useState<FindingDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const latestSummary =
        await validationsApi.getLatestInternalValidation(id);
      setSummary(latestSummary);
      if (latestSummary) {
        const projectFindings = await validationsApi.getProjectFindings(id);
        // Filter findings related to the latest validation run
        setFindings(
          projectFindings.filter(
            (f) => f.validacionId === latestSummary.validacionId,
          ),
        );
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los resultados de validación");
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
      const newSummary = await validationsApi.runInternalValidation(id);
      setSummary(newSummary);
      const projectFindings = await validationsApi.getProjectFindings(id);
      setFindings(
        projectFindings.filter(
          (f) => f.validacionId === newSummary.validacionId,
        ),
      );
    } catch (err: any) {
      setError(err.message || "Error al ejecutar la validación");
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
            Validación Interna del Expediente
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
        <button
          onClick={handleRunValidation}
          disabled={isEvaluating}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isEvaluating ? "Ejecutando..." : "Ejecutar Validación"}
        </button>
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

      {!summary && !error && (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Sin Validaciones Previas
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No se ha ejecutado ninguna validación interna para este proyecto.
          </p>
          <div className="mt-6">
            <button
              onClick={handleRunValidation}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Ejecutar Primera Validación
            </button>
          </div>
        </div>
      )}

      {summary && (
        <>
          <ValidationSummary summary={summary} />
          <ValidationRulesTable results={summary.results} />
          <FindingsList findings={findings} />
        </>
      )}
    </div>
  );
};
