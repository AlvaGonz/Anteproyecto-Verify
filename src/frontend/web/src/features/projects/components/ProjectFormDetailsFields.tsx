import React from "react";
import { MapPin, Compass } from "lucide-react";

interface ProjectFormDetailsFieldsProps {
  ubicacionGps: string;
  designacionCatastral: string;
  matricula: string;
  setMatricula: (v: string) => void;
  valorEstimado: number | "";
  setValorEstimado: (v: number | "") => void;
  superficieM2: string | number;
  setSuperficieM2: (v: string | number) => void;
  duplicateError?: string | null;
  cercania: string;
  setCercania: (v: string) => void;
}

export const ProjectFormDetailsFields: React.FC<ProjectFormDetailsFieldsProps> = ({
  ubicacionGps,
  designacionCatastral,
  matricula,
  setMatricula: _setMatricula,
  valorEstimado,
  setValorEstimado,
  superficieM2,
  setSuperficieM2: _setSuperficieM2,
  duplicateError,
  cercania,
  setCercania: _setCercania,
}) => (
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
          className={`vf-input font-mono pl-10 bg-gray-50 cursor-not-allowed ${duplicateError ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-gray-200'}`}
          placeholder="Haga clic en el mapa para marcar"
        />
        <MapPin className="absolute left-3.5 top-4 w-4 h-4 text-primary opacity-60" />
      </div>
      {duplicateError && (
        <p className="mt-1.5 text-xs text-red-600 font-semibold animate-fade-in">
          {duplicateError}
        </p>
      )}
    </div>

    {/* Referencia de Cercanía */}
    {cercania && (
      <div className="animate-fade-in">
        <label htmlFor="cercania" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
          Referencia de Cercanía (OSM)
        </label>
        <div className="relative">
          <input
            id="cercania"
            type="text"
            disabled={true}
            value={cercania}
            className="vf-input pl-10 bg-gray-50 cursor-not-allowed border-gray-200"
          />
          <MapPin className="absolute left-3.5 top-4 w-4 h-4 text-primary opacity-60" />
        </div>
      </div>
    )}

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
          className={`vf-input font-mono pl-10 bg-gray-50 cursor-not-allowed ${duplicateError ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-gray-200'}`}
          placeholder="Se genera al marcar la ubicación"
        />
        <Compass className="absolute left-3.5 top-4 w-4 h-4 text-primary opacity-60" />
      </div>
    </div>

    {/* Matrícula (Opcional) */}
    <div>
      <label htmlFor="matricula" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
        Matrícula del Inmueble <span className="text-gray-400 font-normal">(Opcional)</span>
      </label>
      <input
        id="matricula"
        type="text"
        value={matricula}
        onChange={(e) => _setMatricula(e.target.value)}
        className={`vf-input font-mono uppercase ${duplicateError ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : ''}`}
        placeholder="Ej: 0100203040"
      />
      {duplicateError && (
        <p className="mt-1.5 text-xs text-red-600 font-semibold animate-fade-in">
          {duplicateError}
        </p>
      )}
      <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
        Si el inmueble ya posee un certificado de título, ingrese la matrícula para validación automática.
      </p>
    </div>

    {/* Valor Estimado */}
    <div>
      <label htmlFor="valorEstimado" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
        Valor Estimado (DOP)
      </label>
      <input
        id="valorEstimado"
        type="text"
        value={valorEstimado ? `RD$ ${valorEstimado.toLocaleString("en-US")}` : ""}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d]/g, "");
          setValorEstimado(raw ? Number(raw) : "");
        }}
        className="vf-input font-mono"
        placeholder="Ej: RD$ 15,000,000"
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
        disabled={true}
        value={superficieM2}
        className="vf-input font-mono bg-gray-50 border-gray-200 cursor-not-allowed"
        placeholder="Se obtiene desde Catastro"
      />
    </div>
  </div>
);
