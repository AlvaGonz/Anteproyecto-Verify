import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { registerSchema, type RegisterFormValues } from "../schemas";
import { useRegister } from "../api/useAuth";
import { FormField } from "@/components/ui/FormField";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { mutate: register_, isPending, error } = useRegister();

  const { register, handleSubmit, formState: { errors } } =
    useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = ({ confirmPassword: _, ...data }: RegisterFormValues) =>
    register_(data, { onSuccess: () => navigate("/dashboard") });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm" noValidate>
      <h1 className="text-2xl font-semibold text-gray-900">Crear cuenta</h1>

      {error && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {(error as Error).message}
        </div>
      )}

      <FormField label="Nombre completo" htmlFor="nombre" error={errors.nombre?.message} required>
        <input id="nombre" type="text" autoComplete="name"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("nombre")} />
      </FormField>

      <FormField label="Correo electrónico" htmlFor="email" error={errors.email?.message} required>
        <input id="email" type="email" autoComplete="email"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("email")} />
      </FormField>

      <FormField label="Contraseña" htmlFor="password" error={errors.password?.message} required>
        <input id="password" type="password" autoComplete="new-password"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("password")} />
      </FormField>

      <FormField label="Confirmar contraseña" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
        <input id="confirmPassword" type="password" autoComplete="new-password"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          {...register("confirmPassword")} />
      </FormField>

      <button type="submit" disabled={isPending}
        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 transition-colors">
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tiene cuenta?{" "}
        <Link to="/login" className="text-teal-700 hover:underline font-medium">Ingresar</Link>
      </p>
    </form>
  );
};
