import { FindingSeverity } from '../types/findings.types';

interface FindingsSeverityBadgeProps {
  severity: FindingSeverity;
}

export const FindingsSeverityBadge = ({ severity }: FindingsSeverityBadgeProps) => {
  const styles = {
    [FindingSeverity.CRITICAL]: 'bg-red-100 text-red-700',
    [FindingSeverity.HIGH]: 'bg-orange-100 text-orange-700',
    [FindingSeverity.MEDIUM]: 'bg-amber-100 text-amber-700',
    [FindingSeverity.LOW]: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${styles[severity]}`}>
      {severity}
    </span>
  );
};
