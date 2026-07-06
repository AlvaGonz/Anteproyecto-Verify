import { z } from "zod";

export const createValidationSchema = z.object({
  tipoValidacion: z.enum(
    ["Documental", "Fisica", "Legal", "Financiera", "Tecnica"] as const,
    { error: () => "Seleccione un tipo de validación" }
  ),
  observaciones: z
    .string()
    .max(2000, "Las observaciones no pueden superar 2000 caracteres")
    .optional(),
  idDocumentoReferencia: z
    .uuid({ error: "Seleccione un documento válido (UUID)" })
    .optional()
    .or(z.literal("")),
});
export type CreateValidationFormValues = z.infer<typeof createValidationSchema>;
