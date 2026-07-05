import React, { useState, useEffect, useRef } from "react";
import { Star, X, Upload, Images, Camera, ImagePlus } from "lucide-react";
import { useDocuments } from "../../documents/api/useDocuments";
import { useUploadDocument } from "../../documents/api/useDocumentMutations";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_PHOTOS = 10;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const isImageDoc = (nombre: string) =>
  IMAGE_EXTENSIONS.includes(nombre.split(".").pop()?.toLowerCase() ?? "");

const validateFile = (file: File): string | null => {
  if (!file.type.startsWith("image/")) return "Solo se permiten imágenes.";
  if (file.size > MAX_SIZE_BYTES) return `${file.name} supera 5MB.`;
  return null;
};

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
  const { mutateAsync: uploadDocumentAsync, isPending: isUploading } = useUploadDocument(projectId);

  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handlePortraitInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files, "portrait");
    if (portraitInputRef.current) portraitInputRef.current.value = "";
  };

  const handleGalleryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files, "gallery");
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [pendingPhotos]);

  const existingImages = documents.filter((d) => isImageDoc(d.nombreArchivoOriginal));
  const portraitDoc = existingImages[0] ?? null;
  const galleryDocs = existingImages.slice(1);
  const totalCount = existingImages.length + pendingPhotos.length;

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
      newPending.push({ file, previewUrl: URL.createObjectURL(file), role });
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

  const handleUploadAll = async () => {
    if (pendingPhotos.length === 0) return;
    setUploadError(null);

    const ordered = [
      ...pendingPhotos.filter((p) => p.role === "portrait"),
      ...pendingPhotos.filter((p) => p.role === "gallery"),
    ];

    const toRevoke = pendingPhotos.map((p) => p.previewUrl);

    try {
      await Promise.all(
        ordered.map(({ file }) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("tipoDocumento", "1"); // Use an existing enum value; backend handles images based on Content-Type
          return uploadDocumentAsync(formData);
        })
      );
    } catch {
      setUploadError("Error al subir una imagen. Intenta nuevamente.");
      return;
    }

    toRevoke.forEach((url) => URL.revokeObjectURL(url));
    setPendingPhotos([]);
  };

  const pendingPortrait = pendingPhotos.filter((p) => p.role === "portrait");
  const pendingGallery = pendingPhotos.filter((p) => p.role === "gallery");

  return (
    <div className="space-y-4">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Images className="w-4 h-4 text-teal-600" />
          Fotos del Proyecto
        </h3>
        {totalCount > 0 && (
          <span className="text-xs text-gray-500 tabular-nums">
            {totalCount} / {MAX_PHOTOS}
          </span>
        )}
      </div>

      {uploadError && (
        <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {uploadError}
        </div>
      )}

      {isLoading ? (
        <div className="flex gap-2 animate-pulse">
          <div className="w-28 h-20 rounded-md bg-gray-100" />
          <div className="w-20 h-20 rounded-md bg-gray-100" />
          <div className="w-20 h-20 rounded-md bg-gray-100" />
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── PORTADA + GALERÍA en una sola fila de acciones ── */}
          <div className="flex flex-wrap items-start gap-4">

            {/* — Portada — */}
            <div className="flex flex-col gap-2 min-w-0">
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                Foto de portada
              </span>

              <div className="flex items-center gap-2">
                {/* Thumbnail existing portada */}
                {portraitDoc && (
                  <div className="relative w-14 h-14 rounded-md overflow-hidden border border-amber-300 flex-shrink-0">
                    <img
                      src={portraitDoc.fileUrl}
                      alt="Portada actual"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                {/* Thumbnail pending portada */}
                {pendingPortrait.map((p, i) => (
                  <div
                    key={`pending-portrait-${p.previewUrl}`}
                    className="relative w-14 h-14 rounded-md overflow-hidden border border-dashed border-amber-400 flex-shrink-0"
                  >
                    <img src={p.previewUrl} alt="Portada pendiente" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePending(pendingPhotos.indexOf(p))}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer"
                      aria-label="Quitar foto de portada"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}

                {/* CTA portada */}
                <button
                  id="btn-agregar-portada"
                  type="button"
                  onClick={() => portraitInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-300 bg-white hover:bg-amber-50 active:scale-[0.98] text-amber-700 text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1"
                  aria-label={portraitDoc ? "Cambiar foto de portada" : "Agregar foto de portada"}
                >
                  <Camera className="w-3.5 h-3.5" />
                  {portraitDoc ? "Cambiar portada" : "Agregar portada"}
                </button>
              </div>
            </div>

            {/* Divider vertical */}
            <div className="hidden sm:block w-px self-stretch bg-gray-100 mt-5" />

            {/* — Galería — */}
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <span className="text-xs font-medium text-gray-500">
                Fotos adicionales
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* Thumbnails existentes galería */}
                {galleryDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="relative w-14 h-14 rounded-md overflow-hidden border border-gray-200 flex-shrink-0"
                  >
                    <img
                      src={doc.fileUrl}
                      alt={doc.nombreArchivoOriginal}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}

                {/* Thumbnails pendientes galería */}
                {pendingGallery.map((p) => {
                  const realIdx = pendingPhotos.indexOf(p);
                  return (
                    <div
                      key={`pending-gallery-${realIdx}`}
                      className="relative w-14 h-14 rounded-md overflow-hidden border border-dashed border-teal-300 flex-shrink-0"
                    >
                      <img src={p.previewUrl} alt="Nueva foto" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePending(realIdx)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer"
                        aria-label="Quitar foto"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  );
                })}

                {/* CTA galería */}
                <button
                  id="btn-agregar-fotos"
                  type="button"
                  disabled={totalCount >= MAX_PHOTOS}
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-teal-300 bg-white hover:bg-teal-50 active:scale-[0.98] text-teal-700 text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Agregar más fotos"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  Agregar más fotos
                </button>
              </div>
            </div>
          </div>

          {/* ── UPLOAD FOOTER ─────────────────────────────────── */}
          {pendingPhotos.length > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {pendingPhotos.length} foto{pendingPhotos.length > 1 ? "s" : ""} por subir
              </span>
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 text-white text-xs font-semibold rounded-md hover:bg-teal-800 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? "Subiendo..." : "Subir fotos"}
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Máximo {MAX_PHOTOS} fotos · 5 MB por imagen · JPEG, PNG, WebP
      </p>

      {/* Hidden file inputs */}
      <input
        id="input-portada"
        type="file"
        ref={portraitInputRef}
        onChange={handlePortraitInput}
        accept={IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleGalleryInput}
        accept={IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        multiple
        className="hidden"
      />
    </div>
  );
};
