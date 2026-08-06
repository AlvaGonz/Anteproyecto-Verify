import React, { useState } from "react";
import { useRemoveInvitee } from "../api/useSettings";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { Users, UserPlus, UserMinus, Edit3, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { InviteUserModal } from "./InviteUserModal";
import { EditInviteeLimitsModal } from "./EditInviteeLimitsModal";

const SLOTS_PER_PAGE = 10;

export const InviteesSettings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedInvitee, setSelectedInvitee] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [userToRemove, setUserToRemove] = useState<any>(null);
  const [page, setPage] = useState(1);

  const removeInviteeMutation = useRemoveInvitee();

  const confirmRemoveInvitee = async () => {
    if (!userToRemove) return;
    try {
      await removeInviteeMutation.mutateAsync(userToRemove.id);
      addToast("Usuario invitado removido exitosamente.", "success");
      setUserToRemove(null);
    } catch (error: any) {
      addToast(error?.response?.data?.Message || "Error al remover usuario.", "error");
    }
  };

  const handleEditLimits = (invitee: any) => {
    setSelectedInvitee(invitee);
    setIsEditModalOpen(true);
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
          {(!(user as any)?.inviteesList || (user as any).inviteesList.length === 0) && (!(user as any)?.maxUsuariosSecundarios) ? (
            <div className="p-6 bg-surface-raised/50 rounded-xl border border-dashed border-border text-center text-text-secondary">
              No tienes usuarios invitados en tu cuenta actualmente.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                // Determine the maximum limit to display (use DB limit or fallback to 5 for Profesional as requested)
                let limit = (user as any)?.maxUsuariosSecundarios || 0;
                // If limit is 0 or undefined, but user says they have limit of 5, we enforce visual 5 if plan is Profesional
                if (limit <= 0 && (user as any)?.plan === "Profesional") {
                  limit = 5;
                } else if (limit <= 0) {
                  // Fallback to the length of current invitees if no limit is set
                  limit = Math.max((user as any)?.inviteesList?.length || 0, 5);
                }

                const invitees = (user as any)?.inviteesList || [];
                const slots = [];

                for (let i = (page - 1) * SLOTS_PER_PAGE; i < limit && i < page * SLOTS_PER_PAGE; i++) {
                  const invitee = invitees[i];
                  if (invitee) {
                    slots.push(
                      <div key={invitee.id} className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-text-primary">{invitee.nombre} {invitee.apellido}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-text-secondary">{invitee.email}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              invitee.estado === 'Activo' ? 'bg-green-100 text-green-700' :
                              invitee.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {invitee.estado}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs text-text-secondary">
                              <span className="font-semibold text-navy">Proyectos:</span> {invitee.proyectosCreados} / {invitee.maxProyectosDelegados === null ? '∞' : invitee.maxProyectosDelegados}
                            </p>
                            <p className="text-xs text-text-secondary">
                              <span className="font-semibold text-navy">Consultas:</span> {invitee.consultasUsadas} / {invitee.maxConsultasDelegadas === null ? '∞' : invitee.maxConsultasDelegadas}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditLimits(invitee)}
                            className="p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                            title="Editar límites"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserToRemove(invitee)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Remover invitado"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    slots.push(
                      <div key={`empty-${i}`} className="bg-surface-raised/30 p-4 rounded-xl border border-dashed border-border shadow-sm flex flex-col items-center justify-center text-center min-h-[120px] transition-colors hover:bg-surface-raised/50">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <UserPlus className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-navy">Espacio Disponible</p>
                        <p className="text-xs text-text-secondary mt-1">Click en "Invitar Usuarios" para asignar</p>
                      </div>
                    );
                  }
                }
                return slots;
              })()}
            </div>
          )}

          {(() => {
            let limit = (user as any)?.maxUsuariosSecundarios || 0;
            if (limit <= 0 && (user as any)?.plan === "Profesional") limit = 5;
            else if (limit <= 0) limit = Math.max((user as any)?.inviteesList?.length || 0, 5);
            const totalPages = Math.ceil(limit / SLOTS_PER_PAGE) || 1;
            if (totalPages <= 1) return null;
            return (
              <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border/50">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-surface-raised disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-text-secondary">Página {page} de {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-surface-raised disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })()}
        </div>
      </div>
      
      {/* Remove Confirmation Modal */}
      {userToRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Remover Invitado?</h3>
              <p className="text-gray-600 mb-6">
                Estás a punto de remover a <span className="font-semibold">{userToRemove.nombre} {userToRemove.apellido}</span> de tu cuenta corporativa. Esta acción no se puede deshacer y el usuario perderá acceso a los proyectos compartidos.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setUserToRemove(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveInvitee}
                  disabled={removeInviteeMutation.isPending}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {removeInviteeMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Remover"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <InviteUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditInviteeLimitsModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInvitee(null);
        }}
        invitee={selectedInvitee}
      />
    </div>
  );
};
