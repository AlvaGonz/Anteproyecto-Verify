import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Search, QrCode, Lock, Clock } from "lucide-react";

export const PublicVerifySearchPage: React.FC = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/verify/${code.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--color-brand-primary)] pt-8 pb-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-[var(--color-brand-accent-soft)]" />
            <span className="text-xl font-bold text-white">VeriFinca</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Portal de Verificacion Publica
          </h1>
          <p className="text-white/60">
            Consulte el estado de integridad de cualquier proyecto inmobiliario registrado.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto px-4 -mt-8 w-full flex-1">
        <div className="vf-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-[var(--color-brand-primary)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-text-strong)]">
                Verificar Codigo
              </h2>
              <p className="text-xs text-[var(--color-text-strong)] opacity-50">
                Ingrese el codigo del sello de integridad
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                required
                placeholder="Ej. VF-2026-ABC123XYZ"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="vf-input py-3 font-mono text-center text-lg"
              />
            </div>
            <button type="submit" className="vf-btn-primary w-full py-3">
              <Search className="w-5 h-5" />
              Consultar
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--color-surface-muted)]/50 flex items-center justify-center gap-4 text-xs text-[var(--color-text-strong)] opacity-40">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Cifrado</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Ley 172-13</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Tiempo real</span>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--color-text-strong)] opacity-40 mt-6">
          Constancia informativa. No sustituye documentacion legal oficial.
        </p>
      </div>
    </div>
  );
};
