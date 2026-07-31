import React, { useState, useMemo, memo, useRef, Suspense, FC } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { LandingNav } from "../../features/public/components/LandingNav";
import { LandingFooter } from "../../features/public/components/LandingFooter";
import { VerifySearchForm } from "../../features/public/components/VerifySearchForm";

import {
  useSuspensePublishedProjects,
  filterPublishedProjects,
  PublishedProjectFilters,
  PROJECT_CATEGORIES,
  PRICE_MAX,
  PRICE_STEPS,
  getDefaultProjectImage,
  PublicProjectSearchResultDto,
} from "../../features/projects/api/usePublishedProjects";
import { ProjectStatusBadge } from "../../features/public/components/ProjectStatusBadge";

import { useProvinces } from "../../features/provinces/api/useProvinces";

interface ProjectCardProps {
  project: PublicProjectSearchResultDto;
  idx: number;
}

const ProjectCard: FC<ProjectCardProps> = memo(({ project, idx }) => (
  <m.div
    layout
    key={project.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
    className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col"
  >
    <div className="relative aspect-[16/10] overflow-hidden">
      <img
        src={project.imagenUrl || getDefaultProjectImage(project.categoria as unknown as number)}
        alt={project.nombreProyecto}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute top-6 left-6">
        <ProjectStatusBadge status={project.estadoIntegridad === 1 ? "Verificado" : "Procesando"} />
      </div>
    </div>

    <div className="p-8 flex flex-col flex-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">{project.nombreProyecto}</h3>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wide">
            <Building2 size={12} />
            {project.ubicacionTexto || "Ubicación no especificada"}
          </div>
        </div>
      </div>

      <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
        {project.constructora ? `Desarrollado por ${project.constructora}.` : "Proyecto verificado bajo estrictos estándares de transparencia institucional."}
      </p>

      <div className="mt-auto space-y-4">
        {/* Integrity Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Integridad Validada</span>
            <span className="text-primary">
              {project.estadoIntegridad === 1 ? "100%" : project.estadoIntegridad === 0 ? "—" : "0%"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${project.estadoIntegridad === 1 ? 100 : 0}%` }}
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
));

const ProjectsPublicListContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [filtersVisible, setFiltersVisible] = useState(true);

  const [filters, setFilters] = useState<PublishedProjectFilters>({
    searchQuery: initialQuery,
    projectTypes: [],
    priceRange: [0, PRICE_MAX],
    province: "",
    latLng: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const pageInputRef = useRef<HTMLInputElement>(null);

  const { data: provincias } = useProvinces();
  const { data: searchResults } = useSuspensePublishedProjects();

  const filteredProjects = useMemo(() => {
    return filterPublishedProjects(searchResults, filters);
  }, [searchResults, filters]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  const updateFilter = (key: keyof PublishedProjectFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const toggleProjectType = (type: number) => {
    setFilters((prev) => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter((t) => t !== type)
        : [...prev.projectTypes, type],
    }));
    setCurrentPage(1);
  };

  const handlePriceChange = (range: [number, number]) => {
    updateFilter("priceRange", range);
  };

  const handleLatLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter("latLng", e.target.value);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setFilters({
      searchQuery: "",
      projectTypes: [],
      priceRange: [0, PRICE_MAX],
      province: "",
      latLng: "",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.projectTypes.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < PRICE_MAX ||
    filters.province ||
    filters.latLng;

  return (
    <>
      {/* Directory Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {/* Header with counter + filter toggle */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Directorio de Proyectos</h2>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <span className="font-black text-primary">{filteredProjects.length}</span> proyecto{filteredProjects.length !== 1 ? "s" : ""} publicado{filteredProjects.length !== 1 ? "s" : ""}
              {hasActiveFilters && (
                <span className="text-sm text-slate-400">(con filtros)</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFiltersVisible(!filtersVisible)}
            className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-colors ${
              filtersVisible
                ? "bg-primary text-white border-primary"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          {filtersVisible && (
          <div className="w-full lg:w-[200px] xl:w-[220px] shrink-0 space-y-6">
            {/* Blue Box: Search + Project Types */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <span className="text-primary">●</span> Búsqueda
              </label>
              <input
                type="text"
                placeholder="RNC, Cédula, Nombre..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter("searchQuery", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />

              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 mt-4">
                <span className="text-primary">●</span> Tipo (acumulativo)
              </label>
              <div className="flex flex-col gap-1.5">
                {PROJECT_CATEGORIES.map((cat) => (
                  <label
                    key={cat.value}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all ${
                      filters.projectTypes.includes(cat.value)
                        ? "bg-primary text-white border-primary"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.projectTypes.includes(cat.value)}
                      onChange={() => toggleProjectType(cat.value)}
                      className="w-3 h-3 accent-primary"
                    />
                    {cat.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Red Box: Price Filter */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <span className="text-rose-500">●</span> Precio (DOP)
              </label>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>RD$ {filters.priceRange[0].toLocaleString()}</span>
                  <span>RD$ {filters.priceRange[1] >= PRICE_MAX ? "15M+" : filters.priceRange[1].toLocaleString()}</span>
                </div>
                <div className="relative h-6">
                  <input
                    type="range"
                    min="0"
                    max={PRICE_MAX}
                    step={PRICE_STEPS}
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange([parseInt(e.target.value), filters.priceRange[1]])}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <input
                    type="range"
                    min="0"
                    max={PRICE_MAX}
                    step={PRICE_STEPS}
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange([filters.priceRange[0], parseInt(e.target.value)])}
                    className="absolute top-0 left-0 w-full h-1.5 bg-transparent appearance-none cursor-pointer accent-rose-500"
                    style={{ pointerEvents: "auto" }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>0</span>
                  <span>7.5M</span>
                  <span>15M+</span>
                </div>
              </div>
            </div>

            {/* Purple Box: Province + Lat/Lng */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <span className="text-purple-500">●</span> Provincia
              </label>
              <select
                value={filters.province}
                onChange={(e) => updateFilter("province", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              >
                <option value="">Todas</option>
                {provincias?.map((p) => (
                  <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>

              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 mt-4">
                <span className="text-purple-500">●</span> Coordenadas (Lat, Lng)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej: 18.47186, -69.93988"
                  value={filters.latLng}
                  onChange={handleLatLngChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>

              {filters.latLng && (
                <div className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-1.5 rounded-lg border border-purple-100 mt-2">
                  Se auto-asignará la provincia más cercana
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-full px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-white rounded-xl border border-slate-100 shadow-sm transition-colors uppercase tracking-widest"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          )}

          {/* Right - Grid + Pagination */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {paginatedProjects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} idx={idx} />
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-dashed border-slate-200 mt-6 shadow-sm"
          >
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron proyectos</h3>
            <p className="text-slate-500 max-w-xs mx-auto font-medium text-sm">No hay registros que coincidan con su búsqueda o filtros actuales.</p>
            <button type="button"
              onClick={clearAllFilters}
              className="mt-6 text-primary font-black text-xs uppercase tracking-widest hover:underline"
            >
              Limpiar filtros
            </button>
          </m.div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between mt-8">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              Mostrando <span className="font-bold text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
              <span className="font-bold text-primary">{Math.min(currentPage * itemsPerPage, filteredProjects.length)}</span> de{' '}
              <span className="font-bold text-primary">{filteredProjects.length}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-100 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-100 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5 mx-2">
                <span className="text-sm font-medium text-slate-500">Página</span>
                <input
                  ref={pageInputRef}
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= totalPages) {
                      setCurrentPage(val);
                    }
                  }}
                  onBlur={() => setCurrentPage(currentPage)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      pageInputRef.current?.blur();
                    }
                  }}
                  className="w-14 h-8 text-center font-bold text-primary bg-white border border-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm font-medium text-slate-500">de {totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-100 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-100 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
          </div>{/* /.flex-1 */}
        </div>{/* /.flex-row */}
      </section>
    </>
  );
};

const DirectorySkeleton = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
    <LandingNav />
    <main className="flex-1">
      <section className="relative pt-40 pb-20 px-6 bg-slate-900 overflow-hidden min-h-[520px] md:min-h-[580px]">
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
    <LandingFooter />
  </div>
);

export const ProjectsPublicListPage: React.FC = () => {
  return (
    <Suspense fallback={<DirectorySkeleton />}>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
        <LandingNav />

        <main className="flex-1">
          {/* Unified Portal Hero */}
          <section className="relative pt-28 pb-20 px-3 bg-slate-900 overflow-hidden min-h-[520px] md:min-h-[580px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,133,19,0.1),transparent)]" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">

              <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
                Cero Incertidumbre En Su <br />
                <span className="text-primary italic">Inversión Inmobiliaria</span>
              </h1>

              <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-5 max-w-2xl">
                Valide la legitimidad de cualquier proyecto o explore nuestro directorio de propiedades certificadas bajo estrictos estándares de transparencia.
              </p>

              <div className="w-full max-w-2xl">
                <VerifySearchForm variant="dark" className="border-white/5" />
              </div>
            </div>
          </section>

          <ProjectsPublicListContent />

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
    </Suspense>
  );
};
