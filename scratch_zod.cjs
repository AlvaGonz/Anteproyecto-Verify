const { z } = require('zod');

const stripNonDigits = (val) => val.replace(/\D/g, '');

const registerSchema = z.object({
  telefono: z
    .string()
    .min(1, 'El teléfono es requerido')
    .transform(stripNonDigits)
    .refine((v) => /^(809|829|849)\d{7}$/.test(v), {
      message: 'Teléfono inválido. Códigos válidos: 809, 829, 849 (ej: 809-555-0199)',
    }),
});

try {
  console.log(registerSchema.parse({ telefono: "(809) 555-0199" }));
} catch (e) {
  console.log(e.errors);
}
