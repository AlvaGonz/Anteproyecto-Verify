import React from "react";
import { ValidationSourceResult } from "../types";

interface ValidationSourcesSummaryProps {
  sources: ValidationSourceResult[];
}

export const ValidationSourcesSummary: React.FC<
  ValidationSourcesSummaryProps
> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border mb-6">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Fuentes Institucionales Consultadas
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Resultados de validación contra entidades externas.
        </p>
      </div>
      <ul className="divide-y divide-gray-200">
        {sources.map((source, idx) => (
          <li key={idx}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-600 truncate">
                  {source.sourceName}
                </p>
                <div className="ml-2 flex-shrink-0 flex space-x-2">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${source.isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {source.status}
                  </span>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${source.isMatch ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}`}
                  >
                    {source.isMatch ? "Coincide" : "Inconsistente"}
                  </span>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {source.summary}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>{new Date(source.timestampUtc).toLocaleTimeString()}</p>
                </div>
              </div>
              {source.referenceCode && (
                <p className="mt-1 text-xs text-gray-400">
                  Ref: {source.referenceCode}
                </p>
              )}
              {source.findings && source.findings.length > 0 && (
                <div className="mt-2 bg-yellow-50 p-2 rounded text-sm text-yellow-800">
                  <ul className="list-disc pl-5">
                    {source.findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {source.errorMessage && (
                <div className="mt-2 bg-red-50 p-2 rounded text-sm text-red-800">
                  Error: {source.errorMessage}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
