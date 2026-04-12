import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicProjectVerificationDto } from "../../features/public-verification/types";
import { publicVerificationApi } from "../../features/public-verification/api/publicVerificationApi";
import { Shield, CheckCircle2, XCircle, Search, ArrowLeft, MapPin, Calendar, Lock, ChevronLeft } from "lucide-react";

export const PublicVerifyResultPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<PublicProjectVerificationDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!code) return;
      setIsLoading(true);
      try {
        const result = await publicVerificationApi.verifyCode(code);
        if (result) setData(result);
        else setError("Código de verificación no válido o no encontrado.");
      } catch {
        setError("Error al verificar el código. Intente más tarde.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [code]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#223382] mx-auto mb-3 animate-pulse" />
          <p className="text-lg font-semibold text-on-surface">Verificando...</p>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <nav className="w-full flex items-center px-8 h-20 bg-[#223382] shadow-2xl font-['Manrope'] font-bold">
          <Link to="/" className="text-2xl font-extrabold text-[#F4F1EC]">VeriFinca</Link>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-10 max-w-md w-full text-center shadow-lg">
            <XCircle className="w-14 h-14 text-error mx-auto mb-4" />
            <h2 className="text-xl font-bold text-on-surface font-['Manrope'] mb-2">Verificación Fallida</h2>
            <p className="text-sm text-on-surface-variant mb-8">{error || "Código no encontrado."}</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/verify"
                className="flex items-center justify-center gap-2 bg-[#F98513] text-[#5d2d00] py-3 px-6 rounded-full font-bold active:scale-95 transition-transform"
              >
                <Search className="w-4 h-4" /> Intentar otro código
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 border border-outline-variant/30 text-on-surface py-3 px-6 rounded-full font-semibold hover:bg-surface-container-low transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success result ── */
  return (
    <div className="min-h-screen bg-surface font-['Inter'] text-on-surface flex flex-col">
      {/* Nav */}
      <nav className="w-full flex justify-between items-center px-8 h-20 bg-[#223382] shadow-2xl shadow-[#111144]/10 font-['Manrope'] font-bold tracking-tight">
        <div className="flex items-center gap-4">
          <Link to="/verify" className="text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <Link to="/" className="text-2xl font-extrabold text-[#F4F1EC]">VeriFinca</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#223382] py-14 px-8 text-center relative overflow-hidden">
        <div className="absolute -right-20 top-0 w-60 h-60 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#F4F1EC] font-['Manrope'] mb-2">
            Resultado de Verificación
          </h1>
          <p className="text-[#F4F1EC]/60 font-light">
            Constancia pública del estado de validación del proyecto.
          </p>
        </div>
      </div>

      {/* Result card */}
      <div className="max-w-2xl mx-auto w-full px-4 py-12 flex-1">
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden shadow-lg">
          {/* Status bar */}
          <div className={`px-6 py-4 flex items-center gap-3 ${data.isVerifiable ? "bg-emerald-50" : "bg-error-container"}`}>
            {data.isVerifiable
              ? <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              : <XCircle className="w-6 h-6 text-on-error-container" />}
            <span className={`text-sm font-bold ${data.isVerifiable ? "text-emerald-700" : "text-on-error-container"}`}>
              {data.isVerifiable ? "Proyecto Verificado" : "Proyecto No Verificable"}
            </span>
          </div>

          {!data.isVerifiable && (
            <div className="px-6 py-3 bg-error-container/30 border-t border-error/10 text-sm text-on-error-container">
              {data.verificationMessage}
            </div>
          )}

          {/* Detail content */}
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-on-surface font-['Manrope']">{data.projectName}</h2>
              <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mt-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {data.publicLocation}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20">
              <div>
                <div className="text-xs text-on-surface-variant/60 mb-1">Estado</div>
                <div className="text-sm font-semibold text-on-surface">{data.publicProjectStatus}</div>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant/60 mb-1">Integridad</div>
                <div className="text-sm font-semibold text-on-surface">{data.integrityStatus}</div>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant/60 mb-1">Código</div>
                <div className="text-sm font-mono font-semibold text-on-surface">{data.publicCode}</div>
              </div>
              {data.lastVerifiedUtc && (
                <div>
                  <div className="text-xs text-on-surface-variant/60 mb-1">Fecha</div>
                  <div className="flex items-center gap-1 text-sm text-on-surface">
                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                    {new Date(data.lastVerifiedUtc).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-outline-variant/20">
              <div className="text-xs text-on-surface-variant/60 mb-1">Resumen</div>
              <p className="text-sm text-on-surface leading-relaxed">{data.summary}</p>
            </div>
          </div>

          {/* Card footer */}
          <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-outline" />
            <p className="text-xs text-on-surface-variant">
              Constancia informativa. No sustituye documentación legal oficial (Ley 172-13).
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/verify" className="text-sm font-medium text-secondary hover:underline">
            Verificar otro proyecto
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#111144] text-[#F4F1EC] py-10 px-8 flex flex-col md:flex-row justify-between items-center gap-4 font-light text-sm">
        <div className="font-bold text-[#F4F1EC] font-['Manrope']">VeriFinca</div>
        <div className="flex items-center gap-2 text-[#F4F1EC]/50">
          <Shield className="w-4 h-4" />
          Portal de Verificación Institucional
        </div>
        <div className="text-xs text-[#F4F1EC]/40">© {new Date().getFullYear()} VeriFinca.</div>
      </footer>
    </div>
  );
};
