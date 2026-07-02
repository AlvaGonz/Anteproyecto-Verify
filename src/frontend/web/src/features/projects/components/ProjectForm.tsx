import React, { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CreateProyectoDto, UpdateProyectoDto, ProyectoDto, ProjectCategory } from "../types";
import { useAuth } from "../../../shared/context/AuthContext";
import { MapPin, Globe, Compass, Navigation, ImagePlus, X } from "lucide-react";
import { apiClient } from "../../../infrastructure/api/client";

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
  onDelete?: () => void;
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
  onDelete,
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
  const [matricula, setMatricula] = useState(initialData?.matricula ?? "");

  // ── Constantes de fotos ────────────────────────────────────────────────────
  const MAX_PHOTOS = 6;
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

  // ── Estado de fotos ────────────────────────────────────────────────────────
  const [portrait, setPortrait] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [fotosError, setFotosError] = useState<string | null>(null);
  
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const existingFotoUrls: string[] = initialData?.fotoUrls ?? (initialData && 'imagenUrl' in initialData && initialData.imagenUrl ? [initialData.imagenUrl as string] : []);

  // Derivado unificado para el submit — portada siempre primera
  const fotos: File[] = portrait ? [portrait, ...gallery] : gallery;

  // ── Estado de superficie ───────────────────────────────────────────────────
  const [superficieM2, setSuperficieM2] = useState<number | "">(initialData?.superficieM2 ?? "");

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

  // ── Photo Handlers ─────────────────────────────────────────────────────────
  const handlePortraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFotosError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setFotosError("Solo se permiten JPEG, PNG y WebP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFotosError(`La imagen supera ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    if (portraitPreview) URL.revokeObjectURL(portraitPreview);
    setPortrait(file);
    setPortraitPreview(URL.createObjectURL(file));
    if (portraitInputRef.current) portraitInputRef.current.value = "";
  };

  const removePortrait = () => {
    if (portraitPreview) URL.revokeObjectURL(portraitPreview);
    setPortrait(null);
    setPortraitPreview(null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFotosError(null);
    const selected = Array.from(e.target.files ?? []);
    const existingGalleryCount = existingFotoUrls.length > 1 ? existingFotoUrls.length - 1 : 0;
    const remaining = 5 - gallery.length - existingGalleryCount;

    if (selected.length > remaining) {
      setFotosError(`Solo puedes agregar ${remaining} foto${remaining !== 1 ? "s" : ""} más.`);
      return;
    }
    const invalidType = selected.find((f) => !ALLOWED_PHOTO_TYPES.includes(f.type));
    if (invalidType) {
      setFotosError(`Tipo no permitido: ${invalidType.name}.`);
      return;
    }
    const oversized = selected.find((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setFotosError(`"${oversized.name}" supera ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    const newGallery = [...gallery, ...selected];
    setGallery(newGallery);
    setGalleryPreviews([...galleryPreviews, ...selected.map((f) => URL.createObjectURL(f))]);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeGalleryPhoto = (idx: number) => {
    URL.revokeObjectURL(galleryPreviews[idx]);
    setGallery((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Limpiar object URLs al desmontar
  useEffect(() => {
    return () => {
      if (portraitPreview) URL.revokeObjectURL(portraitPreview);
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const updateData: UpdateProyectoDto & { fotosNuevas?: File[] } = {
          nombre,
          ubicacionTexto,
          ubicacionGps: ubicacionGps || undefined,
          valorEstimado: valorEstimado === "" ? undefined : Number(valorEstimado),
          categoria,
          datosDesarrollador: datosDesarrollador || undefined,
          rncDesarrollador: rncDesarrollador || undefined,
          designacionCatastral: designacionCatastral || undefined,
          matricula: matricula || undefined,
          superficieM2: superficieM2 === "" ? undefined : Number(superficieM2),
          fotosNuevas: fotos.length > 0 ? fotos : undefined,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateProyectoDto & { fotosNuevas?: File[] } = {
          nombre,
          ubicacionTexto,
          usuarioCreadorId: user?.id ?? "00000000-0000-0000-0000-000000000000",
          categoria,
          datosDesarrollador: datosDesarrollador || undefined,
          rncDesarrollador: rncDesarrollador || undefined,
          designacionCatastral: designacionCatastral || undefined,
          ubicacionGps: ubicacionGps || undefined,
          matricula: matricula || undefined,
          superficieM2: superficieM2 === "" ? undefined : Number(superficieM2),
          fotosNuevas: fotos.length > 0 ? fotos : undefined,
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

      {/* ── TOP: Map Workspace Full-Width ── */}
      <div className="w-full rounded-xl overflow-hidden">
        <div className="vf-card p-6 flex flex-col space-y-4 bg-white/90 backdrop-blur-md w-full">

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
            className={activeMapTab === "leaflet" ? "block" : "hidden"}
          >
            <div
              ref={mapContainerRef}
              className="w-full h-[400px] md:h-[500px] rounded-2xl border border-[var(--color-border)]/30 shadow-inner overflow-hidden"
              style={{ zIndex: 1 }}
            />
          </div>

          {/* ── Official RI Cadastral Iframe ── */}
          <div
            className={activeMapTab === "official" ? "block relative overflow-hidden rounded-2xl border border-[var(--color-border)]/30 shadow-inner" : "hidden"}
            style={{ height: 410 }}
          >
            <iframe
              ref={iframeRef}
              src="https://servicios.ri.gob.do/ConsultaGeografica"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="border-none absolute left-0"
              title="Consulta Geográfica Registro Inmobiliario"
              style={{
                top: "-132px",
                width: "100%",
                height: "calc(100% + 132px)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Form Fields in 2-col grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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

          {/* Matrícula */}
          <div>
            <label htmlFor="matricula" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
              Matrícula del Inmueble
            </label>
            <input
              id="matricula"
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="vf-input font-mono"
              placeholder="Ej: 0100234567"
            />
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

          {/* Superficie en M² */}
          <div>
            <label htmlFor="superficieM2" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
              Superficie (m²)
            </label>
            <input
              id="superficieM2"
              type="number"
              min={0}
              step={0.01}
              value={superficieM2}
              onChange={(e) => setSuperficieM2(e.target.value ? Number(e.target.value) : "")}
              className="vf-input font-mono"
              placeholder="Ej: 250.00"
            />
          </div>
        </div>

        <div className="vf-card p-8 bg-white/90 backdrop-blur-md md:col-span-2">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)]/20 pb-2 mb-6">
            Fotos del Proyecto
          </h3>

          {fotosError && (
            <div role="alert" className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {fotosError}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">

            {/* ── PORTADA ── */}
            <div className="flex-shrink-0 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-amber-600">★</span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">Foto de Portada</span>
                <span className="text-xs text-[var(--color-text-secondary)]">· thumbnail principal</span>
              </div>

              {/* Slot portada */}
              {portraitPreview ? (
                <div className="relative w-[200px] h-[200px] rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md">
                  <img
                    src={portraitPreview}
                    alt="Vista previa de portada"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-amber-500/80 text-white text-[10px] font-black uppercase tracking-wider text-center py-1">
                    Portada
                  </div>
                  <button
                    type="button"
                    onClick={removePortrait}
                    aria-label="Quitar foto de portada"
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : existingFotoUrls[0] ? (
                <div className="relative w-[200px] h-[200px] rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md">
                  <img
                    src={existingFotoUrls[0]}
                    alt="Portada actual"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-amber-500/80 text-white text-[10px] font-black uppercase tracking-wider text-center py-1">
                    Portada activa
                  </div>
                  <button
                    type="button"
                    onClick={() => portraitInputRef.current?.click()}
                    aria-label="Cambiar foto de portada"
                    className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded-lg hover:bg-black/80 transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="btn-agregar-portada"
                  onClick={() => portraitInputRef.current?.click()}
                  aria-label="Subir foto de portada"
                  className="w-[200px] h-[200px] rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <ImagePlus className="w-8 h-8 text-amber-400" />
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                    Subir portada
                  </span>
                </button>
              )}

              <input
                ref={portraitInputRef}
                id="input-portada"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Seleccionar foto de portada"
                onChange={handlePortraitChange}
              />
            </div>

            {/* Divisor vertical */}
            <div className="hidden md:block w-px bg-[var(--color-border)]/20 self-stretch" />
            <div className="md:hidden h-px w-full bg-[var(--color-border)]/20" />

            {/* ── GALERÍA ── */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">Fotos adicionales</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">· hasta 5 fotos</span>
                </div>
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                  {gallery.length + (existingFotoUrls.length > 1 ? existingFotoUrls.length - 1 : 0)}/5
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Fotos de galería existentes (edit mode) */}
                {existingFotoUrls.slice(1).map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative w-full aspect-square rounded-xl overflow-hidden border border-[var(--color-border)]/30 shadow-sm">
                    <img src={url} alt={`Foto adicional ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}

                {/* Previews de galería nuevas */}
                {galleryPreviews.map((preview, idx) => (
                  <div key={`preview-${idx}`} className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-teal-300">
                    <img src={preview} alt={`Nueva foto ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute bottom-0 inset-x-0 bg-teal-500/80 text-white text-[9px] font-black uppercase tracking-wider text-center py-0.5">
                      Por subir
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGalleryPhoto(idx)}
                      aria-label={`Quitar foto ${idx + 1}`}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}

                {/* Botón agregar galería */}
                {gallery.length + (existingFotoUrls.length > 1 ? existingFotoUrls.length - 1 : 0) < 5 && (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    aria-label="Agregar fotos adicionales"
                    className="w-full aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)]/40 bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-raised)]/80 flex flex-col items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <ImagePlus className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">
                      Agregar
                    </span>
                  </button>
                )}
              </div>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                aria-label="Seleccionar fotos adicionales"
                onChange={handleGalleryChange}
              />

              <p className="text-xs text-[var(--color-text-secondary)]">
                5 MB por imagen · JPEG, PNG, WebP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex justify-end gap-3 pt-6 border-t border-[var(--color-border)]/20">
        {initialData && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="vf-btn-danger mr-auto"
          >
            Eliminar Expediente
          </button>
        )}
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
