import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export const OfficialSeal: React.FC = () => {
  return (
    <section className="mt-24 border-t-2 border-[#DAD1C8]/10 pt-24 text-center max-w-3xl mx-auto">
      <div className="mb-12 inline-block">
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-32 h-32 mx-auto relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[#223382] rounded-full opacity-5 animate-pulse"></div>
          <ShieldCheck size={80} className="text-[#F98513]" strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-4xl font-extrabold text-[#223382] mt-6">Sello de Integridad</h2>
        <p className="text-[#5C5C5C] mt-4 leading-relaxed font-medium">
          "Este proyecto ha sido validado por <span className="text-[#223382] font-bold">VeriFinca</span> bajo los estándares internacionales de transparencia inmobiliaria, garantizando la seguridad jurídica para todos los inversores."
        </p>
      </div>
      <div className="flex flex-col items-center gap-6">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#F98513] text-[#111144] text-lg font-bold px-12 py-5 rounded-full shadow-2xl hover:shadow-[#F98513]/20 transition-all border-none cursor-pointer"
        >
          Acceder al expediente completo
        </motion.button>
        <p className="text-sm text-[#223382]/60 font-semibold italic">
          Uso exclusivo para usuarios registrados con licencia profesional.
        </p>
      </div>
    </section>
  );
};
