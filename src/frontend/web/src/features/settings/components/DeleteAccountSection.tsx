import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useDeleteAccount } from "../api/useAccountDeletion";
import { useToast } from "@/shared/components/ui/Toast/ToastContext";
import { useAuth } from "@/shared/context/AuthContext";
import { DeleteAccountModal } from "./DeleteAccountModal";

export const DeleteAccountSection: React.FC = () => {
  const { addToast } = useToast();
  const { logout } = useAuth();
  const deleteAccount = useDeleteAccount();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (data: { confirmation: string; password: string; deletionReason?: string }) => {
    try {
      await deleteAccount.mutateAsync({
        confirmation: data.confirmation,
        password: data.password,
        deletionReason: data.deletionReason,
      });
      addToast("Cuenta marcada para eliminación. Tiene 14 días para recuperarla.", "success");
      // Server already cleared jwt + refreshToken cookies via Set-Cookie
      logout();
      window.location.hash = "#/login";
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Error al solicitar eliminación de cuenta";
      addToast(msg, "error");
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="vf-btn-danger w-full sm:w-auto"
      >
        <Trash2 className="w-4 h-4" />
        Eliminar cuenta
      </button>

      {/* Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        isProcessing={deleteAccount.isPending}
      />
    </>
  );
};