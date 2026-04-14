import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Fingerprint, ShieldCheck } from 'lucide-react';
import { TOKENS } from '../../constants';

interface HeroHeaderProps {
  name: string;
  location: string;
  projectId: string;
  status: 'approved' | 'pending' | 'rejected';
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({ name, location, projectId, status }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TOKENS.animation.transition}
      className="mb-16"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[#223382] font-semibold uppercase tracking-widest text-xs mb-3 block opacity-80">
            Registro Público Institucional
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#223382] mb-4 tracking-tighter">
            {name}
          </h1>
          <div className="flex items-center gap-4 text-[#5C5C5C] font-medium">
            <div className="flex items-center gap-1">
              <MapPin size={18} className="text-[#F98513]" />
              <span>{location}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[#DAD1C8]"></span>
            <div className="flex items-center gap-1">
              <Fingerprint size={18} className="text-[#F98513]" />
              <span>ID: {projectId}</span>
            </div>
          </div>
        </div>

        {status === 'approved' && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-[#f9851315] border border-[#F98513] px-6 py-3 rounded-full shadow-sm"
          >
            <ShieldCheck className="text-[#F98513]" size={24} />
            <span className="text-[#F98513] font-bold text-lg">Aprobado</span>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};
