import { IFindingsSummary } from '../types/findings.types';

interface FindingsSummaryBentoProps {
  summary: IFindingsSummary;
}

export const FindingsSummaryBento = ({ summary }: FindingsSummaryBentoProps) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-6 gap-4">
      {/* Total Card */}
      <div className="md:col-span-1 bg-white p-5 rounded-xl border border-border shadow-raised flex flex-col justify-between">
        <span className="text-xs font-bold text-text-secondary uppercase">Total</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-text-primary tracking-tight font-display">{summary.total}</span>
          <span className="text-xs text-text-secondary">Findings</span>
        </div>
      </div>

      {/* Critical Card */}
      <div className="md:col-span-1 bg-red-50 p-5 rounded-xl border border-red-200 shadow-raised flex flex-col justify-between">
        <span className="text-xs font-bold text-red-700 uppercase">Critical</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-red-600 tracking-tight font-display">{summary.critical}</span>
          <span className="material-symbols-outlined text-red-600 text-[20px] fill-current">report</span>
        </div>
      </div>

      {/* High Card */}
      <div className="md:col-span-1 bg-orange-50 p-5 rounded-xl border border-orange-200 shadow-raised flex flex-col justify-between">
        <span className="text-xs font-bold text-orange-700 uppercase">High</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-orange-600 tracking-tight font-display">{summary.high}</span>
        </div>
      </div>

      {/* Medium Card */}
      <div className="md:col-span-1 bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-raised flex flex-col justify-between">
        <span className="text-xs font-bold text-amber-700 uppercase">Medium</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-amber-600 tracking-tight font-display">{summary.medium}</span>
        </div>
      </div>

      {/* Low Card */}
      <div className="md:col-span-1 bg-luster-white p-5 rounded-xl border border-border shadow-raised flex flex-col justify-between">
        <span className="text-xs font-bold text-text-secondary uppercase">Low</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-text-secondary tracking-tight font-display">{summary.low}</span>
        </div>
      </div>

      {/* Resolved Card */}
      <div className="md:col-span-1 bg-emerald-50 p-5 rounded-xl border border-emerald-200 shadow-raised flex flex-col justify-between">
        <span className="text-xs font-bold text-emerald-700 uppercase">Resolved</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-emerald-600 tracking-tight font-display">{summary.resolved}</span>
          <span className="material-symbols-outlined text-emerald-600 text-[20px] fill-current">check_circle</span>
        </div>
      </div>
    </section>
  );
};
