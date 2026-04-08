import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AuditDto, AuditFilters } from "../../features/audit/types";
import { auditApi } from "../../features/audit/api/auditApi";
import { AuditTable } from "../../features/audit/components/AuditTable";
import { AuditFiltersComponent } from "../../features/audit/components/AuditFilters";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";

export const ProjectAuditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const [logs, setLogs] = useState<AuditDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({});

  const fetchAudit = async (currentFilters: AuditFilters) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await auditApi.getProjectAuditTrail(id, currentFilters);
      setLogs(data);
    } catch (error) {
      console.error("Error fetching audit trail:", error);
      addToast("Error al cargar la auditoría", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit(filters);
  }, [id, filters]);

  const handleExport = () => {
    if (!id) return;
    window.location.href = auditApi.exportAuditTrailUrl(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Auditoría del Proyecto
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Historial detallado de eventos y acciones operativas.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleExport}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <AuditFiltersComponent onFilterChange={setFilters} />
      <AuditTable logs={logs} isLoading={isLoading} />
    </div>
  );
};
