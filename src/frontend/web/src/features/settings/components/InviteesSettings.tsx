import React, { useState } from "react";
import { useRemoveInvitee } from "../api/useSettings";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { Users, UserPlus, UserMinus, Shield } from "lucide-react";
import { InviteUserModal } from "./InviteUserModal";

export const InviteesSettings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeInviteeMutation = useRemoveInvitee();

  const handleRemoveInvitee = async (inviteeId: string) => {
    try {
      await removeInviteeMutation.mutateAsync(inviteeId);
      addToast("Usuario invitado removido exitosamente.", "success");
    } catch (error: any) {
      addToast(error?.response?.data?.Message || "Error al remover usuario.", "error");
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl shadow-premium border border-border p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-display font-bold text-[#223382] flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            Gestión de Usuarios Invitados
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invitar Usuarios
          </button>
        </div>
        <p className="text-text-secondary text-sm mb-6">
          Invita a usuarios a unirse a tu cuenta para compartir acceso a tus proyectos.
        </p>

        {/* Invited users section */}
        <div className="mb-4">
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
      </div>
      
      <InviteUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
