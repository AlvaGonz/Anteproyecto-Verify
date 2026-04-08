import React from "react";
import { ValidationExecutionResult, ValidationExecutionStatus } from "../types";

interface ValidationRunPanelProps {
  result: ValidationExecutionResult | null;
  isEvaluating: boolean;
  onRunValidation: () => void;
}

export const ValidationRunPanel: React.FC<ValidationRunPanelProps> = ({
  result,
  isEvaluating,
  onRunValidation,
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border mb-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Validación Integral del Proyecto
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Consolida la validación interna y la consulta a instituciones
            externas.
          </p>
        </div>
        <button
          onClick={onRunValidation}
          disabled={isEvaluating}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isEvaluating ? "Ejecutando..." : "Ejecutar Validación Completa"}
        </button>
      </div>

      {result && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Estado de Ejecución
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.overallStatus === ValidationExecutionStatus.Completed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {ValidationExecutionStatus[result.overallStatus]}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Resultado Consolidado
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.isFullyValid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {result.isFullyValid
                    ? "Válido y Consistente"
                    : "Inconsistencias Detectadas"}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Fecha de Ejecución
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(result.completedAtUtc).toLocaleString()}
              </dd>
            </div>
            {result.errors && result.errors.length > 0 && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-red-50">
                <dt className="text-sm font-medium text-red-800">
                  Errores del Sistema
                </dt>
                <dd className="mt-1 text-sm text-red-700 sm:mt-0 sm:col-span-2">
                  <ul className="list-disc pl-5">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
};
