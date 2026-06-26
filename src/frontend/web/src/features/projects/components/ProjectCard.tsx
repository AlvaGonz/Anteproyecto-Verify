import React, { useMemo } from "react";
import { ProyectoDto, ProjectStatus } from "../types";
import { Link } from "react-router-dom";
import { useDocuments } from "../../documents/api/useDocuments";
import { getProjectCoverUrl } from "../utils/imageUtils";
import { DocumentStatus } from "../../documents/types";
import { 
  ShieldCheck, 
  MapPin, 
  FileText, 
  ChevronRight,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: ProyectoDto;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { data: documents = [] } = useDocuments(project.id);

  const documentCount = documents.length;
  const allVerified = useMemo(() => {
    return documents.length >= 20 && documents.every((d: any) => d.estadoDocumento === DocumentStatus.Valid);
  }, [documents]);

  const coverUrl = getProjectCoverUrl(project.imagenUrl, documents);

  const isValidated = project.estadoProyecto === ProjectStatus.Validated && allVerified;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="vf-card group !p-0 overflow-hidden border border-surface-container-high/50 hover:border-primary/30 transition-all duration-500"
    >
      <div className="relative h-48 overflow-hidden bg-secondary">
         {coverUrl ? (
           <img
             src={coverUrl}
             alt={`Portada del proyecto ${project.nombre}`}
             className="absolute inset-0 w-full h-full object-cover"
             loading="lazy"
           />
         ) : (
           <div className="absolute inset-0 flex items-center justify-center">
             <ShieldCheck className={`w-16 h-16 ${isValidated ? "text-primary animate-pulse" : "text-white/10"}`} />
           </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-primary/40 opacity-90"></div>
         
         <div className="absolute top-4 left-4 z-10">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg backdrop-blur-md ${
              isValidated 
                ? "bg-white text-secondary border-primary shadow-primary/20" 
                : "bg-black/20 text-white/80 border-white/10"
            }`}>
              {isValidated ? "Expediente Verificado" : "Auditoría en proceso"}
            </div>
         </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-display font-black text-secondary tracking-tight group-hover:text-primary transition-colors uppercase italic">
            {project.nombre}
          </h3>
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">
            <MapPin className="w-3 h-3 text-primary" />
            {project.ubicacionTexto}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-6 border-y border-surface-container-high/50">
          <div className="space-y-1">
             <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest block">Documentos</span>
             <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-secondary/40" />
                <span className="text-sm font-black text-secondary">{documentCount ?? "--"}</span>
             </div>
          </div>
          <div className="space-y-1">
             <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest block">Actualización</span>
             <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary/40" />
                <span className="text-sm font-black text-secondary">
                  {new Date().toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })}
                </span>
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 group/btn">
            <Link
              to={`/p/${project.id}`}
              className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 hover:gap-4 transition-all"
            >
              Auditar Proyecto <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isValidated && (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
