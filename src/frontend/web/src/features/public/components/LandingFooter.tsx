import React from "react";
import { Link } from "react-router-dom";
import { Gavel, Building2 } from "lucide-react";

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
          <h4 className="text-white font-black text-xs uppercase tracking-widest">Navegación</h4>
          <ul className="space-y-4 text-sm font-bold">
            <li><Link to="/portal" className="hover:text-primary transition-colors text-white/60">Verificar Proyecto</Link></li>
            <li><a href="#" className="hover:text-primary transition-colors">Instituciones</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Portal Auditor</a></li>
          </ul>
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
);
