import React from "react";
import { ProjectCategory } from "../types";

interface ProjectFormBasicFieldsProps {
  provincias: { nombre: string; lat: number; lng: number; dcPrefix: string }[];
  nombre: string;
  setNombre: (v: string) => void;
  nombreTouched: boolean;
  setNombreTouched: (v: boolean) => void;
  ubicacionTexto: string;
  setUbicacionTexto: (v: string) => void;
  ubicacionTouched: boolean;
  setUbicacionTouched: (v: boolean) => void;
  setUbicacionGps: (v: string) => void;
  setDesignacionCatastral: (v: string) => void;
  categoria: ProjectCategory;
  setCategoria: (v: ProjectCategory) => void;
  rncDesarrollador: string;
  setRncDesarrollador: (v: string) => void;
  rncError: string | null;
  setRncError: (v: string | null) => void;
  isSearchingRnc: boolean;
  handleRncSearch: (v: string) => Promise<void>;
  datosDesarrollador: string;
  setDatosDesarrollador: (v: string) => void;
}

export const ProjectFormBasicFields: React.FC<ProjectFormBasicFieldsProps> = ({
  provincias,
  nombre,
  setNombre,
  nombreTouched,
  setNombreTouched,
  ubicacionTexto,
  setUbicacionTexto,
  ubicacionTouched,
  setUbicacionTouched,
  setUbicacionGps,
  setDesignacionCatastral,
  categoria,
  setCategoria,
  rncDesarrollador,
  setRncDesarrollador,
  rncError,
  setRncError,
  isSearchingRnc,
  handleRncSearch,
  datosDesarrollador,
  setDatosDesarrollador,
}) => (
  <div className="vf-card p-8 space-y-5 bg-white/90 backdrop-blur-md">
    <h3 className="text-lg font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)]/20 pb-2">
      Detalles del Proyecto
    </h3>

    {/* Nombre del Proyecto */}
    <div>
      <label htmlFor="nombre" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
        Nombre del Proyecto *
      </label>
      <input
        id="nombre"
        type="text"
        required
        placeholder="Ej: Residencial Las Palmeras"
        value={nombre}
        onChange={(e) => { setNombre(e.target.value); setNombreTouched(true); }}
        onBlur={() => setNombreTouched(true)}
        className={`vf-input ${nombreTouched && !nombre.trim() ? "border-red-400 focus:ring-red-200 focus:border-red-500" : ""}`}
      />
      {nombreTouched && !nombre.trim() && (
        <p className="mt-1.5 text-xs text-red-600 font-semibold animate-fade-in">
          Campo Nombre del Proyecto necesario
        </p>
      )}
    </div>

    {/* Provincia Dropdown */}
    <div>
      <label htmlFor="provincia" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
        Provincia (Ubicación) *
      </label>
      <select
        id="provincia"
        required
        value={ubicacionTexto}
        onChange={(e) => {
          const val = e.target.value;
          setUbicacionTexto(val);
          setUbicacionTouched(true);
          const matched = provincias.find((p) => p.nombre === val);
          if (matched) {
            setUbicacionGps(`${matched.lat.toFixed(6)},${matched.lng.toFixed(6)}`);
            setDesignacionCatastral(`Parc. ${Math.floor(Math.random() * 500) + 1}, ${matched.dcPrefix}`);
          }
        }}
        onBlur={() => setUbicacionTouched(true)}
        className={`vf-input ${ubicacionTouched && !ubicacionTexto.trim() ? "border-red-400 focus:ring-red-200 focus:border-red-500" : ""}`}
      >
        <option value="">-- Seleccione una provincia --</option>
        {provincias.map((prov) => (
          <option key={prov.nombre} value={prov.nombre}>{prov.nombre}</option>
        ))}
      </select>
      {ubicacionTouched && !ubicacionTexto.trim() && (
        <p className="mt-1.5 text-xs text-red-600 font-semibold animate-fade-in">
          Campo Provincia necesario
        </p>
      )}
    </div>

    {/* Categoría */}
    <div>
      <label htmlFor="categoria" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
        Categoria del Proyecto
      </label>
      <select
        id="categoria"
        value={categoria}
        onChange={(e) => setCategoria(Number(e.target.value) as ProjectCategory)}
        className="vf-input"
      >
        <option value={ProjectCategory.Residencial}>Residencial</option>
        <option value={ProjectCategory.Comercial}>Comercial</option>
        <option value={ProjectCategory.Turistico}>Turístico</option>
        <option value={ProjectCategory.Mixto}>Mixto</option>
        <option value={ProjectCategory.Otro}>Otro</option>
      </select>
    </div>

    {/* RNC del Desarrollador */}
    <div>
      <label htmlFor="rncDesarrollador" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
        RNC / Cédula del Desarrollador
      </label>
      <div className="relative">
        <input
          id="rncDesarrollador"
          type="text"
          value={rncDesarrollador}
          onChange={(e) => {
            setRncDesarrollador(e.target.value);
            if (rncError) setRncError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleRncSearch(rncDesarrollador);
            }
          }}
          onBlur={() => handleRncSearch(rncDesarrollador)}
          className={`vf-input ${rncError ? "border-red-400 focus:ring-red-200 focus:border-red-500" : ""}`}
          placeholder="Ingrese RNC o Cédula (ej: 02601322098)"
        />
        {isSearchingRnc && (
          <div className="absolute right-3 top-3.5 flex items-center">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      {rncError && (
        <p className="mt-1.5 text-xs text-red-600 font-semibold animate-fade-in">
          {rncError}
        </p>
      )}
    </div>

    {/* Desarrollador */}
    <div>
      <label htmlFor="desarrollador" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
        Desarrollador / Constructora
      </label>
      <input
        id="desarrollador"
        type="text"
        value={datosDesarrollador}
        onChange={(e) => setDatosDesarrollador(e.target.value)}
        className="vf-input"
        placeholder="Nombre de la constructora encargada"
      />
    </div>
  </div>
);
