import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface DeleteModalProps {
  deleteId: string | null;
  isProcessing: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ deleteId, isProcessing, onConfirm, onCancel }) => {
  if (!deleteId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-2">¿Eliminar Usuario?</h3>
        <p className="text-sm text-text-secondary mb-6">
          Esta acción no se puede deshacer. El usuario perderá acceso al sistema inmediatamente.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="vf-btn-secondary w-full"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Sí, Eliminar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
