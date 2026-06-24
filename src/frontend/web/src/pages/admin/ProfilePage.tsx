import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../shared/context/AuthContext';
import { UpdateProfileSchema, UpdateProfileDto } from '../../features/auth/schemas';
import { useUpdateProfile } from '../../features/auth/api/useUpdateProfile';
import { useToast } from '../../shared/components/ui/Toast/ToastContext';
import { Lock, Mail, User as UserIcon, Phone, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const updateProfile = useUpdateProfile();
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<UpdateProfileDto>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      telefono: user?.telefono || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: UpdateProfileDto) => {
    try {
      await updateProfile.mutateAsync(data);
      addToast("Perfil actualizado", "success");
      // Optional: hide password section after update
      setShowPasswordSection(false);
    } catch (error: any) {
      addToast(error.message || "Error al actualizar perfil", "error");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#223382] flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-primary" />
          Mi Perfil
        </h1>
        <p className="text-text-secondary mt-2 text-sm font-medium">
          Administra tu información personal y seguridad
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface-raised p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="text-xs font-bold text-text-secondary uppercase mb-4 tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Datos de Cuenta
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Correo Electrónico</label>
                <div className="flex items-center gap-2 p-3 bg-surface rounded-xl opacity-70">
                  <Mail className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Cédula</label>
                <div className="flex items-center gap-2 p-3 bg-surface rounded-xl opacity-70">
                  <span className="text-sm font-medium">{user?.cedula || 'No registrada'}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Rol</label>
                <div className="flex items-center gap-2 p-3 bg-surface rounded-xl opacity-70">
                  <span className="text-sm font-medium capitalize">{user?.role}</span>
                </div>
              </div>
              
              <p className="text-[10px] text-text-secondary mt-2">Estos datos no pueden ser modificados. Contacta soporte si necesitas actualizarlos.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-border">
            <h2 className="text-lg font-bold text-[#223382] mb-6">Información Personal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Nombre Completo</label>
                <input
                  type="text"
                  {...register("name")}
                  className={`vf-input w-full ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Ej. Juan Pérez"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Teléfono</label>
                <input
                  type="text"
                  {...register("telefono")}
                  className={`vf-input w-full ${errors.telefono ? 'border-red-500' : ''}`}
                  placeholder="(809) 000-0000"
                />
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
              </div>
            </div>

            <div className="border-t border-border pt-6 mb-8">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FEE2E2] text-red-600 rounded-lg">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-[#223382]">Cambiar contraseña</h3>
                    <p className="text-xs text-text-secondary">Opcional. Deja en blanco si no quieres cambiarla.</p>
                  </div>
                </div>
                {showPasswordSection ? <ChevronUp className="text-text-secondary" /> : <ChevronDown className="text-text-secondary" />}
              </button>

              <AnimatePresence>
                {showPasswordSection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-surface-raised rounded-xl mt-4 space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-xs font-bold text-text-secondary uppercase mb-1">Contraseña Actual</label>
                        <input
                          id="currentPassword"
                          type="password"
                          {...register("currentPassword")}
                          className={`vf-input w-full ${errors.currentPassword ? 'border-red-500' : ''}`}
                        />
                        {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="newPassword" className="block text-xs font-bold text-text-secondary uppercase mb-1">Nueva Contraseña</label>
                          <input
                            id="newPassword"
                            type="password"
                            {...register("newPassword")}
                            className={`vf-input w-full ${errors.newPassword ? 'border-red-500' : ''}`}
                          />
                          {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-xs font-bold text-text-secondary uppercase mb-1">Confirmar Nueva</label>
                          <input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword")}
                            className={`vf-input w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          />
                          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || updateProfile.isPending}
                className="vf-btn-primary px-8"
              >
                {isSubmitting || updateProfile.isPending ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
