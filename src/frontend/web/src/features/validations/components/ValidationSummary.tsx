import React from "react";
import { InternalValidationSummaryDto } from "../types";

interface ValidationSummaryProps {
  summary: InternalValidationSummaryDto;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  summary,
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Resumen de Validación Interna
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Última ejecución: {new Date(summary.createdAtUtc).toLocaleString()}
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Estado General
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${summary.esLegitimo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {summary.esLegitimo ? "Aprobado" : "Requiere Atención"}
              </span>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Reglas Aprobadas
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className="text-green-600 font-bold">
                {summary.passedCount}
              </span>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Advertencias</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className="text-yellow-600 font-bold">
                {summary.warningCount}
              </span>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Reglas Fallidas
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className="text-red-600 font-bold">
                {summary.failedCount}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
