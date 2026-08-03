import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { PROJECT_CATEGORIES } from "../api/usePublishedProjects";

interface ProjectTypeFilterProps {
  selected: number[];
  onToggle: (value: number) => void;
}

// Shared collapsible "Tipo (acumulativo)" filter — used by the public directory
// sidebar and the admin published-projects view.
export const ProjectTypeFilter: React.FC<ProjectTypeFilterProps> = ({ selected, onToggle }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 mt-4 mb-1.5 cursor-pointer group"
      >
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
          <span className="text-primary">●</span> Tipo (acumulativo)
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          {selected.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-black min-w-[18px] text-center leading-none">
              {selected.length}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 pt-1">
              {PROJECT_CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all ${
                    selected.includes(cat.value)
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(cat.value)}
                    onChange={() => onToggle(cat.value)}
                    className="w-3 h-3 accent-primary"
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};
