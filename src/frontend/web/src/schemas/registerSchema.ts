import { z } from 'zod';

// Normalize: strip all non-digit characters before validating
const stripNonDigits = (val: string) => val.replace(/\D/g, '');

// Cédula dominicana: 11 digits, valid JCE check digit (Luhn mod-10 variant)
function validateCedulaCheckDigit(digits: string): boolean {
  if (digits.length !== 11) return false;
  const multipliers = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let product = parseInt(digits[i]) * multipliers[i];
    if (product >= 10) product -= 9;
    sum += product;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(digits[10]);
}

export const registerSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre solo puede contener letras'),

  apellido: z
    .string()
    .min(1, 'El apellido es requerido')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'El apellido solo puede contener letras'),

  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),

  telefono: z
    .string()
    .min(1, 'El teléfono es requerido')
    .transform(stripNonDigits)
    .refine((v) => /^(809|829|849)\d{7}$/.test(v), {
      message: 'Teléfono inválido. Códigos válidos: 809, 829, 849 (ej: 809-555-0199)',
    }),

  cedula: z
    .string()
    .min(1, 'La cédula es requerida')
    .transform(stripNonDigits)
    .refine((v) => /^\d{11}$/.test(v), {
      message: 'La cédula debe tener 11 dígitos (formato: 001-1234567-8)',
    })
    .refine((v) => validateCedulaCheckDigit(v), {
      message: 'Cédula inválida: el dígito verificador no es correcto',
    }),

  password: z
    .string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Al menos 1 Mayúscula')
    .regex(/[a-z]/, 'Al menos 1 Minúscula')
    .regex(/[0-9]/, 'Al menos 1 Número')
    .regex(/[!@#$%^&*()_+{}[\]:;<>?,./~|-]/, 'Al menos 1 Carácter Especial'),

  acceptedTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos de uso y la política de privacidad.'
  })
});

export type RegisterFormData = z.infer<typeof registerSchema>;
