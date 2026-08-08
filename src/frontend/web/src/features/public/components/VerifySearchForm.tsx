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
import { useQueryClient } from "@tanstack/react-query";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { useAuth } from "../../../shared/context/AuthContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VerifySearchFormProps {
  className?: string;
  variant?: "light" | "dark";
  onSearch?: (type: string, query: string) => void;
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
    label: "Permiso Suelo",
    icon: MapPin,
    placeholder: "Ej: 12345",
    title: "Catastro Nacional / Uso de Suelo",
    subtitle: "Búsqueda por Número de Permiso de Suelo",
    example: "12345"
  },
  {
    id: "ipi",
    label: "IPI",
    icon: FileText,
    placeholder: "Ej: 101999999999",
    title: "Consulta IPI",
    subtitle: "Búsqueda por Impuesto al Patrimonio Inmobiliario",
    example: "101999999999"
  },
  {
    id: "rnc",
    label: "RNC",
    icon: Building2,
    placeholder: "Ej: 101234567",
    title: "Registro RNC",
    subtitle: "Búsqueda por Registro Nacional de Contribuyentes",
    example: "101234567"
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
    regex: /^VF-\d{4}-[A-Z0-9]{4,10}$/,
    example: "VF-2026-X83L",
    name: "Sello VeriFinca"
  },
  suelo: {
    regex: /^\d{4,10}$/,
    example: "12345",
    name: "Número Permiso"
  },
  rnc: {
    regex: /^\d{9,11}$/,
    example: "101234567",
    name: "RNC"
  },
  ipi: {
    regex: /^\d{12}$/,
    example: "101999999999",
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

const formatValue = (value: string, typeId: string): string => {
  if (typeId === "cedula") {
    const clean = value.replace(/[^0-9]/g, "");
    if (clean.length > 3 && clean.length <= 10) {
      return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    } else if (clean.length > 10) {
      return `${clean.slice(0, 3)}-${clean.slice(3, 10)}-${clean.slice(10, 11)}`;
    }
    return clean;
  } else if (typeId === "ipi") {
    const clean = value.replace(/[^0-9]/g, "");
    return clean;
  } else if (typeId === "rnc") {
    const clean = value.replace(/[^0-9]/g, "");
    return clean;
  } else if (typeId === "suelo") {
    const clean = value.replace(/[^0-9]/g, "");
    return clean;
  } else {
    // Para Sello VeriFinca u otros
    let clean = value.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase();
    if (typeId === "cert") {
      // Intentar auto formatear si es puro alfanumerico
      const justChars = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (justChars.startsWith("VF") && justChars.length > 6) {
        return `VF-${justChars.slice(2, 6)}-${justChars.slice(6, 16)}`;
      }
    }
    return clean;
  }
};

export const VerifySearchForm: React.FC<VerifySearchFormProps> = ({
  className,
  variant = "light",
  onSearch
}) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState(SEARCH_TYPES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { user, isAuthenticated } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateInput(code.trim(), searchType.id);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (code.trim()) {
      if (!isAuthenticated) {
        addToast("Debe iniciar sesión para realizar consultas.", "info");
        navigate("/login");
        return;
      }

      const { projectsApi } = await import("../../projects/api/projectsApi");
      const result = await projectsApi.consumeQuota({ codigo: code.trim() });
      if (result._tag === 'Failure') {
        const errorTag = (result as any).error?._tag || result.error?._tag;
        if (errorTag === 'LimitReached') {
          if (user?.role === 'Administrator') {
            console.warn("Quota limit reached but bypassed for Administrator.");
          } else {
            addToast("Límite de consultas alcanzado. Mejora tu plan para continuar.", "error");
            return;
          }
        } else if (errorTag !== 'Unauthorized') {
          // Log errors other than unauthorized, but allow the search to proceed for public users
          console.warn("Quota check failed, but proceeding with search.", result);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["subscription", "my-status"] });
      
      if (onSearch) {
        onSearch(searchType.id, code.trim());
      } else {
        if (searchType.id === "cert") {
          navigate(`/projects/verify/${encodeURIComponent(code.trim())}`);
        } else {
          navigate(`/projects?type=${encodeURIComponent(searchType.id)}&q=${encodeURIComponent(code.trim())}`);
        }
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
      "max-w-xl mx-auto rounded-3xl p-4 md:p-8 shadow-premium border transition-all duration-500",
      isDark ? "bg-slate-900/50 border-white/10 backdrop-blur-xl" : "bg-white border-slate-100",
      className
    )}>
      {/* Header Section with Icon and Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-4 flex-1 justify-center min-w-0">
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
            onChange={(e) => setCode(formatValue(e.target.value, searchType.id))}
            className={cn(
              "w-full h-18 px-8 rounded-2xl border-2 transition-all text-2xl font-mono font-black text-center placeholder:opacity-20 flex items-center justify-center",
              isDark
                ? "bg-white/5 border-white/5 text-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                : "bg-slate-50 border-slate-100 text-secondary focus:border-primary focus:ring-4 focus:ring-primary/10"
            )}
            style={{ height: '3.5rem' }}
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
        "mt-8 pt-6 border-t flex flex-wrap justify-between gap-2 items-center text-[10px] font-black uppercase tracking-widest",
        isDark ? "border-white/5 text-white/20" : "border-slate-50 text-slate-300"
      )}>
        <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Encriptado</div>
        <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Acceso Global</div>
        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Tiempo Real</div>
      </div>
    </div>
  );
};
