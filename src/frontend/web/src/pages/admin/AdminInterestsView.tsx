import React, { useState, useMemo } from "react";
import { useInterests } from "../../features/projects/api/useProjectsInteractions";
import { Search, Users, Building2, X, BarChart3 } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface InterestRecord {
  tipo: string;
  proyectoId: string;
  nombreProyecto: string;
  usuarioId: string;
  nombreUsuario: string;
  avatarUrl?: string;
  fecha: string;
}

export const AdminInterestsView: React.FC = () => {
  const { data: intereses = [] } = useInterests();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"Todos" | "Interesados" | "Mis Intereses">("Todos");
  const [selectedInterest, setSelectedInterest] = useState<InterestRecord | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedInterest(null);
    };
    if (selectedInterest) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedInterest]);

  const filteredIntereses = useMemo(() => {
    let result = intereses;
    if (filterType !== "Todos") {
      result = result.filter((i: InterestRecord) => i.tipo === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i: InterestRecord) =>
          i.nombreProyecto.toLowerCase().includes(q) ||
          i.nombreUsuario.toLowerCase().includes(q)
      );
    }
    return result;
  }, [intereses, searchQuery, filterType]);

  const misInteresesCount = useMemo(
    () => intereses.filter((i: InterestRecord) => i.tipo === "Mis Intereses").length,
    [intereses]
  );
  const interesadosCount = useMemo(
    () => intereses.filter((i: InterestRecord) => i.tipo === "Interesados").length,
    [intereses]
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-secondary tracking-tight">
          Listado de Proyectos de Interés e Interesados
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Visualiza los proyectos en los que has mostrado interés y las personas
          interesadas en tus proyectos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart3 size={22} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{intereses.length}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Interacciones</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Building2 size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{misInteresesCount}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mis Intereses</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Users size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{interesadosCount}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interesados</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nombre de usuario o proyecto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl">
          <button
            type="button"
            onClick={() => setFilterType("Todos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "Todos"
                ? "bg-white text-primary shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Interesados")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "Interesados"
                ? "bg-white text-primary shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Interesados
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Mis Intereses")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "Mis Intereses"
                ? "bg-white text-primary shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Mis Intereses
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6">
          {filteredIntereses.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredIntereses.map((interes: InterestRecord, idx: number) => {

                const isInteresados = interes.tipo === "Interesados";
                
                return (
                  <m.div
                    key={`${interes.proyectoId}-${interes.usuarioId}-${idx}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    onClick={() => {
                      if (isInteresados) {
                        setSelectedInterest(interes);
                      }
                    }}
                    className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center ${
                      isInteresados
                        ? "border-slate-200 hover:shadow-md cursor-pointer hover:border-primary/40 hover:bg-slate-50/50 transition-all"
                        : "border-slate-100 opacity-90 cursor-default"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white ring-1 ring-slate-200">
                      {interes.avatarUrl ? (
                        <img
                          src={interes.avatarUrl}
                          alt={interes.nombreUsuario}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-black text-slate-400">
                          {interes.nombreUsuario.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left flex flex-col justify-center">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 truncate text-base">
                          {interes.nombreUsuario}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          isInteresados 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {isInteresados ? "Interesado" : "Mis Intereses"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate flex items-center justify-center sm:justify-start gap-1">
                        {isInteresados ? "Interesado en tu proyecto:" : "Te interesa el proyecto:"} <span className="font-semibold text-slate-700">{interes.nombreProyecto}</span>
                      </p>
                    </div>
                    {isInteresados && (
                      <div className="mt-3 sm:mt-0 shrink-0">
                        <button
                          type="button"
                          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors"
                        >
                          Ver Mensaje
                        </button>
                      </div>
                    )}
                  </m.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Building2 size={28} className="text-slate-300" />
              </div>
              <h4 className="text-lg font-bold text-slate-700 mb-1">
                {searchQuery
                  ? "Sin resultados"
                  : "No hay intereses registrados"}
              </h4>
              <p className="text-sm text-slate-500 max-w-xs font-medium">
                {searchQuery
                  ? "No hay coincidencias para tu búsqueda."
                  : "Cuando te intereses en un proyecto o alguien se interese en el tuyo, aparecerá aquí."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedInterest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInterest(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <m.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedInterest(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors z-10"
              >
                <X size={16} />
              </button>

              <div className="px-8 pt-12 pb-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden mb-6 border-4 border-white shadow-lg ring-1 ring-slate-200">
                  {selectedInterest.avatarUrl ? (
                    <img
                      src={selectedInterest.avatarUrl}
                      alt={selectedInterest.nombreUsuario}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-slate-400">
                      {selectedInterest.nombreUsuario.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative w-full mt-4">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-slate-50 border-t border-l border-slate-100 rotate-45 rounded-sm" />
                  <p className="text-slate-600 text-[15px] leading-relaxed relative z-10">
                    <span className="italic">
                      “
                      {selectedInterest.tipo === "Interesados" ? (
                        <>
                          Hola soy{" "}
                          <span className="font-bold text-slate-800 not-italic">
                            {selectedInterest.nombreUsuario}
                          </span>
                          {" "}y estoy interesado en conversar contigo para ver mas detalles de tu proyecto{" "}
                          <span className="font-bold text-slate-800 not-italic">
                            {selectedInterest.nombreProyecto}
                          </span>
                        </>
                      ) : (
                        <>
                          Hola{" "}
                          <span className="font-bold text-slate-800 not-italic">
                            {selectedInterest.nombreUsuario}
                          </span>
                          {", "}me gustaría conversar contigo para ver mas detalles de tu proyecto{" "}
                          <span className="font-bold text-slate-800 not-italic">
                            {selectedInterest.nombreProyecto}
                          </span>
                        </>
                      )}
                      .”
                    </span>
                  </p>
                </div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
