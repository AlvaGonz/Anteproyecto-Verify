import React from "react";
import { motion as m } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  Loader2,
  ArrowRight,
} from "lucide-react";
import type { UseFormRegister, FieldErrors, UseFormHandleSubmit } from "react-hook-form";
import type { RegisterFormValues } from "../schemas";
import { PasswordStrengthSection } from "./PasswordStrengthSection";
import { TermsCheckboxSection } from "./TermsCheckboxSection";
import { SocialLoginSection } from "./SocialLoginSection";
import { TermsModal } from "./TermsModal";

interface RegisterFormLayoutProps {
  error: Error | null;
  handleSubmit: UseFormHandleSubmit<RegisterFormValues>;
  onSubmit: (data: RegisterFormValues) => void;
  register: UseFormRegister<RegisterFormValues>;
  formErrors: FieldErrors<RegisterFormValues>;
  password: string;
  checks: Array<{ label: string; passed: boolean }>;
  phone: { value: string; handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void };
  blockNonDigits: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  cedulaOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openModal: (type: "terms" | "privacy") => void;
  closeModal: () => void;
  acceptAndCloseModal: () => void;
  isPending: boolean;
  isValid: boolean;
  modalType: "terms" | "privacy" | null;
}

export const RegisterFormLayout: React.FC<RegisterFormLayoutProps> = ({
  error,
  handleSubmit,
  onSubmit,
  register,
  formErrors,
  password,
  checks,
  phone,
  blockNonDigits,
  cedulaOnChange,
  openModal,
  closeModal,
  acceptAndCloseModal,
  isPending,
  isValid,
  modalType,
}) => (
  <div className="w-full">
    {error && (
      <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium animate-in fade-in duration-200" role="alert">
        {(error as Error).message || "Ocurrió un error al crear la cuenta. Intente de nuevo."}
      </div>
    )}

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nombre y Apellido Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label htmlFor="nombre" className="sr-only">Nombre completo</label>
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
          <input
            id="nombre"
            type="text"
            placeholder="Nombre *"
            className="vf-input w-full pl-12 h-[52px]"
            {...register("nombre")}
          />
          {formErrors.nombre && (
            <span className="text-rose-500 text-[10px] font-medium absolute -bottom-5 left-0">
              {formErrors.nombre.message}
            </span>
          )}
        </div>
        <div className="relative">
          <label htmlFor="apellido" className="sr-only">Apellido</label>
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
          <input
            id="apellido"
            type="text"
            placeholder="Apellido *"
            className="vf-input w-full pl-12 h-[52px]"
            {...register("apellido")}
          />
          {formErrors.apellido && (
            <span className="text-rose-500 text-[10px] font-medium absolute -bottom-5 left-0">
              {formErrors.apellido.message}
            </span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="relative pt-1">
        <label htmlFor="email" className="sr-only">Correo electrónico</label>
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
        <input
          id="email"
          type="email"
          placeholder="Correo electrónico *"
          className="vf-input w-full pl-12 h-[52px]"
          {...register("email")}
        />
        {formErrors.email && (
          <span className="text-rose-500 text-[10px] font-medium absolute -bottom-5 left-0">
            {formErrors.email.message}
          </span>
        )}
      </div>

      {/* Teléfono y Cédula Grid */}
      <div className="grid grid-cols-2 gap-4 pt-1">
        <div className="relative">
          <label htmlFor="telefono" className="sr-only">Teléfono</label>
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
          <input
            id="telefono"
            type="text"
            {...register("telefono")}
            placeholder="Teléfono"
            maxLength={14}
            inputMode="numeric"
            value={phone.value}
            onChange={phone.handleChange}
            onKeyDown={blockNonDigits}
            className="vf-input w-full pl-12 h-[52px]"
          />
          {formErrors.telefono && (
            <span className="text-rose-500 text-[10px] font-medium absolute -bottom-5 left-0">
              {formErrors.telefono.message}
            </span>
          )}
        </div>
        <div className="relative">
          <label htmlFor="cedula" className="sr-only">Cédula</label>
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
          <input
            id="cedula"
            type="text"
            placeholder="Cédula"
            maxLength={13}
            inputMode="numeric"
            className="vf-input w-full pl-12 h-[52px]"
            {...register("cedula", { onChange: cedulaOnChange })}
            onKeyDown={blockNonDigits}
          />
          {formErrors.cedula && (
            <span className="text-rose-500 text-[10px] font-medium absolute -bottom-5 left-0">
              {formErrors.cedula.message}
            </span>
          )}
        </div>
      </div>

      {/* Contraseña */}
      <div className="relative pt-1">
        <label htmlFor="password" className="sr-only">Contraseña</label>
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
        <input
          id="password"
          type="password"
          placeholder="Contraseña de acceso *"
          className="vf-input w-full pl-12 h-[52px]"
          {...register("password")}
        />
        {formErrors.password && (
          <span className="text-rose-500 text-[10px] font-medium absolute -bottom-5 left-0">
            {formErrors.password.message}
          </span>
        )}
      </div>

      <PasswordStrengthSection password={password} checks={checks} />

      <TermsCheckboxSection register={register} formErrors={formErrors} openModal={openModal} />

      {/* CTA Button */}
      <m.button
        whileHover={isValid ? { scale: 1.01 } : {}}
        whileTap={isValid ? { scale: 0.99 } : {}}
        type="submit"
        disabled={isPending}
        className="vf-btn-primary w-full h-[56px] text-base font-bold shadow-floating disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 mt-4"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Procesando Registro...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Crear mi cuenta <ArrowRight className="w-5 h-5" />
          </span>
        )}
      </m.button>
    </form>

    <SocialLoginSection />

    <TermsModal
      modalType={modalType}
      closeModal={closeModal}
      acceptAndCloseModal={acceptAndCloseModal}
    />
  </div>
);
