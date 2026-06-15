import React, { useState } from "react";
import { CreateProyectoDto, UpdateProyectoDto, ProyectoDto, ProjectCategory } from "../types";

interface ProjectFormProps {
  initialData?: ProyectoDto;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [ubicacionTexto, setUbicacionTexto] = useState(initialData?.ubicacionTexto || "");
  const [ubicacionGps, setUbicacionGps] = useState(initialData?.ubicacionGps || "");
  const [valorEstimado, setValorEstimado] = useState<number | "">(initialData?.valorEstimado || "");
  const [categoria, setCategoria] = useState<ProjectCategory>(initialData?.categoria || ProjectCategory.Residencial);
  const [datosDesarrollador, setDatosDesarrollador] = useState(initialData?.datosDesarrollador || "");
  const [designacionCatastral, setDesignacionCatastral] = useState(initialData?.designacionCatastral || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!nombre.trim()) {
      setError("El Nombre del Proyecto es requerido.");
      return;
    }
    if (!ubicacionTexto.trim()) {
      setError("La Ubicación es requerida.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (initialData) {
        const updateData: UpdateProyectoDto = {
          nombre, ubicacionTexto,
          ubicacionGps: ubicacionGps || undefined,
          valorEstimado: valorEstimado === "" ? undefined : Number(valorEstimado),
          categoria,
          datosDesarrollador: datosDesarrollador || undefined,
          designacionCatastral: designacionCatastral || undefined,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateProyectoDto = {
          nombre, ubicacionTexto,
          usuarioCreadorId: "00000000-0000-0000-0000-000000000000",
          categoria,
          datosDesarrollador: datosDesarrollador || undefined,
          designacionCatastral: designacionCatastral || undefined,
        };
        await onSubmit(createData);
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar el proyecto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = "vf-input py-2.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto vf-card p-6" noValidate>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1.5">
          Nombre del Proyecto *
        </label>
        <input id="nombre" type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="ubicacion" className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1.5">
          Ubicación (Texto) *
        </label>
        <input id="ubicacion" type="text" required value={ubicacionTexto} onChange={(e) => setUbicacionTexto(e.target.value)} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="categoria" className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1.5">
          Categoria
        </label>
        <select id="categoria" value={categoria} onChange={(e) => setCategoria(Number(e.target.value) as ProjectCategory)} className={fieldClass}>
          <option value={ProjectCategory.Residencial}>Residencial</option>
          <option value={ProjectCategory.Comercial}>Comercial</option>
          <option value={ProjectCategory.Turistico}>Turistico</option>
          <option value={ProjectCategory.Mixto}>Mixto</option>
          <option value={ProjectCategory.Otro}>Otro</option>
        </select>
      </div>

      <div>
        <label htmlFor="desarrollador" className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1.5">
          Desarrollador
        </label>
        <input id="desarrollador" type="text" value={datosDesarrollador} onChange={(e) => setDatosDesarrollador(e.target.value)} className={fieldClass} placeholder="Nombre de la constructora o desarrollador" />
      </div>

      <div>
        <label htmlFor="catastral" className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1.5">
          Designacion Catastral
        </label>
        <input id="catastral" type="text" value={designacionCatastral} onChange={(e) => setDesignacionCatastral(e.target.value)} className={`${fieldClass} font-mono`} placeholder="Ej: DC-12345" />
      </div>

      {initialData && (
        <>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1.5">
              Coordenadas GPS
            </label>
            <input type="text" value={ubicacionGps} onChange={(e) => setUbicacionGps(e.target.value)} className={`${fieldClass} font-mono`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1.5">
              Valor Estimado (DOP)
            </label>
            <input type="number" value={valorEstimado} onChange={(e) => setValorEstimado(e.target.value ? Number(e.target.value) : "")} className={`${fieldClass} font-mono`} />
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-surface-muted)]/50">
        <button type="button" onClick={onCancel} className="vf-btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="vf-btn-primary">
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};
