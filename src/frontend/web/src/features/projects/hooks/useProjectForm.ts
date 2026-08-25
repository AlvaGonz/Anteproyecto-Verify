import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CreateProyectoDto, UpdateProyectoDto, ProyectoDto } from "../types";
import { useAuth } from "../../../shared/context/AuthContext";
import { apiClient } from "../../../infrastructure/api/client";
import { projectsApi } from "../api/projectsApi";
import { isSuccess } from "@/shared/utils/functional";
import { useProvinces } from "../../provinces/api/useProvinces";
import { useCategories } from "../api/useCategories";

import { useToast } from "../../../shared/components/ui/Toast/ToastContext";

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

const toProvinciaInfo = (apiData: { id: string; nombre: string; latitud: number; longitud: number }[]): ProvinciaInfo[] =>
  apiData.map((p, i) => ({
    nombre: p.nombre,
    lat: Number(p.latitud),
    lng: Number(p.longitud),
    dcPrefix: `DC-${String(i + 1).padStart(2, "0")}`,
  }));

const getClosestProvincia = (provinces: ProvinciaInfo[], lat: number, lng: number): string => {
  if (provinces.length === 0) return "Distrito Nacional";
  let closestProvince = provinces[0].nombre;
  let minDistance = Number.MAX_VALUE;

  for (const province of provinces) {
    const dist = Math.sqrt(Math.pow(lat - province.lat, 2) + Math.pow(lng - province.lng, 2));
    if (dist < minDistance) {
      minDistance = dist;
      closestProvince = province.nombre;
    }
  }
  return closestProvince;
};

export function useProjectForm({ initialData, onSubmit, onCancel, onDelete }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const activeProcessControllerRef = useRef<AbortController | null>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const { data: provinciasApi } = useProvinces();
  const provincias = toProvinciaInfo(provinciasApi ?? []);
  const provinciasRef = useRef(provincias);
  provinciasRef.current = provincias;

  const { data: categorias = [] } = useCategories();

  // ── Fields State ──────────────────────────────────────────────────────────
  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [ubicacionTexto, setUbicacionTexto] = useState(initialData?.ubicacionTexto ?? "");
  const [ubicacionGps, setUbicacionGps] = useState(initialData?.ubicacionGps ?? "");
  const [valorEstimado, setValorEstimado] = useState<number | "">(initialData?.valorEstimado ?? "");
  // ponytail: 0 = "no selection" sentinel (matches the disabled placeholder option); category is required, so no magic default
  const [categoriaId, setCategoriaId] = useState<number>(initialData?.categoriaId ?? categorias[0]?.id ?? 0);
  const [datosDesarrollador, setDatosDesarrollador] = useState(initialData?.datosDesarrollador ?? "");
  const [rncDesarrollador, setRncDesarrollador] = useState(initialData?.rncDesarrollador ?? "");
  const [designacionCatastral, setDesignacionCatastral] = useState(initialData?.designacionCatastral ?? "");
  const [matricula, setMatricula] = useState(initialData?.matricula ?? "");
  const [propietario, setPropietario] = useState(initialData?.propietario ?? "");
  const [cedulaRncPropietario, setCedulaRncPropietario] = useState(initialData?.cedulaRncPropietario ?? "");
  const [ipi, setIpi] = useState(initialData?.ipi ?? "");
  const [estatusIpi, setEstatusIpi] = useState(initialData?.estatusIpi ?? "");

  // ── Image URLs State ───────────────────────────────────────────────────────
  const [imagenUrl, setImagenUrl] = useState(initialData?.imagenUrl ?? "");
  const [imagenAdicional1, setImagenAdicional1] = useState(initialData?.imagenAdicional1 ?? "");
  const [imagenAdicional2, setImagenAdicional2] = useState(initialData?.imagenAdicional2 ?? "");
  const [imagenAdicional3, setImagenAdicional3] = useState(initialData?.imagenAdicional3 ?? "");
  const [imagenAdicional4, setImagenAdicional4] = useState(initialData?.imagenAdicional4 ?? "");
  const [imagenAdicional5, setImagenAdicional5] = useState(initialData?.imagenAdicional5 ?? "");

  // ── Constantes de fotos ────────────────────────────────────────────────────
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

  // ── Estado de fotos ────────────────────────────────────────────────────────
  const [fotosError, setFotosError] = useState<string | null>(null);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const portraitInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // ── Estado de superficie ───────────────────────────────────────────────────
  const [superficieM2, setSuperficieM2] = useState<number | string>(initialData?.superficieM2 ?? "");

  // RNC Lookup States
  const [isSearchingRnc, setIsSearchingRnc] = useState(false);
  const [rncError, setRncError] = useState<string | null>(null);

  const handleRncSearch = async (rncValue: string) => {
    const cleaned = rncValue.replace(/\D/g, "");
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
    const cleaned = rncDesarrollador.replace(/\D/g, "");
    if (cleaned.length === 11 || cleaned.length === 9) {
      const timer = setTimeout(() => {
        handleRncSearch(rncDesarrollador);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [rncDesarrollador]);

  // ── Photo Handlers ─────────────────────────────────────────────────────────
  const handlePortraitChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingPhotos(true);
    try {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      const res = await projectsApi.uploadProjectImage(file);
      if (isSuccess(res)) {
        setImagenUrl(res.value);
      } else {
        console.error("PORTRAIT UPLOAD FAIL:", res);
        setFotosError("Error al subir la foto de portada.");
      }
    } catch (err) {
      console.error("PORTRAIT UPLOAD EXCEPTION:", err);
      setFotosError("Error al subir la foto de portada.");
    } finally {
      setIsUploadingPhotos(false);
      if (portraitInputRef.current) portraitInputRef.current.value = "";
    }
  };

  const removePortrait = () => {
    setImagenUrl("");
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFotosError(null);
    const selected = Array.from(e.target.files ?? []);
    
    const currentUrls = [imagenAdicional1, imagenAdicional2, imagenAdicional3, imagenAdicional4, imagenAdicional5];
    const currentCount = currentUrls.filter(Boolean).length;
    const remaining = 5 - currentCount;

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

    setIsUploadingPhotos(true);
    try {
      const uploadPromises = selected.map(file => projectsApi.uploadProjectImage(file));
      const results = await Promise.all(uploadPromises);

      const uploadedUrls: string[] = [];
      results.forEach((res, idx) => {
        if (isSuccess(res)) {
          uploadedUrls.push(res.value);
        } else {
          console.error("Error uploading gallery image", selected[idx].name);
        }
      });

      if (uploadedUrls.length < selected.length) {
        setFotosError("Algunas fotos no se pudieron subir.");
      }

      const updated = [...currentUrls];
      let uploadedIdx = 0;
      for (let i = 0; i < 5; i++) {
        if (!updated[i] && uploadedIdx < uploadedUrls.length) {
          updated[i] = uploadedUrls[uploadedIdx++];
        }
      }

      setImagenAdicional1(updated[0]);
      setImagenAdicional2(updated[1]);
      setImagenAdicional3(updated[2]);
      setImagenAdicional4(updated[3]);
      setImagenAdicional5(updated[4]);
    } catch (err) {
      setFotosError("Error al subir las fotos.");
    } finally {
      setIsUploadingPhotos(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const removeGalleryPhoto = (idx: number) => {
    const currentUrls = [imagenAdicional1, imagenAdicional2, imagenAdicional3, imagenAdicional4, imagenAdicional5].filter(Boolean);
    const updatedUrls = currentUrls.filter((_, i) => i !== idx);
    const padded = [...updatedUrls, "", "", "", "", ""].slice(0, 5);

    setImagenAdicional1(padded[0]);
    setImagenAdicional2(padded[1]);
    setImagenAdicional3(padded[2]);
    setImagenAdicional4(padded[3]);
    setImagenAdicional5(padded[4]);
  };

  // Limpiar object URLs al desmontar
  useEffect(() => {
    return () => {
    };
  }, []);

  // ── Validation State ──────────────────────────────────────────────────────
  const [nombreTouched, setNombreTouched] = useState(false);
  const [ubicacionTouched, setUbicacionTouched] = useState(false);
  const [desarrolladorTouched, setDesarrolladorTouched] = useState(false);
  const [duplicateWarningOpen, setDuplicateWarningOpen] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
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
  const [cercania, setCercania] = useState(initialData?.cercania ?? "");

  const processLocation = useCallback(async (lat: number, lng: number, map: L.Map | null) => {
    if (!map) return;

    // Abort previous in-flight requests to avoid race conditions (falsos positivos/negativos)
    if (activeProcessControllerRef.current) {
      activeProcessControllerRef.current.abort();
    }
    const abortController = new AbortController();
    activeProcessControllerRef.current = abortController;
    const signal = abortController.signal;

    // Control de Zoom Automático (Zoom 17)
    const targetZoom = 17;
    const currentZoom = map.getZoom();
    if (Math.abs(currentZoom - targetZoom) > 1) {
      map.flyTo([lat, lng], targetZoom, { duration: 1.0 });
    } else {
      map.flyTo([lat, lng], currentZoom, { duration: 0.5 });
    }

    // 1. Initial State Updates
    setUbicacionGps(`${lat.toFixed(6)},${lng.toFixed(6)}`);
    skipFlyToRef.current = true;
    const closestProvName = getClosestProvincia(provinciasRef.current, lat, lng);
    setUbicacionTexto(closestProvName);

    // 2. Fire 3 Requests in Parallel for Blazing Speed
    const nominatimPromise = fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=18&addressdetails=1&polygon_geojson=1`, { signal })
      .then(res => res.ok ? res.json() : null)
      .catch(() => null);

    // Using nwr (node, way, relation) to catch complexes like university campuses
    const overpassQuery = `[out:json][timeout:3];(nwr["building"](around:5,${lat},${lng});nwr["amenity"](around:5,${lat},${lng});nwr["leisure"](around:5,${lat},${lng});nwr["natural"="water"](around:5,${lat},${lng});nwr["waterway"](around:5,${lat},${lng}););out geom tags;`;
    const timeoutId = setTimeout(() => {
        if (!signal.aborted) abortController.abort();
    }, 3500); // Prevent hanging
    const overpassPromise = fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: overpassQuery, signal })
      .then(res => { clearTimeout(timeoutId); return res.ok ? res.json() : null; })
      .catch(() => { clearTimeout(timeoutId); return null; });

    const catastroPromise = projectsApi.lookupCatastroByGps(lat.toString(), lng.toString())
      .catch(() => null);

    let nomResult, opResult, catResult;
    try {
      [nomResult, opResult, catResult] = await Promise.allSettled([
        nominatimPromise,
        overpassPromise,
        catastroPromise
      ]);
    } catch (e) {
      return; // if Promise.allSettled throws (unlikely)
    }

    // Abort processing ONLY if a new click came in while waiting (Race condition prevention)
    if (activeProcessControllerRef.current !== abortController) return;

    const nomData = nomResult.status === "fulfilled" ? nomResult.value : null;
    const opData = opResult.status === "fulfilled" ? opResult.value : null;
    const catData = catResult.status === "fulfilled" ? catResult.value : null;

    // 3. Nominatim Validation & Address
    let nomName = "";
    let addr: any = null;
    
    let isSeaBlocked = false;
    if (nomData && nomData.error) {
      isSeaBlocked = true;
    }

    if (nomData && !nomData.error) {
      const osmClass = nomData.class || nomData.category || "";
      const type = nomData.type || "";
      addr = nomData.address;
      nomName = nomData.name || (nomData.display_name ? nomData.display_name.split(",")[0].trim() : "");
      
      let isHighwayBlocked = false;
      if (osmClass === "highway") {
        if (nomData.geojson && nomData.geojson.type === "LineString") {
          const coords = nomData.geojson.coordinates as [number, number][];
          const dist = getDistanceToLineString([lng, lat], coords);
          if (dist < 10) {
            isHighwayBlocked = true;
          } else if (dist > 150) {
            isSeaBlocked = true;
          }
        } else {
          isHighwayBlocked = true;
        }
      } else if (nomData.lat && nomData.lon) {
        const dy = lat - parseFloat(nomData.lat);
        const dx = (lng - parseFloat(nomData.lon)) * Math.cos(lat * Math.PI / 180);
        const distToSnapped = Math.sqrt(dx * dx + dy * dy) * 111320;
        if (distToSnapped > 250) {
          isSeaBlocked = true;
        }
      }

      if (
        isHighwayBlocked ||
        isSeaBlocked ||
        osmClass === "waterway" || 
        osmClass === "natural" ||
        (osmClass === "place" && type === "sea") ||
        type === "water" || type === "sea" || type === "ocean" || type === "river" || type === "bay"
      ) {
        setInvalidLocationModalOpen(true);
        setUbicacionGps("");
        setDesignacionCatastral("");
        setMatricula("");
        setCercania("");
        setSuperficieM2("");
        setPropietario("");
        setCedulaRncPropietario("");
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        if (polygonRef.current) {
            polygonRef.current.remove();
            polygonRef.current = null;
        }
        return; // Abort processing
      }
    }

    // 4. Overpass Processing (Polygon + Exact Name)
    let calculatedArea = 15;
    let reference = "";

    if (opData && opData.elements && opData.elements.length > 0) {
      // Check if Overpass found water
      const isWaterOverpass = opData.elements.some((el: any) => 
        el.tags && (el.tags.natural === "water" || el.tags.waterway)
      );

      if (isWaterOverpass) {
        setInvalidLocationModalOpen(true);
        setUbicacionGps("");
        setDesignacionCatastral("");
        setMatricula("");
        setCercania("");
        setSuperficieM2("");
        setPropietario("");
        setCedulaRncPropietario("");
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        if (polygonRef.current) {
            polygonRef.current.remove();
            polygonRef.current = null;
        }
        return; // Abort processing
      }

      let bestElement: any = null;
      let bestScore = Infinity;
      
      for (const el of opData.elements) {
        if (el.type === "way" && el.geometry) {
          const coords = el.geometry.map((g: any) => [g.lon, g.lat] as [number, number]);
          const area = calculatePolygonArea(coords);
          if (area > 0 && area < 40000) {
            const inside = isPointInPolygon([lng, lat], coords);
            let score = Infinity;
            if (inside) {
              score = area;
            } else {
              const dist = getDistanceToLineString([lng, lat], coords);
              if (dist < 2) {
                score = dist + 1000000;
              } else {
                continue;
              }
            }
            if (score < bestScore) {
              bestScore = score;
              bestElement = { ...el, area, coords };
            }
          }
        }
      }
      
      if (bestElement) {
        calculatedArea = Math.round(bestElement.area);
        const leafletCoords = bestElement.coords.map((c: any) => [c[1], c[0]] as L.LatLngTuple);
        if (polygonRef.current) polygonRef.current.remove();
        polygonRef.current = L.polygon(leafletCoords, { color: 'blue', weight: 2, fillOpacity: 0.2 }).addTo(map);
        
        if (bestElement.tags && bestElement.tags.name) {
          reference = bestElement.tags.name;
        }
      } else {
        if (polygonRef.current) polygonRef.current.remove();
      }
    } else {
      if (polygonRef.current) polygonRef.current.remove();
    }

    // Fallback: If Overpass failed or found no buildings, try Nominatim geojson
    if (!polygonRef.current && nomData && nomData.geojson && (nomData.geojson.type === "Polygon" || nomData.geojson.type === "MultiPolygon")) {
      try {
        const geom = nomData.geojson.type === "Polygon" ? nomData.geojson.coordinates[0] : nomData.geojson.coordinates[0][0];
        const coords = geom.map((c: any) => [c[0], c[1]] as [number, number]);
        const area = calculatePolygonArea(coords);
        if (area > 0 && area < 40000) {
          calculatedArea = Math.round(area);
          const leafletCoords = coords.map(c => [c[1], c[0]] as L.LatLngTuple);
          polygonRef.current = L.polygon(leafletCoords, { color: 'green', weight: 2, fillOpacity: 0.2 }).addTo(map);
        }
      } catch (e) {
        console.warn("Could not draw fallback Nominatim polygon", e);
      }
    }

    // 4.b Fallback to Nominatim name if Overpass failed or had no name
    if (!reference && nomData) {
      const osmClass = nomData.class || nomData.category || "";
      const isRoadOrWaterOrPlace = (osmClass === "highway" || osmClass === "waterway" || osmClass === "natural" || osmClass === "boundary" || osmClass === "place" || osmClass === "landuse");
      
      // Filter out words that denote a street, waterbody, or administrative region, case insensitive
      const isStreetName = /^(calle|avenida|ave\.?|av\.?|c\/|carretera|camino|autopista|autovía|río|rio|mar|océano|lago|arroyo|provincia|municipio|ciudad|paraje|sector|barrio|distrito)\b/i.test(nomName);

      if (!isRoadOrWaterOrPlace && nomName && nomName !== "unnamed" && !isStreetName) {
        reference = nomName;
      } else if (addr) {
        const poi = addr.amenity || addr.shop || addr.tourism || addr.historic || addr.leisure || addr.office || addr.government || addr.building || addr.industrial;
        if (poi && !/^(calle|avenida|ave\.?|av\.?|c\/|carretera|camino|autopista|autovía|río|rio|mar|océano|lago|arroyo|provincia|municipio|ciudad|paraje|sector|barrio|distrito)\b/i.test(poi)) {
          reference = poi;
        }
      }
    }
    
    setSuperficieM2(calculatedArea.toString());
    setCercania(reference);

    // 5. Catastro Data
    let catastroSuccess = false;
    
    if (catData && (catData as any)._tag === "Success") {
      const catastro = (catData as any).value;
      if (catastro.designacionCatastral) setDesignacionCatastral(catastro.designacionCatastral);
      if (catastro.matricula) setMatricula(catastro.matricula);
      if (catastro.superficieM2) setSuperficieM2(catastro.superficieM2);
      if (catastro.propietario) setPropietario(catastro.propietario);
      if (catastro.cedulaRncPropietario) setCedulaRncPropietario(catastro.cedulaRncPropietario);
      if (catastro.ipi) setIpi(catastro.ipi);
      if (catastro.estatusIpi) setEstatusIpi(catastro.estatusIpi);
      catastroSuccess = true;
    } else if (catData && (catData as any).designacionCatastral) {
      const catastro = catData as any;
      if (catastro.designacionCatastral) setDesignacionCatastral(catastro.designacionCatastral);
      if (catastro.matricula) setMatricula(catastro.matricula);
      if (catastro.superficieM2) setSuperficieM2(catastro.superficieM2);
      if (catastro.propietario) setPropietario(catastro.propietario);
      catastroSuccess = true;
    }

    if (!catastroSuccess) {
      const randomParcel = Math.floor(Math.random() * 500) + 1;
      const matchedProv = provinciasRef.current.find(p => p.nombre === closestProvName);
      const prefix = matchedProv ? matchedProv.dcPrefix : "DC-01";
      setDesignacionCatastral(`Parc. ${randomParcel}, ${prefix}`);
    }

    // 6. Update Marker
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }
  }, []);

  const handleSearchCoordinates = useCallback(async () => {
    const map = leafletMapRef.current;
    if (!map || !mapSearchText.trim()) return;

    const match = mapSearchText.match(/([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      await processLocation(lat, lng, map);
    }
  }, [mapSearchText, processLocation]);

  const [invalidLocationModalOpen, setInvalidLocationModalOpen] = useState(false);
  const polygonRef = useRef<L.Polygon | null>(null);

  // Helper for simple area calculation (meters)
  const calculatePolygonArea = (coordinates: [number, number][]): number => {
    if (coordinates.length < 3) return 0;
    let area = 0;
    let sumLat = 0;
    for(let i=0; i<coordinates.length; i++) sumLat += coordinates[i][1];
    const avgLat = sumLat / coordinates.length;
    const metersPerDegLat = 111320;
    const metersPerDegLon = 111320 * Math.cos(avgLat * Math.PI / 180);

    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      const x1 = coordinates[i][0] * metersPerDegLon;
      const y1 = coordinates[i][1] * metersPerDegLat;
      const x2 = coordinates[j][0] * metersPerDegLon;
      const y2 = coordinates[j][1] * metersPerDegLat;
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area / 2);
  };

  // Helper for point in polygon check
  const isPointInPolygon = (point: [number, number], vs: [number, number][]) => {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 1) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Helper to find shortest distance from point to LineString segment (in meters)
  const pointToSegmentDistance = (px: number, py: number, ax: number, ay: number, bx: number, by: number): number => {
    const l2 = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
    if (l2 === 0) return Math.sqrt((px - ax) * (px - ax) + (py - ay) * (py - ay));
    let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projx = ax + t * (bx - ax);
    const projy = ay + t * (by - ay);
    return Math.sqrt((px - projx) * (px - projx) + (py - projy) * (py - projy));
  };

  const getDistanceToLineString = (point: [number, number], lineCoords: [number, number][]): number => {
    let minDistance = Infinity;
    const degToMetersLat = 111320;
    const degToMetersLon = 111320 * Math.cos(point[1] * Math.PI / 180);
    const pX = point[0] * degToMetersLon;
    const pY = point[1] * degToMetersLat;

    for (let i = 0; i < lineCoords.length - 1; i++) {
      const aX = lineCoords[i][0] * degToMetersLon;
      const aY = lineCoords[i][1] * degToMetersLat;
      const bX = lineCoords[i+1][0] * degToMetersLon;
      const bY = lineCoords[i+1][1] * degToMetersLat;
      const dist = pointToSegmentDistance(pX, pY, aX, aY, bX, bY);
      if (dist < minDistance) minDistance = dist;
    }
    return minDistance;
  };

  // always has the current province without needing to re-register
  const ubicacionTextoRef = useRef(ubicacionTexto);
  useEffect(() => { ubicacionTextoRef.current = ubicacionTexto; }, [ubicacionTexto]);
  const skipFlyToRef = useRef(false);

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
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      await processLocation(lat, lng, map);
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
    if (skipFlyToRef.current) {
      skipFlyToRef.current = false;
      return;
    }
    const map = leafletMapRef.current;
    if (!map || !ubicacionTexto) return;

    const prov = provinciasRef.current.find(p => p.nombre === ubicacionTexto);
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

    const prov = provinciasRef.current.find(p => p.nombre === ubicacionTextoRef.current);
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
  const handleSubmit = async (e?: React.FormEvent | boolean) => {
    const forceSubmit = typeof e === "boolean" ? e : false;
    const formEvent = typeof e === "object" ? e as React.FormEvent : undefined;
    if (formEvent) formEvent.preventDefault();
    if (isSubmitting) return;
    const missingFields: string[] = [];
    if (!nombre.trim()) missingFields.push("Nombre del proyecto");
    if (!ubicacionTexto.trim()) missingFields.push("Ubicación (Provincia)");
    if (!datosDesarrollador.trim()) missingFields.push("Desarrollador/Constructora");

    if (missingFields.length > 0) {
      setNombreTouched(true);
      setUbicacionTouched(true);
      setDesarrolladorTouched(true);
      setError(`Por favor complete los campos obligatorios: ${missingFields.join(", ")}`);
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
          cercania: cercania || undefined,
          valorEstimado: valorEstimado === "" ? undefined : Number(valorEstimado),
          categoriaId,
          datosDesarrollador: datosDesarrollador || undefined,
          rncDesarrollador: rncDesarrollador || undefined,
          designacionCatastral: designacionCatastral || undefined,
          matricula: matricula || undefined,
          superficieM2: superficieM2 === "" ? undefined : Number(superficieM2),
          propietario: propietario || undefined,
          cedulaRncPropietario: cedulaRncPropietario || undefined,
          ipi: ipi || undefined,
          estatusIpi: estatusIpi || undefined,
          imagenUrl: imagenUrl || undefined,
          imagenAdicional1: imagenAdicional1 || undefined,
          imagenAdicional2: imagenAdicional2 || undefined,
          imagenAdicional3: imagenAdicional3 || undefined,
          imagenAdicional4: imagenAdicional4 || undefined,
          imagenAdicional5: imagenAdicional5 || undefined,
          force: forceSubmit
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateProyectoDto = {
          nombre,
          ubicacionTexto,
          usuarioCreadorId: user?.id ?? "00000000-0000-0000-0000-000000000000",
          categoriaId,
          datosDesarrollador: datosDesarrollador || undefined,
          rncDesarrollador: rncDesarrollador || undefined,
          designacionCatastral: designacionCatastral || undefined,
          ubicacionGps: ubicacionGps || undefined,
          cercania: cercania || undefined,
          matricula: matricula || undefined,
          superficieM2: superficieM2 === "" ? undefined : Number(superficieM2),
          propietario: propietario || undefined,
          cedulaRncPropietario: cedulaRncPropietario || undefined,
          ipi: ipi || undefined,
          estatusIpi: estatusIpi || undefined,
          imagenUrl: imagenUrl || undefined,
          imagenAdicional1: imagenAdicional1 || undefined,
          imagenAdicional2: imagenAdicional2 || undefined,
          imagenAdicional3: imagenAdicional3 || undefined,
          imagenAdicional4: imagenAdicional4 || undefined,
          imagenAdicional5: imagenAdicional5 || undefined,
          force: forceSubmit
        };
        await onSubmit(createData);
      }
    } catch (err: any) {
      let errorMessage = err.message || "Error al guardar el proyecto";
      
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
          if (err.response.data.errors) {
            const errors = Object.values(err.response.data.errors).flat();
            if (errors.length > 0) {
              errorMessage += ": " + errors.join(", ");
            }
          }
        } else if (err.response.data.message) {
           errorMessage = err.response.data.message;
        }
      }

      if (errorMessage.includes("DUPLICATE_LOCATION")) {
        setDuplicateError("No se puede porque ya hay un proyecto en esa locación");
        setDuplicateWarningOpen(true);
      } else {
        setError(errorMessage);
        addToast(errorMessage, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSaveDisabled = isSubmitting || isUploadingPhotos;

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
    duplicateWarningOpen,
    setDuplicateWarningOpen,
    invalidLocationModalOpen,
    setInvalidLocationModalOpen,
    mapSearchText,
    setMapSearchText,
    handleSearchCoordinates,
    // Grouped field props
    basicFields: {
      provincias: provincias,
      nombre, setNombre, nombreTouched, setNombreTouched,
      ubicacionTexto, setUbicacionTexto, ubicacionTouched, setUbicacionTouched,
      setUbicacionGps, setDesignacionCatastral,
      categoriaId, setCategoriaId, categorias,
      rncDesarrollador, setRncDesarrollador, rncError, setRncError,
      isSearchingRnc, handleRncSearch,
      datosDesarrollador, setDatosDesarrollador,
      desarrolladorTouched, setDesarrolladorTouched,
      duplicateError,
    } as const,
    detailsFields: {
      ubicacionGps, designacionCatastral,
      matricula, setMatricula,
      valorEstimado, setValorEstimado,
      superficieM2, setSuperficieM2,
      duplicateError,
      cercania, setCercania,
    } as const,
    documentSection: {
      portraitUrl: imagenUrl,
      handlePortraitChange, removePortrait, portraitInputRef,
      galleryUrls: [imagenAdicional1, imagenAdicional2, imagenAdicional3, imagenAdicional4, imagenAdicional5].filter(Boolean),
      handleGalleryChange, removeGalleryPhoto,
      galleryInputRef, fotosError,
    } as const,
  };
}
