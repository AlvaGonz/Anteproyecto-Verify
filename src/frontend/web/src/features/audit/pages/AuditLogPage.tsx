import React, { useState, useEffect } from "react";
import { 
  History, 
  Download, 
  Search, 
  Calendar, 
  User as UserIcon, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Activity
} from "lucide-react";
import { auditApi } from "../api/auditApi";
import { AuditDto, AuditFilters } from "../types";

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditApi.getGlobalAuditTrail(filters);
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (tipoEvento: string) => {
    switch (tipoEvento) {
      case "ProjectCreated":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">Creación</span>;
      case "DocumentUploaded":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">Carga Doc</span>;
      case "ValidationExecuted":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">Validación</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{tipoEvento}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-black tracking-tight text-secondary">
              Registro de Auditoría
            </h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck className="w-3 h-3" />
              Sistema Protegido
            </div>
          </div>
          <p className="text-text-secondary font-medium">
            Historial completo de eventos críticos y acciones administrativas del sistema.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border rounded-xl font-sans font-bold text-sm text-secondary hover:bg-surface-raised transition-all shadow-raised hover:shadow-floating">
          <Download className="w-4 h-4" />
          Exportar Logs
        </button>
      </div>

      {/* Filters Area (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-white rounded-3xl border border-border/40 shadow-raised">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary px-1">Búsqueda</label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por detalle..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-raised border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary px-1">Tipo de Evento</label>
          <select 
            className="w-full px-4 py-2.5 text-sm bg-surface-raised border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
            onChange={(e) => setFilters({...filters, tipoEvento: e.target.value})}
          >
            <option value="">Todos los eventos</option>
            <option value="ProjectCreated">Creación de Proyecto</option>
            <option value="DocumentUploaded">Carga de Documentos</option>
            <option value="ValidationExecuted">Ejecución de Validación</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary px-1">Fecha Desde</label>
          <div className="relative group">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input 
              type="date"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-raised border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary px-1">Fecha Hasta</label>
          <div className="relative group">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input 
              type="date"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-raised border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              onChange={(e) => setFilters({...filters, toDate: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[32px] border border-border/30 overflow-hidden shadow-floating">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-raised/50 border-b border-border/20">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Timestamp (UTC)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Usuario</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Evento</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Proyecto</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="w-8 h-8 text-primary animate-pulse" />
                      <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Cargando registros...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-text-secondary font-medium">
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-raised/30 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-secondary">{new Date(log.fechaEventoUtc).toLocaleDateString()}</span>
                        <span className="text-[10px] font-medium text-text-secondary uppercase tracking-tighter">{new Date(log.fechaEventoUtc).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-secondary/5 flex items-center justify-center text-secondary">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-extrabold text-secondary">{log.usuarioId || "SISTEMA"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {getStatusBadge(log.tipoEvento)}
                    </td>
                    <td className="px-8 py-5 font-mono text-xs font-bold text-primary/80">
                      {log.proyectoId?.substring(0, 8) || "N/A"}
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-text-secondary font-medium max-w-md truncate md:whitespace-normal group-hover:text-secondary transition-colors">
                        {log.detalle}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-8 py-5 bg-surface-raised/30 flex items-center justify-between border-t border-border/20">
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-text-secondary">
            Mostrando {logs.length} registros del historial
          </span>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl bg-white border border-border/40 hover:bg-surface-raised transition-all disabled:opacity-30 shadow-raised" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1 shrink-0">
              <button className="w-8 h-8 rounded-xl bg-secondary text-white text-[10px] font-black">1</button>
              <button className="w-8 h-8 rounded-xl bg-white border border-border/40 text-[10px] font-black text-text-secondary hover:bg-surface-raised">2</button>
              <button className="w-8 h-8 rounded-xl bg-white border border-border/40 text-[10px] font-black text-text-secondary hover:bg-surface-raised">3</button>
            </div>
            <button className="p-2 rounded-xl bg-white border border-border/40 hover:bg-surface-raised transition-all shadow-raised">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
