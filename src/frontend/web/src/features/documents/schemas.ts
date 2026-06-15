import { z } from "zod";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadDocumentSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre del documento es requerido")
    .max(200),
  tipo: z.enum(
    ["Plano", "Permiso", "Titulo", "Fotografia", "Contrato", "Otro"],
    { errorMap: () => ({ message: "Seleccione un tipo de documento" }) }
  ),
  archivo: z
    .instanceof(File, { message: "Seleccione un archivo" })
    .refine((f) => f.size <= MAX_FILE_SIZE, "El archivo no puede superar 10MB")
    .refine(
      (f) => ACCEPTED_TYPES.includes(f.type),
      "Solo se aceptan PDF, JPG, PNG o WebP"
    ),
});
export type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;
