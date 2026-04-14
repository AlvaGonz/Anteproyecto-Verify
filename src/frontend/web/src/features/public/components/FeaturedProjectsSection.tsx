import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, ChevronRight } from "lucide-react";
import { fadeInUp } from "./motion";

export const FeaturedProjectsSection: React.FC = () => (
  <section id="proyectos" className="py-32 px-6 bg-[#F4F1EC]">
    <div className="max-w-7xl mx-auto space-y-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">Expose Público</span>
          <h2 className="text-4xl md:text-6xl font-display font-black text-secondary tracking-tight">
            Proyectos <span className="italic text-primary">Verificados</span>
          </h2>
        </div>
        <Link to="/proyectos" className="flex items-center gap-2 text-secondary font-black group">
          Ver todos los proyectos <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            name: "Blue Forest Residences",
            location: "Las Terrenas, Samaná",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            status: "Auditado",
            risk: "Bajo",
          },
          {
            name: "Sky Tower SD",
            location: "Naco, Santo Domingo",
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            status: "En Proceso",
            risk: "Calculando",
          },
          {
            name: "Marina Reef",
            location: "Cap Cana, La Altagracia",
            image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80",
            status: "Certificado",
            risk: "Bajo",
          },
        ].map((project, i) => (
          <motion.div
            key={project.name}
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
            className="group bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 hover:-translate-y-2"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="bg-white/90 backdrop-blur shadow-lg px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-secondary tracking-widest">
                  {project.status}
                </span>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-secondary leading-none">{project.name}</h3>
                <p className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wide">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {project.location}
                </p>
              </div>
              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Nivel de Riesgo</p>
                  <p className="text-secondary font-black flex items-center gap-1">
                    {project.risk} <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </p>
                </div>
                <button className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
