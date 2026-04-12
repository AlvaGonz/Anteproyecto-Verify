import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Search, QrCode, Lock, Clock, ChevronLeft } from "lucide-react";

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
    <div className="min-h-screen bg-surface font-['Inter'] text-on-surface selection:bg-primary-container selection:text-on-primary-container flex flex-col">
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
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="w-14 h-14 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-[#F98513]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#F4F1EC] font-['Manrope'] mb-3 leading-tight">
            Portal de Verificación Pública
          </h1>
          <p className="text-[#F4F1EC]/60 text-lg font-light">
            Consulte el estado de integridad de cualquier proyecto inmobiliario registrado.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 shadow-lg">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface font-['Manrope']">Verificar Código</h2>
                <p className="text-xs text-on-surface-variant">Ingrese el código del sello de integridad</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Ej. VF-2026-ABC123XYZ"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-14 px-6 rounded-full border border-outline-variant/30 bg-surface text-on-surface placeholder:text-outline/60 font-mono text-center text-lg outline-none focus:ring-2 focus:ring-primary-container transition-all"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#F98513] text-[#5d2d00] py-4 rounded-full font-['Manrope'] font-black text-lg active:scale-95 transition-transform shadow-md hover:shadow-lg"
              >
                <Search className="w-5 h-5" />
                Consultar
              </button>
            </form>

            {/* Trust badges */}
            <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-center gap-6 text-xs text-on-surface-variant/50">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Cifrado</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Ley 172-13</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Tiempo real</span>
            </div>
          </div>

          <p className="text-center text-xs text-on-surface-variant/40 mt-4">
            Constancia informativa. No sustituye documentación legal oficial.
          </p>
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
