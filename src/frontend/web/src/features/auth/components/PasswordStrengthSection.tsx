import React from "react";
import { Check, X } from "lucide-react";

interface Requirement {
  label: string;
  passed: boolean;
}

export interface PasswordStrengthSectionProps {
  password: string;
  checks: Requirement[];
}

const LAST_TWO_CLASS = "col-span-2";

export const PasswordStrengthSection: React.FC<PasswordStrengthSectionProps> = ({
  password,
  checks,
}) =>
  password.length > 0 ? (
    <div className="p-4 bg-slate-50 border border-border/80 rounded-xl space-y-2 text-xs text-text-secondary transition-all animate-in fade-in duration-200">
      <p className="font-bold text-[#223382] mb-1">Requisitos de seguridad:</p>
      <div className="grid grid-cols-2 gap-2">
        {checks.map((check, i) => (
          <div key={check.label} className={`flex items-center gap-2 ${i === checks.length - 1 ? LAST_TWO_CLASS : ""}`}>
            {check.passed ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <X className="w-4 h-4 text-rose-400" />}
            <span className={check.passed ? "text-emerald-700 font-medium" : ""}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  ) : null;
