import { Link } from "react-router-dom";
import { CheckCircle2, MapPin, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";

import { useSuspensePublishedProjects, getDefaultProjectImage } from "../../projects/api/usePublishedProjects";


const ITEM_WIDTH = 400;
const GAP = 60;

export const FeaturedProjectsSection: React.FC = () => {
  const { data: searchResults = [] } = useSuspensePublishedProjects();
  const x = useMotionValue(0);
  const dragging = useRef(false);
  const hovering = useRef(false);

  // Use ALL published projects for the carousel (API already filters PUBLICADO)
  const projects = searchResults
    .map((p: any) => ({
      id: p.id,
      codigoPublico: p.codigoPublico,
      name: p.nombreProyecto,
      location: p.ubicacionTexto || "Ubicación no especificada",
      image: p.imagenUrl || getDefaultProjectImage(p.categoria),
      completionRate: p.completionRate ?? 80,
      isVerified: p.estadoValidacion === "Verificado",
    }))
    .slice(0, 12);

  if (projects.length === 0) return null;

  // Duplicate for seamless infinite loop
  const carouselItems = [...projects, ...projects];

  // Each item: width + gap. Track is 2x single set.
  const trackWidth = carouselItems.length * (ITEM_WIDTH + GAP);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (dragging.current || hovering.current) return;
      let next = x.get() - 2.5;
      if (next <= -(trackWidth / 2)) next += trackWidth / 2;
      x.set(next);
    }, 50);
    return () => clearInterval(id);
  }, [trackWidth]);

  return (
    <section id="proyectos" className="py-32 bg-surface-raised overflow-hidden">
      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black text-secondary tracking-tight">
              Proyectos <span className="italic text-primary">Verificados</span>
            </h2>
            <p className="text-text-secondary text-sm font-bold uppercase tracking-widest max-w-xl">
              Proyectos inmobiliarios con validación documental, financiera y territorial aprobada
            </p>
          </div>

          <Link
            to="/projects"
            className="flex items-center gap-2 text-secondary font-black group whitespace-nowrap"
          >
            Ver todos los proyectos
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Infinite marquee ── */}
      <div
        className="vf-viewport relative overflow-hidden"
        aria-label="Proyectos destacados"
      >
        {/* Fade edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32"
          style={{ background: "linear-gradient(to right, var(--color-surface-raised, #f8f8f8), transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32"
          style={{ background: "linear-gradient(to left, var(--color-surface-raised, #f8f8f8), transparent)" }}
        />

        <motion.div
          className="vf-track gap-8 py-4"
          style={{ x, width: trackWidth, cursor: dragging.current ? 'grabbing' : hovering.current ? 'grab' : 'grab' }}
          drag="x"
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => { dragging.current = true; }}
          onDragEnd={() => { dragging.current = false; }}
          onMouseEnter={() => { hovering.current = true; }}
          onMouseLeave={() => { hovering.current = false; }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Proyectos destacados verificados"
        >
          {carouselItems.map((project, i) => (
            <div
              key={`${project.id}-${i}`}
              className="group bg-white rounded-[40px] overflow-hidden border border-outline-variant/20 shadow-raised hover:shadow-premium transition-shadow duration-500 flex-shrink-0"
              style={{ width: `${ITEM_WIDTH}px` }}
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.name}
                  width="800"
                  height="450"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  draggable={false}
                />
                {project.isVerified && (
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 shadow-floating px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-secondary tracking-widest">
                      Verificado
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black text-secondary leading-none truncate">
                    {project.name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-text-secondary text-xs font-bold uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {project.location}
                  </p>
                </div>

                <div className="pt-6 border-t border-outline-variant/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">
                        Documentación
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-secondary font-black">{project.completionRate}%</p>
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      </div>
                    </div>
                    <Link
                      to={`/p/${project.codigoPublico || project.id}`}
                      className="w-12 h-12 bg-surface-variant rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-raised"
                      aria-label={`Ver detalles de ${project.name}`}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Link>
                  </div>

                  <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${project.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
