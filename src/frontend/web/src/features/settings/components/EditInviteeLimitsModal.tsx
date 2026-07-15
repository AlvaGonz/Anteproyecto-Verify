import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Edit3 } from "lucide-react";
import { useUpdateInviteeLimits } from "../api/useSettings";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";

const editLimitsSchema = z.object({
  maxProyectosDelegados: z.string().optional().transform(val => (val === "" || val === undefined) ? null : Number(val)).pipe(z.number().nullable()),
  maxConsultasDelegadas: z.string().optional().transform(val => (val === "" || val === undefined) ? null : Number(val)).pipe(z.number().nullable()),
});

type EditLimitsFormData = z.infer<typeof editLimitsSchema>;

interface EditInviteeLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitee: any;
}

export const EditInviteeLimitsModal: React.FC<EditInviteeLimitsModalProps> = ({ isOpen, onClose, invitee }) => {
  const [pendingConfirmData, setPendingConfirmData] = useState<EditLimitsFormData | null>(null);
  const { addToast } = useToast();
  const updateLimitsMutation = useUpdateInviteeLimits();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditLimitsFormData>({
    resolver: zodResolver(editLimitsSchema),
    defaultValues: {
      maxProyectosDelegados: null,
      maxConsultasDelegadas: null,
    },
  });

  useEffect(() => {
    if (invitee && isOpen) {
      reset({
        maxProyectosDelegados: invitee.maxProyectosDelegados ?? null,
        maxConsultasDelegadas: invitee.maxConsultasDelegadas ?? null,
      });
    }
  }, [invitee, isOpen, reset]);

  const onSubmit = async (data: EditLimitsFormData) => {
    if ((data.maxProyectosDelegados === null || data.maxConsultasDelegadas === null) && !pendingConfirmData) {
      setPendingConfirmData(data);
      return;
    }

    await executeUpdate(data);
  };

  const executeUpdate = async (data: EditLimitsFormData) => {
    try {
      await updateLimitsMutation.mutateAsync({
        inviteeId: invitee.id,
        maxProyectosDelegados: data.maxProyectosDelegados,
        maxConsultasDelegadas: data.maxConsultasDelegadas,
      });
      addToast("Límites actualizados exitosamente", "success");
      setPendingConfirmData(null);
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.Message || "Error al actualizar límites.";
      addToast(errorMessage, "error");
    }
  };

  const handleClose = () => {
    setPendingConfirmData(null);
    onClose();
  };

  if (!isOpen || !invitee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-premium w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface-raised">
          <h2 className="text-xl font-display font-bold text-navy flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Editar Límites - {invitee.nombre}
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
                Has dejado uno o ambos límites en blanco. Esto significa que el usuario invitado 
                <strong> no tendrá restricciones individuales</strong> y consumirá del límite global de tu suscripción.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                ¿Estás seguro de que deseas guardar estos cambios?
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
                onClick={() => executeUpdate(pendingConfirmData)}
                disabled={updateLimitsMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {updateLimitsMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Confirmar Cambios
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <p className="text-sm text-text-secondary mb-4">
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
                placeholder="Ilimitado"
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
                placeholder="Ilimitado"
              />
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
              disabled={isSubmitting || updateLimitsMutation.isPending}
              className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {(isSubmitting || updateLimitsMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Límites"
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
