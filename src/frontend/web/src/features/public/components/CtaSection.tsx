import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInUp } from "./motion";

export const CtaSection: React.FC = () => (
  <section id="servicios" className="py-20 px-6 bg-white mt-12">
    <motion.div
      {...fadeInUp}
      className="max-w-7xl mx-auto bg-primary rounded-[48px] p-12 md:p-24 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      <div className="space-y-6 relative z-10 max-w-2xl">
        <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-none tracking-tight">
          Lleva tu proyecto al siguiente nivel de confianza
        </h2>
        <p className="text-white/80 text-lg md:text-xl font-medium">
          Únete a la red de desarrolladores que han transformado la industria en RD.
        </p>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Link
          to="/register"
          className="bg-white text-primary px-12 py-5 rounded-[24px] font-display font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
        >
          Empezar Ahora
        </Link>
        <span className="text-white/60 text-xs font-black uppercase tracking-[0.3em]">Garantía VeriFinca</span>
      </div>
    </motion.div>
  </section>
);
