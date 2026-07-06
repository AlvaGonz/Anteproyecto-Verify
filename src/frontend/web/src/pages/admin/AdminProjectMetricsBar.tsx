import React from "react";

interface Metric {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  barColor: string;
  pct: number;
}

interface AdminProjectMetricsBarProps {
  metrics: Metric[];
}

export const AdminProjectMetricsBar: React.FC<AdminProjectMetricsBarProps> = ({ metrics }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    {metrics.map((stat) => (
      <div
        key={stat.label}
        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:shadow-md"
      >
        <div className="flex items-center gap-5 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}
          >
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {stat.label}
            </p>
            <p className="text-2xl font-display font-black text-gray-900">{stat.value}</p>
          </div>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${stat.barColor}`}
            style={{ width: `${stat.pct}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);
