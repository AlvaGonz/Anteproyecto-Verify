import React from "react";
import { Shield } from "lucide-react";
import { m } from "framer-motion";

export interface DashboardChartsProps {
  totalProjects: number;
  verified: number;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = React.memo(({ totalProjects, verified }) => (
  <div className="flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: "800ms" }}>
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
      className="bg-[#223382] rounded-2xl p-6 text-white border-none shadow-md relative overflow-hidden flex-1 flex flex-col justify-between"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-display font-black tracking-tight">
            Salud del <span className="text-[#F98513]">Sistema</span>
          </h3>
        </div>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6">Proyectos aprobados vs total</p>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-4">
        <div>
          <p className="text-4xl font-display font-black text-white leading-none">
            {totalProjects > 0 ? ((verified / totalProjects) * 100).toFixed(1) : "0"}%
          </p>
          <p className="text-[8px] font-black text-white/30 uppercase mt-1 tracking-tighter">Convergencia de Aprobación</p>
        </div>
      </div>

      <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12">
        <Shield className="w-48 h-48" />
      </div>
    </m.div>
  </div>
));
