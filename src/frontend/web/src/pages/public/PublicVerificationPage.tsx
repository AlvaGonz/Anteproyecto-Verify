import React, { useState } from "react";
import { Link } from "react-router-dom";
import { publicApi, PublicProjectStatusDto } from "../../features/public/api/publicApi";
import { ProjectStatusBadge } from "../../features/public/components/ProjectStatusBadge";
import { ValidationSummaryPublic } from "../../features/public/components/ValidationSummaryPublic";
import { Shield, Search, Lock, QrCode, ChevronLeft } from "lucide-react";

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al consultar el proyecto.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-['Inter'] text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Nav */}
      <nav className="w-full flex justify-between items-center px-8 h-20 bg-[#223382] shadow-2xl shadow-[#111144]/10 font-['Manrope'] font-bold tracking-tight">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <Link to="/" className="text-2xl font-extrabold text-[#F4F1EC]">VeriFinca</Link>
        </div>
        <Link to="/projects" className="hidden md:flex text-[#F4F1EC]/80 hover:text-white transition-colors text-sm font-semibold">
          Ver Proyectos →
        </Link>
      </nav>

      {/* Hero */}
      <div className="bg-[#223382] py-16 px-8 text-center relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-14 h-14 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center">
            <QrCode className="w-7 h-7 text-[#F98513]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#F4F1EC] font-['Manrope'] mb-3 leading-tight">
            Verificación Pública de Proyecto
          </h1>
          <p className="text-[#F4F1EC]/60 text-lg font-light">
            Ingrese el código público o token QR para verificar el estado de validación de un proyecto inmobiliario.
          </p>
        </div>
      </div>

      {/* Search card */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 shadow-lg">
          {/* Card header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface font-['Manrope']">Código Público o Token QR</h2>
              <p className="text-xs text-on-surface-variant">Consultar estado del proyecto</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Ej. VERIFINCA-2026-ABC123"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="flex-1 h-12 px-4 rounded-full border border-outline-variant/30 bg-surface text-on-surface placeholder:text-outline/60 outline-none focus:ring-2 focus:ring-primary-container transition-all text-base"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#F98513] text-[#5d2d00] px-6 py-3 rounded-full font-bold active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              {loading ? "Buscando..." : "Verificar"}
            </button>
          </form>

          {/* Error state */}
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-error-container text-on-error-container text-sm border border-error/20">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-6 pt-6 border-t border-outline-variant/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-on-surface font-['Manrope']">{result.nombreProyecto}</h3>
                  <p className="text-sm text-outline mt-1 font-mono">{result.codigoPublico}</p>
                  <p className="text-sm text-on-surface-variant">{new Date(result.fechaEmision).toLocaleDateString()}</p>
                </div>
                <ProjectStatusBadge status={result.estadoValidacion} />
              </div>

              <ValidationSummaryPublic dimensiones={result.resumenDimensiones} />

              <div className="mt-6 bg-surface-container-low rounded-lg p-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-outline flex-shrink-0" />
                <p className="text-xs text-on-surface-variant">
                  Constancia informativa. No expone datos personales protegidos por la Ley 172-13.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#111144] text-[#F4F1EC] py-10 px-8 flex flex-col md:flex-row justify-between items-center gap-4 font-light text-sm mt-auto">
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
