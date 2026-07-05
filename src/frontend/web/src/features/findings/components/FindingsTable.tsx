import { IFinding, FindingStatus } from '../types/findings.types';
import { FindingsSeverityBadge } from './FindingsSeverityBadge';

interface FindingsTableRowProps {
  finding: IFinding;
}

export const FindingsTableRow = ({ finding }: FindingsTableRowProps) => {
  const isResolved = finding.status === FindingStatus.RESOLVED;

  return (
    <tr className="hover:bg-surface-raised/50 transition-colors">
      <td className="px-6 py-4 font-mono text-xs text-text-secondary">{finding.id}</td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-text-primary text-sm">{finding.title}</span>
          <span className="text-xs text-text-secondary">{finding.description}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <FindingsSeverityBadge severity={finding.severity} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-border"></div>
          <span className="text-sm font-medium text-text-primary">{finding.source}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-text-secondary">{finding.date}</td>
      <td className="px-6 py-4">
        <div className={`flex items-center gap-1.5 text-xs font-bold ${isResolved ? 'text-success' : 'text-primary'}`}>
          {isResolved ? (
            <span className="material-symbols-outlined text-[14px] fill-current">check_circle</span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          )}
          {finding.status}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button type="button" className="text-primary font-bold text-sm hover:underline hover:text-primary-hover transition-colors">
          Ver detalle
        </button>
      </td>
    </tr>
  );
};

interface FindingsTableProps {
  findings: IFinding[];
}

export const FindingsTable = ({ findings }: FindingsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-raised/50 text-text-secondary uppercase text-[11px] font-bold tracking-widest border-b border-border">
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Severity</th>
            <th className="px-6 py-4">Source</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {findings.map((finding) => (
            <FindingsTableRow key={finding.id} finding={finding} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
