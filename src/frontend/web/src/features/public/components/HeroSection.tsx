import React from "react";
import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { Zap, Lock, Building2 } from "lucide-react";
import { VerifySearchForm } from "./VerifySearchForm";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden px-6 md:px-12 pt-20">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-[100px] -z-10" />

      <div className="absolute right-0 top-0 w-full md:w-[60%] h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] z-[5]" />

        {/* Animated Scan Line */}
        <m.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-[2px] bg-primary/40 z-20 shadow-[0_0_20px_rgba(249,133,19,0.7)]"
        />

        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          className="w-full h-full object-cover opacity-40 mix-blend-multiply transition-all duration-1000 z-0 scale-110"
          poster="/media/verifinca_institutional.png"
        >
          <source src="/media/landing_compressed_hd.webm" type="video/webm" />
        </video>
      </div>

      <div className="relative z-10 max-w-5xl space-y-12">
        <m.div
          initial={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-8xl font-display font-black text-secondary leading-[0.95] tracking-tight">
            Seguridad técnica y <span className="text-primary italic">jurídica</span> en un clic
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
            La plataforma líder en validación de proyectos inmobiliarios en RD. Conectamos datos institucionales en tiempo real para inversores y desarrolladores.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl"
        >
          <VerifySearchForm variant="light" />

          <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-y-3 gap-x-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
            <Link to="/projects" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Zap className="w-3.5 h-3.5 text-primary" /> Validación Express
            </Link>
            <Link to="/projects" className="flex items-center gap-1.5 sm:border-l sm:border-gray-200 sm:pl-4 hover:text-primary transition-colors">
              <Lock className="w-3.5 h-3.5 text-primary" /> Conexión Notarial
            </Link>
            <Link to="/projects" className="flex items-center gap-1.5 sm:border-l sm:border-gray-200 sm:pl-4 hover:text-primary transition-colors">
              <Building2 className="w-3.5 h-3.5 text-primary" /> Data Procuraduría
            </Link>
          </div>
        </m.div>
      </div>
    </section>
  );
};

