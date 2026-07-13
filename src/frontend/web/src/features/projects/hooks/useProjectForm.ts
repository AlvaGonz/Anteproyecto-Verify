import React, { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CreateProyectoDto, UpdateProyectoDto, ProyectoDto, ProjectCategory } from "../types";
import { useAuth } from "../../../shared/context/AuthContext";
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

export interface ProjectFormProps {
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

export function useProjectForm({ initialData, onSubmit, onCancel, onDelete }: ProjectFormProps) {
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
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

  // ── Estado de fotos ────────────────────────────────────────────────────────
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [fotosError, setFotosError] = useState<string | null>(null);

  const portraitInputRef = useRef<HTMLInputElement>(null);
  const portraitRef = useRef<File | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const existingFotoUrls: string[] = initialData?.fotoUrls ?? (initialData && 'imagenUrl' in initialData && initialData.imagenUrl ? [initialData.imagenUrl as string] : []);

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

  useEffect(() => {
    const cleaned = rncDesarrollador.replace(/[- ]/g, "").trim();
    if (cleaned.length === 11 || cleaned.length === 9) {
      handleRncSearch(rncDesarrollador);
    }
  }, [rncDesarrollador]);

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
    portraitRef.current = file;
    setPortraitPreview(URL.createObjectURL(file));
    if (portraitInputRef.current) portraitInputRef.current.value = "";
  };

  const removePortrait = () => {
    if (portraitPreview) URL.revokeObjectURL(portraitPreview);
    portraitRef.current = null;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-doctor/exhaustive-deps
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

  // Map Search State
  const [mapSearchText, setMapSearchText] = useState("");

  const handleSearchCoordinates = useCallback(() => {
    const map = leafletMapRef.current;
    if (!map || !mapSearchText.trim()) return;

    // Parse lat, lng from mapSearchText (e.g. "18.47186, -69.93988")
    const match = mapSearchText.match(/([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);

      map.flyTo([lat, lng], 13, { duration: 1.2 });
      
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
    }
  }, [mapSearchText]);

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
          fotosNuevas: portraitRef.current ? [portraitRef.current, ...gallery] : gallery.length > 0 ? gallery : undefined,
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
          fotosNuevas: portraitRef.current ? [portraitRef.current, ...gallery] : gallery.length > 0 ? gallery : undefined,
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

  return {
    // Layout-level props
    error,
    activeMapTab,
    setActiveMapTab,
    mapContainerRef,
    iframeRef,
    ubicacionTexto,
    isSubmitting,
    isSaveDisabled,
    initialData,
    onCancel,
    onDelete,
    handleSubmit,
    mapSearchText,
    setMapSearchText,
    handleSearchCoordinates,
    // Grouped field props
    basicFields: {
      provincias: PROVINCIAS,
      nombre, setNombre, nombreTouched, setNombreTouched,
      ubicacionTexto, setUbicacionTexto, ubicacionTouched, setUbicacionTouched,
      setUbicacionGps, setDesignacionCatastral,
      categoria, setCategoria,
      rncDesarrollador, setRncDesarrollador, rncError, setRncError,
      isSearchingRnc, handleRncSearch,
      datosDesarrollador, setDatosDesarrollador,
    } as const,
    detailsFields: {
      ubicacionGps, designacionCatastral,
      matricula, setMatricula,
      valorEstimado, setValorEstimado,
      superficieM2, setSuperficieM2,
    } as const,
    documentSection: {
      portraitPreview, handlePortraitChange, removePortrait, portraitInputRef,
      existingFotoUrls,
      gallery, galleryPreviews, handleGalleryChange, removeGalleryPhoto,
      galleryInputRef, fotosError,
    } as const,
  };
}
