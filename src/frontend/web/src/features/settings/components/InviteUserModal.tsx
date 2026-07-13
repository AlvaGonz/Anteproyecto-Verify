import React, { useState } from "react";
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
  maxProyectosDelegados: z.string().optional().transform(val => (val === "" || val === undefined) ? null : Number(val)),
  maxConsultasDelegadas: z.string().optional().transform(val => (val === "" || val === undefined) ? null : Number(val)),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose }) => {
  const [pendingConfirmData, setPendingConfirmData] = useState<InviteFormData | null>(null);
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
      maxProyectosDelegados: "",
      maxConsultasDelegadas: "",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    if ((data.maxProyectosDelegados === null || data.maxConsultasDelegadas === null) && !pendingConfirmData) {
      setPendingConfirmData(data);
      return;
    }

    await executeInvite(data);
  };

  const executeInvite = async (data: InviteFormData) => {
    try {
      await inviteUserMutation.mutateAsync({
        nombre: data.nombre,
        apellido: data.apellido || "",
        email: data.email,
        telefono: data.telefono || "",
        cedula: data.cedula,
        maxProyectosDelegados: data.maxProyectosDelegados,
        maxConsultasDelegadas: data.maxConsultasDelegadas,
      });
      addToast("Invitación enviada exitosamente", "success");
      setPendingConfirmData(null);
      reset();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.Message || "Error al invitar usuario.";
      addToast(errorMessage, "error");
    }
  };

  const handleClose = () => {
    setPendingConfirmData(null);
    reset();
    onClose();
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
            onClick={handleClose}
            className="text-text-secondary hover:text-navy transition-colors rounded-lg p-1 hover:bg-border/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {pendingConfirmData ? (
          <div className="p-6 space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <h3 className="text-sm font-bold text-yellow-800 mb-2">Advertencia de límites en blanco</h3>
              <p className="text-sm text-yellow-700">
                Has dejado uno o ambos límites (Proyectos o Consultas) en blanco. Esto significa que el usuario invitado 
                <strong> no tendrá restricciones individuales</strong> y podrá consumir del límite global de tu suscripción sin límite propio.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                ¿Estás seguro de que deseas continuar?
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setPendingConfirmData(null)}
                className="px-4 py-2 text-navy font-semibold hover:bg-surface-raised rounded-xl transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => executeInvite(pendingConfirmData)}
                disabled={inviteUserMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {inviteUserMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Confirmar Invitación
              </button>
            </div>
          </div>
        ) : (
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

          <div className="pt-4 border-t border-border mt-4">
            <h3 className="text-sm font-bold text-navy mb-3">Límites Delegados (Opcional)</h3>
            <p className="text-xs text-text-secondary mb-4">
              Si dejas estos campos en blanco, el usuario no tendrá restricciones y compartirá el límite global de tu suscripción.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Límite de Proyectos
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("maxProyectosDelegados")}
                  className="w-full p-2.5 bg-white border border-border focus:border-primary focus:ring-primary/20 rounded-lg text-sm transition-all outline-none focus:ring-4"
                  placeholder="Ej. 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Límite de Consultas
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("maxConsultasDelegadas")}
                  className="w-full p-2.5 bg-white border border-border focus:border-primary focus:ring-primary/20 rounded-lg text-sm transition-all outline-none focus:ring-4"
                  placeholder="Ej. 100"
                />
              </div>
            </div>
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
        )}
      </div>
    </div>
  );
};
