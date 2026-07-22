import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
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
  X,
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
  }  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => navigate("/admin/projects?tab=publicados")}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors mb-4 uppercase tracking-widest"
      >
        <ChevronLeft size={14} />
        Volver a proyectos
      </button>

      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-100 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">
            {project.nombre}
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Expediente #{project.id.substring(0, 8).toUpperCase()} · Publicado
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-left md:text-right">
          <span className="text-2xl font-black text-slate-900">
            {project.valorEstimado
              ? `RD$ ${project.valorEstimado.toLocaleString()}`
              : "Valor no especificado"}
          </span>
        </div>
      </div>

      {/* 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: IMAGES (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          {uniqueImgs.length > 0 ? (
            <div className="flex flex-col gap-4 items-center w-full">
              {/* Main Image (100% width) */}
              <div 
                className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden rounded border border-slate-200 shadow-sm cursor-pointer group"
                onClick={() => {
                  setSelectedImageIndex(0);
                  setIsLightboxOpen(true);
                }}
              >
                <img
                  src={uniqueImgs[0]}
                  alt={`${project.nombre} - Foto principal`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Stacked Vertical Thumbnails (Smaller & Centered) */}
              {uniqueImgs.length > 1 && (
                <div className="w-[55%] flex flex-col gap-3">
                  {uniqueImgs.slice(1).map((url, i) => (
                    <button
                      key={i + 1}
                      type="button"
                      onClick={() => {
                        setSelectedImageIndex(i + 1);
                        setIsLightboxOpen(true);
                      }}
                      className="w-full aspect-[4/3] overflow-hidden bg-slate-100 rounded border border-slate-200 hover:opacity-80 transition-all shadow-sm"
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
            <div className="w-full aspect-[4/3] bg-slate-50 flex items-center justify-center text-slate-300 flex-col gap-3 border border-slate-100">
              <Camera size={40} />
              <span className="text-[11px] font-black uppercase tracking-widest">Sin imágenes</span>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: DETAILS (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Top Info block (Transmision, Traccion style) */}
          <div className="pb-6 border-b border-slate-100">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">Estado: <span className="font-bold">{project.estado === 1 ? "Activo" : "Inactivo"}</span></p>
                <p className="text-sm font-semibold text-slate-700">Clasificación: <span className="font-bold">{project.categoria === 1 ? "Construcción" : project.categoria === 2 ? "Comercio" : project.categoria === 3 ? "Turismo" : "N/D"}</span></p>
                <p className="text-sm font-semibold text-slate-700">Integridad: <span className="font-bold">{getIntegrityLabel()}</span></p>
                <p className="text-sm font-semibold text-slate-700">Ubicación: <span className="font-bold">{project.ubicacionTexto || "N/D"}</span></p>
              </div>
              <button 
                type="button"
                className="bg-primary text-white text-xs font-bold px-4 py-2 rounded shadow-sm hover:bg-primary/90 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>

          {/* "Cuotas desde" / Integrity Block */}
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-500">Score de Validación</p>
              <p className="text-lg font-black text-secondary">
                <span className="border-b-2 border-emerald-500 pb-0.5">
                  {project.integrityScore !== undefined ? `${project.integrityScore}% Completado` : "Pendiente"}
                </span>
              </p>
            </div>
            <button 
              type="button"
              className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded shadow-sm hover:bg-emerald-700 transition-colors"
            >
              ¡Verificar!
            </button>
          </div>

          {/* Datos Generales Table */}
          <div>
            <h3 className="text-primary font-bold text-sm mb-3">Datos Generales</h3>
            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 text-sm">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-700 w-1/2">Desarrollador:</span>
                  <span className="text-slate-600 w-1/2 truncate">{project.datosDesarrollador || "N/D"}</span>
                </div>
                <div className="flex border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-700 w-1/2">RNC/Cédula:</span>
                  <span className="text-slate-600 w-1/2 truncate">{project.rncDesarrollador || project.cedulaRncPropietario || "N/D"}</span>
                </div>
                <div className="flex border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-700 w-1/2">Categoría:</span>
                  <span className="text-slate-600 w-1/2 truncate">{project.categoria === 1 ? "Construcción" : project.categoria === 2 ? "Comercio" : "Turismo"}</span>
                </div>
                <div className="flex border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-700 w-1/2">Estado:</span>
                  <span className="text-slate-600 w-1/2">{project.estado === 1 ? "Activo" : "Inactivo"}</span>
                </div>
                <div className="flex border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-700 w-1/2">Integridad:</span>
                  <span className="text-slate-600 w-1/2">{getIntegrityLabel()}</span>
                </div>
                <div className="flex border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-700 w-1/2">Ubicación:</span>
                  <span className="text-slate-600 w-1/2 truncate">{project.ubicacionTexto || "N/D"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <h3 className="text-primary font-bold text-sm mb-3">Observaciones</h3>
            <div className="text-sm text-slate-600 space-y-4">
              <p className="font-bold">¿Por qué verificar este proyecto en VeriFinca?</p>
              <p>
                • ESTADO DE INTEGRIDAD | {getIntegrityLabel().toUpperCase()}
                <br/>
                La evaluación de integridad de este proyecto permite a los inversionistas conocer el estatus legal y registral del inmueble.
              </p>
              <p>
                • SEGURIDAD FINANCIERA
                <br/>
                Consulta los reportes asociados y documentos legales en nuestra plataforma para obtener las mejores garantías antes de invertir.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PUBLISHER & MAP (3 cols) */}
        <div className="lg:col-span-3">
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-secondary mb-4 border-b border-slate-200 pb-2">
              Publicado por
            </h2>

            {/* Seller Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-primary text-sm leading-tight">
                  {project.registradoPor?.nombreCompleto || "Usuario Desconocido"}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Responsable Registral
                </p>
              </div>
              <div className="w-16 h-16 bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                {project.registradoPor?.avatarUrl ? (
                  <img src={project.registradoPor.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={24} className="text-slate-300" />
                )}
              </div>
            </div>

            {/* Seller Details List */}
            <ul className="space-y-2 mb-6 text-[11px] text-slate-700">
              <li className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                <span className="font-bold min-w-[60px]">RNC/Cédula:</span> 
                <span className="break-all">{project.cedulaRncPropietario || project.rncDesarrollador || "N/D"}</span>
              </li>
              <li className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                <span className="font-bold min-w-[60px]">R. Social:</span> 
                <span>{project.registradoPor?.razonSocial || project.datosDesarrollador || "N/D"}</span>
              </li>
              <li className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                <span className="font-bold min-w-[60px]">Tel:</span> 
                <a href={project.registradoPor?.telefono ? `tel:${project.registradoPor.telefono.replace(/\s+/g, '')}` : undefined} className="text-primary hover:underline">
                  {project.registradoPor?.telefono || "N/D"}
                </a>
              </li>
              <li className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                <span className="font-bold min-w-[60px]">Email:</span> 
                <a href={project.registradoPor?.email ? `mailto:${project.registradoPor.email}` : undefined} className="text-primary hover:underline break-all">
                  {project.registradoPor?.email || "N/D"}
                </a>
              </li>
              <li className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-sm bg-primary mt-1.5 shrink-0" />
                <span className="font-bold min-w-[60px]">Ubicación:</span> 
                <span>{project.ubicacionTexto || "N/D"}</span>
              </li>
            </ul>

            {/* WhatsApp badges */}
            {project.registradoPor?.telefono && (
              <div className="space-y-2 mb-6">
                <a href={`https://wa.me/${project.registradoPor.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Phone size={10} />
                  </div>
                  WhatsApp: {project.registradoPor.telefono}
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 mb-6">
              <button 
                type="button" 
                onClick={() => setIsInterested(!isInterested)}
                className={`w-full py-2.5 rounded text-sm font-bold transition-colors ${
                  isInterested ? "bg-emerald-600 text-white" : "bg-[#E63946] text-white hover:bg-red-700"
                }`}
              >
                {isInterested ? "Interés Registrado" : "Contactar Responsable"}
              </button>
              <button type="button" className="w-full bg-[#E63946] hover:bg-red-700 text-white py-2.5 rounded text-sm font-bold transition-colors">
                Solicitar Validación
              </button>
              <button type="button" className="w-full bg-[#E63946] hover:bg-red-700 text-white py-2.5 rounded text-sm font-bold transition-colors">
                Ver Documentos
              </button>
            </div>

            {/* Map */}
            <div className="w-full h-48 border border-slate-300 rounded overflow-hidden bg-slate-100">
              {gpsLat !== null && gpsLng !== null ? (
                <MiniMap lat={gpsLat} lng={gpsLng} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <MapIcon size={24} className="mb-2" />
                  <span className="text-[10px] font-bold uppercase">Sin coordenadas</span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Lightbox Modal via Portal */}
      {isLightboxOpen && uniqueImgs.length > 0 && createPortal(
        <div className="fixed inset-0 z-[999999] flex flex-col bg-[#1a1a1a]">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 bg-primary text-white p-2 hover:opacity-80 transition-opacity"
          >
            <X size={24} />
          </button>

          {/* Main Content Area */}
          <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
            {/* Prev Button */}
            {uniqueImgs.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : uniqueImgs.length - 1))}
                className="absolute left-4 z-50 bg-primary text-white p-3 hover:opacity-80 transition-opacity"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Image */}
            <img
              src={uniqueImgs[selectedImageIndex]}
              alt={`${project.nombre} - Foto ampliada`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Next Button */}
            {uniqueImgs.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedImageIndex((prev) => (prev < uniqueImgs.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 z-50 bg-primary text-white p-3 hover:opacity-80 transition-opacity"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {uniqueImgs.length > 1 && (
            <div className="h-28 bg-[#111111] p-4 flex gap-3 overflow-x-auto justify-center items-center shrink-0">
              {uniqueImgs.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative h-full aspect-[4/3] shrink-0 overflow-hidden transition-all ${
                    i === selectedImageIndex ? "border-2 border-primary scale-105" : "opacity-50 hover:opacity-100 border border-slate-700"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
