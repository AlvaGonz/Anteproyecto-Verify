import React from "react";
import { ProjectReportDto } from "../types";
import { useReports } from "../api/useReports";

interface ReportsListProps {
  projectId: string;
}

export const ReportsList: React.FC<ReportsListProps> = ({ projectId }) => {
  const { data: rawReports = [], isLoading } = useReports(projectId || "");

  // Map API DTO to legacy UI shape
  const reports = React.useMemo(() => {
    return rawReports.map(r => ({
      ...r,
      id: String(r.idReporte),
      version: 1, // Fallback since API doesn't return version
      estadoReporte: r.estado,
      resumen: "Reporte general de auditoría", // Fallback
      createdAtUtc: r.fechaGeneracion,
    })) as unknown as ProjectReportDto[];
  }, [rawReports]);

  if (isLoading)
    return (
      <div className="text-sm text-gray-500">
        Cargando historial de reportes...
      </div>
    );
  if (reports.length === 0)
    return (
      <div className="text-sm text-gray-500">
        No hay reportes generados para este proyecto.
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
                    Versión
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Resumen
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha Generación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      v{report.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.estadoReporte === "Generated" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {report.estadoReporte}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      {report.resumen || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAtUtc).toLocaleString()}
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
