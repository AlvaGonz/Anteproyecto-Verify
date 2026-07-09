import React from "react";
import { usePotentialInvitees, useAddInvitee, useRemoveInvitee } from "../api/useSettings";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { Users, UserPlus, UserMinus, Loader2, Shield } from "lucide-react";

export const InviteesSettings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const { data: potentialInvitees = [], isLoading: isLoadingPotential } = usePotentialInvitees();
  const addInviteeMutation = useAddInvitee();
  const removeInviteeMutation = useRemoveInvitee();

  const handleAddInvitee = async (inviteeId: string) => {
    try {
      await addInviteeMutation.mutateAsync(inviteeId);
      addToast("Usuario invitado agregado exitosamente.", "success");
    } catch (error: any) {
      addToast(error?.response?.data?.Message || "Error al agregar usuario.", "error");
    }
  };

  const handleRemoveInvitee = async (inviteeId: string) => {
    try {
      await removeInviteeMutation.mutateAsync(inviteeId);
      addToast("Usuario invitado removido exitosamente.", "success");
    } catch (error: any) {
      addToast(error?.response?.data?.Message || "Error al remover usuario.", "error");
    }
  };

  if (isLoadingPotential) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#223382]" />
        <p className="mt-4 text-sm font-medium text-text-secondary">Cargando usuarios potenciales...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl shadow-premium border border-border p-8">
        <h2 className="text-2xl font-display font-bold text-[#223382] mb-2 flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          Gestión de Usuarios Invitados
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          Invita a usuarios a unirse a tu cuenta para compartir acceso a tus proyectos.
        </p>

        {/* Invited users section */}
        <div className="mb-8">
          <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Usuarios Actualmente Invitados
          </h3>
          {(!(user as any)?.inviteesList || (user as any).inviteesList.length === 0) ? (
            <div className="p-6 bg-surface-raised/50 rounded-xl border border-dashed border-border text-center text-text-secondary">
              No tienes usuarios invitados en tu cuenta actualmente.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(user as any).inviteesList.map((invitee: any) => (
                <div key={invitee.id} className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-text-primary">{invitee.nombre} {invitee.apellido}</h4>
                    <p className="text-xs text-text-secondary">{invitee.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInvitee(invitee.id)}
                    disabled={removeInviteeMutation.isPending}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Remover invitado"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Potential users section */}
        <div>
          <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Usuarios Disponibles para Invitar
          </h3>
          {potentialInvitees.length === 0 ? (
            <div className="p-6 bg-surface-raised/50 rounded-xl border border-dashed border-border text-center text-text-secondary">
              No hay usuarios disponibles para invitar en este momento. (Deben tener cuenta sin plan).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {potentialInvitees.map((pUser) => (
                <div key={pUser.id} className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-between hover:border-primary/30 transition-colors">
                  <div>
                    <h4 className="font-bold text-text-primary">{pUser.nombre} {pUser.apellido}</h4>
                    <p className="text-xs text-text-secondary">{pUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddInvitee(pUser.id)}
                    disabled={addInviteeMutation.isPending}
                    className="p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Invitar usuario"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
