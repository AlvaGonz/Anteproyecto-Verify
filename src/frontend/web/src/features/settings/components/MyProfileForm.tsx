import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileSchema, UpdateProfileDto } from "../../auth/schemas";
import { useAuth } from "../../../shared/context/AuthContext";
import { useUpdateMyProfile, useUploadAvatar } from "../api/useSettings";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { usePhoneInput } from "@/shared/hooks/usePhoneInput";
import { User, Mail, Phone, Shield, Lock, Eye, EyeOff, ChevronDown, CreditCard, Award, Camera, Loader2 } from "lucide-react";

export const MyProfileForm: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const updateProfile = useUpdateMyProfile();
  const uploadAvatar = useUploadAvatar();
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast("La imagen no debe exceder los 5MB", "error");
      return;
    }

    try {
      await uploadAvatar.mutateAsync(file);
      addToast("Avatar actualizado correctamente", "success");
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Error al actualizar avatar", "error");
    }
  };

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
      nombre: user?.nombre ?? "",
      apellido: user?.apellido ?? "",
      telefono: user?.telefono ?? "",
      changePassword: false,
    },
});

   // Phone input hook
   const phoneValueRaw = watch("telefono") ? watch("telefono").replace(/\D/g, '') : "";
   const phone = usePhoneInput(phoneValueRaw, (formattedValue) => {
     const digits = formattedValue.replace(/\D/g, '');
     setValue("telefono", digits, { shouldValidate: true, shouldDirty: true });
   });

   useEffect(() => {
     refreshUser();
   }, [refreshUser]);

  useEffect(() => {
    if (user) {
      reset({
        nombre: user.nombre ?? "",
        apellido: user.apellido ?? "",
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
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono || undefined,
        ...(data.changePassword && {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      await refreshUser();
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
      {/* AVATAR SECTION */}
      <div className="flex flex-col items-center justify-center space-y-4 mb-6">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-raised/30 shadow-md">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl.startsWith('data:') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold uppercase">
                {user?.nombre?.[0] || user?.email?.[0] || "?"}
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {uploadAvatar.isPending ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/jpeg, image/jpg" 
          onChange={handleAvatarChange} 
        />
        <div className="text-center">
          <p className="text-sm font-bold text-text-primary">Foto de perfil</p>
          <p className="text-xs text-text-secondary">JPG o PNG, máx 5MB</p>
        </div>
      </div>

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
        {user?.role !== "admin" && user?.plan && (
          <div className="flex items-center gap-3">
            <Award className="w-4 h-4 text-text-secondary shrink-0" />
            <div>
              <p className="text-[10px] text-text-secondary uppercase font-bold">Plan de Suscripción</p>
              <p className="text-sm font-bold text-primary">
                {user.plan}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* EDITABLE fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Nombre
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                {...register("nombre")}
                type="text"
                className="vf-input w-full pl-9"
                placeholder="Tu nombre"
              />
            </div>
            {errors.nombre && (
              <p className="text-[10px] text-red-500 mt-1">{errors.nombre.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Apellido
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                {...register("apellido")}
                type="text"
                className="vf-input w-full pl-9"
                placeholder="Tu apellido"
              />
            </div>
            {errors.apellido && (
              <p className="text-[10px] text-red-500 mt-1">{errors.apellido.message}</p>
            )}
          </div>
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
                inputMode="numeric"
                value={phone.value}
                onChange={phone.handleChange}
                onKeyDown={(e) => {
                  const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
                  if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
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
