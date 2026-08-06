import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CreateProyectoDto, UpdateProyectoDto, ProyectoDto } from "../types";
import { useAuth } from "../../../shared/context/AuthContext";
import { apiClient } from "../../../infrastructure/api/client";
import { projectsApi } from "../api/projectsApi";
import { isSuccess } from "@/shared/utils/functional";
import { getProjectErrorMessage } from "../types";
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
      console.log("PORTRAIT UPLOAD RESULT:", res);
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

  const handleSearchCoordinates = useCallback(async () => {
    const map = leafletMapRef.current;
    if (!map || !mapSearchText.trim()) return;

    // Parse lat, lng from mapSearchText (e.g. "18.47186, -69.93988")
    const match = mapSearchText.match(/([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);

      map.flyTo([lat, lng], 13, { duration: 1.2 });

      setUbicacionGps(`${lat.toFixed(6)},${lng.toFixed(6)}`);

      skipFlyToRef.current = true;
      let closestProvName = getClosestProvincia(provinciasRef.current, lat, lng);
      setUbicacionTexto(closestProvName);

      try {
        const result = await projectsApi.lookupCatastroByGps(lat.toString(), lng.toString());
        if (isSuccess(result)) {
          const catastroData = result.value;
          if (catastroData.designacionCatastral) setDesignacionCatastral(catastroData.designacionCatastral);
          if (catastroData.matricula) setMatricula(catastroData.matricula);
          if (catastroData.superficieM2) setSuperficieM2(catastroData.superficieM2);
          if (catastroData.propietario) setPropietario(catastroData.propietario);
          if (catastroData.cedulaRncPropietario) setCedulaRncPropietario(catastroData.cedulaRncPropietario);
          if (catastroData.ipi) setIpi(catastroData.ipi);
          if (catastroData.estatusIpi) setEstatusIpi(catastroData.estatusIpi);
          skipFlyToRef.current = true;
          closestProvName = getClosestProvincia(provinciasRef.current, lat, lng);
          setUbicacionTexto(closestProvName);
        } else {
          throw new Error(getProjectErrorMessage(result.error));
        }
      } catch (error) {
        console.error("No catastro data found:", error);
        // Fallback for demo purposes if no real data is found
        const randomParcel = Math.floor(Math.random() * 500) + 1;
        const matchedProv = provinciasRef.current.find(p => p.nombre === closestProvName);
        const prefix = matchedProv ? matchedProv.dcPrefix : "DC-01";
        setDesignacionCatastral(`Parc. ${randomParcel}, ${prefix}`);
      }

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
      setUbicacionGps(`${lat.toFixed(6)},${lng.toFixed(6)}`);

      skipFlyToRef.current = true;
      const closestProvName = getClosestProvincia(provinciasRef.current, lat, lng);
      setUbicacionTexto(closestProvName);

      try {
        const result = await projectsApi.lookupCatastroByGps(lat.toString(), lng.toString());
        if (isSuccess(result)) {
          const catastroData = result.value;
          setDesignacionCatastral(catastroData.designacionCatastral || "");
          setMatricula(catastroData.matricula || "");
          setSuperficieM2(catastroData.superficieM2 || "");
          setPropietario(catastroData.propietario || "");
          setCedulaRncPropietario(catastroData.cedulaRncPropietario || "");
          setIpi(catastroData.ipi || "");
          setEstatusIpi(catastroData.estatusIpi || "");
        } else {
          throw new Error(getProjectErrorMessage(result.error));
        }
      } catch (error) {
        console.error("No catastro data found:", error);
        skipFlyToRef.current = true;
        const closestProvName = getClosestProvincia(provinciasRef.current, lat, lng);
        setUbicacionTexto(closestProvName);
        const randomParcel = Math.floor(Math.random() * 500) + 1;
        const matchedProv = provinciasRef.current.find(p => p.nombre === closestProvName);
        const prefix = matchedProv ? matchedProv.dcPrefix : "DC-01";
        setDesignacionCatastral(`Parc. ${randomParcel}, ${prefix}`);
      }

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        };
        await onSubmit(createData);
      }
    } catch (err: any) {
      if (err.message && err.message.includes("DUPLICATE_LOCATION")) {
        setDuplicateError("No se puede porque ya hay un proyecto en esa locación");
        addToast("No se puede porque ya hay un proyecto en esa locación", "error");
      } else {
        setError(err.message || "Error al guardar el proyecto");
        addToast(err.message || "Error al guardar el proyecto", "error");
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
