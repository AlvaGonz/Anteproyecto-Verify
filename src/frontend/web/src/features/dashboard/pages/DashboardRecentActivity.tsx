import React, { useState } from "react";
import { Users, Activity, FileCheck, CreditCard, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import type { DashboardStatsDto, SuscripcionRecienteDto } from "../../../infrastructure/api/dashboard.api";
import { toUtcDate } from "../../../shared/utils/dates";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const BarChart: React.FC<{ data: { month: string; count: number }[] }> = ({ data }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [width, setWidth] = React.useState(0);
  const height = 180;
  const pad = { t: 20, r: 4, b: 28, l: 32 };

  React.useEffect(() => {
    if (!svgRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(svgRef.current.parentElement!);
    return () => ro.disconnect();
  }, []);

  const { yMax, yMin, gridLines } = React.useMemo(() => {
    if (!data.length || !width) return { yMax: 0, yMin: 0, gridLines: [] as number[] };
    const vals = data.map(d => d.count);
    const yMax = Math.max(...vals) * 1.15 || 1;
    const yMin = 0;
    const tickCount = 3;
    const gridLines = Array.from({ length: tickCount + 1 }, (_, i) => yMin + (yMax - yMin) * (i / tickCount));
    return { yMax, yMin, gridLines };
  }, [data, width]);

  return (
    <svg ref={svgRef} width="100%" height={height} style={{ display: "block" }}>
      {gridLines.map((v, i) => {
        const yPos = pad.t + (height - pad.t - pad.b) * (1 - (v - yMin) / (yMax - yMin || 1));
        return (
          <g key={i}>
            <text x={pad.l - 6} y={yPos + 3.5} textAnchor="end" fontSize="10" fill="#9ca3af">{Math.round(v)}</text>
            {i > 0 && <line x1={pad.l} y1={yPos} x2={width - pad.r} y2={yPos} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 4" />}
          </g>
        );
      })}
      {data.map((d, i) => {
        if (!width) return null;
        const plotW = width - pad.l - pad.r;
        const plotH = height - pad.t - pad.b;
        const barW = Math.min(plotW / Math.max(data.length, 1) * 0.6, 40);
        const cx = pad.l + (i + 0.5) * (plotW / Math.max(data.length, 1));
        const barH = ((d.count - yMin) / (yMax - yMin || 1)) * plotH;
        const yPos = pad.t + plotH - barH;
        
        return (
          <g key={i} className="group cursor-pointer">
            <text x={cx} y={pad.t + plotH + 16} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.month}</text>
            <rect x={cx - barW / 2} y={yPos} width={barW} height={barH} fill="#223382" rx="2" className="group-hover:fill-[#F98513] transition-colors" />
            
            {/* Invisible rect for easier hovering */}
            <rect x={cx - barW / 2} y={pad.t} width={barW} height={plotH} fill="transparent" />
            <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <rect x={cx - 16} y={yPos - 22} width="32" height="18" rx="4" fill="#1f2937" />
              <text x={cx} y={yPos - 10} textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">{d.count}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export interface DashboardRecentActivityProps {
  loading: boolean;
  statsData: DashboardStatsDto | undefined;
  recentSubscriptions: SuscripcionRecienteDto[];
}

export const DashboardRecentActivity: React.FC<DashboardRecentActivityProps> = React.memo(({ loading, statsData, recentSubscriptions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(recentSubscriptions.length / itemsPerPage);
  const paginatedSubscriptions = recentSubscriptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const usuariosPorMesChartData = React.useMemo(() => {
    if (!statsData?.usuariosPorMes) return [];
    return statsData.usuariosPorMes.map(d => ({
      month: MONTHS[d.month - 1],
      count: d.count
    }));
  }, [statsData?.usuariosPorMes]);

  return (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <div className="vf-card p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-xs font-bold text-text-secondary leading-snug min-w-0">Total Usuarios</p>
        </div>
        <p className="text-3xl font-display font-black text-text-primary tracking-tighter">{loading ? "..." : statsData?.totalUsuarios}</p>
      </div>

      <div className="vf-card p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-success" />
          </div>
          <p className="text-xs font-bold text-text-secondary leading-snug min-w-0">Suscripciones Activas</p>
        </div>
        <p className="text-3xl font-display font-black text-text-primary tracking-tighter">{loading ? "..." : statsData?.suscripcionesActivas}</p>
      </div>

      <div className="vf-card p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs font-bold text-text-secondary leading-snug min-w-0">Consultas · Proyectos</p>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-wider mb-0.5">Consultas</p>
            <p className="text-2xl font-display font-black text-text-primary tracking-tighter">{loading ? "..." : statsData?.totalConsultasRealizadas || 0}</p>
          </div>
          <div className="w-px h-10 bg-border self-center" />
          <div className="text-right">
            <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-wider mb-0.5">Proyectos</p>
            <p className="text-2xl font-display font-black text-text-primary tracking-tighter">{loading ? "..." : statsData?.totalProyectosRegistrados || 0}</p>
          </div>
        </div>
      </div>

      <div className="vf-card p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-warning" />
          </div>
          <p className="text-xs font-bold text-text-secondary leading-snug min-w-0">Flujo Mensual Estimado</p>
        </div>
        <p className="text-3xl font-display font-black text-text-primary tracking-tighter">
          ${loading ? "..." : statsData?.ingresosMensualesEstimados.toLocaleString()}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="flex flex-col gap-6">
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border bg-surface-raised/20">
          <h3 className="text-lg font-display font-black text-[#223382] tracking-tight">
            Flujo de <span className="text-[#F98513]">Usuarios</span>
          </h3>
          <p className="text-xs text-text-secondary">Distribución por categoría (Planes)</p>
        </div>
        <div className="p-6 flex-1 flex flex-col justify-center gap-3">
          {loading ? (
            <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223382]" /></div>
          ) : statsData?.usuariosPorPlan && Object.keys(statsData.usuariosPorPlan).length > 0 ? (
            Object.entries(statsData.usuariosPorPlan)
              .sort(([planA], [planB]) => {
                const order = ["Corporativo", "Empresa", "Profesional", "Consultor", "Invitado"];
                const idxA = order.indexOf(planA);
                const idxB = order.indexOf(planB);
                return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
              })
              .map(([plan, count]) => {
                const displayPlan = plan;
                return (
              <div key={plan} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#223382]" />
                  <span className="text-sm font-medium text-text-primary">{displayPlan}</span>
                </div>
                <span className="text-sm font-bold bg-surface-raised px-2 py-0.5 rounded-full">{count}</span>
              </div>
                );
              })
          ) : (
            <div className="text-sm text-text-secondary text-center opacity-70">No hay datos de distribución</div>
          )}
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col p-6">
        <h3 className="text-lg font-display font-black text-[#223382] tracking-tight mb-4">
          Usuarios por <span className="text-[#F98513]">Mes</span>
        </h3>
        <div className="flex-1 min-h-[180px]">
          {loading ? (
             <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223382]" /></div>
          ) : usuariosPorMesChartData.length > 0 ? (
             <BarChart data={usuariosPorMesChartData} />
          ) : (
             <div className="text-sm text-text-secondary text-center opacity-70 mt-10">No hay datos de meses</div>
          )}
        </div>
      </div>
    </div>

      <div className="lg:col-span-2 bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-raised/20">
          <div>
            <h3 className="text-xl font-display font-black text-[#223382] tracking-tight">
              Suscripciones <span className="text-[#F98513]">Recientes</span>
            </h3>
            <p className="text-xs text-text-secondary font-medium mt-0.5">Usuarios nuevos en la plataforma</p>
          </div>
        </div>

        <div className="flex-1 min-h-[445px] overflow-hidden relative">
          {loading ? (
            <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223382]" /></div>
          ) : recentSubscriptions.length === 0 ? (
            <div className="py-20 text-sm text-text-secondary opacity-50 text-center flex flex-col items-center gap-3">
              <Users className="w-10 h-10 opacity-20" />
              No hay usuarios recientes.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <m.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col w-full h-full divide-y divide-border absolute inset-0"
              >
                {Array.from({ length: itemsPerPage }).map((_, idx) => {
                  const s = paginatedSubscriptions[idx];
                  if (!s) {
                    return <div key={`empty-${idx}`} className="h-[89px] pointer-events-none" />;
                  }
                  return (
                    <div key={`${s.correo}-${s.fechaAlta}-${idx}`} className="flex items-center justify-between px-8 py-5 hover:bg-surface-raised/20 transition-all h-[89px]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center text-text-primary font-black text-lg">
                          {s.correo.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary text-lg leading-tight">{s.correo}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                            <Calendar className="w-3 h-3" />
                            {toUtcDate(s.fechaAlta)?.toLocaleDateString() ?? ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#223382]">{s.plan === "Empresa" ? "Corporativo" : s.plan}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${s.estado === "Active" ? "bg-success/20 text-success" : "bg-surface-raised text-text-secondary"}`}>
                          {s.estado}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </m.div>
            </AnimatePresence>
          )}
        </div>
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border bg-surface-raised/10 flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, recentSubscriptions.length)} de {recentSubscriptions.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-surface-raised disabled:opacity-30 transition-colors"
              >
                <ChevronsLeft className="w-4 h-4 text-text-primary" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-surface-raised disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-text-primary" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-surface-raised disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-text-primary" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-surface-raised disabled:opacity-30 transition-colors"
              >
                <ChevronsRight className="w-4 h-4 text-text-primary" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  );
});
