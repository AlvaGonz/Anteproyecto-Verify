import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createValidationSchema, type CreateValidationFormValues } from "../schemas";
import { useSubmitValidation } from "../api/useValidationMutations";
import { FormField } from "@/components/ui/FormField";

interface CreateValidationFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export const CreateValidationForm = ({ projectId, onSuccess }: CreateValidationFormProps) => {
  const { mutate: submit, isPending, error } = useSubmitValidation(projectId);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<CreateValidationFormValues>({ resolver: zodResolver(createValidationSchema) });

  const onSubmit = (data: CreateValidationFormValues) =>
    submit(data, { onSuccess: () => { reset(); onSuccess?.(); } });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <h3 className="text-lg font-semibold text-gray-900">Nueva validación</h3>

      {error && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {(error as Error).message}
        </div>
      )}

      <FormField label="Tipo de validación" htmlFor="tipoValidacion" error={errors.tipoValidacion?.message} required>
        <select id="tipoValidacion"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          {...register("tipoValidacion")}>
          <option value="">Seleccione el tipo</option>
          {["Documental","Fisica","Legal","Financiera","Tecnica"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Observaciones" htmlFor="observaciones" error={errors.observaciones?.message}>
        <textarea id="observaciones" rows={4}
          placeholder="Describa los hallazgos o comentarios de esta validación..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          {...register("observaciones")} />
      </FormField>

      <button type="submit" disabled={isPending}
        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 transition-colors self-end">
        {isPending ? "Enviando..." : "Enviar validación"}
      </button>
    </form>
  );
};
