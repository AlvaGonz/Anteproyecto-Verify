import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { createProjectSchema, type CreateProjectFormValues } from "../schemas";
import { useCreateProject } from "../api/useProjectMutations";
import { ProjectCategory } from "../types";
import { FormField } from "@/components/ui/FormField";

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  [ProjectCategory.Residencial]: "Residencial",
  [ProjectCategory.Comercial]: "Comercial",
  [ProjectCategory.Turistico]: "Turístico",
  [ProjectCategory.Mixto]: "Mixto",
  [ProjectCategory.Otro]: "Otro",
};

interface CreateProjectFormProps {
  onSuccess?: (id: string) => void;
}

export const CreateProjectForm = ({ onSuccess }: CreateProjectFormProps) => {
  const navigate = useNavigate();
  const { mutate: createProject, isPending, error } = useCreateProject();

  const { register, handleSubmit, formState: { errors } } =
    useForm<CreateProjectFormValues>({ resolver: zodResolver(createProjectSchema) });

  const onSubmit = (data: CreateProjectFormValues) =>
    createProject(
      { ...data, usuarioCreadorId: "00000000-0000-0000-0000-000000000000" }, // replaced by auth context in production
      { onSuccess: (proj) => onSuccess ? onSuccess(proj.id) : navigate(`/projects/${proj.id}`) }
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <h2 className="text-xl font-semibold text-gray-900">Nuevo Proyecto</h2>

      {error && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {(error as Error).message}
        </div>
      )}

      <FormField label="Nombre del proyecto" htmlFor="nombre" error={errors.nombre?.message} required>
        <input id="nombre" type="text" placeholder="Ej: Residencial Las Palmas"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("nombre")} />
      </FormField>

      <FormField label="Ubicación" htmlFor="ubicacionTexto" error={errors.ubicacionTexto?.message} required>
        <input id="ubicacionTexto" type="text" placeholder="Ej: La Romana, República Dominicana"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("ubicacionTexto")} />
      </FormField>

      <FormField label="Categoría" htmlFor="categoria" error={errors.categoria?.message} required>
        <select id="categoria"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          {...register("categoria", { valueAsNumber: true })}>
          <option value="">Seleccione una categoría</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Designación catastral" htmlFor="designacionCatastral" error={errors.designacionCatastral?.message}>
        <input id="designacionCatastral" type="text" placeholder="Ej: ABC-12345"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("designacionCatastral")} />
      </FormField>

      <FormField label="Valor estimado (USD)" htmlFor="valorEstimado" error={errors.valorEstimado?.message}>
        <input id="valorEstimado" type="number" min={0} placeholder="Ej: 500000"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("valorEstimado", { valueAsNumber: true })} />
      </FormField>

      <FormField label="Datos del desarrollador" htmlFor="datosDesarrollador" error={errors.datosDesarrollador?.message}>
        <textarea id="datosDesarrollador" rows={3} placeholder="Información del desarrollador o constructora..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          {...register("datosDesarrollador")} />
      </FormField>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={() => navigate(-1)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 transition-colors">
          {isPending ? "Guardando..." : "Crear proyecto"}
        </button>
      </div>
    </form>
  );
};
