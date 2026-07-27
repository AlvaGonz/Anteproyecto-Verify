import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MapPin, ChevronRight, ChevronLeft } from "lucide-react";

import { useSuspensePublishedProjects } from "../../projects/api/usePublishedProjects";
import { getDefaultProjectImage } from "../../projects/api/usePublishedProjects";

interface Project {
  id: string;
  codigoPublico?: string;
  name: string;
  location: string;
  image: string;
  status: string;
  completionRate: number;
}

export const FeaturedProjectsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const { data: searchResults = [] } = useSuspensePublishedProjects();

  const verifiedProjects = searchResults.filter(p => p.estadoValidacion === "Verificado");

  const projects = verifiedProjects
    .map(p => ({
      id: p.id,
      codigoPublico: p.codigoPublico,
      name: p.nombreProyecto,
      location: p.ubicacionTexto || "Ubicación no especificada",
      image: p.imagenUrl || getDefaultProjectImage(p.categoria),
      status: p.estadoValidacion,
      completionRate: p.completionRate ?? 80,
    }))
    .slice(0, 12);

  // Triple for seamless infinite scroll
  const carouselItems = [...projects, ...projects, ...projects];

  // Auto-scroll with pause support
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let lastTime = 0;

    const SPEED = 120;

    const autoScroll = (time: number) => {
      const container = containerRef.current;
      if (container && !isPaused && !isDragging) {
        const delta = lastTime ? ((time - lastTime) / 16.67) : 1;
        container.scrollLeft += SPEED * delta * 0.016;
        const singleSetWidth = container.scrollWidth / 3;
        if (singleSetWidth > 0) {
          if (container.scrollLeft >= singleSetWidth * 2) container.scrollLeft -= singleSetWidth;
          else if (container.scrollLeft <= 0) container.scrollLeft += singleSetWidth;
        }
      }
      lastTime = time;
      animationFrameId = requestAnimationFrame(autoScroll);
    };
    animationFrameId = requestAnimationFrame(autoScroll);

    // Drag handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartScroll = containerRef.current?.scrollLeft ?? 0;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      if (containerRef.current) containerRef.current.scrollLeft = dragStartScroll - dx;
    };
    const onMouseUp = () => { isDragging = false; };
    const onTouchStart = (e: TouchEvent) => {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartScroll = containerRef.current?.scrollLeft ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - dragStartX;
      if (containerRef.current) containerRef.current.scrollLeft = dragStartScroll - dx;
    };
    const onTouchEnd = () => { isDragging = false; };

    const el = containerRef.current;
    if (el) {
      el.addEventListener("mousedown", onMouseDown);
      el.addEventListener("touchstart", onTouchStart, { passive: true });
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (el) {
        el.removeEventListener("mousedown", onMouseDown);
        el.removeEventListener("touchstart", onTouchStart);
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isPaused]);

  const scroll = (direction: "left" | "right") => {
    containerRef.current?.scrollBy({
      left: direction === "left" ? -432 : 432,
      behavior: "smooth",
    });
  };

  return (
    <section id="proyectos" className="py-32 bg-[#F4F1EC] overflow-hidden">
      <style>{`
        .carousel { scroll-snap-type: x proximity; }
        .carousel > * { scroll-snap-align: start; flex: 0 0 400px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) {
          .carousel { scroll-behavior: auto; }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-6 mb-20 space-y-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black text-secondary tracking-tight">
              Proyectos <span className="italic text-primary">Verificados</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-8">
            <Link to="/projects" className="flex items-center gap-2 text-secondary font-black group whitespace-nowrap">
              Ver todos los proyectos <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center gap-3">
              <button onClick={() => scroll("left")} className="w-14 h-14 bg-white text-secondary hover:bg-primary hover:text-white hover:border-primary hover:shadow-md rounded-2xl flex items-center justify-center border border-gray-200/60 shadow-sm transition-all duration-300 active:scale-95 cursor-pointer" aria-label="Proyectos anteriores">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={() => scroll("right")} className="w-14 h-14 bg-white text-secondary hover:bg-primary hover:text-white hover:border-primary hover:shadow-md rounded-2xl flex items-center justify-center border border-gray-200/60 shadow-sm transition-all duration-300 active:scale-95 cursor-pointer" aria-label="Siguientes proyectos">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          role="region"
          aria-label="Proyectos destacados"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="carousel overflow-x-auto no-scrollbar flex gap-8 px-6 py-4 cursor-grab active:cursor-grabbing select-none"
        >
          {carouselItems.map((project, i) => (
            <div key={`${project.id}-${i}`} className="flex-shrink-0 w-[400px] group bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500">
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
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="bg-white/90 backdrop-blur shadow-lg px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-secondary tracking-widest">
                    {project.status}
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black text-secondary leading-none truncate">{project.name}</h3>
                  <p className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {project.location}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Documentación</p>
                      <div className="flex items-center gap-2">
                        <p className="text-secondary font-black">{project.completionRate}%</p>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <Link
                      to={`/p/${project.codigoPublico || project.id}`}
                      className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${project.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};