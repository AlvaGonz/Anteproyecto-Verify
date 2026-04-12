import React, { useState, useEffect } from "react";
import { PublicProjectReportDto } from "../types";
import { reportsApi } from "../api/reportsApi";
import { Info, Calendar } from "lucide-react";

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
      <div className="text-sm text-[var(--color-text-strong)] opacity-60">Cargando reporte público...</div>
    );
  if (!report)
    return (
      <div className="text-sm text-[var(--color-text-strong)] opacity-60">
        No hay reporte público disponible para este proyecto.
      </div>
    );

  return (
    <div className="bg-surface-container-low rounded-xl p-8 mb-12 shadow-sm border border-outline-variant">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-headline text-[#223382]">Reporte Público Resumido</h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-container text-on-primary-container">
          Versión {report.version}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-widest mb-4">Información Clave</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
              <span className="text-on-surface-variant font-medium">Estado del Proyecto</span>
              <span className="font-bold text-on-surface">{report.estadoProyectoVisible}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
              <span className="text-on-surface-variant font-medium">Estado Expediente</span>
              <span className="font-bold text-on-surface">{report.estadoExpedienteVisible}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-widest mb-4">Detalles</h3>
          
          <div className="bg-surface p-4 rounded-lg h-full flex flex-col justify-between">
            <div className="flex gap-3 mb-2">
              <Info className="w-5 h-5 text-secondary flex-shrink-0" />
              <p className="text-sm text-on-surface opacity-90 leading-relaxed">
                {report.resumenPublico}
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-outline-variant opacity-70">
              <Calendar className="w-4 h-4 text-secondary" />
              <span className="text-xs font-medium">
                Actualizado: {new Date(report.ultimaActualizacionUtc).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
