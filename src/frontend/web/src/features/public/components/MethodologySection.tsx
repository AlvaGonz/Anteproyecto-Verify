import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { fadeInUp } from "./motion";

export const MethodologySection: React.FC = () => (
  <section id="metodologia" className="py-32 px-6 bg-white overflow-hidden relative">
    <div className="max-w-7xl mx-auto space-y-24">
      <div className="text-center space-y-4 relative z-10">
        <h2 className="text-4xl md:text-6xl font-display font-black text-secondary tracking-tight">
          Protección en cada etapa
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
          Combinamos tecnología de punta con validaciones institucionales directas para garantizar integridad total.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Large */}
        <motion.div {...fadeInUp} className="md:col-span-2 bg-secondary p-12 rounded-[40px] text-white space-y-12 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="space-y-4">
            <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">Fase 01</span>
            <h3 className="text-3xl md:text-5xl font-display font-black leading-none !text-white">Ingesta de <br />Data Maestra</h3>
          </div>
          <p className="text-white/60 text-lg max-w-sm leading-relaxed">
            Procesamos la documentación legal del proyecto comparándola con repositorios históricos y cartografía digital certificada.
          </p>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary transition-colors">
            <Zap className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 2: Medium */}
        <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.1 }} className="bg-gray-50 p-10 rounded-[40px] flex flex-col justify-between border border-gray-100 hover:border-primary/20 transition-all">
          <div className="space-y-4">
            <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Fase 02</span>
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">Validación <br />Cruzada</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Integración directa con organismos de catastro y servicios notariales.
          </p>
        </motion.div>

        {/* Card 3: Medium */}
        <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.2 }} className="bg-white p-10 rounded-[40px] flex flex-col justify-between border border-gray-100 hover:border-primary/20 transition-all shadow-xl shadow-secondary/5">
          <div className="space-y-4">
            <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Fase 03</span>
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">Sello de <br />Integridad</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Emisión de certificado inmutable con código QR de verificación instantánea.
          </p>
        </motion.div>
      </div>
    </div>
  </section>
);
