import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicProjectVerificationDto } from "../../features/public-verification/types";
import { publicVerificationApi } from "../../features/public-verification/api/publicVerificationApi";
import { Shield, CheckCircle2, XCircle, Search, ArrowLeft, MapPin, Calendar, Lock } from "lucide-react";

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
        else setError("Codigo de verificacion no valido o no encontrado.");
      } catch {
        setError("Error al verificar el codigo. Intente mas tarde.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [code]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-base)] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-10 h-10 text-[var(--color-brand-primary)] mx-auto mb-3 animate-pulse" />
          <p className="text-lg font-semibold text-[var(--color-text-strong)]">Verificando...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-base)] flex flex-col items-center justify-center px-4">
        <div className="vf-card p-8 max-w-md w-full text-center">
          <XCircle className="w-14 h-14 text-[var(--color-brand-accent)] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--color-text-strong)] mb-2">
            Verificacion Fallida
          </h2>
          <p className="text-sm text-[var(--color-text-strong)] opacity-60 mb-6">
            {error || "Codigo no encontrado."}
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/verify" className="vf-btn-primary w-full">
              <Search className="w-4 h-4" /> Intentar otro codigo
            </Link>
            <Link to="/" className="vf-btn-secondary w-full">
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)]">
      {/* Header */}
      <div className="bg-[var(--color-brand-primary)] pt-8 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-[var(--color-brand-accent-soft)]" />
            <span className="text-xl font-bold text-white">VeriFinca</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">
            Resultado de Verificacion
          </h1>
          <p className="text-white/60 text-sm">
            Constancia publica del estado de validacion del proyecto.
          </p>
        </div>
      </div>

      {/* Result card */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 pb-12">
        <div className="vf-card overflow-hidden">
          {/* Top status bar */}
          <div className={`px-6 py-4 flex items-center gap-3 ${data.isVerifiable ? "bg-emerald-50" : "bg-red-50"}`}>
            {data.isVerifiable ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <span className={`text-sm font-bold ${data.isVerifiable ? "text-emerald-700" : "text-red-700"}`}>
              {data.isVerifiable ? "Proyecto Verificado" : "Proyecto No Verificable"}
            </span>
          </div>

          {!data.isVerifiable && (
            <div className="px-6 py-3 bg-red-50/50 border-t border-red-100 text-sm text-red-600">
              {data.verificationMessage}
            </div>
          )}

          {/* Details */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-strong)]">{data.projectName}</h2>
              <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-strong)] opacity-60 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {data.publicLocation}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-surface-muted)]/50">
              <div>
                <div className="text-xs text-[var(--color-text-strong)] opacity-50 mb-1">Estado</div>
                <div className="text-sm font-semibold text-[var(--color-text-strong)]">{data.publicProjectStatus}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-strong)] opacity-50 mb-1">Integridad</div>
                <div className="text-sm font-semibold text-[var(--color-text-strong)]">{data.integrityStatus}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-strong)] opacity-50 mb-1">Codigo</div>
                <div className="text-sm font-mono font-semibold text-[var(--color-text-strong)]">{data.publicCode}</div>
              </div>
              {data.lastVerifiedUtc && (
                <div>
                  <div className="text-xs text-[var(--color-text-strong)] opacity-50 mb-1">Fecha</div>
                  <div className="flex items-center gap-1 text-sm text-[var(--color-text-strong)]">
                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                    {new Date(data.lastVerifiedUtc).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--color-surface-muted)]/50">
              <div className="text-xs text-[var(--color-text-strong)] opacity-50 mb-1">Resumen</div>
              <p className="text-sm text-[var(--color-text-strong)] leading-relaxed">{data.summary}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-[var(--color-surface-base)] border-t border-[var(--color-surface-muted)]/50 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-[var(--color-text-strong)] opacity-30" />
            <p className="text-xs text-[var(--color-text-strong)] opacity-30">
              Constancia informativa. No sustituye documentacion legal oficial (Ley 172-13).
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/verify" className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline">
            Verificar otro proyecto
          </Link>
        </div>
      </div>
    </div>
  );
};
