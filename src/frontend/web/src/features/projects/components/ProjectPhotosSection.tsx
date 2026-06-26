import React, { useState, useEffect, useRef } from "react";
import { ImagePlus, Star, X, Upload, Images } from "lucide-react";
import { useDocuments } from "../../documents/api/useDocuments";
import { useUploadDocument } from "../../documents/api/useDocumentMutations";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_PHOTOS = 10;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const isImageDoc = (nombre: string) =>
  IMAGE_EXTENSIONS.includes(nombre.split(".").pop()?.toLowerCase() ?? "");

interface PendingPhoto {
  file: File;
  previewUrl: string;
  role: "portrait" | "gallery";
}

interface ProjectPhotosSectionProps {
  projectId: string;
}

export const ProjectPhotosSection: React.FC<ProjectPhotosSectionProps> = ({ projectId }) => {
  const { data: documents = [], isLoading } = useDocuments(projectId);
  const { mutate: uploadDocument, isPending: isUploading } = useUploadDocument(projectId);

  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [pendingPhotos]);

  const existingImages = documents.filter((d) => isImageDoc(d.nombreArchivoOriginal));
  const portraitDoc = existingImages[0] ?? null;
  const galleryDocs = existingImages.slice(1);
  const totalCount = existingImages.length + pendingPhotos.length;

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "Solo se permiten imágenes.";
    if (file.size > MAX_SIZE_BYTES) return `${file.name} supera 5MB.`;
    return null;
  };

  const handleFileSelect = (files: FileList | null, role: "portrait" | "gallery") => {
    if (!files) return;
    setUploadError(null);

    const newPending: PendingPhoto[] = [];
    Array.from(files).forEach((file) => {
      if (totalCount + newPending.length >= MAX_PHOTOS) {
        setUploadError(`Máximo ${MAX_PHOTOS} fotos por proyecto.`);
        return;
      }
      const err = validateFile(file);
      if (err) { setUploadError(err); return; }
      newPending.push({
        file,
        previewUrl: URL.createObjectURL(file),
        role,
      });
    });

    if (newPending.length === 0) return;
    setPendingPhotos((prev) => [...prev, ...newPending]);
  };

  const removePending = (idx: number) => {
    setPendingPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleUploadAll = () => {
    if (pendingPhotos.length === 0) return;
    setUploadError(null);

    // Portrait first, then gallery — order determines which is [0] in docs array
    const ordered = [
      ...pendingPhotos.filter((p) => p.role === "portrait"),
      ...pendingPhotos.filter((p) => p.role === "gallery"),
    ];

    ordered.forEach(({ file }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", "Imagen");
      uploadDocument(formData, {
        onError: () => setUploadError("Error al subir una imagen. Intenta nuevamente."),
      });
    });

    // Clear previews after queuing
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingPhotos([]);
  };

  const pendingPortrait = pendingPhotos.filter((p) => p.role === "portrait");
  const pendingGallery = pendingPhotos.filter((p) => p.role === "gallery");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Images className="w-5 h-5 text-teal-600" />
          Fotos del Proyecto
        </h3>
        {totalCount > 0 && (
          <span className="text-xs text-gray-400 font-medium">{totalCount}/{MAX_PHOTOS}</span>
        )}
      </div>

      {uploadError && (
        <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {uploadError}
        </div>
      )}

      {/* === PORTADA === */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="text-sm font-semibold text-gray-700">Foto de Portada</span>
          <span className="text-xs text-gray-400">(1ra imagen — usada como thumbnail)</span>
        </div>

        <div className="flex gap-3">
          {/* Slot portada existente */}
          {portraitDoc ? (
            <div className="relative w-32 h-24 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm flex-shrink-0">
              <img
                src={portraitDoc.fileUrl}
                alt="Portada actual"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 inset-x-0 bg-amber-500/80 text-white text-[9px] font-black uppercase tracking-wider text-center py-0.5">
                Portada activa
              </div>
            </div>
          ) : null}

          {/* Preview portada pendiente (pending) */}
          {pendingPortrait.map((p, i) => (
            <div key={`pending-portrait-${i}`} className="relative w-32 h-24 rounded-xl overflow-hidden border-2 border-amber-400 border-dashed flex-shrink-0">
              <img src={p.previewUrl} alt="Portada pendiente" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-amber-400/80 text-white text-[9px] font-black uppercase tracking-wider text-center py-0.5">
                Por subir
              </div>
              <button
                type="button"
                onClick={() => removePending(pendingPhotos.indexOf(p))}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                aria-label="Quitar foto de portada"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}

          {/* Zona drop portada vacía (solo si no hay portada existente ni pendiente) */}
          {!portraitDoc && pendingPortrait.length === 0 && (
            <button
              type="button"
              onClick={() => portraitInputRef.current?.click()}
              className="w-32 h-24 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center gap-1 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Subir foto de portada"
            >
              <ImagePlus className="w-6 h-6 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Portada</span>
            </button>
          )}
        </div>

        <input
          ref={portraitInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Seleccionar foto de portada"
          onChange={(e) => {
            handleFileSelect(e.target.files, "portrait");
            e.target.value = "";
          }}
        />
      </div>

      <div className="border-t border-gray-100" />

      {/* === GALERÍA === */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-semibold text-gray-700">Fotos adicionales</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Fotos existentes (galería) */}
          {galleryDocs.map((doc) => (
            <div key={doc.id} className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={doc.fileUrl}
                alt={doc.nombreArchivoOriginal}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}

          {/* Fotos pendientes galería */}
          {pendingGallery.map((p) => {
            const realIdx = pendingPhotos.indexOf(p);
            return (
              <div key={`pending-gallery-${realIdx}`} className="relative w-24 h-20 rounded-xl overflow-hidden border-2 border-dashed border-teal-300">
                <img src={p.previewUrl} alt="Nueva foto" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-teal-500/80 text-white text-[9px] font-black text-center py-0.5 uppercase tracking-wide">
                  Por subir
                </div>
                <button
                  type="button"
                  onClick={() => removePending(realIdx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                  aria-label="Quitar foto"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            );
          })}

          {/* Botón agregar galería */}
          {totalCount < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-24 h-20 rounded-xl border-2 border-dashed border-teal-200 bg-teal-50 hover:bg-teal-100 flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              aria-label="Agregar fotos adicionales"
            >
              <ImagePlus className="w-5 h-5 text-teal-400" />
              <span className="text-[10px] font-bold text-teal-500 uppercase tracking-wide">Agregar</span>
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
          onChange={(e) => {
            handleFileSelect(e.target.files, "gallery");
            e.target.value = "";
          }}
        />
      </div>

      {/* === FOOTER UPLOAD === */}
      {pendingPhotos.length > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            {pendingPhotos.length} foto{pendingPhotos.length > 1 ? "s" : ""} lista{pendingPhotos.length > 1 ? "s" : ""} para subir
          </span>
          <button
            type="button"
            onClick={handleUploadAll}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Subiendo..." : "Subir fotos"}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex gap-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-24 h-20 rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Máximo {MAX_PHOTOS} fotos · 5 MB por imagen · JPEG, PNG, WebP
      </p>
    </div>
  );
};
