import React from "react";
import { m } from "framer-motion";

export interface StatItem {
  name: string;
  stat: string;
  icon: React.ElementType;
  bgColor: string;
}

export interface DashboardStatsRowProps {
  stats: StatItem[];
}

export const DashboardStatsRow: React.FC<DashboardStatsRowProps> = React.memo(({ stats }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
    {stats.map((item, idx) => (
      <m.div
        key={item.name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * idx, duration: 0.5 }}
        className="vf-card p-0 overflow-hidden group hover:border-primary/40 transition-all shadow-sm"
      >
        <div className="p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
            <div className={`absolute inset-0 opacity-10 ${item.bgColor}`} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
            <item.icon
              className={`h-8 w-8 ${item.name === "Rechazados" ? "text-error" : item.name === "Aprobados" ? "text-success" : "text-primary"}`}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1 opacity-70">{item.name}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-display font-black text-text-primary tracking-tighter">{item.stat}</p>
            </div>
          </div>
        </div>
      </m.div>
    ))}
  </div>
));
