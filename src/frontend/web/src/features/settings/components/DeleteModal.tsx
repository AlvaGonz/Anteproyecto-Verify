import React, { useState, useEffect } from "react";
import { motion as m } from "framer-motion";
import { Trash2 } from "lucide-react";

interface DeleteModalProps {
  deleteId: string | null;
  isProcessing: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ deleteId, isProcessing, onConfirm, onCancel }) => {
  const [confirmText, setConfirmText] = useState("");
  const [prevDeleteId, setPrevDeleteId] = useState<string | null>(null);

  if (deleteId !== prevDeleteId) {
    setPrevDeleteId(deleteId);
    if (!deleteId) setConfirmText("");
  }

  if (!deleteId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-2">¿Eliminar Usuario?</h3>
        <p className="text-sm text-text-secondary mb-4">
          Esta acción no se puede deshacer. El usuario perderá acceso al sistema inmediatamente.
        </p>
        
        <div className="text-left mb-6">
          <label htmlFor="del-modal-confirm" className="block text-xs font-bold text-text-secondary uppercase mb-1">
            Escriba ELIMINAR para confirmar
          </label>
          <input
            id="del-modal-confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="vf-input w-full"
            placeholder="ELIMINAR"
          />
        </div>

        <div className="flex gap-3 justify-center">
          <button type="button"
            onClick={onCancel}
            className="vf-btn-secondary w-full"
          >
            Cancelar
          </button>
          <button type="button"
            onClick={onConfirm}
            disabled={isProcessing || confirmText !== "ELIMINAR"}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sí, Eliminar
          </button>
        </div>
      </m.div>
    </div>
  );
};
