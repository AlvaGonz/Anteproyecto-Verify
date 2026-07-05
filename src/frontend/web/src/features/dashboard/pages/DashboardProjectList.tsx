import React from "react";
import { FolderKanban } from "lucide-react";
import { m } from "framer-motion";
import type { ProyectoRecienteDto } from "../../../infrastructure/api/dashboard.api";

export interface DashboardProjectListProps {
  loading: boolean;
  recentProjects: ProyectoRecienteDto[];
}

export const DashboardProjectList: React.FC<DashboardProjectListProps> = ({ loading, recentProjects }) => (
  <m.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.4 }}
    className="xl:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm"
  >
    <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-raised/20">
      <div>
        <h3 className="text-xl font-display font-black text-[#223382] tracking-tight">
          Proyectos <span className="text-[#F98513]">Recientes</span>
        </h3>
        <p className="text-xs text-text-secondary font-medium mt-0.5">Últimas actualizaciones en el sistema</p>
      </div>
    </div>

    <div className="divide-y divide-border flex-1">
      {loading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223382]" /></div>
      ) : recentProjects.length === 0 ? (
        <div className="py-20 text-sm text-text-secondary opacity-50 text-center flex flex-col items-center gap-3">
          <FolderKanban className="w-10 h-10 opacity-20" />
          No hay proyectos recientes.
        </div>
      ) : (
        recentProjects.map((p, idx) => (
          <m.div
            key={`${p.nombre}-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (idx * 0.05) }}
          >
            <div className="flex items-center justify-between px-8 py-5 hover:bg-surface-raised/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center text-text-primary font-black text-xs group-hover:bg-[#9BACD8]/20 transition-colors">
                  {p.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-text-primary text-lg group-hover:text-[#223382] transition-colors leading-tight">{p.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-surface-raised text-text-secondary uppercase tracking-tighter">
                      {p.desarrollador}
                    </span>
                    <span className="text-[10px] text-text-secondary opacity-60">
                      {new Date(p.fechaRegistro).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:block text-right">
                  <span className={`vf-badge ${p.estado === "Verified" ? "vf-badge-success" : p.estado === "InReview" ? "vf-badge-warning" : "vf-badge-default"}`}>
                    {p.estado}
                  </span>
                </div>
              </div>
            </div>
          </m.div>
        ))
      )}
    </div>
  </m.div>
);
