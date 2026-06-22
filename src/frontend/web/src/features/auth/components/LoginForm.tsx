import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "../schemas";
import { useLogin } from "../api/useAuth";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

export const LoginForm = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginFormValues) =>
    login(data, { 
      onSuccess: () => {
        window.location.hash = "/admin/dashboard";
        window.location.reload();
      }
    });

  return (
    <div className="w-full">
      <div className="mb-10 text-center md:text-left">
        <h3 className="text-2xl font-display font-extrabold text-[#223382] tracking-tight">Iniciar Sesión</h3>
        <p className="text-text-secondary mt-1">Ingresa tus credenciales profesionales para acceder</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium animate-in fade-in duration-200" role="alert">
          {(error as Error).message || "Error de autenticación. Verifique sus credenciales."}
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
            />
            <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors font-medium">
              Recordar sesión
            </span>
          </label>
          <a
            href="#"
            className="text-[13px] text-primary font-bold hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button
          type="submit"
          disabled={isPending}
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
        </button>
      </form>

      <div className="mt-8">
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

        <button
          type="button"
          className="w-full h-[52px] border border-border rounded-xl flex items-center justify-center gap-3 font-sans font-semibold text-text-primary hover:bg-surface-raised transition-all shadow-sm active:scale-[0.98] bg-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-border/50 text-center">
        <p className="text-sm text-text-secondary font-medium">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};
