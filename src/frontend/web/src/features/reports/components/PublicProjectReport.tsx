import React, { useState, useEffect } from "react";
import { PublicProjectReportDto } from "../types";
import { reportsApi } from "../api/reportsApi";

interface PublicProjectReportProps {
  projectId: string;
}

export const PublicProjectReport: React.FC<PublicProjectReportProps> = ({
  projectId,
}) => {
  const [report, setReport] = useState<PublicProjectReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await reportsApi.getPublicReport(projectId);
        setReport(data);
      } catch (error) {
        console.error("Error fetching public report:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [projectId]);

  if (isLoading)
    return (
      <div className="text-sm text-gray-500">Cargando reporte público...</div>
    );
  if (!report)
    return (
      <div className="text-sm text-gray-500">
        No hay reporte público disponible para este proyecto.
      </div>
    );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Reporte Público Resumido
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Estado visible del proyecto para terceros.
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Versión {report.version}
        </span>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Estado del Proyecto
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
              {report.estadoProyectoVisible}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Estado del Expediente
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {report.estadoExpedienteVisible}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Resumen</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {report.resumenPublico}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Última Actualización
            </dt>
            <dd className="mt-1 text-sm text-gray-500 sm:mt-0 sm:col-span-2">
              {new Date(report.ultimaActualizacionUtc).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
