import React from "react";
import { Link } from "react-router-dom";

export const LandingFooter: React.FC = () => (
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
            <li><Link to="/legal#terminos" className="hover:text-primary transition-colors">Términos de Servicio</Link></li>
            <li><Link to="/legal#privacidad" className="hover:text-primary transition-colors">Privacidad</Link></li>
            <li><Link to="/legal#cookies" className="hover:text-primary transition-colors">Cookies</Link></li>
          </ul>
        </div>
      </div>

      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
          © 2026 VeriFinca. Construyendo Confianza.
        </p>
      </div>
    </div>
  </footer>
);
