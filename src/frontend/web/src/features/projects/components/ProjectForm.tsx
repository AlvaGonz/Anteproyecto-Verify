import React, { useState } from "react";
import { CreateProyectoDto, UpdateProyectoDto, ProyectoDto } from "../types";

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
  const [ubicacionTexto, setUbicacionTexto] = useState(
    initialData?.ubicacionTexto || "",
  );
  const [ubicacionGps, setUbicacionGps] = useState(
    initialData?.ubicacionGps || "",
  );
  const [valorEstimado, setValorEstimado] = useState<number | "">(
    initialData?.valorEstimado || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (initialData) {
        const updateData: UpdateProyectoDto = {
          nombre,
          ubicacionTexto,
          ubicacionGps: ubicacionGps || undefined,
          valorEstimado:
            valorEstimado === "" ? undefined : Number(valorEstimado),
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateProyectoDto = {
          nombre,
          ubicacionTexto,
          // TODO: Replace with actual logged-in user ID when auth is implemented
          usuarioCreadorId: "00000000-0000-0000-0000-000000000000",
        };
        await onSubmit(createData);
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar el proyecto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto p-8 clay-card"
    >
      {error && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-error)', border: '1px solid var(--color-error)' }}>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-strong)' }}>
          Nombre del Proyecto
        </label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="block w-full rounded-lg border p-3 focus:outline-none transition-shadow"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-warm)', color: 'var(--color-text-strong)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-strong)' }}>
          Ubicación (Texto)
        </label>
        <input
          type="text"
          required
          value={ubicacionTexto}
          onChange={(e) => setUbicacionTexto(e.target.value)}
          className="block w-full rounded-lg border p-3 focus:outline-none transition-shadow"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-warm)', color: 'var(--color-text-strong)' }}
        />
      </div>

      {initialData && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-strong)' }}>
              Coordenadas GPS
            </label>
            <input
              type="text"
              value={ubicacionGps}
              onChange={(e) => setUbicacionGps(e.target.value)}
              className="block w-full rounded-lg border p-3 focus:outline-none transition-shadow font-mono"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-warm)', color: 'var(--color-text-strong)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-strong)' }}>
              Valor Estimado
            </label>
            <input
              type="number"
              value={valorEstimado}
              onChange={(e) =>
                setValorEstimado(e.target.value ? Number(e.target.value) : "")
              }
              className="block w-full rounded-lg border p-3 focus:outline-none transition-shadow font-mono"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-warm)', color: 'var(--color-text-strong)' }}
            />
          </div>
        </>
      )}

      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border-warm)' }}>
        <button
          type="button"
          onClick={onCancel}
          className="clay-btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="clay-btn-primary disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};
