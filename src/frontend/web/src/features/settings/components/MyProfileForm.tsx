import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileSchema, UpdateProfileDto } from "../../auth/schemas";
import { useAuth } from "../../../shared/context/AuthContext";
import { useUpdateMyProfile } from "../api/useSettings";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { User, Mail, Phone, Shield, Lock, Eye, EyeOff, ChevronDown, CreditCard } from "lucide-react";

export const MyProfileForm: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const updateProfile = useUpdateMyProfile();
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileDto>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      telefono: user?.telefono ?? "",
      changePassword: false,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        telefono: user.telefono ?? "",
        changePassword: false,
      });
    }
  }, [user, reset]);

  const changePassword = watch("changePassword");

  const togglePasswordSection = () => {
    const next = !showPasswordSection;
    setShowPasswordSection(next);
    setValue("changePassword", next, { shouldDirty: true });
    if (!next) {
      setValue("currentPassword", "");
      setValue("newPassword", "");
      setValue("confirmPassword", "");
    }
  };

  const onSubmit = async (data: UpdateProfileDto) => {
    try {
      await updateProfile.mutateAsync({
        name: data.name,
        telefono: data.telefono || undefined,
        ...(data.changePassword && {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      addToast("Perfil actualizado correctamente", "success");
      setShowPasswordSection(false);
      setValue("changePassword", false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al actualizar perfil";
      addToast(msg, "error");
    }
  };

  const roleLabel: Record<string, string> = {
    admin: "Administrador",
    dev: "Desarrollador",
    validator: "Validador",
    user: "Usuario",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      {/* READ-ONLY identity section */}
      <div className="bg-surface-raised/30 border border-border rounded-2xl p-5 space-y-3">
        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">
          Datos de Identidad
        </p>
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-text-secondary shrink-0" />
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold">Correo Electrónico</p>
            <p className="text-sm font-mono text-text-primary">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="w-4 h-4 text-text-secondary shrink-0" />
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold">Cédula</p>
            <p className="text-sm font-mono text-text-primary">{user?.cedula || "N/A"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-text-secondary shrink-0" />
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold">Rol</p>
            <p className="text-sm font-bold text-text-primary">
              {roleLabel[user?.role ?? "user"] ?? user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* EDITABLE fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
            Nombre Completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              {...register("name")}
              type="text"
              className="vf-input w-full pl-9"
              placeholder="Tu nombre completo"
            />
          </div>
          {errors.name && (
            <p className="text-[10px] text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
            Teléfono
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              {...register("telefono")}
              type="text"
              maxLength={14}
              className="vf-input w-full pl-9"
              placeholder="(809) 000-0000"
            />
          </div>
          {errors.telefono && (
            <p className="text-[10px] text-red-500 mt-1">{errors.telefono.message}</p>
          )}
        </div>
      </div>

      {/* COLLAPSIBLE password change */}
      <div className="border border-border rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={togglePasswordSection}
          className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-text-primary hover:bg-surface-raised/20 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Cambiar Contraseña
          </span>
          <ChevronDown
            className={`w-4 h-4 text-text-secondary transition-transform ${showPasswordSection ? "rotate-180" : ""
              }`}
          />
        </button>

        {showPasswordSection && (
          <div className="px-5 pb-5 pt-2 space-y-4 border-t border-border bg-surface-raised/10">
            {[
              { field: "currentPassword" as const, label: "Contraseña Actual", show: showCurrentPwd, toggle: () => setShowCurrentPwd(p => !p) },
              { field: "newPassword" as const, label: "Nueva Contraseña", show: showNewPwd, toggle: () => setShowNewPwd(p => !p) },
              { field: "confirmPassword" as const, label: "Confirmar Nueva Contraseña", show: showNewPwd, toggle: () => { } },
            ].map(({ field, label, show, toggle }) => (
              <div key={field}>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{label}</label>
                <div className="relative">
                  <input
                    {...register(field)}
                    type={show ? "text" : "password"}
                    className="vf-input w-full pr-9"
                    autoComplete="new-password"
                  />
                  {field !== "confirmPassword" && (
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors[field] && (
                  <p className="text-[10px] text-red-500 mt-1">{errors[field]?.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          className="vf-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {updateProfile.isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
};
