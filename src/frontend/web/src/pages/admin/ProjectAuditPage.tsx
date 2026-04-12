import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AuditDto, AuditFilters } from "../../features/audit/types";
import { auditApi } from "../../features/audit/api/auditApi";
import { AuditTable } from "../../features/audit/components/AuditTable";
import { AuditFiltersComponent } from "../../features/audit/components/AuditFilters";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { ClipboardList, Download } from "lucide-react";

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
    } catch {
      addToast("Error al cargar la auditoria", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAudit(filters); }, [id, filters]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-strong)] flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-[var(--color-brand-primary)]" />
            Auditoria del Proyecto
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-strong)] opacity-60">
            Historial detallado de eventos y acciones operativas.
          </p>
        </div>
        <button
          onClick={() => id && (window.location.href = auditApi.exportAuditTrailUrl(id))}
          className="vf-btn-secondary"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <AuditFiltersComponent onFilterChange={setFilters} />
      <AuditTable logs={logs} isLoading={isLoading} />
    </div>
  );
};
