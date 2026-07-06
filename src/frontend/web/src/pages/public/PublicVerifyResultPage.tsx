import React from "react";
import { useParams, Link, useLocation } from "react-router-dom";

import { usePublicVerification } from "../../features/public-verification/api/usePublicVerification";
import { VerificationResultCard } from "../../features/public-verification/components/VerificationResultCard";
import { LandingFooter } from "../../features/public/components/LandingFooter";
import {
  ShieldCheck,
  Search,
  ArrowLeft,
  ChevronLeft,
  XCircle,
  Loader2,
  Globe,
  Lock,
  ShieldAlert
} from "lucide-react";

export const PublicVerifyResultPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Auto-detect type if default is cert but the code matches an official format
  const getDetectedType = (): string => {
    const typeParam = searchParams.get("type") || "cert";
    if (typeParam === "cert" && code) {
      if (/^\d{3}-\d{7}-\d$/.test(code)) {
        return "cedula";
      } else if (/^\d{3}-\d{2}-\d{3}$/.test(code)) {
        return "suelo";
      } else if (/^\d-\d{2}-\d{5}-\d$/.test(code)) {
        return "rnc";
      }
    }
    return typeParam;
  };

  const type = getDetectedType();

  const getSearchTypeLabel = () => {
    switch (type) {
      case "suelo": return "Número de Suelo";
      case "ipi": return "IPI";
      case "rnc": return "RNC";
      case "cedula": return "Cédula";
      default: return "Sello VeriFinca";
    }
  };

  const { data = null, isLoading, error: fetchError } = usePublicVerification(code || '');
  const error = fetchError ? (fetchError as any).message || `El valor "${code}" no corresponde a ningún ${getSearchTypeLabel()} verificado en nuestra plataforma.` : null;

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-8">
        <div className="vf-hud-grid opacity-10" />
        <div className="relative z-10 text-center">
          <div className="relative mb-8">
            <ShieldCheck className="w-20 h-20 text-primary mx-auto animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          </div>
          <h2 className="text-2xl font-['Manrope'] font-black text-white mb-2">Verificando Credenciales</h2>
          <div className="flex items-center justify-center gap-2 text-white/40 font-mono text-xs uppercase tracking-[0.3em]">
            <Loader2 className="w-3 h-3 animate-spin" /> Accediendo al Registro Blockchain
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface flex flex-col selection:bg-error/10 selection:text-error">
        <nav className="fixed top-0 w-full z-50 bg-secondary px-8 h-20 flex justify-between items-center transition-all duration-500">
          <div className="flex items-center gap-6">
            <Link to="/projects" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all">
              <ChevronLeft className="w-6 h-6 text-white" />
            </Link>
            <div className="flex flex-col">
              <Link to="/" className="flex items-center group">
                <img
                  src="/brand/logotipo/LOGOTIPO WHITE.optimized.svg"
                  alt="VeriFinca"
                  className="h-10 w-auto group-hover:scale-105 transition-transform"
                />
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-8 pt-20">
          <div className="max-w-md w-full text-center space-y-8 animate-fade-in-up">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-error/10 rounded-3xl flex items-center justify-center border-2 border-error/20">
                <ShieldAlert className="w-12 h-12 text-error" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-error rounded-full flex items-center justify-center border-4 border-surface text-white">
                <XCircle className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-['Manrope'] font-black text-secondary mb-3">Código No Válido</h2>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                {error || "El registro solicitado no existe o ha sido revocado por la autoridad competente."}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                to="/projects"
                className="h-16 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 font-black text-lg shadow-raised hover:shadow-floating hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Search className="w-6 h-6" /> REINTENTAR BÚSQUEDA
              </Link>
              <Link
                to="/"
                className="h-16 border-2 border-outline-variant/10 text-secondary bg-surface rounded-2xl flex items-center justify-center gap-3 font-black text-lg hover:bg-surface-raised transition-all"
              >
                <ArrowLeft className="w-6 h-6" /> VOLVER AL INICIO
              </Link>
            </div>

            <div className="pt-8 flex justify-center gap-6 opacity-40">
              <Globe className="w-5 h-5 text-secondary" />
              <Lock className="w-5 h-5 text-secondary" />
              <ShieldCheck className="w-5 h-5 text-secondary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success result ── */
  return (
    <div className="min-h-screen bg-[#F4F1EC] font-sans flex flex-col selection:bg-primary/20 selection:text-primary">

      {/* Dynamic Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-secondary/95 backdrop-blur-xl border-b border-white/5 h-20 px-8 flex justify-between items-center transition-all duration-500 print:hidden">
        <div className="flex items-center gap-6">
          <Link to="/projects" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all">
            <ChevronLeft className="w-6 h-6 text-white" />
          </Link>
          <div className="flex flex-col">
            <span className="text-white text-xl font-display font-black tracking-tight">VeriFinca</span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-[-2px]">Institutional Division</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white font-mono text-[10px] font-black tracking-widest uppercase">Nodo Activo: VF-DR-01</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-24 px-8 animate-fade-in-up">
        {/* Verification Result Card (Certificate) */}
        <VerificationResultCard data={data} />

        {/* Support Section */}
        <div className="max-w-4xl mx-auto mt-16 text-center print:hidden">
          <p className="text-on-surface-variant text-sm font-medium mb-8">
            ¿Tiene dudas sobre este certificado? <a href="mailto:soporte@verifinca.do" className="text-secondary font-black underline decoration-primary underline-offset-4">Contacte a Soporte Institucional</a>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-30 px-12 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="h-12 flex items-center justify-center border-r border-outline-variant/20 italic font-black text-secondary">FIDUCIA</div>
            <div className="h-12 flex items-center justify-center border-r border-outline-variant/20 italic font-black text-secondary">CATASTRO</div>
            <div className="h-12 flex items-center justify-center border-r border-outline-variant/20 italic font-black text-secondary">PROCONSUMIDOR</div>
            <div className="h-12 flex items-center justify-center italic font-black text-secondary">DGII</div>
          </div>
        </div>
      </main>

      {/* Industrial Footer */}
      <div className="print:hidden">
        <LandingFooter />
      </div>
    </div>
  );
};
