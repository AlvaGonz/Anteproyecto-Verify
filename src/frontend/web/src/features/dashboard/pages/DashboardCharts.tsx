import React, { useMemo, useRef, useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { m } from "framer-motion";
import type { ProyectosPorMesDto } from "../../../infrastructure/api/dashboard.api";

export interface DashboardChartsProps {
  totalProjects: number;
  verified: number;
  proyectosPorMes: ProyectosPorMesDto[];
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const Sparkline: React.FC<{ data: { month: string; count: number }[] }> = ({ data }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [width, setWidth] = React.useState(0);
  const height = 200;
  const pad = { t: 30, r: 24, b: 28, l: 32 };

  useEffect(() => {
    if (!svgRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(svgRef.current.parentElement!);
    return () => ro.disconnect();
  }, []);

  const { path, area, yMax, yMin, gridLines } = React.useMemo(() => {
    if (!data.length || !width) return { path: "", area: "", yMax: 0, yMin: 0, gridLines: [] as number[] };
    const vals = data.map(d => d.count);
    const yMax = Math.max(...vals) * 1.15 || 1;
    const yMin = 0;
    const plotW = width - pad.l - pad.r;
    const plotH = height - pad.t - pad.b;
    const x = (i: number) => pad.l + (i / Math.max(data.length - 1, 1)) * plotW;
    const y = (v: number) => pad.t + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;
    const pts = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.count).toFixed(1)}`);
    const area = `M${x(0).toFixed(1)},${pad.t + plotH} ${pts.join(" ")} L${x(data.length - 1).toFixed(1)},${pad.t + plotH}Z`;
    const tickCount = 4;
    const gridLines = Array.from({ length: tickCount + 1 }, (_, i) => yMin + (yMax - yMin) * (i / tickCount));
    return { path: pts.join(" "), area, yMax, yMin, gridLines };
  }, [data, width]);

  return (
    <svg ref={svgRef} width="100%" height={height} style={{ display: "block", overflow: "visible" }}>
      {gridLines.map((v, i) => {
        const yPos = pad.t + (height - pad.t - pad.b) * (1 - (v - yMin) / (yMax - yMin || 1));
        return (
          <g key={i}>
            <text x={pad.l - 6} y={yPos + 3.5} textAnchor="end" fontSize="10" fill="#9ca3af">{Math.round(v)}</text>
            <line x1={pad.l} y1={yPos} x2={width - pad.r} y2={yPos} stroke="#e5e7eb" strokeWidth={1} />
          </g>
        );
      })}
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#223382" stopOpacity={0.12} />
          <stop offset="95%" stopColor="#223382" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkGrad)" />
      <path d={path} fill="none" stroke="#223382" strokeWidth={2} strokeLinejoin="round" />
      {data.map((d, i) => {
        if (!width) return null;
        const plotW = width - pad.l - pad.r;
        const plotH = height - pad.t - pad.b;
        const cx = pad.l + (i / Math.max(data.length - 1, 1)) * plotW;
        const cy = pad.t + plotH - ((d.count - yMin) / (yMax - yMin || 1)) * plotH;
        return (
          <g key={i} className="group cursor-pointer">
            <text x={cx} y={pad.t + plotH + 16} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.month}</text>
            <circle cx={cx} cy={cy} r="4" fill="#223382" className="group-hover:r-6 group-hover:fill-[#F98513] transition-all" />
            {/* Invisible rect for easier hovering */}
            <rect x={cx - 15} y={pad.t} width="30" height={plotH + 20} fill="transparent" />
            <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <rect x={cx - 24} y={cy - 26} width="48" height="18" rx="4" fill="#1f2937" />
              <text x={cx} y={cy - 14} textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">{d.count}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export const DashboardCharts: React.FC<DashboardChartsProps> = React.memo(({ totalProjects, verified, proyectosPorMes }) => {
  const chartData = useMemo(() =>
    proyectosPorMes.map((d) => ({
      month: `${MONTHS[d.month - 1]}`,
      count: d.count,
    })),
    [proyectosPorMes]
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: "800ms" }}>
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-[#223382] rounded-2xl p-6 text-white border-none shadow-md relative overflow-hidden flex-1 flex flex-col"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-display font-black tracking-tight">
              Salud de los <span className="text-[#F98513]">Proyectos</span>
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

      {chartData.length > 0 && (
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white border border-border rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-display font-black text-[#223382] tracking-tight mb-2">
            Proyectos por <span className="text-[#F98513]">Mes</span>
          </h3>
          <Sparkline data={chartData} />
        </m.div>
      )}
    </div>
  );
});