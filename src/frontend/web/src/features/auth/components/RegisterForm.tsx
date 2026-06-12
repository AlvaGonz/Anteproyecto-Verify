import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { registerSchema, type RegisterFormValues } from "../schemas";
import { useRegister } from "../api/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Lock, 
  Check, 
  X, 
  Loader2, 
  ArrowRight, 
  ShieldCheck 
} from "lucide-react";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { mutate: register_, isPending, error } = useRegister();
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors: formErrors, isValid },
  } = useForm<RegisterFormValues>({ 
    resolver: zodResolver(registerSchema),
    mode: "onChange" 
  });

  const onSubmit = (data: RegisterFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { acceptedTerms: _, ...submitData } = data;
    register_(submitData, { onSuccess: () => navigate("/admin/dashboard") });
  };

  const password = watch("password") || "";
  const isMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*\-]/.test(password);

  const blockNonDigits = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
    if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const openModal = (type: "terms" | "privacy") => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  const acceptAndCloseModal = () => {
    setValue("acceptedTerms", true, { shouldValidate: true, shouldDirty: true });
    setModalType(null);
  };

  return (
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
              placeholder="Teléfono"
              maxLength={14}
              inputMode="numeric"
              className="vf-input w-full pl-12 h-[52px]"
              {...register("telefono", {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length > 0) {
                    if (val.length <= 3) val = `(${val}`;
                    else if (val.length <= 6) val = `(${val.slice(0, 3)}) ${val.slice(3)}`;
                    else val = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6, 10)}`;
                  }
                  setValue("telefono", val, { shouldValidate: true, shouldDirty: true });
                }
              })}
              onKeyDown={blockNonDigits}
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
              {...register("cedula", {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length > 3 && val.length <= 10) val = `${val.slice(0, 3)}-${val.slice(3)}`;
                  else if (val.length > 10) val = `${val.slice(0, 3)}-${val.slice(3, 10)}-${val.slice(10, 11)}`;
                  setValue("cedula", val, { shouldValidate: true, shouldDirty: true });
                }
              })}
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

        {/* Premium Live Password Criteria Checker */}
        {password.length > 0 && (
          <div className="p-4 bg-slate-50 border border-border/80 rounded-xl space-y-2 text-xs text-text-secondary transition-all animate-in fade-in duration-200">
            <p className="font-bold text-[#223382] mb-1">Requisitos de seguridad:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                {isMinLength ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <X className="w-4 h-4 text-rose-400" />}
                <span className={isMinLength ? "text-emerald-700 font-medium" : ""}>Mínimo 8 caracteres</span>
              </div>
              <div className="flex items-center gap-2">
                {hasUpper ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <X className="w-4 h-4 text-rose-400" />}
                <span className={hasUpper ? "text-emerald-700 font-medium" : ""}>Al menos 1 Mayúscula</span>
              </div>
              <div className="flex items-center gap-2">
                {hasLower ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <X className="w-4 h-4 text-rose-400" />}
                <span className={hasLower ? "text-emerald-700 font-medium" : ""}>Al menos 1 Minúscula</span>
              </div>
              <div className="flex items-center gap-2">
                {hasNumber ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <X className="w-4 h-4 text-rose-400" />}
                <span className={hasNumber ? "text-emerald-700 font-medium" : ""}>Al menos 1 Número</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                {hasSpecial ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <X className="w-4 h-4 text-rose-400" />}
                <span className={hasSpecial ? "text-emerald-700 font-medium" : ""}>Al menos 1 Carácter Especial (!@#$%^&*-)</span>
              </div>
            </div>
          </div>
        )}

        {/* Terms of Service Checkbox */}
        <div className="pb-2 pt-2 relative">
          <label className="flex gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary/20" 
              {...register("acceptedTerms")}
            />
            <span className="text-[13px] text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
              Acepto los{" "}
              <button
                type="button"
                onClick={() => openModal("terms")}
                className="font-bold text-primary hover:underline bg-transparent border-none p-0 cursor-pointer inline"
              >
                términos de uso
              </button>{" "}
              y la{" "}
              <button
                type="button"
                onClick={() => openModal("privacy")}
                className="font-bold text-primary hover:underline bg-transparent border-none p-0 cursor-pointer inline"
              >
                política de privacidad
              </button>
              .
            </span>
          </label>
          {formErrors.acceptedTerms && (
            <span className="text-rose-500 text-[10px] font-medium absolute -bottom-3 left-7">
              {formErrors.acceptedTerms.message}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={isValid ? { scale: 1.01 } : {}}
          whileTap={isValid ? { scale: 0.99 } : {}}
          type="submit"
          disabled={isPending || !isValid}
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
        </motion.button>
      </form>

      {/* Social Google Registration */}
      <div className="mt-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-text-secondary uppercase tracking-widest font-black text-[10px]">O CONTINUAR CON</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full h-[52px] border border-border rounded-xl flex items-center justify-center gap-3 font-sans font-semibold text-text-primary hover:bg-surface-raised transition-all shadow-sm active:scale-[0.98] bg-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-border/50 text-center">
        <p className="text-sm text-text-secondary font-medium">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      {/* Premium Terms of Use & Privacy Policy Modal (EULA) */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-premium border border-border overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-[#223382] text-white">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#22c55e]" />
                  <h3 className="text-xl font-display font-bold text-white">
                    {modalType === "terms" 
                      ? "Términos de Uso y EULA" 
                      : "Política de Privacidad de Datos"}
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="p-8 overflow-y-auto space-y-6 text-sm text-text-secondary leading-relaxed font-sans scrollbar-thin">
                {modalType === "terms" ? (
                  <>
                    <p className="font-semibold text-text-primary">
                      Acuerdo de Licencia de Usuario Final (EULA) y Condiciones Generales de Uso de VeriFinca.
                    </p>
                    
                    <div className="space-y-4">
                      <h4 className="font-bold text-[#223382] text-base">1. Aceptación del Acuerdo</h4>
                      <p>
                        Al registrarse y utilizar los servicios de VeriFinca, usted acepta expresamente quedar vinculado por los términos de este Acuerdo de Licencia de Usuario Final (EULA). Si no está de acuerdo con estos términos, no podrá crear una cuenta ni utilizar la plataforma.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-[#223382] text-base">2. Licencia de Uso Limitada</h4>
                      <p>
                        VeriFinca otorga al usuario una licencia personal, revocable, no exclusiva y no transferible para utilizar la plataforma únicamente con fines profesionales de evaluación, gestión y validación de proyectos inmobiliarios. Queda estrictamente prohibida la ingeniería inversa, copia o distribución comercial no autorizada del software.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-[#223382] text-base">3. Uso Aceptable y Restricciones</h4>
                      <p>
                        Como usuario, usted se compromete a no proporcionar información falsa, alterada o no autorizada. Toda documentación catastral, planos, certificados de título y cédulas de identidad subidas a la plataforma deben ser legítimos y contar con la debida autorización de los titulares correspondientes.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-[#223382] text-base">4. Veracidad de las Consultas Institucionales</h4>
                      <p>
                        La plataforma realiza integraciones con bases de datos externas (DGII, Catastro Nacional, Ayuntamientos). El usuario reconoce que VeriFinca procesa e indexa estos datos con propósitos informativos de validación de m² y solvencia fiscal, y que cualquier discrepancia legal deberá ser resuelta directamente ante el organismo correspondiente.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-[#223382] text-base">5. Limitación de Responsabilidad</h4>
                      <p>
                        VeriFinca se ofrece "tal cual" y no se hace responsable por pérdidas financieras, retrasos en aprobaciones de construcción o daños directos/indirectos resultantes del uso o la imposibilidad de uso de la plataforma.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-text-primary">
                      Declaración de Privacidad de Datos y Confidencialidad de la Información.
                    </p>

                    <div className="space-y-4">
                      <h4 className="font-bold text-[#223382] text-base">1. Información que Recopilamos</h4>
                      <p>
                        Para habilitar el acceso institucional y la validación de proyectos inmobiliarios, recopilamos información de contacto (nombres, apellidos, correo electrónico, teléfono) y datos de identificación fiscal y legal del usuario (número de Cédula de Identidad y Electoral).
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-[#223382] text-base">2. Uso Obligatorio de los Datos</h4>
                      <p>
                        Los datos personales recopilados se utilizan estrictamente para:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Validar la identidad del profesional ante los portales gubernamentales.</li>
                        <li>Hashear y almacenar credenciales de acceso bajo estándares de criptografía industrial (BCrypt).</li>
                        <li>Emitir sellos digitales de integridad y generar reportes analíticos de m² y cumplimiento.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-[#223382] text-base">3. Medidas de Seguridad de la Información</h4>
                      <p>
                        Toda información confidencial, incluyendo claves, documentos de identidad y planos, se almacena en bases de datos protegidas y servidores seguros con cifrado de extremo a extremo (AES-256) y canales de comunicación cifrados mediante HTTPS. Sus contraseñas se almacenan únicamente como hashes irreversibles.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-[#223382] text-base">4. Compartición de Datos con Terceros</h4>
                      <p>
                        VeriFinca no vende, alquila ni comparte datos de carácter personal con anunciantes o empresas externas. Las consultas a la DGII o Catastro se realizan a través de APIs cifradas únicamente para la ejecución de las validaciones solicitadas por el usuario.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-border bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 h-[44px] rounded-xl border border-border bg-white text-sm font-semibold text-text-primary hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={acceptAndCloseModal}
                  className="px-6 h-[44px] rounded-xl bg-[#223382] text-sm font-bold text-white hover:bg-[#1a2663] transition-colors shadow-sm flex items-center justify-center gap-2 focus:outline-none"
                >
                  <Check className="w-4 h-4 font-bold" /> Aceptar y Continuar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
