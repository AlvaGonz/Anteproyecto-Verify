import React from "react";
import { ProjectStatus } from "../../features/projects/types";
import { Search, Filter } from "lucide-react";

const ALL_STATUSES = [
  { value: ProjectStatus.Draft, label: "Creado" },
  { value: ProjectStatus.Edited, label: "Editado" },
  { value: ProjectStatus.InReview, label: "En Revisión" },
  { value: ProjectStatus.Observed, label: "Con Observaciones" },
  { value: ProjectStatus.Published, label: "Publicado" },
];

interface AdminProjectToolbarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  activeFilter: string;
  setActiveFilter: (v: string) => void;
  selectedStatuses: ProjectStatus[];
  setSelectedStatuses: (v: ProjectStatus[]) => void;
  isFilterDropdownOpen: boolean;
  setIsFilterDropdownOpen: (v: boolean) => void;
}

export const AdminProjectToolbar: React.FC<AdminProjectToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  selectedStatuses,
  setSelectedStatuses,
  isFilterDropdownOpen,
  setIsFilterDropdownOpen,
}) => (
  <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 w-full">
    <div className="relative flex-1 group w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        placeholder="Buscar por nombre, código o folio..."
        aria-label="Buscar proyectos"
        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-gray-50 rounded-2xl w-full md:w-auto">
      {[
        { id: "all", label: "Todos" },
        { id: "published", label: "Publicados" },
        { id: "review", label: "En Revisión" },
      ].map((f) => (
        <button type="button"
          key={f.id}
          onClick={() => {
            setActiveFilter(f.id);
            if (f.id === "all") {
              setSelectedStatuses([]);
            } else if (f.id === "published") {
              setSelectedStatuses([ProjectStatus.Published]);
            } else if (f.id === "review") {
              setSelectedStatuses([ProjectStatus.InReview]);
            }
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            (activeFilter === f.id ||
             (f.id === "all" && selectedStatuses.length === 0) ||
             (f.id === "published" && selectedStatuses.length === 1 && selectedStatuses[0] === ProjectStatus.Published) ||
             (f.id === "review" && selectedStatuses.length === 1 && selectedStatuses[0] === ProjectStatus.InReview))
              ? "bg-white text-primary shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>

    <div className="relative w-full md:w-auto flex justify-center md:block">
      <button type="button"
        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
        className={`p-3 rounded-2xl transition-all ${
          selectedStatuses.length > 0
            ? "text-primary bg-primary/10 hover:bg-primary/20"
            : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
        }`}
        title="Filtrar por estados"
      >
        <Filter className="w-5 h-5" />
      </button>

      {isFilterDropdownOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Cerrar filtros"
            onClick={() => setIsFilterDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 z-20 p-4 space-y-2.5">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Filtrar por estado</p>
            {ALL_STATUSES.map((status) => {
              const isChecked = selectedStatuses.includes(status.value);
              return (
                <label key={status.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors w-full">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      let next;
                      if (isChecked) {
                        next = selectedStatuses.filter(s => s !== status.value);
                      } else {
                        next = [...selectedStatuses, status.value];
                      }
                      setSelectedStatuses(next);

                      if (next.length === 0) {
                        setActiveFilter("all");
                      } else if (next.length === 1 && next[0] === ProjectStatus.Published) {
                        setActiveFilter("published");
                      } else if (next.length === 1 && next[0] === ProjectStatus.InReview) {
                        setActiveFilter("review");
                      } else {
                        setActiveFilter("custom");
                      }
                    }}
                    className="rounded text-primary focus:ring-primary w-4 h-4 border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-700">{status.label}</span>
                </label>
              );
            })}
            {selectedStatuses.length > 0 && (
              <button type="button"
                onClick={() => {
                  setSelectedStatuses([]);
                  setActiveFilter("all");
                  setIsFilterDropdownOpen(false);
                }}
                className="w-full text-center text-xs font-black text-red-500 hover:text-red-700 pt-2 border-t border-gray-100 block"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </>
      )}
    </div>
  </div>
);
