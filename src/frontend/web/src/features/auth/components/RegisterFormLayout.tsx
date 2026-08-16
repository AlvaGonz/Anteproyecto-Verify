import React from "react";
import { m } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: "easeOut" as any },
  },
};
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
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
  telefonoOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  blockNonDigits: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  cedulaOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rncOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  documentType: "cedula" | "rnc";
  toggleDocumentType: () => void;
  isRncValid: boolean | null;
  isValidatingRnc: boolean;
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
  telefonoOnChange,
  blockNonDigits,
  cedulaOnChange,
  rncOnChange,
  documentType,
  toggleDocumentType,
  isRncValid,
  isValidatingRnc,
  openModal,
  closeModal,
  acceptAndCloseModal,
  isPending,
  isValid,
  modalType,
}) => (
  <m.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
    <m.div variants={itemVariants} className="mb-10 text-center md:text-left">
      <h3 className="text-2xl font-display font-extrabold text-[#223382] tracking-tight">Registrarse</h3>
      <p className="text-text-secondary mt-1">Crea tu cuenta para acceder a VeriFinca</p>
    </m.div>

    {error && (
      <m.div variants={itemVariants} className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium" role="alert">
        {(error as Error).message || "Ocurrió un error al crear la cuenta. Intente de nuevo."}
      </m.div>
    )}

    <m.form variants={itemVariants} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {...register("telefono", { onChange: telefonoOnChange })}
            placeholder="Teléfono"
            maxLength={14}
            inputMode="numeric"
            onKeyDown={blockNonDigits}
            className="vf-input w-full pl-12 h-[52px]"
          />
          {formErrors.telefono && (
            <span className="text-rose-500 text-[10px] font-medium absolute -bottom-5 left-0">
              {formErrors.telefono.message}
            </span>
          )}
        </div>
          <div className="relative group flex items-center">
            <label htmlFor={documentType} className="sr-only">
              {documentType === "cedula" ? "Cédula" : "RNC"}
            </label>
            
            {/* Animated Toggle Button (Icon) */}
            <button
              type="button"
              onClick={toggleDocumentType}
              className={`absolute top-[1px] z-10 flex items-center justify-center w-[50px] h-[50px] bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all duration-500 ease-in-out ${
                documentType === "cedula"
                  ? "left-[1px] rounded-l-[11px] rounded-r-none"
                  : "left-[calc(100%-51px)] rounded-l-none rounded-r-[11px]"
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </button>

            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
              <div className="bg-slate-800 text-white text-[10px] font-medium py-1 px-2 rounded whitespace-nowrap shadow-lg">
                Puede seleccionar entre cédula o rnc
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-slate-800"></div>
              </div>
            </div>

            <input
              id={documentType}
              type="text"
              placeholder={documentType === "cedula" ? "Cédula" : "RNC"}
              maxLength={documentType === "cedula" ? 13 : undefined}
              inputMode="numeric"
              className={`vf-input w-full h-[52px] transition-all duration-300 ${
                documentType === "cedula" ? "pl-14 pr-4" : "pl-12 pr-14"
              }`}
              {...(documentType === "cedula" 
                 ? register("cedula", { onChange: cedulaOnChange }) 
                 : register("rnc", { onChange: rncOnChange }))}
              onKeyDown={documentType === "cedula" ? blockNonDigits : undefined}
            />

            {/* Icons */}
            {documentType === "rnc" && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-0">
                {isValidatingRnc ? (
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                ) : isRncValid === true ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isRncValid === false ? (
                  <XCircle className="w-5 h-5 text-rose-500" />
                ) : null}
              </div>
            )}

            {formErrors[documentType] && (
              <span className="text-rose-500 text-[10px] font-medium absolute -bottom-5 left-0">
                {formErrors[documentType]?.message as string}
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
    </m.form>

    <m.div variants={itemVariants}>
      <SocialLoginSection />
    </m.div>

    <TermsModal
      modalType={modalType}
      closeModal={closeModal}
      acceptAndCloseModal={acceptAndCloseModal}
    />
  </m.div>
);
