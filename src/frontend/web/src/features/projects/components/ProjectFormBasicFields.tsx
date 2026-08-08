import React from "react";
import { CategoriaProyectoDto } from "../types";

export function formatRncCedula(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 9) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 8)}-${digits.slice(8)}`;
  }
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
}

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
  categoriaId: number;
  setCategoriaId: (v: number) => void;
  categorias: CategoriaProyectoDto[];
  rncDesarrollador: string;
  setRncDesarrollador: (v: string) => void;
  rncError: string | null;
  setRncError: (v: string | null) => void;
  isSearchingRnc: boolean;
  handleRncSearch: (v: string) => Promise<void>;
  datosDesarrollador: string;
  setDatosDesarrollador: (v: string) => void;
  desarrolladorTouched: boolean;
  setDesarrolladorTouched: (v: boolean) => void;
  duplicateError?: string | null;
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
  categoriaId,
  setCategoriaId,
  categorias,
  rncDesarrollador,
  setRncDesarrollador,
  rncError,
  setRncError,
  isSearchingRnc,
  handleRncSearch,
  datosDesarrollador,
  setDatosDesarrollador,
  desarrolladorTouched,
  setDesarrolladorTouched,}) => (
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

    <div>
      <label htmlFor="categoria" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
        Categoria del Proyecto
      </label>
      <select
        id="categoria"
        value={categoriaId}
        onChange={(e) => setCategoriaId(Number(e.target.value))}
        className="vf-input"
      >
        <option value={0} disabled>-- Seleccione una categoría --</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
        ))}
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
          value={formatRncCedula(rncDesarrollador)}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
            setRncDesarrollador(raw);
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
        Desarrollador / Constructora *
      </label>
      <input
        id="desarrollador"
        type="text"
        required
        value={datosDesarrollador}
        onChange={(e) => { setDatosDesarrollador(e.target.value); setDesarrolladorTouched(true); }}
        onBlur={() => setDesarrolladorTouched(true)}
        className={`vf-input ${desarrolladorTouched && !datosDesarrollador.trim() ? "border-red-400 focus:ring-red-200 focus:border-red-500" : ""}`}
        placeholder="Nombre de la constructora encargada"
      />
      {desarrolladorTouched && !datosDesarrollador.trim() && (
        <p className="mt-1.5 text-xs text-red-600 font-semibold animate-fade-in">
          Campo Desarrollador / Constructora necesario
        </p>
      )}
    </div>
  </div>
);
