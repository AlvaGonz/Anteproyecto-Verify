import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Filter,
  ArrowRight,
  Building2,
  ChevronRight,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { LandingNav } from "../../features/public/components/LandingNav";
import { LandingFooter } from "../../features/public/components/LandingFooter";
import { ProjectStatusBadge } from "../../features/public/components/ProjectStatusBadge";
import { VerifySearchForm } from "../../features/public/components/VerifySearchForm";

import { useSearchPublicProjects } from "../../features/projects/api/useSearchPublicProjects";

export const ProjectsPublicListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    provincia: "",
    constructora: "",
    registrante: ""
  });

  const { data: searchResults = [], isLoading } = useSearchPublicProjects(searchQuery);

  const mappedProjects = useMemo(() => {
    // searchResults now returns visible projects if there is no query
    const sourceData = Array.isArray(searchResults) ? searchResults : [];

    return sourceData.map((p: any) => ({
      id: String(p.id),
      name: p.nombre || p.nombreProyecto,
      location: p.ubicacionTexto || "Ubicación no especificada",
      status: p.estadoValidacion === "Verificado" ? "CERTIFIED" : "PROCESSING",
      imageUrl: p.imagenUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop",
      lastVerification: p.createdAtUtc ? p.createdAtUtc.split("T")[0] : new Date().toISOString().split("T")[0],
      description: "",
      completionPercentage: p.estadoValidacion === "Verificado" ? 100 : 50,
      constructora: p.constructora || "",
      registrante: p.registrante || "",
    }));
  }, [searchResults]);

  const filteredProjects = useMemo(() => {
    return mappedProjects.filter((project) => {
      const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
      const matchesProvincia = !advancedFilters.provincia || project.location.toLowerCase().includes(advancedFilters.provincia.toLowerCase());
      const matchesConstructora = !advancedFilters.constructora || project.constructora.toLowerCase().includes(advancedFilters.constructora.toLowerCase());
      const matchesRegistrante = !advancedFilters.registrante || project.registrante.toLowerCase().includes(advancedFilters.registrante.toLowerCase());
      return matchesStatus && matchesProvincia && matchesConstructora && matchesRegistrante;
    });
  }, [mappedProjects, statusFilter, advancedFilters]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
        <LandingNav />
        <main className="flex-1">
          <section className="relative pt-40 pb-20 px-6 bg-slate-900 overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
              <div className="w-64 h-8 bg-slate-800 animate-pulse rounded-full mb-8"></div>
              <div className="w-3/4 max-w-3xl h-16 md:h-24 bg-slate-800 animate-pulse rounded-3xl mb-6"></div>
              <div className="w-1/2 max-w-xl h-10 bg-slate-800 animate-pulse rounded-xl mb-12"></div>
              <div className="w-full max-w-2xl h-16 bg-slate-800 animate-pulse rounded-2xl"></div>
            </div>
          </section>
          <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
              <div className="space-y-3 w-full max-w-sm">
                <div className="h-10 bg-slate-200 animate-pulse rounded-xl w-3/4"></div>
                <div className="h-6 bg-slate-200 animate-pulse rounded-lg w-full"></div>
              </div>
              <div className="w-64 h-12 bg-slate-200 animate-pulse rounded-2xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 flex flex-col animate-pulse">
                  <div className="aspect-[16/10] bg-slate-200 w-full" />
                  <div className="p-8 flex flex-col flex-1 space-y-4">
                    <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
                    <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-slate-200 rounded-lg w-full" />
                      <div className="h-4 bg-slate-200 rounded-lg w-5/6" />
                    </div>
                    <div className="mt-auto pt-6">
                      <div className="h-14 bg-slate-200 rounded-2xl w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      <LandingNav />

      <main className="flex-1">
        {/* Unified Portal Hero */}
        <section className="relative pt-28 pb-20 px-3 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,133,19,0.1),transparent)]" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">

            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight tracking-tight"
            >
              Cero Incertidumbre En Su <br />
              <span className="text-primary italic">Inversión Inmobiliaria</span>
            </m.h1>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-5 max-w-2xl"
            >
              Valide la legitimidad de cualquier proyecto o explore nuestro directorio de propiedades certificadas bajo estrictos estándares de transparencia.
            </m.p>

            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full max-w-2xl"
            >
              <VerifySearchForm variant="dark" className="border-white/5" />
            </m.div>
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
                <button type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button type="button"
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

                <button
                  type="button"
                  onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                  className={`ml-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border ${isAdvancedFiltersOpen ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                >
                  Búsqueda Avanzada
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isAdvancedFiltersOpen && (
              <m.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: "auto", opacity: 1, marginBottom: 48 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Provincia / Ubicación</label>
                    <input
                      type="text"
                      placeholder="Ej. Santo Domingo"
                      value={advancedFilters.provincia}
                      onChange={e => setAdvancedFilters(prev => ({ ...prev, provincia: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Constructora / Desarrollador</label>
                    <input
                      type="text"
                      placeholder="Ej. Constructora Bisonó"
                      value={advancedFilters.constructora}
                      onChange={e => setAdvancedFilters(prev => ({ ...prev, constructora: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Persona que registra</label>
                    <input
                      type="text"
                      placeholder="Nombre de la persona"
                      value={advancedFilters.registrante}
                      onChange={e => setAdvancedFilters(prev => ({ ...prev, registrante: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <button
                      type="button"
                      onClick={() => setAdvancedFilters({ provincia: "", constructora: "", registrante: "" })}
                      className="px-4 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <m.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden">
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
                          <m.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.completionPercentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-primary"
                          />
                        </div>
                      </div>

                      <Link
                        to={`/p/${project.id}`}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all group/btn"
                      >
                        Ver Detalles <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProjects.length === 0 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-dashed border-slate-200"
            >
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron proyectos</h3>
              <p className="text-slate-500 max-w-xs mx-auto font-medium">No hay registros que coincidan con su búsqueda o filtros actuales.</p>
              <button type="button"
                onClick={() => { setSearchParams({}); setStatusFilter("ALL"); }}
                className="mt-6 text-primary font-black text-xs uppercase tracking-widest hover:underline"
              >
                Limpiar filtros
              </button>
            </m.div>
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
