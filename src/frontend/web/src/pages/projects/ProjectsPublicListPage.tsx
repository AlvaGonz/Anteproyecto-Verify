import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Search, 
  MapPin, 
  Building, 
  Trees, 
  LayoutGrid,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Globe,
} from "lucide-react";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { ProyectoDto, ProjectStatus, ProjectCategory } from "../../features/projects/types";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utility for merging tailwind classes */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-slate-200 rounded-lg", className)}></div>
);

const CategoryIcon = ({ category }: { category: ProjectCategory }) => {
  switch (category) {
    case ProjectCategory.Residencial: return <Building2 className="w-5 h-5" />;
    case ProjectCategory.Comercial:   return <TrendingUp className="w-5 h-5" />;
    case ProjectCategory.Turistico:   return <Trees className="w-5 h-5" />;
    case ProjectCategory.Mixto:       return <LayoutGrid className="w-5 h-5" />;
    default:                          return <Building className="w-5 h-5" />;
  }
};

const ProjectCard = ({ project }: { project: ProyectoDto }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 p-7 transition-all duration-500 hover:shadow-premium overflow-hidden"
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-secondary border border-slate-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
          <CategoryIcon category={project.categoria} />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black tracking-widest uppercase">Verificado</span>
        </div>
      </div>

      <div className="flex-grow space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Expediente {project.codigoInterno}</p>
          <h3 className="text-2xl font-display font-black text-secondary leading-tight tracking-tight group-hover:text-primary transition-colors duration-300 italic uppercase">
            {project.nombre}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium line-clamp-1">{project.ubicacionTexto}</span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Estimado</p>
          <p className="text-lg font-black text-secondary font-display italic">
            {project.valorEstimado ? `$${project.valorEstimado.toLocaleString()}` : "TBD"}
          </p>
        </div>
        <Link 
          to={`/projects/${project.id}`}
          className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-secondary group-hover:text-white transition-all duration-300"
        >
          <ArrowUpRight className="w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  );
};

export const ProjectsPublicListPage: React.FC = () => {
  const [projects, setProjects] = useState<ProyectoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await projectsApi.getProjects();
        if (result._tag === "Success") {
          const published = result.data.filter(
            (p) => p.estadoProyecto === ProjectStatus.Published
          );
          setProjects(published);
        } else {
          console.error("Error fetching projects:", result.error);
        }
      } catch (error) {
        console.error("Unexpected error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.ubicacionTexto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === null || p.categoria === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchTerm, activeCategory]);

  const categories = [
    { id: ProjectCategory.Residencial, label: "Residencial", icon: Building2 },
    { id: ProjectCategory.Comercial, label: "Comercial", icon: TrendingUp },
    { id: ProjectCategory.Turistico, label: "Turístico", icon: Trees },
    { id: ProjectCategory.Mixto, label: "Mixto", icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary selection:text-white antialiased">
      {/* Dynamic Navigation / Header Area */}
      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
             </div>
             <div className="text-xl font-display font-black text-secondary tracking-tighter uppercase">
               Veri<span className="text-primary italic">Finca</span>
             </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
             <nav className="flex items-center gap-6">
                <Link to="/projects" className="text-xs font-black uppercase tracking-widest text-secondary border-b-2 border-primary pb-1">Directorio</Link>
                <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-secondary transition-colors pb-1">Sobre Nosotros</a>
                <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-secondary transition-colors pb-1">Protocolo</a>
             </nav>
             <Link to="/admin" className="h-10 px-5 rounded-xl bg-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg shadow-secondary/10">
               Acceso Agente
             </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-12">
          {/* Hero Section */}
          <div className="space-y-6 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Directorio Global de Activos</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-black text-secondary leading-none tracking-tighter uppercase italic"
            >
              Encuentre Su Próxima <span className="text-primary">Inversión Segura</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-500 font-medium leading-relaxed"
            >
              Acceda al registro oficial de proyectos inmobiliarios verificados bajo el protocolo VeriFinca. Transparencia absoluta en cada activo.
            </motion.p>
          </div>

          {/* Filters & Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-md font-sans"
          >
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Buscar por nombre, localidad o código..."
                className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border-none ring-0 focus:ring-4 focus:ring-primary/10 transition-all text-secondary font-medium placeholder:text-slate-400 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-2",
                  activeCategory === null 
                    ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-3",
                    activeCategory === cat.id 
                      ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Projects Grid */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-8 h-80 space-y-6">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                    <Skeleton className="h-4 w-2/3" />
                    <div className="pt-6 border-t border-slate-50 flex justify-between">
                      <Skeleton className="h-10 w-1/3" />
                      <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <Search className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black text-secondary italic tracking-tight uppercase">Sin hallazgos registrales</h3>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">No encontramos proyectos que coincidan con sus criterios de filtrado en nuestra base de datos activa.</p>
                </div>
                <button 
                  onClick={() => { setSearchTerm(""); setActiveCategory(null); }}
                  className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline"
                >
                  Reiniciar filtros
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-display font-black text-secondary tracking-tighter uppercase opacity-30">
            Veri<span className="text-primary italic">Finca</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#" className="hover:text-secondary transition-colors">Aviso Legal</a>
            <a href="#" className="hover:text-secondary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-secondary transition-colors">Contacto</a>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            © {new Date().getFullYear()} Protocolo VeriFinca - República Dominicana
          </div>
        </div>
      </footer>
    </div>
  );
};
