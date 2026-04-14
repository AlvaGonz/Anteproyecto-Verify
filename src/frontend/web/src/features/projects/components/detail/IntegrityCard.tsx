import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield } from 'lucide-react';

interface IntegrityCardProps {
  score: number;
  riskLevel: 'minimo' | 'medio' | 'alto';
}

export const IntegrityCard: React.FC<IntegrityCardProps> = ({ score, riskLevel }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#223382] text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden"
    >
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-6">Resumen de Validación</h3>
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full border-8 border-green-500/30 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="48" cy="48" r="40"
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="8"
                strokeDasharray={`${score * 2.51} 251`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="text-2xl font-black">{score}%</span>
            <div className="absolute -top-1 -right-1 bg-green-500 p-1.5 rounded-full border-4 border-[#223382]">
              <Zap size={10} fill="white" />
            </div>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1">Puntaje de Integridad</p>
            <p className="text-lg font-bold">
              Riesgo: <span className="text-green-400 capitalize">{riskLevel}</span>
            </p>
          </div>
        </div>
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
          <p className="text-sm font-light leading-relaxed">
            Este proyecto ha superado los protocolos de cumplimiento normativo y financiero de VeriFinca.
          </p>
        </div>
      </div>
      <div className="absolute bottom-[-50px] right-[-30px] opacity-10 rotate-12">
        <Shield size={240} />
      </div>
    </motion.div>
  );
};
