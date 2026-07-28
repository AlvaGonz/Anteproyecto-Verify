import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { updateProjectSchema, type UpdateProjectFormValues } from "../schemas";
import { useUpdateProject } from "../api/useProjectMutations";
import { ProjectCategory, type ProyectoDto, type UpdateProyectoDto } from "../types";
import { FormField } from "@/components/ui/FormField";
import { useCedulaInput } from "@/shared/hooks/useCedulaInput";
import { ProjectPhotosSection } from "./ProjectPhotosSection";
import { useDgiiLookup } from "@/shared/hooks/useDgiiLookup";
import { useEffect } from "react";

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  [ProjectCategory.Residencial]: "Residencial",
  [ProjectCategory.Comercial]: "Comercial",
  [ProjectCategory.Turistico]: "Turístico",
  [ProjectCategory.Mixto]: "Mixto",
  [ProjectCategory.Otro]: "Otro",
};

interface EditProjectFormProps {
  project: ProyectoDto;
  onSuccess?: () => void;
}

export const EditProjectForm = ({ project, onSuccess }: EditProjectFormProps) => {
  const navigate = useNavigate();
  const { mutate: updateProject, isPending, error } = useUpdateProject(project.id);

  const { register, handleSubmit, formState: { errors }, setValue } =
    useForm<UpdateProjectFormValues>({
      resolver: zodResolver(updateProjectSchema),
      defaultValues: {
        nombre: project.nombre,
        ubicacionTexto: project.ubicacionTexto,
        ubicacionGps: project.ubicacionGps ?? "",
        categoria: project.categoria,
        valorEstimado: project.valorEstimado,
        datosDesarrollador: project.datosDesarrollador ?? "",
        rncDesarrollador: project.rncDesarrollador ?? "",
        designacionCatastral: project.designacionCatastral ?? "",
        superficieM2: project.superficieM2,
      },
    });

  // Initialize cedula hook with project's RNC (raw or formatted)
  const { value: formattedRnc, handleChange: handleCedulaChange, rawDigits: rncRawDigits } = useCedulaInput(project.rncDesarrollador ?? "");
  const { searchRnc, isSearching: isSearchingRnc, error: rncSearchError, setError: setRncSearchError } = useDgiiLookup();

  const handleSearchRnc = async (val: string) => {
    if (!val) return;
    const data = await searchRnc(val);
    if (data && data.nombreRazonSocial) {
      setValue("datosDesarrollador", data.nombreRazonSocial, { shouldDirty: true, shouldValidate: true });
    }
  };

  useEffect(() => {
    if (rncRawDigits.length === 11 || rncRawDigits.length === 9) {
      handleSearchRnc(rncRawDigits);
    } else {
      setRncSearchError(null);
    }
  }, [rncRawDigits]);

  const onSubmit = (data: UpdateProjectFormValues) => {
    const payload: UpdateProyectoDto = {
      ...data,
      imagenAdicional1: project.imagenAdicional1,
      imagenAdicional2: project.imagenAdicional2,
      imagenAdicional3: project.imagenAdicional3,
      imagenAdicional4: project.imagenAdicional4,
      imagenAdicional5: project.imagenAdicional5,
    };
    updateProject(payload, { onSuccess: () => onSuccess ? onSuccess() : navigate(`/p/${project.id}`) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <h2 className="text-xl font-semibold text-gray-900">Editar proyecto</h2>

      {error && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {(error as Error).message}
        </div>
      )}

      <FormField label="Nombre del proyecto" htmlFor="nombre" error={errors.nombre?.message} required>
        <input id="nombre" type="text"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("nombre")} />
      </FormField>

      <FormField label="Ubicación" htmlFor="ubicacionTexto" error={errors.ubicacionTexto?.message} required>
        <input id="ubicacionTexto" type="text"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("ubicacionTexto")} />
      </FormField>

      <FormField label="Coordenadas GPS" htmlFor="ubicacionGps" error={errors.ubicacionGps?.message}>
        <input id="ubicacionGps" type="text" placeholder="18.4861,-69.9312"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("ubicacionGps")} />
      </FormField>

      <FormField label="Categoría" htmlFor="categoria" error={errors.categoria?.message} required>
        <select id="categoria"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          {...register("categoria", { valueAsNumber: true })} >
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Valor estimado (USD)" htmlFor="valorEstimado" error={errors.valorEstimado?.message}>
        <input id="valorEstimado" type="number" min={0}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("valorEstimado", { valueAsNumber: true })} />
      </FormField>

      <FormField label="Datos del desarrollador" htmlFor="datosDesarrollador" error={errors.datosDesarrollador?.message}>
        <input id="datosDesarrollador" type="text"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("datosDesarrollador")} />
      </FormField>

      <FormField label="RNC del desarrollador" htmlFor="rncDesarrollador" error={errors.rncDesarrollador?.message || rncSearchError || undefined}>
        <div className="relative">
          <input
            id="rncDesarrollador"
            type="text"
            aria-label="RNC del desarrollador"
            value={formattedRnc}
            onChange={(e) => {
              handleCedulaChange(e);
              setValue("rncDesarrollador", e.target.value.replace(/\D/g, ""), { shouldValidate: true, shouldDirty: true });
              if (rncSearchError) setRncSearchError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchRnc(rncRawDigits);
              }
            }}
            name="rncDesarrollador"
            inputMode="numeric"
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${rncSearchError ? "border-red-400 focus:ring-red-200 focus:border-red-500" : ""}`}
          />
          {isSearchingRnc && (
            <div className="absolute right-3 top-2.5 flex items-center">
              <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </FormField>

      <FormField label="Designación catastral" htmlFor="designacionCatastral" error={errors.designacionCatastral?.message}>
        <input id="designacionCatastral" type="text"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("designacionCatastral")} />
      </FormField>

      <FormField label="Superficie (m²)" htmlFor="superficieM2" error={errors.superficieM2?.message}>
        <input id="superficieM2" type="number" min={1}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("superficieM2", { valueAsNumber: true })} />
      </FormField>

      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
        <ProjectPhotosSection projectId={project.id} />
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
        <button type="button" onClick={() => navigate(-1)}
          className="w-full sm:w-auto rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 transition-colors">
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
};