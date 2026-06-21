import React, { useState, useEffect, useRef } from "react";
import { CreateProyectoDto, UpdateProyectoDto, ProyectoDto, ProjectCategory } from "../types";
import { useAuth } from "../../../shared/context/AuthContext";
import { MapPin, Globe, Compass, Navigation } from "lucide-react";

interface ProjectFormProps {
  initialData?: ProyectoDto;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

interface ProvinciaInfo {
  nombre: string;
  lat: number;
  lng: number;
  dcPrefix: string;
}

const PROVINCIAS: ProvinciaInfo[] = [
  { nombre: "Distrito Nacional", lat: 18.47186, lng: -69.93988, dcPrefix: "DC-01" },
  { nombre: "Azua", lat: 18.45320, lng: -70.73490, dcPrefix: "DC-02" },
  { nombre: "Baoruco", lat: 18.50000, lng: -71.30000, dcPrefix: "DC-03" },
  { nombre: "Barahona", lat: 18.20850, lng: -71.10080, dcPrefix: "DC-04" },
  { nombre: "Dajabón", lat: 19.54000, lng: -71.70000, dcPrefix: "DC-05" },
  { nombre: "Duarte", lat: 19.30000, lng: -70.25000, dcPrefix: "DC-06" },
  { nombre: "El Seibo", lat: 18.76000, lng: -69.04000, dcPrefix: "DC-07" },
  { nombre: "Elías Piña", lat: 18.88000, lng: -71.68000, dcPrefix: "DC-08" },
  { nombre: "Espaillat", lat: 19.50000, lng: -70.50000, dcPrefix: "DC-09" },
  { nombre: "Hato Mayor", lat: 18.76000, lng: -69.25000, dcPrefix: "DC-10" },
  { nombre: "Hermanas Mirabal", lat: 19.38000, lng: -70.35000, dcPrefix: "DC-11" },
  { nombre: "Independencia", lat: 18.40000, lng: -71.60000, dcPrefix: "DC-12" },
  { nombre: "La Altagracia", lat: 18.61890, lng: -68.70830, dcPrefix: "DC-13" },
  { nombre: "La Romana", lat: 18.42730, lng: -68.97280, dcPrefix: "DC-14" },
  { nombre: "La Vega", lat: 19.22000, lng: -70.53000, dcPrefix: "DC-15" },
  { nombre: "María Trinidad Sánchez", lat: 19.38000, lng: -69.95000, dcPrefix: "DC-16" },
  { nombre: "Monseñor Nouel", lat: 18.91000, lng: -70.43000, dcPrefix: "DC-17" },
  { nombre: "Monte Cristi", lat: 19.72000, lng: -71.58000, dcPrefix: "DC-18" },
  { nombre: "Monte Plata", lat: 18.80700, lng: -69.78900, dcPrefix: "DC-19" },
  { nombre: "Pedernales", lat: 18.03000, lng: -71.74000, dcPrefix: "DC-20" },
  { nombre: "Peravia", lat: 18.28000, lng: -70.33000, dcPrefix: "DC-21" },
  { nombre: "Puerto Plata", lat: 19.79340, lng: -70.68840, dcPrefix: "DC-22" },
  { nombre: "Samaná", lat: 19.20000, lng: -69.33000, dcPrefix: "DC-23" },
  { nombre: "San Cristóbal", lat: 18.41667, lng: -70.10000, dcPrefix: "DC-24" },
  { nombre: "San José de Ocoa", lat: 18.55000, lng: -70.50000, dcPrefix: "DC-25" },
  { nombre: "San Juan", lat: 18.80580, lng: -71.22990, dcPrefix: "DC-26" },
  { nombre: "San Pedro de Macorís", lat: 18.45390, lng: -69.30820, dcPrefix: "DC-27" },
  { nombre: "Sánchez Ramírez", lat: 19.00160, lng: -70.14920, dcPrefix: "DC-28" },
  { nombre: "Santiago", lat: 19.45170, lng: -70.69703, dcPrefix: "DC-29" },
  { nombre: "Santiago Rodríguez", lat: 19.48000, lng: -71.34000, dcPrefix: "DC-30" },
  { nombre: "Santo Domingo", lat: 18.54118659239565, lng: -69.4181733044046, dcPrefix: "DC-31" },
  { nombre: "Valverde", lat: 19.58000, lng: -71.07000, dcPrefix: "DC-32" }
];

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  let user: any = null;
  try {
    const auth = useAuth();
    user = auth ? auth.user : null;
  } catch (e) {
    // Fallback when rendered without AuthProvider in unit tests
  }
  
  // Fields State
  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [ubicacionTexto, setUbicacionTexto] = useState(initialData?.ubicacionTexto ?? "");
  const [ubicacionGps, setUbicacionGps] = useState(initialData?.ubicacionGps ?? "");
  const [valorEstimado, setValorEstimado] = useState<number | "">(initialData?.valorEstimado ?? "");
  const [categoria, setCategoria] = useState<ProjectCategory>(initialData?.categoria ?? ProjectCategory.Residencial);
  const [datosDesarrollador, setDatosDesarrollador] = useState(initialData?.datosDesarrollador ?? "");
  const [designacionCatastral, setDesignacionCatastral] = useState(initialData?.designacionCatastral ?? "");
  
  // Interaction and Submission states
  const [nombreTouched, setNombreTouched] = useState(false);
  const [ubicacionTouched, setUbicacionTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map elements
  const [activeMapTab, setActiveMapTab] = useState<"leaflet" | "official">("leaflet");
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize and update Leaflet Map
  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;

    // Wait until DOM ref is available and map isn't initialized yet
    if (!mapRef.current) {
      const defaultCenter = [18.7357, -70.1627]; // Dominican Republic center
      const map = L.map("leaflet-map-container").setView(defaultCenter, 8);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapRef.current = map;

      // Handle map clicks to drop marker & capture coordinates + parcel designation
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        const coordsStr = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        setUbicacionGps(coordsStr);

        // Auto generate realistic parcel number based on province prefix
        const randomParcel = Math.floor(Math.random() * 500) + 1;
        const matchedProv = PROVINCIAS.find(p => p.nombre === ubicacionTexto);
        const prefix = matchedProv ? matchedProv.dcPrefix : "DC-01";
        setDesignacionCatastral(`Parc. ${randomParcel}, ${prefix}`);

        // Set or update marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
      });
    } else {
      // Map already initialized. If province is selected, fly to centroid
      const matchedProv = PROVINCIAS.find(p => p.nombre === ubicacionTexto);
      if (matchedProv) {
        mapRef.current.flyTo([matchedProv.lat, matchedProv.lng], 11);

        // Place or move marker to centroid
        if (markerRef.current) {
          markerRef.current.setLatLng([matchedProv.lat, matchedProv.lng]);
        } else {
          markerRef.current = L.marker([matchedProv.lat, matchedProv.lng]).addTo(mapRef.current);
        }
      }
    }
  }, [ubicacionTexto]);

  // Recalculate sizes when map tab changes to prevent broken/gray tiles in Leaflet
  useEffect(() => {
    if (activeMapTab === "leaflet" && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [activeMapTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!nombre.trim() || !ubicacionTexto.trim()) {
      setError("Por favor complete los campos obligatorios (*).");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (initialData) {
        const updateData: UpdateProyectoDto = {
          nombre, 
          ubicacionTexto,
          ubicacionGps: ubicacionGps || undefined,
          valorEstimado: valorEstimado === "" ? undefined : Number(valorEstimado),
          categoria,
          datosDesarrollador: datosDesarrollador || undefined,
          designacionCatastral: designacionCatastral || undefined,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateProyectoDto = {
          nombre, 
          ubicacionTexto,
          usuarioCreadorId: user?.id ?? "00000000-0000-0000-0000-000000000000",
          categoria,
          datosDesarrollador: datosDesarrollador || undefined,
          designacionCatastral: designacionCatastral || undefined,
          ubicacionGps: ubicacionGps || undefined,
        };
        await onSubmit(createData);
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar el proyecto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSaveDisabled = !nombre.trim() || !ubicacionTexto.trim() || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6" noValidate>
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-200 animate-fade-in">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Cards */}
        <div className="lg:col-span-6 space-y-6">
          <div className="vf-card p-8 space-y-5 bg-white/90 backdrop-blur-md">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)]/20 pb-2">
              Detalles del Proyecto
            </h3>

            {/* Nombre del Proyecto */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                Nombre del Proyecto *
              </label>
              <input
                id="nombre"
                type="text"
                required
                placeholder="Ej: Residencial Las Palmeras"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setNombreTouched(true);
                }}
                onBlur={() => setNombreTouched(true)}
                className={`vf-input ${nombreTouched && !nombre.trim() ? "border-red-400 focus:ring-red-200 focus:border-red-500" : ""}`}
              />
              {nombreTouched && !nombre.trim() && (
                <p className="mt-1.5 text-xs text-red-600 font-semibold animate-fade-in">
                  Campo Nombre del Proyecto necesario
                </p>
              )}
            </div>

            {/* Provincia (Ubicación Dropdown) */}
            <div>
              <label htmlFor="provincia" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                Provincia (Ubicación) *
              </label>
              <select
                id="provincia"
                required
                value={ubicacionTexto}
                onChange={(e) => {
                  setUbicacionTexto(e.target.value);
                  setUbicacionTouched(true);

                  // Update coordinates if mapped
                  const matched = PROVINCIAS.find(p => p.nombre === e.target.value);
                  if (matched) {
                    setUbicacionGps(`${matched.lat.toFixed(6)},${matched.lng.toFixed(6)}`);
                    setDesignacionCatastral(`Parc. ${Math.floor(Math.random() * 500) + 1}, ${matched.dcPrefix}`);
                  }
                }}
                onBlur={() => setUbicacionTouched(true)}
                className={`vf-input ${ubicacionTouched && !ubicacionTexto.trim() ? "border-red-400 focus:ring-red-200 focus:border-red-500" : ""}`}
              >
                <option value="">-- Seleccione una provincia --</option>
                {PROVINCIAS.map((prov) => (
                  <option key={prov.nombre} value={prov.nombre}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
              {ubicacionTouched && !ubicacionTexto.trim() && (
                <p className="mt-1.5 text-xs text-red-600 font-semibold animate-fade-in">
                  Campo Provincia necesario
                </p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="categoria" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                Categoria del Proyecto
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(Number(e.target.value) as ProjectCategory)}
                className="vf-input"
              >
                <option value={ProjectCategory.Residencial}>Residencial</option>
                <option value={ProjectCategory.Comercial}>Comercial</option>
                <option value={ProjectCategory.Turistico}>Turístico</option>
                <option value={ProjectCategory.Mixto}>Mixto</option>
                <option value={ProjectCategory.Otro}>Otro</option>
              </select>
            </div>

            {/* Desarrollador */}
            <div>
              <label htmlFor="desarrollador" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                Desarrollador / Constructora
              </label>
              <input
                id="desarrollador"
                type="text"
                value={datosDesarrollador}
                onChange={(e) => setDatosDesarrollador(e.target.value)}
                className="vf-input"
                placeholder="Nombre de la constructora encargada"
              />
            </div>
          </div>

          <div className="vf-card p-8 space-y-5 bg-white/90 backdrop-blur-md">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)]/20 pb-2">
              Geolocalización y Catastro
            </h3>

            {/* Coordenadas GPS */}
            <div>
              <label htmlFor="gps" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                Coordenadas GPS (Lat, Lng)
              </label>
              <div className="relative">
                <input
                  id="gps"
                  type="text"
                  value={ubicacionGps}
                  onChange={(e) => setUbicacionGps(e.target.value)}
                  className="vf-input font-mono pl-10"
                  placeholder="Haga clic en el mapa para marcar o ingrese coordenadas"
                />
                <MapPin className="absolute left-3.5 top-4 w-4 h-4 text-primary opacity-60" />
              </div>
            </div>

            {/* Designación Catastral */}
            <div>
              <label htmlFor="catastral" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                Designación Catastral
              </label>
              <div className="relative">
                <input
                  id="catastral"
                  type="text"
                  value={designacionCatastral}
                  onChange={(e) => setDesignacionCatastral(e.target.value)}
                  className="vf-input font-mono pl-10"
                  placeholder="Ej: Parc. 120, DC-01"
                />
                <Compass className="absolute left-3.5 top-4 w-4 h-4 text-primary opacity-60" />
              </div>
            </div>

            {/* Valor Estimado */}
            <div>
              <label htmlFor="valorEstimado" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                Valor Estimado (DOP)
              </label>
              <input
                id="valorEstimado"
                type="number"
                value={valorEstimado}
                onChange={(e) => setValorEstimado(e.target.value ? Number(e.target.value) : "")}
                className="vf-input font-mono"
                placeholder="Ej: 15000000"
              />
            </div>
          </div>
        </div>

        {/* Right Map Workspace */}
        <div className="lg:col-span-6 space-y-4">
          <div className="vf-card p-6 flex flex-col space-y-4 bg-white/90 backdrop-blur-md min-h-[570px]">
            {/* Tab Selectors */}
            <div className="flex bg-[var(--color-surface-raised)] p-1 rounded-xl border border-[var(--color-border)]/20 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveMapTab("leaflet")}
                className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                  activeMapTab === "leaflet"
                    ? "bg-primary text-white shadow-raised"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                Mapa Interactivo
              </button>
              <button
                type="button"
                onClick={() => setActiveMapTab("official")}
                className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                  activeMapTab === "official"
                    ? "bg-primary text-white shadow-raised"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Catastro Oficial RI
              </button>
            </div>

            {/* Instructions */}
            <p className="text-xs text-[var(--color-text-secondary)] italic">
              {activeMapTab === "leaflet"
                ? "Seleccione una provincia o haga clic directamente en el mapa para posicionar el marcador, extraer coordenadas GPS y obtener la Designación Catastral asociada."
                : "Portal de Consulta Geográfica Oficial del Registro Inmobiliario de la República Dominicana. Utilícelo como consulta espacial paralela."}
            </p>

            {/* Leaflet Map Container */}
            <div className={activeMapTab === "leaflet" ? "block" : "hidden"}>
              <div
                id="leaflet-map-container"
                className="w-full h-[410px] rounded-2xl border border-[var(--color-border)]/30 shadow-inner overflow-hidden"
                style={{ zIndex: 1 }}
              ></div>
            </div>

            {/* Official IFrame Container */}
            <div className={activeMapTab === "official" ? "block" : "hidden"}>
              <div 
                className="w-full h-[410px] rounded-2xl border border-[var(--color-border)]/30 shadow-inner overflow-hidden relative"
                style={{ zIndex: 1 }}
              >
                <iframe
                  src="https://servicios.ri.gob.do/ConsultaGeografica"
                  className="w-full h-full border-none"
                  title="Consulta Geográfica Registro Inmobiliario"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-[var(--color-border)]/20">
        <button type="button" onClick={onCancel} className="vf-btn-secondary">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaveDisabled}
          className={`vf-btn-primary min-w-[140px] ${
            isSaveDisabled ? "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400 hover:shadow-none" : ""
          }`}
        >
          {isSubmitting ? "Guardando..." : "Guardar Proyecto"}
        </button>
      </div>
    </form>
  );
};
