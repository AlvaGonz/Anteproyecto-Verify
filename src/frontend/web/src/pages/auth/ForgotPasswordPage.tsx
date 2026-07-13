import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { m } from "framer-motion";
import { Mail, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { authApi } from "../../infrastructure/api/auth.api";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../../features/auth/schemas";

export const ForgotPasswordPage: React.FC = () => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsPending(true);
      setError(null);
      await authApi.forgotPassword(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(new Error(err?.response?.data?.message || err?.message || "Ocurrió un error al intentar enviar el correo."));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EC] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <m.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
      />
      <m.div
        animate={{ scale: [1, 1.1, 1], x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"
      />

      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-5xl bg-white border border-border rounded-[32px] shadow-premium flex flex-col md:flex-row overflow-hidden relative z-10"
      >
        <div className="w-full md:w-[400px] bg-[#223382] p-12 text-white relative flex flex-col justify-between overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 border-2 border-white rounded-full" />
            <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 border border-white rounded-full opacity-50" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="mb-10">
              <Link to="/" className="inline-block mb-10 group transition-transform hover:scale-[1.02]">
                <img
                  src="/brand/logotipo/LOGOTIPO WHITE.optimized.svg"
                  alt="VeriFinca Logo"
                  className="h-10 w-auto"
                />
              </Link>
              <div className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary-light mb-4">
                Recuperación Segura
              </div>
              <h2 className="text-4xl font-display font-black leading-[1.1] mb-6 tracking-tighter text-white">
                Restablecer <br />
                <span className="text-primary-light">Contraseña.</span>
              </h2>

              <p className="text-base text-white/70 leading-relaxed font-medium max-w-[280px]">
                Te enviaremos instrucciones seguras a tu correo para que puedas recuperar el acceso a tu cuenta.
              </p>
            </div>

            <div className="space-y-8 flex-1 mt-8">
              <div className="flex gap-5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                  <ShieldCheck className="w-6 h-6 text-primary-light" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-display font-bold text-[15px] leading-tight mb-1 text-white">Proceso Verificado</h4>
                  <p className="text-xs text-white/80 leading-normal">Los enlaces de recuperación tienen una validez temporal por seguridad.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-12 flex items-center justify-center">
          <div className="w-full max-w-[400px]">
            {isSuccess ? (
              <m.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-display font-extrabold text-[#223382] mb-3">Revisa tu correo</h3>
                <p className="text-text-secondary mb-8 leading-relaxed">
                  Si la dirección ingresada está registrada, recibirás un correo con un enlace seguro para restablecer tu contraseña.
                </p>
                <Link
                  to="/login"
                  className="vf-btn-secondary w-full h-[56px] flex items-center justify-center text-base font-bold transition-all"
                >
                  Volver al inicio de sesión
                </Link>
              </m.div>
            ) : (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mb-10 text-center md:text-left">
                  <h3 className="text-2xl font-display font-extrabold text-[#223382] tracking-tight">Recuperar Cuenta</h3>
                  <p className="text-text-secondary mt-1">Ingresa tu correo para recibir las instrucciones</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium animate-in fade-in duration-200" role="alert">
                    {(error as Error).message}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="relative">
                    <label htmlFor="email" className="sr-only">Correo electrónico</label>
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Correo electrónico *"
                      className="vf-input w-full pl-12 pr-4 h-[52px]"
                      {...register("email")}
                    />
                    {formErrors.email && (
                      <span className="text-rose-500 text-xs font-medium absolute -bottom-5 left-0">
                        {formErrors.email.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="vf-btn-primary w-full h-[56px] text-base font-bold shadow-floating disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 mt-4"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Enviar instrucciones <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border/50 text-center">
                  <p className="text-sm text-text-secondary font-medium">
                    ¿Recordaste tu contraseña?{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </m.div>
            )}
          </div>
        </div>
      </m.div>
    </div>
  );
};
