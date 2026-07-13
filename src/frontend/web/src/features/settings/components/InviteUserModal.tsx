import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, UserPlus, Loader2 } from "lucide-react";
import { useInviteUser } from "../api/useSettings";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";

const inviteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().optional(),
  cedula: z.string().min(1, "La cédula es requerida"),
  telefono: z.string().optional(),
  email: z.string().email("Correo electrónico inválido").min(1, "El correo es requerido"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const inviteUserMutation = useInviteUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      cedula: "",
      telefono: "",
      email: "",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteUserMutation.mutateAsync({
        nombre: data.nombre,
        apellido: data.apellido || "",
        email: data.email,
        telefono: data.telefono || "",
        cedula: data.cedula,
      });
      addToast("Invitación enviada exitosamente", "success");
      reset();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.Message || "Error al invitar usuario.";
      addToast(errorMessage, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-premium w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface-raised">
          <h2 className="text-xl font-display font-bold text-navy flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invitar Usuario
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-navy transition-colors rounded-lg p-1 hover:bg-border/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("nombre")}
                className={`w-full p-2.5 bg-white border ${
                  errors.nombre ? "border-red-500 focus:ring-red-500" : "border-border focus:border-primary focus:ring-primary/20"
                } rounded-lg text-sm transition-all outline-none focus:ring-4`}
                placeholder="Ej. Juan"
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Apellido
              </label>
              <input
                type="text"
                {...register("apellido")}
                className="w-full p-2.5 bg-white border border-border focus:border-primary focus:ring-primary/20 rounded-lg text-sm transition-all outline-none focus:ring-4"
                placeholder="Ej. Pérez"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Cédula / Pasaporte <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("cedula")}
                className={`w-full p-2.5 bg-white border ${
                  errors.cedula ? "border-red-500 focus:ring-red-500" : "border-border focus:border-primary focus:ring-primary/20"
                } rounded-lg text-sm transition-all outline-none focus:ring-4`}
                placeholder="Ej. 00100000000"
              />
              {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Teléfono
              </label>
              <input
                type="text"
                {...register("telefono")}
                className="w-full p-2.5 bg-white border border-border focus:border-primary focus:ring-primary/20 rounded-lg text-sm transition-all outline-none focus:ring-4"
                placeholder="Ej. 8090000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full p-2.5 bg-white border ${
                errors.email ? "border-red-500 focus:ring-red-500" : "border-border focus:border-primary focus:ring-primary/20"
              } rounded-lg text-sm transition-all outline-none focus:ring-4`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-surface-raised hover:bg-border/50 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || inviteUserMutation.isPending}
              className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {(isSubmitting || inviteUserMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Invitando...
                </>
              ) : (
                "Invitar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
