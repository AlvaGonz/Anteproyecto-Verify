import React, { useState } from "react";
import { Users, Activity, FileCheck, CreditCard, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import type { DashboardStatsDto, SuscripcionRecienteDto } from "../../../infrastructure/api/dashboard.api";

export interface DashboardRecentActivityProps {
  loading: boolean;
  statsData: DashboardStatsDto | undefined;
  recentSubscriptions: SuscripcionRecienteDto[];
}

export const DashboardRecentActivity: React.FC<DashboardRecentActivityProps> = ({ loading, statsData, recentSubscriptions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(recentSubscriptions.length / itemsPerPage);
  const paginatedSubscriptions = recentSubscriptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
  <>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#223382]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#223382]" />
          </div>
          <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">Total Usuarios</p>
        </div>
        <p className="text-4xl font-display font-black text-text-primary">{loading ? "..." : statsData?.totalUsuarios}</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-success" />
          </div>
          <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">Suscripciones Activas</p>
        </div>
        <p className="text-4xl font-display font-black text-text-primary">{loading ? "..." : statsData?.suscripcionesActivas}</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Flujo: Consultas/Proyectos</p>
        </div>
        <div className="flex justify-between items-end mt-1">
          <div>
            <p className="text-xs text-text-secondary">Consultas</p>
            <p className="text-2xl font-display font-black text-text-primary">{loading ? "..." : statsData?.totalConsultasRealizadas || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-secondary">Proyectos</p>
            <p className="text-2xl font-display font-black text-text-primary">{loading ? "..." : statsData?.totalProyectosRegistrados || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#F98513]/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#F98513]" />
          </div>
          <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Flujo Mensual Estimado</p>
        </div>
        <p className="text-3xl font-display font-black text-text-primary">
          ${loading ? "..." : statsData?.ingresosMensualesEstimados.toLocaleString()}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                const order = ["Corporativo", "Empresa", "Profesional", "Gratuito", "Invitado"];
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
                            {new Date(s.fechaAlta).toLocaleDateString()}
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
};
