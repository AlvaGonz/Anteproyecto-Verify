import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, QrCode, Lock, ShieldCheck, Globe, Clock } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VerifySearchFormProps {
  className?: string;
  variant?: "light" | "dark";
}

export const VerifySearchForm: React.FC<VerifySearchFormProps> = ({ 
  className,
  variant = "light"
}) => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/verify/${code.trim()}`);
    }
  };

  const isDark = variant === "dark";

  return (
    <div className={cn(
      "max-w-xl mx-auto rounded-3xl p-8 md:p-10 shadow-premium border",
      isDark ? "bg-slate-900/50 border-white/10 backdrop-blur-xl" : "bg-white border-slate-100",
      className
    )}>
      <div className="flex items-center gap-4 mb-8">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
          isDark ? "bg-white/5" : "bg-slate-50"
        )}>
          <QrCode className={cn("w-6 h-6", isDark ? "text-primary" : "text-secondary")} />
        </div>
        <div className="text-left">
          <h2 className={cn("text-lg font-black uppercase tracking-tight", isDark ? "text-white" : "text-secondary")}>
            Validar Certificado
          </h2>
          <p className={cn("text-xs font-medium", isDark ? "text-white/40" : "text-slate-400")}>
            Ingrese el identificador único del sello VeriFinca
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <input
            type="text"
            required
            placeholder="Ej: VF-2026-X83L"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={cn(
              "w-full h-18 px-8 rounded-2xl border-2 transition-all text-2xl font-mono font-black text-center placeholder:opacity-20 flex items-center justify-center",
              isDark 
                ? "bg-white/5 border-white/5 text-white focus:border-primary focus:ring-4 focus:ring-primary/10" 
                : "bg-slate-50 border-slate-100 text-secondary focus:border-primary focus:ring-4 focus:ring-primary/10"
            )}
            style={{ height: '4.5rem' }}
          />
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none opacity-20 group-focus-within:opacity-50 transition-opacity">
            <Lock className={cn("w-5 h-5", isDark ? "text-white" : "text-secondary")} />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-18 bg-primary rounded-2xl flex items-center justify-center gap-3 text-white font-black text-lg shadow-raised hover:shadow-floating hover:scale-[1.02] active:scale-95 transition-all"
          style={{ height: '4.5rem' }}
        >
          <Search className="w-6 h-6" />
          CONSULTAR REGISTRO
        </button>
      </form>

      <div className={cn(
        "mt-8 pt-6 border-t flex justify-between items-center text-[10px] font-black uppercase tracking-widest",
        isDark ? "border-white/5 text-white/20" : "border-slate-50 text-slate-300"
      )}>
        <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Encriptado</div>
        <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Acceso Global</div>
        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Tiempo Real</div>
      </div>
    </div>
  );
};
