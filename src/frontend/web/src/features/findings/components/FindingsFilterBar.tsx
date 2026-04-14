interface FindingsFilterBarProps {
  onSearchChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export const FindingsFilterBar = ({ 
  onSearchChange, 
  onSeverityChange, 
  onStatusChange 
}: FindingsFilterBarProps) => {
  return (
    <div className="p-6 border-b border-border bg-surface-raised/30 flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-text-secondary" data-icon="filter_list">filter_list</span>
        <span className="text-sm font-bold text-text-primary">Filters:</span>
      </div>
      
      <select 
        onChange={(e) => onSeverityChange(e.target.value)}
        className="rounded-lg border-border text-sm focus:ring-primary focus:border-primary bg-surface py-2 px-3 outline-none"
      >
        <option value="">Severity: All</option>
        <option value="CRITICAL">Critical</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      <select 
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-lg border-border text-sm focus:ring-primary focus:border-primary bg-surface py-2 px-3 outline-none"
      >
        <option value="">Status: All</option>
        <option value="PENDING">Pending</option>
        <option value="RESOLVED">Resolved</option>
      </select>

      <select className="rounded-lg border-border text-sm focus:ring-primary focus:border-primary bg-surface py-2 px-3 outline-none">
        <option>Source: All Agencies</option>
        <option>Catastro</option>
        <option>DGII</option>
        <option>Internal</option>
      </select>

      <div className="flex-1"></div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]" data-icon="search">search</span>
        <input 
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg border-border text-sm focus:ring-primary focus:border-primary bg-surface outline-none" 
          placeholder="Search by ID or Title..." 
          type="text"
        />
      </div>
    </div>
  );
};
