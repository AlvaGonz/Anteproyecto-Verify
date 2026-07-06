import React from "react";
import { Link } from "react-router-dom";
import { motion as m } from "framer-motion";
import { ShieldCheck, Zap } from "lucide-react";
import { RegisterForm } from "../../features/auth/components/RegisterForm";

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F1EC] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <m.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
      />
      <m.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -30, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"
      />

      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-5xl bg-white border border-border rounded-[32px] shadow-premium flex flex-col md:flex-row overflow-hidden relative z-10"
      >
        {/* Left Side: Info */}
        <div className="w-full md:w-[400px] bg-[#223382] p-12 text-white relative flex flex-col justify-between overflow-hidden shrink-0">
          {/* Subtle geometric pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 border-2 border-white rounded-full" />
            <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 border border-white rounded-full opacity-50" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="mb-10">
              <Link to="/" className="inline-block mb-10 group transition-transform hover:scale-[1.02]">
                <img
                  src="/brand/logotipo/LOGOTIPO WHITE.optimized.svg"
                  alt="VeriFinca Logo"
                  className="h-10 w-auto"
                />
              </Link>
              <div className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary-light mb-4">
                Plataforma Certificada
              </div>
              <h2 className="text-4xl font-display font-black leading-[1.1] mb-6 tracking-tighter text-white">
                Integridad <br />
                <span className="text-primary-light">en cada m².</span>
              </h2>

              <p className="text-base text-white/70 leading-relaxed font-medium max-w-[280px]">
                La solución definitiva para la validación y gestión de proyectos inmobiliarios institucionales.
              </p>
            </div>

            <div className="space-y-8 flex-1">
              <div className="flex gap-5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                  <ShieldCheck className="w-6 h-6 text-primary-light" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-display font-bold text-[15px] leading-tight mb-1 text-white">Cifrado de Extremo a Extremo</h4>
                  <p className="text-xs text-white/80 leading-normal">Sus datos están protegidos por estándares globales de seguridad.</p>
                </div>
              </div>

              <div className="flex gap-5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                  <Zap className="w-6 h-6 text-primary-light" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-display font-bold text-[15px] leading-tight mb-1 text-white">Acceso Instantáneo</h4>
                  <p className="text-xs text-white/80 leading-normal">Infraestructura optimizada para una respuesta inmediata.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-12 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#223382] bg-surface-variant/20 backdrop-blur-sm flex items-center justify-center text-[9px] font-black text-primary-light shadow-lg">PRO</div>
                  ))}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white/80 leading-tight">Únete a la red</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">+250 PROFESIONALES</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-12 flex items-center justify-center">
          <RegisterForm />
        </div>
      </m.div>
    </div>
  );
};
