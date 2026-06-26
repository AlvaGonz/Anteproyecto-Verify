import { z } from "zod";

// Dominican Cédula check-digit validation algorithm (Luhn mod-10 variant)
export const validateCedulaCheckDigit = (cedula: string): boolean => {
  const digits = cedula.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  
  const multipliers = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    let product = parseInt(digits[i], 10) * multipliers[i];
    if (product >= 10) product -= 9;
    sum += product;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(digits[10], 10);
};

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Formato de correo inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "Contraseña demasiado larga"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre demasiado largo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "El nombre solo puede contener letras"),
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(100, "Apellido demasiado largo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "El apellido solo puede contener letras"),
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Formato de correo inválido"),
telefono: z
     .string()
     .min(1, "El teléfono es requerido")
     .refine((val) => {
       const digits = val.replace(/\D/g, "");
       return /^(809|829|849)\d{7}$/.test(digits);
     }, "Teléfono inválido. Solo códigos 809, 829 o 849 (ej: 8095550199)"),
  cedula: z
    .string()
    .min(1, "La cédula es requerida")
    .refine((val) => {
      const digits = val.replace(/\D/g, "");
      return /^\d{11}$/.test(digits);
    }, "La cédula debe tener 11 dígitos")
    .refine((val) => {
      const digits = val.replace(/\D/g, "");
      return validateCedulaCheckDigit(digits);
    }, "Cédula inválida: el dígito verificador no es correcto"),
  password: z
    .string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[!@#$%^&*\-]/, "Debe contener al menos un carácter especial (!@#$%^&*-)"),
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, "Debe aceptar los términos de uso y políticas de privacidad"),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const UpdateProfileSchema = z.object({
  nombre: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Solo letras y espacios"),
  apellido: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Solo letras y espacios"),
telefono: z
     .string()
     .optional()
     .refine((val) => {
       if (val === undefined || val === "") return true;
       return /^(809|829|849)\d{7}$/.test(val);
     }, "Teléfono inválido. Solo códigos 809, 829 o 849 (ej: 8095550199)"),
  changePassword: z.boolean().default(false),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
})
.superRefine((data, ctx) => {
  if (!data.changePassword) return;
  if (!data.currentPassword || data.currentPassword.length === 0) {
    ctx.addIssue({ code: "custom", path: ["currentPassword"], message: "Requerida para cambiar contraseña" });
  }
  if (!data.newPassword || data.newPassword.length < 8) {
    ctx.addIssue({ code: "custom", path: ["newPassword"], message: "Mínimo 8 caracteres" });
  } else if (!/[A-Z]/.test(data.newPassword) || !/[a-z]/.test(data.newPassword) || !/[0-9]/.test(data.newPassword) || !/[!@#$%^&*\-]/.test(data.newPassword)) {
    ctx.addIssue({ code: "custom", path: ["newPassword"], message: "Requiere mayúscula, minúscula, número y carácter especial (!@#$%^&*-)" });
  }
  if (data.newPassword !== data.confirmPassword) {
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Las contraseñas no coinciden" });
  }
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
