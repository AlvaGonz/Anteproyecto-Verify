import React, { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CreateProyectoDto, UpdateProyectoDto, ProyectoDto, ProjectCategory } from "../types";
import { useAuth } from "../../../shared/context/AuthContext";
import { MapPin, Globe, Compass, Navigation } from "lucide-react";
import { apiClient } from "@/infrastructure/api/client";

// Fix Leaflet default marker icon paths broken by Vite's asset bundler
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

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
  { nombre: "Santo Domingo", lat: 18.54119, lng: -69.41817, dcPrefix: "DC-31" },
  { nombre: "Valverde", lat: 19.58000, lng: -71.07000, dcPrefix: "DC-32" },
];

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  // useAuth must be called unconditionally at the top level (React rules).
  // In unit tests the component is wrapped in a test AuthProvider, so this is safe.
  const { user } = useAuth();

  // ── Fields State ──────────────────────────────────────────────────────────
  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [ubicacionTexto, setUbicacionTexto] = useState(initialData?.ubicacionTexto ?? "");
  const [ubicacionGps, setUbicacionGps] = useState(initialData?.ubicacionGps ?? "");
  const [valorEstimado, setValorEstimado] = useState<number | "">(initialData?.valorEstimado ?? "");
  const [categoria, setCategoria] = useState<ProjectCategory>(initialData?.categoria ?? ProjectCategory.Residencial);
  const [datosDesarrollador, setDatosDesarrollador] = useState(initialData?.datosDesarrollador ?? "");
  const [rncDesarrollador, setRncDesarrollador] = useState(initialData?.rncDesarrollador ?? "");
  const [designacionCatastral, setDesignacionCatastral] = useState(initialData?.designacionCatastral ?? "");

  // RNC Lookup States
  const [isSearchingRnc, setIsSearchingRnc] = useState(false);
  const [rncError, setRncError] = useState<string | null>(null);

  const handleRncSearch = async (rncValue: string) => {
    const cleaned = rncValue.replace(/[- ]/g, "").trim();
    if (!cleaned) return;

    setIsSearchingRnc(true);
    setRncError(null);

    try {
      const response = await apiClient.get(`/dgii/rnc/${cleaned}`);
      if (response.data && response.data.nombreRazonSocial) {
        setDatosDesarrollador(response.data.nombreRazonSocial);
      }
    } catch (err: any) {
      console.error("Error fetching RNC:", err);
      setRncError("RNC/Cédula no registrado o inválido");
    } finally {
      setIsSearchingRnc(false);
    }
  };

  // ── Validation State ──────────────────────────────────────────────────────
  const [nombreTouched, setNombreTouched] = useState(false);
  const [ubicacionTouched, setUbicacionTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Map State ─────────────────────────────────────────────────────────────
  const [activeMapTab, setActiveMapTab] = useState<"leaflet" | "official">("leaflet");

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // RI iframe ref (for postMessage targeting)
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Keep a ref to the latest ubicacionTexto so the postMessage listener
  // always has the current province without needing to re-register
  const ubicacionTextoRef = useRef(ubicacionTexto);
  useEffect(() => { ubicacionTextoRef.current = ubicacionTexto; }, [ubicacionTexto]);

  // ── Leaflet: Initialize map once on mount ─────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    const defaultCenter: L.LatLngTuple = [18.7357, -70.1627]; // DR center
    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(defaultCenter, 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
      maxZoom: 18,
    }).addTo(map);

    leafletMapRef.current = map;

    // Click to drop marker + capture GPS + generate catastral code
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setUbicacionGps(`${lat.toFixed(6)},${lng.toFixed(6)}`);

      const randomParcel = Math.floor(Math.random() * 500) + 1;
      const matchedProv = PROVINCIAS.find(p => p.nombre === ubicacionTextoRef.current);
      const prefix = matchedProv ? matchedProv.dcPrefix : "DC-01";
      setDesignacionCatastral(`Parc. ${randomParcel}, ${prefix}`);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
    });

    // Settle layout then force a size recalculation
    setTimeout(() => { map.invalidateSize(); }, 250);

    return () => {
      map.remove();
      leafletMapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // ── Leaflet: Fly to province centroid when selection changes ──────────────
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !ubicacionTexto) return;

    const prov = PROVINCIAS.find(p => p.nombre === ubicacionTexto);
    if (!prov) return;

    map.flyTo([prov.lat, prov.lng], 11, { duration: 1.2 });

    if (markerRef.current) {
      markerRef.current.setLatLng([prov.lat, prov.lng]);
    } else {
      markerRef.current = L.marker([prov.lat, prov.lng]).addTo(map);
    }
  }, [ubicacionTexto]);

  // ── Leaflet: Fix tile rendering when switching back to Leaflet tab ────────
  useEffect(() => {
    const map = leafletMapRef.current; // capture before async timeout
    if (activeMapTab === "leaflet" && map) {
      const timer = setTimeout(() => { map.invalidateSize(); }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeMapTab]);

  // ── postMessage bridge: Respond to RI page's geoPermission request ────────
  // The RI engineers built this bridge (see /ConsultaGeografica source lines
  // 1257–1307): the iframe fires { event: 'geoPermission' } to window.parent
  // (which is our app). We reply with province centroid coordinates, and their
  // showPosition() pans the Google Maps instance to our selected location.
  const handleRiPostMessage = useCallback((event: MessageEvent) => {
    // Only handle messages from the RI portal
    if (!event.origin.includes("ri.gob.do") && event.origin !== "null") return;
    if (event.data?.event !== "geoPermission") return;

    const prov = PROVINCIAS.find(p => p.nombre === ubicacionTextoRef.current);
    const lat = prov?.lat ?? 18.7357;
    const lng = prov?.lng ?? -70.1627;

    // Reply to the iframe with our province coordinates
    const target = iframeRef.current?.contentWindow ?? (event.source as Window);
    if (target) {
      target.postMessage(
        {
          event: "geolocation",
          type: "geoPermissionGranted",
          latitude: lat,
          longitude: lng,
        },
        "https://servicios.ri.gob.do"
      );
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleRiPostMessage);
    return () => window.removeEventListener("message", handleRiPostMessage);
  }, [handleRiPostMessage]);

  // When user switches to RI tab AND a province is selected, reload the iframe
  // so the RI page re-fires geoPermission with our new province in scope
  useEffect(() => {
    if (activeMapTab === "official" && iframeRef.current && ubicacionTexto) {
      // Small delay to let the iframe become visible before triggering reload
      const timer = setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = "https://servicios.ri.gob.do/ConsultaGeografica";
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeMapTab, ubicacionTexto]);

  // ── Form submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!nombre.trim() || !ubicacionTexto.trim()) {
      setNombreTouched(true);
      setUbicacionTouched(true);
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
          rncDesarrollador: rncDesarrollador || undefined,
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
          rncDesarrollador: rncDesarrollador || undefined,
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6" noValidate>
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-200 animate-fade-in">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── Left: Form Fields ── */}
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
                onChange={(e) => { setNombre(e.target.value); setNombreTouched(true); }}
                onBlur={() => setNombreTouched(true)}
                className={`vf-input ${nombreTouched && !nombre.trim() ? "border-red-400 focus:ring-red-200 focus:border-red-500" : ""}`}
              />
              {nombreTouched && !nombre.trim() && (
                <p className="mt-1.5 text-xs text-red-600 font-semibold animate-fade-in">
                  Campo Nombre del Proyecto necesario
                </p>
              )}
            </div>

            {/* Provincia Dropdown */}
            <div>
              <label htmlFor="provincia" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                Provincia (Ubicación) *
              </label>
              <select
                id="provincia"
                required
                value={ubicacionTexto}
                onChange={(e) => {
                  const val = e.target.value;
                  setUbicacionTexto(val);
                  setUbicacionTouched(true);
                  const matched = PROVINCIAS.find(p => p.nombre === val);
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
                  <option key={prov.nombre} value={prov.nombre}>{prov.nombre}</option>
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

            {/* RNC del Desarrollador */}
            <div>
              <label htmlFor="rncDesarrollador" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                RNC / Cédula del Desarrollador
              </label>
              <div className="relative">
                <input
                  id="rncDesarrollador"
                  type="text"
                  value={rncDesarrollador}
                  onChange={(e) => {
                    setRncDesarrollador(e.target.value);
                    if (rncError) setRncError(null);
                  }}
                  onBlur={() => handleRncSearch(rncDesarrollador)}
                  className={`vf-input ${rncError ? "border-red-400 focus:ring-red-200 focus:border-red-500" : ""}`}
                  placeholder="Ingrese RNC o Cédula (ej: 02601322098) y presione Tab"
                />
                {isSearchingRnc && (
                  <div className="absolute right-3 top-3.5 flex items-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {rncError && (
                <p className="mt-1.5 text-xs text-red-600 font-semibold animate-fade-in">
                  {rncError}
                </p>
              )}
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

          {/* Geolocalización y Catastro */}
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
                  disabled={true}
                  value={ubicacionGps}
                  className="vf-input font-mono pl-10 bg-gray-50 border-gray-200 cursor-not-allowed"
                  placeholder="Haga clic en el mapa para marcar"
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
                  disabled={true}
                  value={designacionCatastral}
                  className="vf-input font-mono pl-10 bg-gray-50 border-gray-200 cursor-not-allowed"
                  placeholder="Se genera al marcar la ubicación"
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

        {/* ── Right: Map Workspace ── */}
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
                ? "Seleccione una provincia o haga clic en el mapa para posicionar el marcador, extraer coordenadas GPS y obtener la Designación Catastral."
                : ubicacionTexto
                  ? `Portal Catastral RI — mostrando: ${ubicacionTexto}. El mapa se centra automáticamente en la provincia seleccionada.`
                  : "Portal de Consulta Geográfica Oficial del Registro Inmobiliario. Seleccione una provincia para centrar el mapa automáticamente."}
            </p>

            {/* ── Leaflet Interactive Map ── */}
            <div
              className={activeMapTab === "leaflet" ? "block flex-1" : "hidden"}
              style={{ minHeight: 410 }}
            >
              <div
                ref={mapContainerRef}
                className="w-full rounded-2xl border border-[var(--color-border)]/30 shadow-inner overflow-hidden"
                style={{ height: 410, zIndex: 1 }}
              />
            </div>

            {/* ── Official RI Cadastral Iframe ── */}
            <div
              className={activeMapTab === "official" ? "block flex-1 relative overflow-hidden rounded-2xl border border-[var(--color-border)]/30 shadow-inner" : "hidden"}
              style={{ height: 410 }}
            >
              {/* 
                sandbox: silences geolocation popup (allow-geolocation is intentionally absent).
                The RI page fires postMessage({ event: 'geoPermission' }) to window.parent.
                Our useEffect listener above responds with province centroid coordinates,
                which their showPosition() uses to pan the Google Maps instance.
              */}
              <iframe
                ref={iframeRef}
                src="https://servicios.ri.gob.do/ConsultaGeografica"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                className="border-none absolute left-0"
                title="Consulta Geográfica Registro Inmobiliario"
                style={{
                  // The RI page has ~130px of header + nav above the map canvas.
                  // We shift the iframe up to clip those away and show only the map.
                  top: "-132px",
                  width: "100%",
                  height: "calc(100% + 132px)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
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
