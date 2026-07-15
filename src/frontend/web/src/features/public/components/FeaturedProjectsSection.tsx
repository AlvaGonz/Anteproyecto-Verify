import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { CheckCircle2, MapPin, ChevronRight, ChevronLeft } from "lucide-react";

import { useSearchPublicProjects } from "../../projects/api/useSearchPublicProjects";
import { ProjectStatus, LegalStatus, IntegrityStatus } from "../../projects/types";

interface Project {
  name: string;
  location: string;
  image: string;
  status: string;
  risk: string;
  deliveredDocs: number;
  totalDocs: number;
}

const FALLBACK_PROJECTS: Project[] = [
  {
    name: "Blue Forest Residences",
    location: "Las Terrenas, Samaná",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    status: "Auditado",
    risk: "Bajo",
    deliveredDocs: 10,
    totalDocs: 12,
  }
];

export const FeaturedProjectsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const isHoveredRef = useRef(false);
  const isButtonScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<any>(null);
  const startXRef = useRef(0);
  const scrollLeftValRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const { data: searchResults = [] } = useSearchPublicProjects("");

  const publicProjects = Array.isArray(searchResults) ? searchResults : [];

  const formattedProjects: Project[] = publicProjects
    .filter(p =>
      p.estadoJuridico === LegalStatus.Valid &&
      p.estadoProyecto >= ProjectStatus.Published &&
      p.estadoProyecto !== ProjectStatus.Rejected &&
      p.estadoIntegridad === IntegrityStatus.Verified
    )
    .map(p => ({
      name: p.nombreProyecto,
      location: p.ubicacionTexto || "Ubicación no especificada",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      status: "Validado",
      risk: "Calculando",
      deliveredDocs: 8,
      totalDocs: 10,
    }));

  const projectsToUse = formattedProjects.length > 0 ? formattedProjects : FALLBACK_PROJECTS;

  const filteredProjects = projectsToUse.filter(
    (p) => (p.deliveredDocs / p.totalDocs) >= 0.8
  ).slice(0, 12);

  // Triple items for seamless marquee wrap-around
  const carouselItems = [...filteredProjects, ...filteredProjects, ...filteredProjects];

  // Auto-scroll loop using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const autoScroll = () => {
      const container = containerRef.current;
      if (container && !isMouseDownRef.current && !isHoveredRef.current && !isButtonScrollingRef.current) {
        container.scrollLeft += 0.8; // Constant scrolling speed

        const singleSetWidth = container.scrollWidth / 3;
        if (singleSetWidth > 0) {
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += singleSetWidth;
          }
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth } = containerRef.current;
      const singleSetWidth = scrollWidth / 3;

      if (singleSetWidth > 0) {
        if (scrollLeft >= singleSetWidth * 2) {
          containerRef.current.scrollLeft = scrollLeft - singleSetWidth;
        } else if (scrollLeft <= 2) {
          containerRef.current.scrollLeft = scrollLeft + singleSetWidth;
        }
      }
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });

      const initScroll = () => {
        const singleSetWidth = el.scrollWidth / 3;
        if (singleSetWidth > 0) {
          el.scrollLeft = singleSetWidth;
        }
      };

      const timer = setTimeout(initScroll, 50);
      return () => {
        el.removeEventListener("scroll", handleScroll);
        clearTimeout(timer);
      };
    }
  }, [filteredProjects.length]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isMouseDownRef.current = true;
    startXRef.current = e.clientX - containerRef.current.offsetLeft;
    scrollLeftValRef.current = containerRef.current.scrollLeft;
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.clientX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeftValRef.current - walk;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
  };

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      isButtonScrollingRef.current = true;

      // Clear previous timeout if exists
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const scrollAmount = 432; // card width (400) + gap (32)
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      // Pause auto-scroll during smooth scroll transition (500ms)
      scrollTimeoutRef.current = setTimeout(() => {
        isButtonScrollingRef.current = false;
      }, 500);
    }
  };

  return (
    <section id="proyectos" className="py-32 bg-[#F4F1EC] overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
              <button type="button"
                onClick={() => scroll("left")}
                className="w-14 h-14 bg-white text-secondary hover:bg-primary hover:text-white hover:border-primary hover:shadow-md rounded-2xl flex items-center justify-center border border-gray-200/60 shadow-sm transition-all duration-300 active:scale-95 cursor-pointer"
                aria-label="Proyectos anteriores"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button type="button"
                onClick={() => scroll("right")}
                className="w-14 h-14 bg-white text-secondary hover:bg-primary hover:text-white hover:border-primary hover:shadow-md rounded-2xl flex items-center justify-center border border-gray-200/60 shadow-sm transition-all duration-300 active:scale-95 cursor-pointer"
                aria-label="Siguientes proyectos"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
      >
        <div
          ref={containerRef}
          role="region"
          aria-label="Proyectos destacados"
          className="overflow-x-auto no-scrollbar flex gap-8 px-6 py-4 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {carouselItems.map((project, i) => {
            const deliveryPercentage = Math.round((project.deliveredDocs / project.totalDocs) * 100);

            return (
              <div
                key={`${project.name}-${i}`}
                className="flex-shrink-0 w-[400px] group bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
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
                          <p className="text-secondary font-black">{deliveryPercentage}%</p>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                      <Link
                        to="/projects"
                        onClick={(e) => {
                          if (hasDraggedRef.current) {
                            e.preventDefault();
                          }
                        }}
                        className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <m.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${deliveryPercentage}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

