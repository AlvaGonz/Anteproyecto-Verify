import React from "react";
import { useStatusHistory, StatusHistoryEntry } from "../api/useStatusHistory";
import { toUtcDate } from "@/shared/utils/dates";
import { GitCommitHorizontal } from "lucide-react";

interface StatusHistoryProps {
  projectId: string;
  hideAttribution?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  Creado: "bg-blue-50 text-blue-700 border-blue-200",
  Editado: "bg-amber-50 text-amber-700 border-amber-200",
  "En Revisión": "bg-orange-50 text-orange-700 border-orange-200",
  Revisión: "bg-orange-50 text-orange-700 border-orange-200",
  Publicado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Con Observaciones": "bg-red-50 text-red-700 border-red-200",
  Observación: "bg-red-50 text-red-700 border-red-200",
};

const DOT_COLORS: Record<string, string> = {
  Creado: "bg-blue-500 ring-blue-100",
  Editado: "bg-amber-500 ring-amber-100",
  "En Revisión": "bg-orange-500 ring-orange-100",
  Revisión: "bg-orange-500 ring-orange-100",
  Publicado: "bg-emerald-500 ring-emerald-100",
  "Con Observaciones": "bg-red-500 ring-red-100",
  Observación: "bg-red-500 ring-red-100",
};

export const StatusHistory: React.FC<StatusHistoryProps> = ({ projectId, hideAttribution }) => {
  const { data: entries = [], isLoading } = useStatusHistory(projectId);

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-sm text-text-secondary py-4">
        <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
        Cargando historial...
      </div>
    );

  if (entries.length === 0)
    return null;

  return (
    <section aria-labelledby="status-history-heading">
      <h2
        id="status-history-heading"
        className="text-base font-display font-black text-secondary italic tracking-tighter mb-4 flex items-center gap-2"
      >
        <GitCommitHorizontal className="w-5 h-5 text-primary" aria-hidden="true" />
        Historial de Estatus
      </h2>

      <ol className="relative border-s-2 border-border ms-3 space-y-5">
        {entries.map((entry: StatusHistoryEntry) => {
          const dotColor = DOT_COLORS[entry.estadoNuevoNombre] ?? "bg-slate-400 ring-slate-100";
          const badgeStyle = STATUS_STYLES[entry.estadoNuevoNombre] ?? "bg-slate-50 text-slate-600 border-slate-200";

          return (
            <li
              key={entry.id}
              className="ms-6 group"
              data-testid="status-history-entry"
            >
              <span
                className={`absolute w-3 h-3 ${dotColor} rounded-full -start-[7px] ring-4 ring-white mt-1.5 transition-transform duration-200 group-hover:scale-125`}
                aria-hidden="true"
              />

              <time
                dateTime={entry.fechaCambioUtc}
                className="block text-xs font-medium text-text-secondary mb-1"
              >
                {toUtcDate(entry.fechaCambioUtc)?.toLocaleString() ?? ""}
              </time>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${badgeStyle}`}>
                  {entry.estadoNuevoNombre}
                </span>
                {entry.estadoAnteriorNombre && (
                  <>
                    <span className="text-text-secondary text-xs" aria-hidden="true">←</span>
                    <span className="text-xs text-text-secondary">{entry.estadoAnteriorNombre}</span>
                  </>
                )}
              </div>

              {!hideAttribution && entry.usuarioNombre && (
                <p className="text-xs text-text-secondary mt-1">
                  por {entry.usuarioNombre}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
