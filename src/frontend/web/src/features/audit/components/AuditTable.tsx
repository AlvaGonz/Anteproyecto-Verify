import React from "react";
import { AuditDto } from "../types";
import { toUtcDate } from "../../../shared/utils/dates";

interface AuditTableProps {
  logs: AuditDto[];
  isLoading: boolean;
}

export const AuditTable: React.FC<AuditTableProps> = ({ logs, isLoading }) => {
  if (isLoading)
    return (
      <div className="text-sm text-gray-500 py-4">Cargando auditoría...</div>
    );
  if (logs.length === 0)
    return (
      <div className="text-sm text-gray-500 py-4">
        No hay registros de auditoría.
      </div>
    );

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha (UTC)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Evento
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acción
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Entidad
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Usuario
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {toUtcDate(log.fechaEventoUtc)?.toLocaleString() ?? ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.tipoEvento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.accion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.entidad}{" "}
                      {log.entidadId && log.entidadId !== "undefined"
                        ? `(${log.entidadId.substring(0, 8)}...)`
                        : ""}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      title={log.usuarioId}
                    >
                      {log.usuarioId ? "Usuario Interno" : "Sistema"}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-500 max-w-md truncate"
                      title={log.detalle}
                    >
                      {log.detalle || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
