import React from "react";
import { ImagePlus, X } from "lucide-react";

interface ProjectFormDocumentSectionProps {
  portraitUrl: string;
  handlePortraitChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePortrait: () => void;
  portraitInputRef: React.RefObject<HTMLInputElement | null>;
  galleryUrls: string[];
  handleGalleryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeGalleryPhoto: (idx: number) => void;
  galleryInputRef: React.RefObject<HTMLInputElement | null>;
  fotosError: string | null;
}

export const ProjectFormDocumentSection: React.FC<ProjectFormDocumentSectionProps> = ({
  portraitUrl,
  handlePortraitChange,
  removePortrait,
  portraitInputRef,
  galleryUrls,
  handleGalleryChange,
  removeGalleryPhoto,
  galleryInputRef,
  fotosError,
}) => (
  <div className="vf-card p-8 bg-white/90 backdrop-blur-md md:col-span-2">
    <h3 className="text-lg font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)]/20 pb-2 mb-6">
      Fotos del Proyecto
    </h3>

    {fotosError && (
      <div role="alert" className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {fotosError}
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 md:gap-3">
      {/* ── PORTADA ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-amber-600">★</span>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Foto de Portada</span>
          <span className="text-xs text-[var(--color-text-secondary)]">· thumbnail principal</span>
        </div>

        {/* Slot portada */}
        {portraitUrl ? (
          <div className="relative w-full max-w-[140px] aspect-square rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md group">
            <img
              src={portraitUrl}
              alt="Vista previa de portada"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-white text-xs font-bold uppercase tracking-wide text-center py-1.5 leading-none">
              PORTADA
            </div>
            <button
              type="button"
              onClick={removePortrait}
              aria-label="Quitar foto de portada"
              className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
            >
              <X className="w-3 h-3 text-white" />
            </button>
            <button
              type="button"
              onClick={() => portraitInputRef.current?.click()}
              aria-label="Cambiar foto de portada"
              className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded-lg hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-md"
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
            className="w-full max-w-[140px] aspect-square rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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


      {/* ── GALERÍA ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Fotos adicionales</span>
            <span className="text-xs text-[var(--color-text-secondary)]">· hasta 5 fotos</span>
          </div>
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            {galleryUrls.length}/5
          </span>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {/* Fotos de galería */}
          {galleryUrls.map((url, idx) => (
            <div key={`gallery-${url}-${idx}`} className="relative w-full aspect-square rounded-xl overflow-hidden border border-[var(--color-border)]/30 shadow-sm group">
              <img src={url} alt={`Foto adicional ${idx + 1}`} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <button
                type="button"
                onClick={() => removeGalleryPhoto(idx)}
                aria-label={`Quitar foto ${idx + 1}`}
                className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}

          {/* Botón agregar galería */}
          {galleryUrls.length < 5 && (
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
);
