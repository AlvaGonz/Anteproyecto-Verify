import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronRight,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LandingNav, LandingFooter, ProjectStatusBadge, VerifySearchForm } from "../../features/public/components";

// Mock data for projects (ensure it matches the domain types)
const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Residencial Terra Noble",
    location: "Punta Cana, RD",
    status: "CERTIFIED",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop",
    lastVerification: "2024-03-10",
    description: "Complejo residencial de lujo con certificación de integridad VeriFinca Oro.",
    completionPercentage: 85,
  },
  {
    id: "2",
    name: "Torre San Gerónimo",
    location: "Santo Domingo, RD",
    status: "PROCESSING",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop",
    lastVerification: "2024-03-12",
    description: "Proyecto corporativo en fase final de validación legal y técnica.",
    completionPercentage: 45,
  },
  {
    id: "3",
    name: "Plaza Central Mall",
    location: "Santiago, RD",
    status: "CERTIFIED",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop",
    lastVerification: "2024-03-08",
    description: "Centro comercial verificado con protocolos de transparencia institucional.",
    completionPercentage: 100,
  }
];

export const ProjectsPublicListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      <LandingNav />

      <main className="flex-1">
        {/* Unified Portal Hero */}
        <section className="relative pt-40 pb-20 px-6 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,133,19,0.1),transparent)]" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />
          
          <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-primary text-[10px] font-black tracking-[0.2em] uppercase">Portal de Transparencia VeriFinca</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight"
            >
              Cero Incertidumbre En Su <br/>
              <span className="text-primary italic">Inversión Inmobiliaria</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-2xl"
            >
              Valide la legitimidad de cualquier proyecto o explore nuestro directorio de propiedades certificadas bajo estrictos estándares de transparencia.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full max-w-2xl"
            >
              <VerifySearchForm variant="dark" className="border-white/5" />
            </motion.div>
          </div>
        </section>

        {/* Directory Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Directorio de Proyectos</h2>
              <p className="text-slate-500 font-medium">Explore proyectos que han pasado por nuestro riguroso proceso de validación.</p>
            </div>

            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}
                >
                  <List size={20} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                <Filter size={18} className="text-slate-400" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">TODOS LOS ESTATUS</option>
                  <option value="CERTIFIED">CERTIFICADOS</option>
                  <option value="PROCESSING">EN PROCESO</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={project.imageUrl} 
                      alt={project.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-6 left-6">
                      <ProjectStatusBadge status={project.status as any} />
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wide">
                          <Building2 size={12} />
                          {project.location}
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="mt-auto space-y-4">
                      {/* Integrity Progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Integridad Validada</span>
                          <span className="text-primary">{project.completionPercentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${project.completionPercentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-primary"
                          />
                        </div>
                      </div>

                      <Link 
                        to={`/projects/${project.id}`}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all group/btn"
                      >
                        Ver Detalles <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProjects.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-dashed border-slate-200"
            >
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron proyectos</h3>
              <p className="text-slate-500 max-w-xs mx-auto font-medium">No hay registros que coincidan con su búsqueda o filtros actuales.</p>
              <button 
                onClick={() => {setSearchQuery(""); setStatusFilter("ALL");}}
                className="mt-6 text-primary font-black text-xs uppercase tracking-widest hover:underline"
              >
                Limpiar filtros
              </button>
            </motion.div>
          )}
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto rounded-[48px] bg-primary text-white p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight italic decoration-white/30 underline-offset-8 underline">
                  ¿Desea certificar su propio proyecto?
                </h2>
                <p className="text-white/80 font-medium text-lg leading-relaxed mb-8">
                  Únase a la red de desarrolladores que priorizan la confianza y la seguridad institucional. Inicie su proceso de auditoría hoy.
                </p>
                <Link to="/register" className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all tracking-widest">
                  EMPEZAR REGISTRO <ArrowRight size={18} />
                </Link>
              </div>
              <div className="hidden md:flex flex-col gap-6 w-full max-w-xs shrink-0 bg-white/5 backdrop-blur-sm p-8 rounded-[32px] border border-white/10">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-white text-primary rounded-xl flex items-center justify-center shrink-0"><CheckCircle2 size={20} /></div>
                  <span className="text-sm font-bold opacity-90 tracking-tight">Debida Diligencia Integral</span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-white text-primary rounded-xl flex items-center justify-center shrink-0"><CheckCircle2 size={20} /></div>
                  <span className="text-sm font-bold opacity-90 tracking-tight">Sellado Blockchain Inmutable</span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-white text-primary rounded-xl flex items-center justify-center shrink-0"><CheckCircle2 size={20} /></div>
                  <span className="text-sm font-bold opacity-90 tracking-tight">Monitoreo 24/7 de Estatus</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};
