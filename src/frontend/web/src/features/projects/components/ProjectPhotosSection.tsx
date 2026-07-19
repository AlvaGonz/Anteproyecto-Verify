import React, { useState, useEffect, useRef } from "react";
import { Star, X, Upload, Images, Camera, ImagePlus, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useProject } from "../api/useProjects";
import { useUpdateProject } from "../api/useProjectMutations";
import { projectsApi } from "../api/projectsApi";
import { isSuccess } from "@/shared/utils/functional";
import type { ProyectoDto, UpdateProyectoDto } from "../types";
import { getProjectErrorMessage } from "../types";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_GALLERY_PHOTOS = 5;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const validateFile = (file: File): string | null => {
  if (!file.type.startsWith("image/")) return "Solo se permiten imágenes (JPEG, PNG, WebP).";
  if (file.size > MAX_SIZE_BYTES) return `${file.name} supera 5MB.`;
  return null;
};

const mapToUpdateDto = (project: ProyectoDto): UpdateProyectoDto => ({
  nombre: project.nombre,
  ubicacionTexto: project.ubicacionTexto,
  ubicacionGps: project.ubicacionGps,
  valorEstimado: project.valorEstimado,
  categoria: project.categoria,
  datosDesarrollador: project.datosDesarrollador,
  rncDesarrollador: project.rncDesarrollador,
  designacionCatastral: project.designacionCatastral,
  matricula: project.matricula,
  propietario: project.propietario,
  cedulaRncPropietario: project.cedulaRncPropietario,
  ipi: project.ipi,
  estatusIpi: project.estatusIpi,
  superficieM2: project.superficieM2,
  imagenUrl: project.imagenUrl,
  imagenAdicional1: project.imagenAdicional1,
  imagenAdicional2: project.imagenAdicional2,
  imagenAdicional3: project.imagenAdicional3,
  imagenAdicional4: project.imagenAdicional4,
  imagenAdicional5: project.imagenAdicional5,
});

interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
  role: "portrait" | "gallery";
}

export const ProjectPhotosSection: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: project, isLoading } = useProject(projectId);
  const { mutateAsync: updateProjectAsync, isPending: isUpdating } = useUpdateProject(projectId);

  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const portraitInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [pendingPhotos]);

  if (isLoading || !project) {
    return (
      <div className="animate-pulse bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="h-6 w-1/3 bg-gray-200 rounded-lg mb-6"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 aspect-[4/3] bg-gray-100 rounded-3xl"></div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  const currentPortrait = project.imagenUrl;
  const currentGallery = [
    project.imagenAdicional1,
    project.imagenAdicional2,
    project.imagenAdicional3,
    project.imagenAdicional4,
    project.imagenAdicional5,
  ].filter(Boolean) as string[];

  const pendingPortrait = pendingPhotos.filter((p) => p.role === "portrait");
  const pendingGallery = pendingPhotos.filter((p) => p.role === "gallery");
  const totalGalleryCount = currentGallery.length + pendingGallery.length;

  const handleFileSelect = (files: FileList | null, role: "portrait" | "gallery") => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setSuccessMessage(null);

    const newPending: PendingPhoto[] = [];
    
    Array.from(files).forEach((file) => {
      if (role === "gallery" && totalGalleryCount + newPending.length >= MAX_GALLERY_PHOTOS) {
        setUploadError(`Solo se permiten hasta ${MAX_GALLERY_PHOTOS} fotos adicionales.`);
        return;
      }
      if (role === "portrait" && newPending.some(p => p.role === "portrait")) {
        return;
      }
      const err = validateFile(file);
      if (err) { setUploadError(err); return; }
      newPending.push({ 
        id: Math.random().toString(36).substring(7),
        file, 
        previewUrl: URL.createObjectURL(file), 
        role 
      });
    });

    if (newPending.length === 0) return;

    setPendingPhotos((prev) => {
      if (role === "portrait") {
        const withoutOldPortrait = prev.filter(p => p.role !== "portrait");
        const oldPortrait = prev.find(p => p.role === "portrait");
        if (oldPortrait) URL.revokeObjectURL(oldPortrait.previewUrl);
        return [...withoutOldPortrait, ...newPending];
      }
      return [...prev, ...newPending];
    });
  };

  const removePending = (id: string) => {
    setPendingPhotos((prev) => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const removeExistingGalleryImage = async (urlToRemove: string) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      
      const newGallery = currentGallery.filter(url => url !== urlToRemove);
      const updatedDto = mapToUpdateDto(project);
      updatedDto.imagenAdicional1 = newGallery[0] || undefined;
      updatedDto.imagenAdicional2 = newGallery[1] || undefined;
      updatedDto.imagenAdicional3 = newGallery[2] || undefined;
      updatedDto.imagenAdicional4 = newGallery[3] || undefined;
      updatedDto.imagenAdicional5 = newGallery[4] || undefined;

      await updateProjectAsync(updatedDto);
      setSuccessMessage("Foto eliminada correctamente.");
    } catch (err: any) {
      setUploadError("Error al eliminar la foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadAll = async () => {
    if (pendingPhotos.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    const ordered = [
      ...pendingPhotos.filter((p) => p.role === "portrait"),
      ...pendingPhotos.filter((p) => p.role === "gallery"),
    ];

    try {
      const uploadedUrls = await Promise.all(
        ordered.map(async ({ file, role }) => {
          const result = await projectsApi.uploadProjectImage(file);
          if (!isSuccess(result)) throw new Error(getProjectErrorMessage(result.error));
          return { url: result.value, role };
        })
      );

      const updateDto = mapToUpdateDto(project);

      const newPortrait = uploadedUrls.find(u => u.role === "portrait");
      if (newPortrait) {
        updateDto.imagenUrl = newPortrait.url;
      }

      const newGalleryUrls = uploadedUrls.filter(u => u.role === "gallery").map(u => u.url);
      if (newGalleryUrls.length > 0) {
        // Keep unique URLs to prevent duplicates
        const combinedGallery = Array.from(new Set([...currentGallery, ...newGalleryUrls])).slice(0, MAX_GALLERY_PHOTOS);
        updateDto.imagenAdicional1 = combinedGallery[0] || undefined;
        updateDto.imagenAdicional2 = combinedGallery[1] || undefined;
        updateDto.imagenAdicional3 = combinedGallery[2] || undefined;
        updateDto.imagenAdicional4 = combinedGallery[3] || undefined;
        updateDto.imagenAdicional5 = combinedGallery[4] || undefined;
      }

      await updateProjectAsync(updateDto);

      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPendingPhotos([]);
      setSuccessMessage("Las fotos se guardaron exitosamente.");
    } catch (err: any) {
      setUploadError(err.message || "Ocurrió un error al subir las fotos. Intenta nuevamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Images className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-black text-secondary tracking-tight uppercase italic">
              Fotos del Proyecto
            </h2>
          </div>
          <p className="text-gray-500 font-medium ml-13">Destaca las mejores vistas de tu activo para el mercado.</p>
        </div>
      </div>

      {/* ALERTS */}
      <div className="space-y-3 mb-8">
        {uploadError && (
          <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{uploadError}</p>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* PORTRAIT */}
        <div className="w-full lg:w-[35%] space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-bold text-gray-800 tracking-tight">Foto Principal (Portada)</h3>
          </div>
          
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden group bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary/50 transition-all duration-300 shadow-inner">
            {(pendingPortrait.length > 0 || currentPortrait) ? (
              <>
                <img
                  src={pendingPortrait.length > 0 ? pendingPortrait[0].previewUrl : currentPortrait!}
                  alt="Portada"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button
                    type="button"
                    onClick={() => portraitInputRef.current?.click()}
                    className="px-6 py-2.5 bg-white text-secondary font-bold text-sm rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Reemplazar
                  </button>
                  {pendingPortrait.length > 0 && (
                    <button
                      type="button"
                      onClick={() => removePending(pendingPortrait[0].id)}
                      className="w-10 h-10 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:scale-105 flex items-center justify-center transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => portraitInputRef.current?.click()}
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-primary transition-colors focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold">Subir Portada</span>
              </button>
            )}
          </div>
          <p className="text-xs font-medium text-gray-400 text-center px-4">
            Esta imagen representa al proyecto en todos los listados públicos.
          </p>
        </div>

        {/* GALLERY */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-800 tracking-tight">Galería Adicional</h3>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-xs font-bold text-gray-700">{totalGalleryCount}</span>
              <span className="text-xs font-medium text-gray-400">de</span>
              <span className="text-xs font-bold text-gray-700">{MAX_GALLERY_PHOTOS}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* CURRENT GALLERY */}
            {currentGallery.map((url, idx) => (
              <div key={`existing-${idx}`} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-sm">
                <img src={url} alt={`Extra ${idx + 1}`} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    type="button"
                    onClick={() => removeExistingGalleryImage(url)}
                    disabled={isUploading || isUpdating}
                    className="w-8 h-8 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* PENDING GALLERY */}
            {pendingGallery.map((p) => (
              <div key={p.id} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-sm border-2 border-primary border-dashed p-1">
                <div className="w-full h-full rounded-[1.2rem] overflow-hidden relative">
                  <img src={p.previewUrl} alt="Pendiente" className="w-full h-full object-cover object-center opacity-70" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => removePending(p.id)}
                      className="w-8 h-8 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:scale-105 flex items-center justify-center transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md whitespace-nowrap">
                  Por guardar
                </div>
              </div>
            ))}

            {/* ADD BUTTON */}
            {totalGalleryCount < MAX_GALLERY_PHOTOS && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="aspect-square rounded-[1.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-primary/[0.02] transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-white group-hover:shadow-md flex items-center justify-center transition-all duration-300">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Agregar Foto</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      {pendingPhotos.length > 0 && (
        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Cambios pendientes</p>
              <p className="text-sm text-gray-500">Tienes {pendingPhotos.length} imagen(es) lista(s) para guardar en el servidor.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUploadAll}
            disabled={isUploading || isUpdating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-primary text-white text-sm font-black tracking-widest uppercase rounded-2xl shadow-[0_10px_30px_-10px_rgba(249,133,19,0.5)] hover:shadow-[0_10px_30px_-5px_rgba(249,133,19,0.6)] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {(isUploading || isUpdating) ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                PROCESANDO...
              </>
            ) : (
              "GUARDAR CAMBIOS"
            )}
          </button>
        </div>
      )}

      {/* HIDDEN INPUTS */}
      <input
        type="file"
        ref={portraitInputRef}
        onChange={(e) => {
          handleFileSelect(e.target.files, "portrait");
          if (portraitInputRef.current) portraitInputRef.current.value = "";
        }}
        accept={IMAGE_EXTENSIONS.map(e => `.${e}`).join(",")}
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        onChange={(e) => {
          handleFileSelect(e.target.files, "gallery");
          if (galleryInputRef.current) galleryInputRef.current.value = "";
        }}
        accept={IMAGE_EXTENSIONS.map(e => `.${e}`).join(",")}
        multiple
        className="hidden"
      />
    </div>
  );
};
