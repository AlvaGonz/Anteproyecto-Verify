import { useState, useMemo } from 'react';
import { useFindings } from './api/useFindings';
import { FindingsSummaryBento } from './components/FindingsSummaryBento';
import { FindingsFilterBar } from './components/FindingsFilterBar';
import { FindingsTable } from './components/FindingsTable';
import { FindingsVisualInsight } from './components/FindingsVisualInsight';
import type { IFinding, IFindingsSummary } from './types/findings.types';
import { FindingSeverity, FindingStatus } from './types/findings.types';

// Translation helpers
const severityMap: Record<string, FindingSeverity> = {
  "Critico": FindingSeverity.CRITICAL,
  "Alto": FindingSeverity.HIGH,
  "Medio": FindingSeverity.MEDIUM,
  "Bajo": FindingSeverity.LOW,
};

const statusMap: Record<string, FindingStatus> = {
  "Abierto": FindingStatus.PENDING,
  "Resuelto": FindingStatus.RESOLVED,
  "Descartado": FindingStatus.RESOLVED, // Assuming Descartado is considered resolved for UI
};

export const FindingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Use hook with a default project ID (e.g. 1) for now until router integration
  const projectId = 1;
  const { data: rawFindings = [], isLoading } = useFindings(projectId);

  // Map API DTOs to UI Models
  const mappedFindings: IFinding[] = useMemo(() => {
    return rawFindings.map((f) => ({
      id: String(f.idHallazgo),
      title: f.titulo,
      description: f.descripcion,
      severity: severityMap[f.severidad] || FindingSeverity.MEDIUM,
      source: "Internal", // ⚠️ HUMAN REVIEW: Mocked source as API doesn't have it
      date: f.fechaDeteccion,
      status: statusMap[f.estado] || FindingStatus.PENDING,
    }));
  }, [rawFindings]);

  // Compute summary dynamically
  const summary: IFindingsSummary = useMemo(() => {
    let critical = 0, high = 0, medium = 0, low = 0, resolved = 0;
    mappedFindings.forEach(f => {
      if (f.severity === FindingSeverity.CRITICAL) critical++;
      else if (f.severity === FindingSeverity.HIGH) high++;
      else if (f.severity === FindingSeverity.MEDIUM) medium++;
      else if (f.severity === FindingSeverity.LOW) low++;
      if (f.status === FindingStatus.RESOLVED) resolved++;
    });

    return {
      total: mappedFindings.length,
      critical,
      high,
      medium,
      low,
      resolved,
      integrityScore: 84, // ⚠️ HUMAN REVIEW: Hardcoded placeholder
      integrityTrend: -4,
    };
  }, [mappedFindings]);

  const filteredFindings = useMemo(() => {
    return mappedFindings.filter((finding) => {
      const matchesSearch = 
        finding.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        finding.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = severityFilter === '' || finding.severity === severityFilter;
      const matchesStatus = statusFilter === '' || finding.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [mappedFindings, searchTerm, severityFilter, statusFilter]);

  if (isLoading) {
    return <div className="p-8 text-center text-text-secondary">Loading findings...</div>;
  }

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
      <FindingsSummaryBento summary={summary} />

      {/* Main Content Area: Filters + Table */}
      <div className="bg-surface rounded-3xl border border-border shadow-raised overflow-hidden">
        <FindingsFilterBar 
          onSearchChange={setSearchTerm}
          onSeverityChange={setSeverityFilter}
          onStatusChange={setStatusFilter}
        />
        
        {mappedFindings.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">No se encontraron hallazgos</div>
        ) : (
          <FindingsTable findings={filteredFindings} />
        )}
        
        {/* Pagination Placeholder */}
        <div className="p-6 border-t border-border bg-surface flex justify-between items-center">
          <span className="text-xs text-text-secondary font-medium">
            Showing {filteredFindings.length} of {mappedFindings.length} findings
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
      <FindingsVisualInsight summary={summary} locationName="Torre Piantini" />
      
      {/* Spacer for bottom */}
      <div className="h-8"></div>
    </div>
  );
};

export default FindingsPage;
