import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  ChevronLeft,
  DollarSign,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapIcon,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Camera,
  AlertCircle,
} from "lucide-react";
import { useProject } from "../../features/projects/api/useProjects";
import { IntegrityStatus } from "../../features/projects/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MiniMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lng]).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng]);

  return <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />;
};

export const PublishedProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id || "");

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInterested, setIsInterested] = useState(false);

  // Gather all available images
  const allImgs = [
    project?.imagenUrl,
    project?.imagenAdicional1,
    project?.imagenAdicional2,
    project?.imagenAdicional3,
    project?.imagenAdicional4,
    project?.imagenAdicional5,
    ...(project?.fotoUrls || []),
  ].filter(Boolean) as string[];

  const uniqueImgs = Array.from(new Set(allImgs));

  // Parse GPS coordinates
  let gpsLat: number | null = null;
  let gpsLng: number | null = null;
  if (project?.ubicacionGps) {
    const parts = project.ubicacionGps.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      gpsLat = parts[0];
      gpsLng = parts[1];
    }
  }

  const getIntegrityLabel = () => {
    if (!project) return "—";
    switch (project.estadoIntegridad) {
      case IntegrityStatus.Verified: return "Verificado";
      case IntegrityStatus.Failed: return "Falló";
      default: return "Pendiente";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Cargando proyecto...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          No se pudo cargar el proyecto
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          {error instanceof Error ? error.message : "Proyecto no encontrado"}
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin/projects?tab=publicados")}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors"
        >
          Volver a proyectos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <button
        type="button"
        onClick={() => navigate("/admin/projects?tab=publicados")}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors mb-6 uppercase tracking-widest"
      >
        <ChevronLeft size={14} />
        Volver a proyectos
      </button>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {project.nombre}
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Publicado · {project.ubicacionTexto}
        </p>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN (5 cols) — Image Gallery */}
        <div className="xl:col-span-5">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl p-5 border border-blue-200/60 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Camera size={16} />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                Galería del proyecto
              </span>
            </div>

            {uniqueImgs.length > 0 ? (
              <div className="space-y-3">
                {/* Main image */}
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-white shadow-inner">
                  <img
                    src={uniqueImgs[selectedImageIndex]}
                    alt={`${project.nombre} - Foto ${selectedImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Thumbnails */}
                {uniqueImgs.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {uniqueImgs.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedImageIndex(i)}
                        className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          i === selectedImageIndex
                            ? "border-blue-600 ring-2 ring-blue-200"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[16/10] rounded-2xl bg-white/60 flex items-center justify-center text-slate-400 flex-col gap-2">
                <Camera size={32} />
                <span className="text-xs font-bold">Sin imágenes</span>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN (4 cols) — Project Data */}
        <div className="xl:col-span-4">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-3xl p-5 border border-emerald-200/60 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Building2 size={16} />
              </div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Datos del proyecto
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {/* Location */}
              <div className="bg-white/70 rounded-2xl p-4 border border-emerald-100/50">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <MapPin size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
                    Ubicación
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {project.ubicacionTexto || "No especificada"}
                </p>
                {project.ubicacionGps && (
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    {project.ubicacionGps}
                  </p>
                )}
              </div>

              {/* Sponsor / Developer */}
              <div className="bg-white/70 rounded-2xl p-4 border border-emerald-100/50">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Building2 size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
                    Desarrollador / RNC
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {project.datosDesarrollador || "—"}
                </p>
                {project.rncDesarrollador && (
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    RNC: {project.rncDesarrollador}
                  </p>
                )}
                {project.cedulaRncPropietario && (
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Cédula: {project.cedulaRncPropietario}
                  </p>
                )}
              </div>

              {/* Evaluation / Integrity */}
              <div className="bg-white/70 rounded-2xl p-4 border border-emerald-100/50">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
                    Evaluación de integridad
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      project.estadoIntegridad === IntegrityStatus.Verified
                        ? "bg-emerald-100 text-emerald-700"
                        : project.estadoIntegridad === IntegrityStatus.Failed
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {getIntegrityLabel()}
                  </div>
                  {project.integrityScore !== undefined && (
                    <span className="text-[10px] font-bold text-slate-400">
                      Score: {project.integrityScore}%
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${
                        project.estadoIntegridad === IntegrityStatus.Verified
                          ? 100
                          : project.estadoIntegridad === IntegrityStatus.Failed
                          ? 0
                          : 50
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Cost */}
              <div className="bg-white/70 rounded-2xl p-4 border border-emerald-100/50">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <DollarSign size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
                    Valor estimado
                  </span>
                </div>
                <p className="text-xl font-black text-slate-800">
                  {project.valorEstimado
                    ? `RD$ ${project.valorEstimado.toLocaleString()}`
                    : "No especificado"}
                </p>
              </div>
            </div>

            {/* "Estoy interesado" Button — always at bottom */}
            <div className="mt-5 pt-4 border-t border-emerald-200/40">
              <button
                type="button"
                onClick={() => setIsInterested(!isInterested)}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isInterested
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : "bg-slate-800 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200"
                }`}
              >
                {isInterested ? (
                  <>
                    <CheckCircle2 size={16} />
                    Interés registrado
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    Estoy interesado
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (3 cols) — Publisher Info + Map */}
        <div className="xl:col-span-3">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-3xl p-5 border border-orange-200/60 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                Publicado por
              </span>
            </div>

            {/* Publisher Avatar — Centered */}
            <div className="flex justify-center mb-5">
              {project.registradoPor?.avatarUrl ? (
                <img
                  src={project.registradoPor.avatarUrl}
                  alt={project.registradoPor.nombreCompleto}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-200 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-400 border-2 border-orange-200">
                  <User size={32} />
                </div>
              )}
            </div>

            {/* Publisher Name */}
            <p className="text-center text-sm font-black text-slate-800 mb-4">
              {project.registradoPor?.nombreCompleto || "—"}
            </p>

            {/* Publisher Details */}
            <div className="space-y-2.5 flex-1">
              {/* Email */}
              <div className="flex items-center gap-3 bg-white/70 rounded-xl px-3.5 py-2.5 border border-orange-100/50">
                <Mail size={14} className="text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">
                    Email
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 truncate block">
                    {project.registradoPor?.email || "—"}
                  </span>
                </div>
              </div>

              {/* Cédula / RNC */}
              <div className="flex items-center gap-3 bg-white/70 rounded-xl px-3.5 py-2.5 border border-orange-100/50">
                <Globe size={14} className="text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">
                    Cédula / RNC
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 truncate block">
                    {project.cedulaRncPropietario || project.rncDesarrollador || "—"}
                  </span>
                </div>
              </div>

              {/* Razón Social (DGII) */}
              <div className="flex items-center gap-3 bg-white/70 rounded-xl px-3.5 py-2.5 border border-orange-100/50">
                <Building2 size={14} className="text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">
                    Razón Social (DGII)
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 truncate block">
                    {project.registradoPor?.razonSocial || project.datosDesarrollador || "—"}
                  </span>
                </div>
              </div>

              {/* Nombre Comercial */}
              <div className="flex items-center gap-3 bg-white/70 rounded-xl px-3.5 py-2.5 border border-orange-100/50">
                <Building2 size={14} className="text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">
                    Nombre Comercial
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 truncate block">
                    {project.datosDesarrollador || "—"}
                  </span>
                </div>
              </div>

              {/* Actividad Económica */}
              <div className="flex items-center gap-3 bg-white/70 rounded-xl px-3.5 py-2.5 border border-orange-100/50">
                <Globe size={14} className="text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">
                    Actividad Económica
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 truncate block">
                    {project.categoria === 1
                      ? "Construcción / Inmobiliaria"
                      : project.categoria === 2
                      ? "Comercio"
                      : project.categoria === 3
                      ? "Turismo"
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Phone */}
              {project.registradoPor?.telefono && (
                <div className="flex items-center gap-3 bg-white/70 rounded-xl px-3.5 py-2.5 border border-orange-100/50">
                  <Phone size={14} className="text-orange-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">
                      Teléfono
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 truncate block">
                      {project.registradoPor.telefono}
                    </span>
                  </div>
                </div>
              )}

              {/* Dirección / Provincia */}
              <div className="flex items-center gap-3 bg-white/70 rounded-xl px-3.5 py-2.5 border border-orange-100/50">
                <MapPin size={14} className="text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">
                    Dirección / Provincia
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 truncate block">
                    {project.ubicacionTexto || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Leaflet Map */}
            <div className="mt-5 pt-4 border-t border-orange-200/40">
              <div className="flex items-center gap-2 mb-3">
                <MapIcon size={12} className="text-orange-500" />
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                  Ubicación en mapa
                </span>
              </div>
              <div className="h-40 rounded-xl overflow-hidden bg-orange-100/50 border border-orange-200/40">
                {gpsLat !== null && gpsLng !== null ? (
                  <MiniMap lat={gpsLat} lng={gpsLng} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-1">
                    <MapIcon size={20} />
                    <span className="text-[10px] font-bold">Sin coordenadas</span>
                  </div>
                )}
              </div>
            </div>

            {/* Integrity status badge */}
            <div className="mt-4 pt-4 border-t border-orange-200/40">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-orange-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Integridad:
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    project.estadoIntegridad === IntegrityStatus.Verified
                      ? "bg-emerald-100 text-emerald-700"
                      : project.estadoIntegridad === IntegrityStatus.Failed
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {getIntegrityLabel()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
