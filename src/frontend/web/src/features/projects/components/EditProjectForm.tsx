import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { updateProjectSchema, type UpdateProjectFormValues } from "../schemas";
import { useUpdateProject } from "../api/useProjectMutations";
import { ProjectCategory, type ProyectoDto } from "../types";
import { FormField } from "@/components/ui/FormField";
import { useCedulaInput } from "@/shared/hooks/useCedulaInput";
import { useDocuments, useUploadDocument } from "../../documents/api/useDocuments";
import { isImageDocument } from "../utils/imageUtils";
import { ImageIcon, CheckCircle, UploadCloud } from "lucide-react";

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

  const { data: documents = [] } = useDocuments(project.id);
  const imageDocuments = documents.filter(d => isImageDocument(d.nombreArchivoOriginal));
  const [selectedCoverId, setSelectedCoverId] = useState<string | null>(
    imageDocuments[0]?.id ?? null
  );
  const { mutate: uploadDocument } = useUploadDocument(project.id);

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

  const onSubmit = (data: UpdateProjectFormValues) => {
    const { fotos, ...rest } = data;
    const fotosNuevas = fotos ? Array.from(fotos) : undefined;
    updateProject({ ...rest, fotosNuevas }, { onSuccess: () => onSuccess ? onSuccess() : navigate(`/p/${project.id}`) });
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

      <FormField label="RNC del desarrollador" htmlFor="rncDesarrollador" error={errors.rncDesarrollador?.message}>
        <input
          id="rncDesarrollador"
          type="text"
          value={formattedRnc}
          onChange={(e) => {
            handleCedulaChange(e);
            setValue("rncDesarrollador", rncRawDigits, { shouldValidate: true });
          }}
          name="rncDesarrollador"
          inputMode="numeric"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
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

      <FormField label="Fotos del proyecto (máx. 5)" htmlFor="fotos" error={errors.fotos?.message as string}>
        {/* Show existing photos as small thumbnails if project.fotoUrls?.length */}
        {project.fotoUrls?.length ? (
          <div className="flex gap-2 flex-wrap mb-2">
            {project.fotoUrls.map((url, i) => (
              <img key={i} src={url} alt={`Foto ${i + 1}`}
                className="h-16 w-16 rounded object-cover border border-gray-200" />
            ))}
          </div>
        ) : null}
        <input id="fotos" type="file" accept="image/*" multiple
          className="text-sm"
          {...register("fotos")} />
        <p className="text-xs text-gray-400 mt-1">Las nuevas fotos reemplazarán las anteriores.</p>
      </FormField>

      {imageDocuments.length > 0 && (
        <div className="space-y-3 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/40 p-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-semibold text-teal-800">
              Imagen de portada del proyecto
            </h3>
            <span className="ml-auto text-xs text-teal-600">
              La 1ª imagen seleccionada se usa como thumbnail
            </span>
          </div>

          {/* Preview de portada actual */}
          {selectedCoverId && (() => {
            const selected = imageDocuments.find(d => d.id === selectedCoverId);
            return selected ? (
              <div className="relative w-full h-44 rounded-lg overflow-hidden border border-teal-200">
                <img
                  src={selected.fileUrl}
                  alt="Portada seleccionada"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-teal-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Portada activa
                </div>
              </div>
            ) : null;
          })()}

          {/* Grid de selección */}
          <div className="grid grid-cols-4 gap-2">
            {imageDocuments.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedCoverId(doc.id)}
                aria-pressed={selectedCoverId === doc.id}
                aria-label={`Seleccionar ${doc.nombreArchivoOriginal} como portada`}
                className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  selectedCoverId === doc.id
                    ? 'border-teal-500 ring-2 ring-teal-300'
                    : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <img
                  src={doc.fileUrl}
                  alt={doc.nombreArchivoOriginal}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selectedCoverId === doc.id && (
                  <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-teal-700" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Upload nueva imagen */}
          <label className="flex items-center gap-2 cursor-pointer w-fit text-sm text-teal-700 font-medium hover:text-teal-900 transition-colors">
            <UploadCloud className="w-4 h-4" />
            Subir nueva imagen
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                formData.append('tipo', 'Imagen');
                uploadDocument(formData);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={() => navigate(-1)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 transition-colors">
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
};