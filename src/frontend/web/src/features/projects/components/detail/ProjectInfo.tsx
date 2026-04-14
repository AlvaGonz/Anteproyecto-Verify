import React from 'react';
import { motion } from 'framer-motion';
import { ValidationProjectMetadata as ProjectMetadata } from '../../types';

interface ProjectInfoProps {
  metadata: ProjectMetadata;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ metadata }) => {
  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[#F4F1EC] p-10 rounded-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#223382]/5 rounded-bl-full -mr-10 -mt-10"></div>
      <h3 className="text-xs uppercase tracking-[0.2em] text-[#223382] font-bold mb-8 opacity-70">
        Información del Proyecto
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-6 relative z-10">
        <div>
          <p className="text-[#5C5C5C] text-sm mb-1">Desarrollador</p>
          <p className="text-xl font-bold text-[#223382]">{metadata.developer}</p>
        </div>
        <div>
          <p className="text-[#5C5C5C] text-sm mb-1">Año de Finalización</p>
          <p className="text-xl font-bold text-[#223382]">{metadata.completionYear}</p>
        </div>
        <div>
          <p className="text-[#5C5C5C] text-sm mb-1">Número de Registro</p>
          <p className="text-xl font-bold text-[#223382]">{metadata.registrationNumber}</p>
        </div>
        <div>
          <p className="text-[#5C5C5C] text-sm mb-1">Tipo de Propiedad</p>
          <p className="text-xl font-bold text-[#223382]">{metadata.propertyType}</p>
        </div>
      </div>
    </motion.section>
  );
};
