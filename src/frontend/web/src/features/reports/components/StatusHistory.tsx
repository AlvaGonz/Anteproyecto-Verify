import React from "react";
import { useStatusHistory, StatusHistoryEntry } from "../api/useStatusHistory";
import { toUtcDate } from "@/shared/utils/dates";

interface StatusHistoryProps {
  projectId: string;
}

export const StatusHistory: React.FC<StatusHistoryProps> = ({ projectId }) => {
  const { data: entries = [], isLoading } = useStatusHistory(projectId);

  if (isLoading)
    return (
      <div className="text-sm text-gray-500">
        Cargando historial de estatus...
      </div>
    );

  if (entries.length === 0)
    return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-[var(--color-text-strong)] mb-4">
        Historial de Estatus
      </h2>
      <ol className="relative border-s border-gray-200 ms-4">
        {entries.map((entry: StatusHistoryEntry) => (
          <li key={entry.id} className="mb-6 ms-6" data-testid="status-history-entry">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-[var(--color-brand-primary)] rounded-full -start-3 ring-4 ring-white">
              <svg className="w-3 h-3 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Z"/>
              </svg>
            </span>
            <time
              dateTime={entry.fechaCambioUtc}
              className="mb-1 text-sm font-normal leading-none text-gray-500"
            >
              {toUtcDate(entry.fechaCambioUtc)?.toLocaleString() ?? ""}
            </time>
            <h3 className="text-sm font-medium text-[var(--color-text-strong)]">
              {entry.estadoNuevoNombre}
              {entry.estadoAnteriorNombre && (
                <span className="font-normal text-gray-500">
                  {" "}← {entry.estadoAnteriorNombre}
                </span>
              )}
            </h3>
            {entry.usuarioNombre && (
              <p className="text-xs text-gray-500">por {entry.usuarioNombre}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};
