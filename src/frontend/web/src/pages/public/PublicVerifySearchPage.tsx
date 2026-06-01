import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  QrCode,
  Lock,
  Clock,
  ChevronLeft,
  Globe,
  ArrowRight,
  ShieldAlert,
  Gavel,
  Building2
} from "lucide-react";

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
    <div className="min-h-screen bg-surface font-sans text-text-primary flex flex-col selection:bg-primary/20 selection:text-primary">

      {/* Navbar Premium */}
      <nav className="fixed top-0 w-full z-50 bg-secondary/95 backdrop-blur-xl border-b border-white/5 h-20 px-8 flex justify-between items-center transition-all duration-500">
        <div className="flex items-center gap-6">
          <Link to="/" className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 hover:bg-primary/20 transition-all">
            <ChevronLeft className="w-6 h-6 text-primary" />
          </Link>
          <div className="flex flex-col">
            <Link to="/" className="flex items-center group">
              <img
                src="/brand/logotipo/LOGOTIPO WHITE.svg"
                alt="VeriFinca"
                className="h-10 w-auto group-hover:scale-105 transition-transform"
              />
            </Link>
          </div>
        </div>

        <Link
          to="/portal"
          className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-full transition-all"
        >
          <span className="text-white/80 text-xs font-black uppercase tracking-wider">Explorar Proyectos</span>
          <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
        </Link>
      </nav>

      {/* Hero Section with Grid Effect */}
      <div className="relative pt-40 pb-24 px-8 overflow-hidden bg-secondary">
        <div className="vf-hud-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary to-surface" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="display-lg text-white mb-6 animate-fade-in-up">
            Portal de Verificación<br />
            <span className="text-primary italic">de Integridad Inmobiliaria</span>
          </h1>

          <p className="text-white/60 text-lg font-medium max-w-2xl mx-auto mb-12 animate-fade-in-up delay-100">
            Seguridad institucional para su inversión. El sello de VeriFinca garantiza que el proyecto cumple con los estándares documentales y de cumplimiento legal.
          </p>

          {/* Search Card */}
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-premium border border-outline-variant/5 animate-fade-in-up delay-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-surface-raised rounded-2xl flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-black text-secondary uppercase tracking-tight">Verificar Código</h2>
                <p className="text-xs text-on-surface-variant font-medium">Ingrese el identificador único del certificado</p>
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
                  className="w-full h-18 px-8 rounded-2xl border-2 border-outline-variant/10 bg-surface-raised text-on-surface text-2xl font-mono font-black text-center focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:opacity-20"
                />
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none opacity-20 group-focus-within:opacity-50 transition-opacity">
                  <Lock className="w-5 h-5 text-secondary" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-18 bg-primary rounded-2xl flex items-center justify-center gap-3 text-white font-black text-lg shadow-raised hover:shadow-floating hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Search className="w-6 h-6" />
                CONSULTAR REGISTRO
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Encriptado</div>
              <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Acceso Global</div>
              <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Tiempo Real</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-surface py-24 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-['Manrope'] text-secondary">Prevención de Fraude</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Verifica que los documentos presentados coinciden con los registros oficiales en nuestra base de datos institucional.</p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-['Manrope'] text-secondary">Inmutabilidad Blockchain</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Cada validación es sellada en una red distribuida, asegurando que el historial de cumplimiento no pueda ser alterado.</p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-['Manrope'] text-secondary">Monitoreo Constante</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Nuestros sistemas auditan el estatus de los permisos y licencias 24/7 para alertar sobre cualquier irregularidad.</p>
          </div>
        </div>
      </div>

      {/* Footer Industrial */}
      <footer className="bg-secondary pt-24 pb-12 px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col gap-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-white/60">
            <div className="md:col-span-2 space-y-8">
              <Link to="/">
                <img src="/brand/logotipo/LOGOTIPO WHITE.svg" alt="VeriFinca" className="h-12 w-auto" />
              </Link>
              <p className="text-lg max-w-md leading-relaxed text-white/40 font-medium">
                Construyendo infraestructuras de confianza para el futuro inmobiliario de la República Dominicana.
              </p>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Legal</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><a href="#" className="hover:text-primary transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
              © 2026 VeriFinca. Construyendo Confianza.
            </p>
            <div className="flex gap-4">
              {[Gavel, Building2].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-all border border-white/5">
                  <Icon className="w-5 h-5 text-white/40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
