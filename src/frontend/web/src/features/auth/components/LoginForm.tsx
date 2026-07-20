import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { m } from "framer-motion";
import { loginSchema, type LoginFormValues } from "../schemas";
import { useAuth } from "../../../shared/context/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";


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

export const LoginForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified") === "true";
  const verificationError = searchParams.get("error");
  const redirectUrl = searchParams.get("redirect");
  
  const { login, error: authError } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setIsPending(true);
    const user = await login(data.email, data.password);
    if (!user) {
      setIsPending(false);
      return; // authError is set by AuthContext, shows on next render
    }
    // Soft update for browser state (React Router navigation)
    if (redirectUrl) {
      navigate(redirectUrl);
    } else {
      navigate("/admin/dashboard");
    }
  };

  return (
    <m.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
      <m.div variants={itemVariants} className="mb-10 text-center md:text-left">
        <h3 className="text-2xl font-display font-extrabold text-[#223382] tracking-tight">Iniciar Sesión</h3>
        <p className="text-text-secondary mt-1">Ingresa tus credenciales profesionales para acceder</p>
      </m.div>

      {authError && (
        <m.div variants={itemVariants} className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium" role="alert">
          {authError?.message || "No encontramos una cuenta con este correo. ¿Desea registrarse?"}
        </m.div>
      )}

      {verified && (
        <m.div variants={itemVariants} className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-r-xl text-sm font-medium" role="alert">
          ¡Correo electrónico verificado con éxito! Ya puede iniciar sesión.
        </m.div>
      )}

      {verificationError && (
        <m.div variants={itemVariants} className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium" role="alert">
          {verificationError}
        </m.div>
      )}

      <m.form variants={itemVariants} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="relative">
          <label htmlFor="password" className="sr-only">Contraseña</label>
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña *"
            className="vf-input w-full pl-12 pr-12 h-[52px]"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-border hover:text-text-primary transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {formErrors.password && (
            <span className="text-rose-500 text-xs font-medium absolute -bottom-5 left-0">
              {formErrors.password.message}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end pt-1">
          <Link
            to="/forgot-password"
            className="text-[13px] text-primary font-bold hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <m.button
          type="submit"
          disabled={isPending}
          whileHover={!isPending ? { scale: 1.01 } : {}}
          whileTap={!isPending ? { scale: 0.98 } : {}}
          className="vf-btn-primary w-full h-[56px] text-base font-bold shadow-floating disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 mt-4"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Iniciar sesión <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </m.button>
      </m.form>

      <m.div variants={itemVariants} className="mt-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-text-secondary uppercase tracking-widest font-black text-[10px]">
              O CONTINUAR CON
            </span>
          </div>
        </div>

        <GoogleSignInButton />
      </m.div>

      <m.div variants={itemVariants} className="mt-8 pt-6 border-t border-border/50 text-center">
        <p className="text-sm text-text-secondary font-medium">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </m.div>
    </m.div>
  );
};
