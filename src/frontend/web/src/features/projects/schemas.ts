import { z } from "zod";


export const createProjectSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "Nombre demasiado largo"),
  ubicacionTexto: z
    .string()
    .min(5, "Ingrese una ubicación válida")
    .max(500, "Ubicación demasiado larga"),
  categoriaId: z.number().min(1, "Seleccione una categoría válida"),
  datosDesarrollador: z.string().max(1000).optional(),
  rncDesarrollador: z.string().optional(),
  designacionCatastral: z
    .string()
    .max(100, "Designación catastral demasiado larga")
    .optional()
    .or(z.literal("")),
  cercania: z.string().max(1000).optional(),
  valorEstimado: z
    .number({ error: () => "Debe ser un número" })
    .positive({ error: "El valor debe ser positivo" })
    .max(999_999_999, { error: "Valor fuera de rango" })
    .optional(),
  superficieM2: z
    .number({ error: () => "Debe ser un número" })
    .positive({ error: "Debe ser mayor a 0" })
    .optional(),
  fotos: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length <= 5,
      "Máximo 5 fotos permitidas"
    )
    .refine(
      (files) =>
        !files ||
        Array.from(files).every((f) => f.type.startsWith("image/")),
      "Solo se permiten archivos de imagen"
    ),
  propietario: z.string().optional(),
  cedulaRncPropietario: z.string().optional(),
  ipi: z.string().optional(),
  estatusIpi: z.string().optional(),
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
