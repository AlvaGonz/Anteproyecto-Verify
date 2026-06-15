import { z } from "zod";
import { ProjectCategory } from "./types";

export const createProjectSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "Nombre demasiado largo"),
  ubicacionTexto: z
    .string()
    .min(5, "Ingrese una ubicación válida")
    .max(500, "Ubicación demasiado larga"),
  categoria: z.nativeEnum(ProjectCategory, {
    errorMap: () => ({ message: "Seleccione una categoría válida" }),
  }),
  datosDesarrollador: z.string().max(1000).optional(),
  designacionCatastral: z
    .string()
    .regex(/^[A-Z0-9\-]{3,30}$/, "Formato catastral inválido (ej: ABC-123)")
    .optional()
    .or(z.literal("")),
  valorEstimado: z
    .number({ invalid_type_error: "Debe ser un número" })
    .positive("El valor debe ser positivo")
    .max(999_999_999, "Valor fuera de rango")
    .optional(),
});
export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.extend({
  ubicacionGps: z
    .string()
    .regex(
      /^-?\d{1,2}\.\d+,\s*-?\d{1,3}\.\d+$/,
      "Formato GPS inválido (ej: 18.4861,-69.9312)"
    )
    .optional()
    .or(z.literal("")),
});
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
