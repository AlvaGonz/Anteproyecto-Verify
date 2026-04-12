import React, { useState } from "react";
import { Link } from "react-router-dom";
import { publicApi, PublicProjectStatusDto } from "../../features/public/api/publicApi";
import { ProjectStatusBadge } from "../../features/public/components/ProjectStatusBadge";
import { ValidationSummaryPublic } from "../../features/public/components/ValidationSummaryPublic";
import { Shield, Search, Lock, QrCode } from "lucide-react";

export const PublicVerificationPage: React.FC = () => {
  const [codigo, setCodigo] = useState("");
  const [result, setResult] = useState<PublicProjectStatusDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await publicApi.getProjectStatus(codigo);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Error al consultar el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)]">
      {/* Header */}
      <div className="bg-[var(--color-brand-primary)] pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-[var(--color-brand-accent-soft)]" />
            <span className="text-xl font-bold text-white">VeriFinca</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Verificacion Publica de Proyecto
          </h1>
          <p className="text-white/60">
            Ingrese el codigo publico o token QR para verificar el estado de validacion de un proyecto inmobiliario.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <div className="vf-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-[var(--color-brand-primary)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-text-strong)]">Codigo Publico o Token QR</h2>
              <p className="text-xs text-[var(--color-text-strong)] opacity-50">Consultar estado del proyecto</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Ej. VERIFINCA-2026-ABC123"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="vf-input flex-1 py-3"
            />
            <button type="submit" disabled={loading} className="vf-btn-primary py-3 px-6">
              <Search className="w-4 h-4" />
              {loading ? "Buscando..." : "Verificar"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 pt-6 border-t border-[var(--color-surface-muted)]/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text-strong)]">{result.nombreProyecto}</h3>
                  <p className="text-sm text-[var(--color-text-strong)] opacity-50 mt-1 font-mono">{result.codigoPublico}</p>
                  <p className="text-sm text-[var(--color-text-strong)] opacity-50">{new Date(result.fechaEmision).toLocaleDateString()}</p>
                </div>
                <ProjectStatusBadge status={result.estadoValidacion} />
              </div>

              <ValidationSummaryPublic dimensiones={result.resumenDimensiones} />

              <div className="mt-6 bg-[var(--color-surface-base)] rounded-lg p-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--color-text-strong)] opacity-30 flex-shrink-0" />
                <p className="text-xs text-[var(--color-text-strong)] opacity-40">
                  Constancia informativa. No expone datos personales protegidos por la Ley 172-13.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
