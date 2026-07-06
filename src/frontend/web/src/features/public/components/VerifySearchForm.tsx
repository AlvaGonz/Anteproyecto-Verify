import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import { 
  Search, 
  QrCode, 
  Lock, 
  ShieldCheck, 
  Globe, 
  Clock, 
  ChevronDown, 
  MapPin, 
  FileText, 
  Building2, 
  User,
  Check
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VerifySearchFormProps {
  className?: string;
  variant?: "light" | "dark";
}

const SEARCH_TYPES = [
  { 
    id: "cert", 
    label: "Sello VeriFinca", 
    icon: QrCode, 
    placeholder: "Ej: VF-2026-X83L",
    title: "Validar Certificado",
    subtitle: "Ingrese el identificador único del sello VeriFinca",
    example: "VF-2026-X83L"
  },
  { 
    id: "suelo", 
    label: "Número Suelo", 
    icon: MapPin, 
    placeholder: "Ej: 001-02-003",
    title: "Catastro Nacional",
    subtitle: "Búsqueda por número de registro de suelo",
    example: "001-02-003"
  },
  { 
    id: "ipi", 
    label: "IPI", 
    icon: FileText, 
    placeholder: "Ej: 1-01-99999-9",
    title: "Consulta IPI",
    subtitle: "Búsqueda por Impuesto al Patrimonio Inmobiliario",
    example: "1-01-999999-9"
  },
  { 
    id: "rnc", 
    label: "RNC", 
    icon: Building2, 
    placeholder: "Ej: 1-01-23456-7",
    title: "Registro RNC",
    subtitle: "Búsqueda por Registro Nacional de Contribuyentes",
    example: "1-01-23456-7"
  },
  { 
    id: "cedula", 
    label: "Cédula", 
    icon: User, 
    placeholder: "Ej: 402-1234567-8",
    title: "Documento Cédula",
    subtitle: "Búsqueda por número de identidad personal",
    example: "402-1234567-8"
  },
];

const VALIDATION_PATTERNS = {
  cert: {
    regex: /^VF-\d{4}-[A-Z0-9]{4}$/,
    example: "VF-2026-X83L",
    name: "Sello VeriFinca"
  },
  suelo: {
    regex: /^\d{3}-\d{2}-\d{3}$/,
    example: "001-02-003",
    name: "Número Suelo"
  },
  rnc: {
    regex: /^\d-\d{2}-\d{5}-\d$/,
    example: "1-01-23456-7",
    name: "RNC"
  },
  ipi: {
    regex: /^\d-\d{2}-\d{5}-\d$/,
    example: "1-01-23456-7",
    name: "IPI"
  },
  cedula: {
    regex: /^\d{3}-\d{7}-\d$/,
    example: "402-1234567-8",
    name: "Cédula"
  }
} as const;

const validateInput = (value: string, typeId: string): string | null => {
  if (!value.trim()) return "Por favor, ingrese un valor";
  
  const pattern = VALIDATION_PATTERNS[typeId as keyof typeof VALIDATION_PATTERNS];
  if (pattern && !pattern.regex.test(value)) {
    return `Formato de ${pattern.name} inválido (Ej: ${pattern.example})`;
  }
  
  return null;
};

export const VerifySearchForm: React.FC<VerifySearchFormProps> = ({ 
  className,
  variant = "light"
}) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState(SEARCH_TYPES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isDark = variant === "dark";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateInput(code.trim(), searchType.id);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    if (code.trim()) {
      if (searchType.id === "cert") {
        navigate(`/projects/verify/${code.trim()}`);
      } else {
        navigate(`/projects/verify/${code.trim()}?type=${searchType.id}`);
      }
    }
  };

  const handleTypeSelect = (type: typeof SEARCH_TYPES[0]) => {
    setSearchType(type);
    setIsDropdownOpen(false);
    setCode(""); 
    setError(null); // Limpiar error al cambiar tipo
  };

  return (
    <div className={cn(
      "max-w-xl mx-auto rounded-3xl p-8 md:p-10 shadow-premium border transition-all duration-500",
      isDark ? "bg-slate-900/50 border-white/10 backdrop-blur-xl" : "bg-white border-slate-100",
      className
    )}>
      {/* Header Section with Icon and Title */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500",
            isDark ? "bg-white/5" : "bg-slate-50"
          )}>
            <searchType.icon className={cn("w-6 h-6", isDark ? "text-primary" : "text-secondary")} />
          </div>
          <div className="text-left">
            <h2 className={cn("text-lg font-black uppercase tracking-tight", isDark ? "text-white" : "text-secondary")}>
              {searchType.title}
            </h2>
            <p className={cn("text-xs font-medium", isDark ? "text-white/40" : "text-slate-400")}>
              {searchType.subtitle}
            </p>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-widest",
              isDark 
                ? "bg-white/5 border-white/5 text-white/60 hover:text-white hover:border-white/10" 
                : "bg-slate-50 border-slate-100 text-slate-400 hover:text-secondary hover:border-slate-200"
            )}
          >
            Tipo: {searchType.label}
            <ChevronDown className={cn("w-3 h-3 transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <m.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden z-50",
                  isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-100"
                )}
              >
                <div className="p-2 space-y-1">
                  {SEARCH_TYPES.map((type) => (
                    <button type="button"
                      key={type.id}
                      onClick={() => handleTypeSelect(type)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left group",
                        searchType.id === type.id 
                          ? (isDark ? "bg-white/10 text-white" : "bg-slate-50 text-secondary")
                          : (isDark ? "text-white/40 hover:bg-white/5 hover:text-white" : "text-slate-400 hover:bg-slate-50/50 hover:text-secondary")
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <type.icon className={cn("w-4 h-4", searchType.id === type.id ? "text-primary" : "opacity-40 group-hover:opacity-100")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                      </div>
                      {searchType.id === type.id && <Check className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <input
            type="text"
            required
            placeholder={searchType.placeholder}
            aria-label={searchType.placeholder}
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
          
          <AnimatePresence>
            {error && (
              <m.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute -bottom-6 left-0 right-0 text-center"
              >
                <span className="text-[10px] font-black text-error uppercase tracking-widest bg-error/10 px-3 py-0.5 rounded-full border border-error/10">
                  {error}
                </span>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          className="w-full h-18 bg-primary rounded-2xl flex items-center justify-center gap-3 text-white font-black text-lg shadow-raised hover:shadow-floating hover:scale-[1.02] active:scale-95 transition-all"
          style={{ height: '4.5rem' }}
        >
          <Search className="w-6 h-6" />
          CONSULTAR {searchType.label}
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
