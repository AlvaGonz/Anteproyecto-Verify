import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadDocumentSchema, type UploadDocumentFormValues } from "../schemas";
import { useUploadDocument } from "../api/useDocumentMutations";
import { FormField } from "@/components/ui/FormField";

interface UploadDocumentFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export const UploadDocumentForm = ({ projectId, onSuccess }: UploadDocumentFormProps) => {
  const { mutate: upload, isPending, error } = useUploadDocument(projectId);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<UploadDocumentFormValues>({ resolver: zodResolver(uploadDocumentSchema) });

  const onSubmit = (data: UploadDocumentFormValues) => {
    const formData = new FormData();
    formData.append("nombre", data.nombre);
    formData.append("tipo", data.tipo);
    formData.append("archivo", data.archivo);
    upload(formData, {
      onSuccess: () => { reset(); onSuccess?.(); },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <h3 className="text-lg font-semibold text-gray-900">Subir documento</h3>

      {error && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {(error as Error).message}
        </div>
      )}

      <FormField label="Nombre del documento" htmlFor="docNombre" error={errors.nombre?.message} required>
        <input id="docNombre" type="text" placeholder="Ej: Plano de planta baja"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("nombre")} />
      </FormField>

      <FormField label="Tipo de documento" htmlFor="docTipo" error={errors.tipo?.message} required>
        <select id="docTipo"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          {...register("tipo")}>
          <option value="">Seleccione un tipo</option>
          {["Plano","Permiso","Titulo","Fotografia","Contrato","Otro"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Archivo" htmlFor="docArchivo" error={errors.archivo?.message} required>
        <input id="docArchivo" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1 file:text-teal-700 file:font-medium hover:file:bg-teal-100"
          {...register("archivo", {
            setValueAs: (v: FileList) => v?.[0],
          })} />
      </FormField>

      <button type="submit" disabled={isPending}
        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 transition-colors self-end">
        {isPending ? "Subiendo..." : "Subir documento"}
      </button>
    </form>
  );
};
