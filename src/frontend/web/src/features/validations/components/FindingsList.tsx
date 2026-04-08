import React from "react";
import { FindingDto, FindingSeverity } from "../types";

interface FindingsListProps {
  findings: FindingDto[];
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings }) => {
  if (findings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border">
        No hay hallazgos reportados.
      </div>
    );
  }

  const getSeverityBadge = (severity: FindingSeverity) => {
    switch (severity) {
      case FindingSeverity.Low:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Baja
          </span>
        );
      case FindingSeverity.Medium:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Media
          </span>
        );
      case FindingSeverity.High:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
            Alta
          </span>
        );
      case FindingSeverity.Critical:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Crítica
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md border mb-6">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Hallazgos Generados
        </h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {findings.map((finding) => (
          <li key={finding.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-600 truncate">
                  {finding.titulo} ({finding.codigo})
                </p>
                <div className="ml-2 flex-shrink-0 flex">
                  {getSeverityBadge(finding.severidad)}
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {finding.descripcion}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    Registrado:{" "}
                    {new Date(finding.createdAtUtc).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {finding.recomendacion && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Recomendación:</strong> {finding.recomendacion}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
