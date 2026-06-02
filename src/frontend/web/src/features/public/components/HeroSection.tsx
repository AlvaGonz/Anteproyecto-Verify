import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronRight, Zap, Lock, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const [code, setCode] = React.useState("");

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
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-[2px] bg-primary/40 z-20 shadow-[0_0_20px_rgba(249,133,19,0.7)]"
        />

        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-40 mix-blend-multiply transition-all duration-1000 z-0 scale-110"
          poster="/media/verifinca_institutional.png"
        >
          <source src="/media/landing_Sketch_to_finished_202604121407.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 max-w-5xl space-y-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-8xl font-display font-black text-secondary leading-[0.95] tracking-tight">
            Seguridad técnica y <span className="text-primary italic">jurídica</span> en un clic
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
            La plataforma líder en validación de proyectos inmobiliarios en RD. Conectamos datos institucionales en tiempo real para inversores y desarrolladores.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl"
        >
          <div className="bg-white p-2 rounded-3xl flex flex-col sm:flex-row items-center shadow-2xl shadow-secondary/10 border border-gray-100 group focus-within:ring-4 focus-within:ring-primary/5 transition-all">
            <div className="flex-1 w-full flex items-center px-4">
              <Search className="w-5 h-5 text-gray-300 group-focus-within:text-primary" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nombre del proyecto o código de radicación..."
                className="w-full bg-transparent border-none focus:ring-0 px-3 py-4 text-base font-bold placeholder:text-gray-300 outline-none"
              />
            </div>
            <Link
              to={code ? `/projects/verify/${code}` : "/projects"}
              className="w-full sm:w-auto bg-secondary text-white px-10 py-4 rounded-2xl font-display font-black text-lg hover:bg-primary active:scale-95 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
            >
              Consultar Ahora
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
            <Link to="/projects" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Zap className="w-3.5 h-3.5 text-primary" /> {t('hero.valExpress')}
            </Link>
            <Link to="/projects" className="flex items-center gap-1.5 border-l border-gray-200 pl-4 hover:text-primary transition-colors">
              <Lock className="w-3.5 h-3.5 text-primary" /> {t('hero.connNotarial')}
            </Link>
            <Link to="/projects" className="flex items-center gap-1.5 border-l border-gray-200 pl-4 hover:text-primary transition-colors">
              <Building2 className="w-3.5 h-3.5 text-primary" /> {t('hero.dataProcuraduria')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
