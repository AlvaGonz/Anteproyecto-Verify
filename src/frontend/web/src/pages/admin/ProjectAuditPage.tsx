import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { AuditDto, AuditFilters } from "../../features/audit/types";
import { useAuditLog } from "../../features/audit/api/useAudit";
import { AuditTable } from "../../features/audit/components/AuditTable";
import { AuditFiltersComponent } from "../../features/audit/components/AuditFilters";
import { ClipboardList, Download } from "lucide-react";

export const ProjectAuditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [filters, setFilters] = useState<AuditFilters>({});
  
  const { data: rawLogs = [], isLoading } = useAuditLog(id || "", filters);

  // Map API DTO to legacy DTO expected by UI
  const logs = React.useMemo(() => {
    return rawLogs.map(l => ({
      id: String(l.idLog),
      proyectoId: String(l.idProyecto),
      usuarioId: String(l.idUsuario),
      tipoEvento: l.accion,
      accion: l.accion,
      entidad: "Proyecto",
      entidadId: String(l.idProyecto),
      detalle: l.descripcion || "Sin detalles",
      fechaEventoUtc: l.fecha
    })) as AuditDto[];
  }, [rawLogs, id]);

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
          onClick={() => id && (window.location.href = `${import.meta.env.VITE_API_URL}/projects/${id}/audit/export`)}
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
