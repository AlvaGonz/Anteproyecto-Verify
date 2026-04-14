import { useState, useMemo } from 'react';
import { MOCK_FINDINGS, MOCK_SUMMARY } from './data/findings.mock';
import { FindingsSummaryBento } from './components/FindingsSummaryBento';
import { FindingsFilterBar } from './components/FindingsFilterBar';
import { FindingsTable } from './components/FindingsTable';
import { FindingsVisualInsight } from './components/FindingsVisualInsight';

export const FindingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredFindings = useMemo(() => {
    return MOCK_FINDINGS.filter((finding) => {
      const matchesSearch = 
        finding.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        finding.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = severityFilter === '' || finding.severity === severityFilter;
      const matchesStatus = statusFilter === '' || finding.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [searchTerm, severityFilter, statusFilter]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Breadcrumbs & Title */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest">
          <a href="#" className="hover:text-primary transition-colors">Projects</a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <a href="#" className="hover:text-primary transition-colors">Torre Piantini</a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-text-primary">Findings</span>
        </nav>
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-text-primary font-display tracking-tight">Torre Piantini</h1>
            <p className="text-text-secondary text-sm mt-1 font-medium">Validation Audit Findings & Discrepancies</p>
          </div>
          <button className="bg-primary text-text-on-primary px-6 py-3 rounded-xl font-black text-xs shadow-raised hover:bg-primary-hover hover:shadow-floating transition-all flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <FindingsSummaryBento summary={MOCK_SUMMARY} />

      {/* Main Content Area: Filters + Table */}
      <div className="bg-surface rounded-3xl border border-border shadow-raised overflow-hidden">
        <FindingsFilterBar 
          onSearchChange={setSearchTerm}
          onSeverityChange={setSeverityFilter}
          onStatusChange={setStatusFilter}
        />
        <FindingsTable findings={filteredFindings} />
        
        {/* Pagination Placeholder */}
        <div className="p-6 border-t border-border bg-surface flex justify-between items-center">
          <span className="text-xs text-text-secondary font-medium">
            Showing {filteredFindings.length} of {MOCK_FINDINGS.length} findings
          </span>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:bg-surface-raised transition-colors disabled:opacity-30" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg border border-primary bg-primary text-text-on-primary flex items-center justify-center text-xs font-black">
              1
            </button>
            <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:bg-surface-raised transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Insights Section */}
      <FindingsVisualInsight summary={MOCK_SUMMARY} locationName="Torre Piantini" />
      
      {/* Spacer for bottom */}
      <div className="h-8"></div>
    </div>
  );
};

export default FindingsPage;
