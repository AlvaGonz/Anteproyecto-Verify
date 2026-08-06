import React from "react";
import { Link } from "react-router-dom";

export const LandingFooter: React.FC = () => (
  <footer className="bg-secondary pt-24 pb-12 px-6 overflow-hidden relative">
    <div className="max-w-7xl mx-auto flex flex-col gap-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-white/60">
        <div className="md:col-span-2 space-y-8">
          <Link to="/">
            <img src="/brand/logotipo/LOGOTIPO WHITE.optimized.svg" alt="VeriFinca" className="h-12 w-auto" />
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
        <div className="space-y-6">
          <h4 className="text-white font-black text-xs uppercase tracking-widest">Contacto</h4>
          <div className="space-y-4">
            <p className="text-xs font-medium text-white/40 leading-relaxed">
              ¿Tiene problemas o necesita más información? Estamos aquí para ayudarle con sus proyectos.
            </p>
            <a 
              href="mailto:contacto@verifinca.com.do" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 text-white font-bold text-sm transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              contacto@verifinca.com.do
            </a>
          </div>
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
