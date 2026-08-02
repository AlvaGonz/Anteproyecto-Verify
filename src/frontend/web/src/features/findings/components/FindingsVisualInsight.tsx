import { IFindingsSummary } from '../types/findings.types';

interface FindingsVisualInsightProps {
  summary: IFindingsSummary;
  locationName: string;
}

export const FindingsVisualInsight = ({ summary, locationName }: FindingsVisualInsightProps) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Map Insight */}
      <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 h-[300px] relative overflow-hidden shadow-raised group">
        <div className="absolute inset-0 grayscale opacity-40 group-hover:opacity-60 transition-opacity duration-700">
          <img 
            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-10000"
            loading="lazy"
            decoding="async"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqZE_FVPB2DqWk8DwPX0B-qPzbX-EIk3HlkeHL8jXf-VNmQ3nwQzl3MrFhzXhd3WCiAEwj68pSmQht3PW4c4IZIxvwlAa1AIa5rhc6B5pLDFVLRBDo7l7u1u3s8zxeB2bfKfKj3BmKs4zQy6u8vG2dD6plMlafxhCRsYkkz0gPquaxzG7olMKLqal1hiZunwgdLPAyJFNz7EamlJANe9cBdWfcBllRRVA6EPFBWF1y8DvP2dKURpMFnysNnfe8d1Yz833YQM83Qcs"
            alt="Site location context"
          />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
          <div>
            <span className="bg-primary px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider text-text-on-primary shadow-lg">
              Location Context
            </span>
            <h3 className="text-text-primary font-black text-xl mt-2 drop-shadow-sm font-display">
              {locationName} Site
            </h3>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface/90 backdrop-blur-md p-3 rounded-lg shadow-floating border border-red-500/20 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-ping"></div>
              <span className="text-[10px] font-black text-text-primary uppercase tracking-tight">
                Conflict Area: North Boundary
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Integrity Score */}
      <div className="bg-secondary p-8 rounded-xl border border-secondary shadow-raised flex flex-col justify-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-symbols-outlined text-8xl" style={{ fontSize: '120px' }}>verified_user</span>
        </div>
        <h3 className="text-2xl font-black mb-4 font-display relative z-10">Integrity Score</h3>
        <div className="flex items-center gap-4 relative z-10">
          <span className="text-6xl font-black font-display">{summary.integrityScore}%</span>
          <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out" 
              style={{ width: `${summary.integrityScore}%` }}
            ></div>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium leading-relaxed opacity-80 relative z-10">
          The current integrity score has decreased by {Math.abs(summary.integrityTrend)}% due to the {summary.critical} critical findings detected in the latest Catastro sync.
        </p>
      </div>
    </section>
  );
};
