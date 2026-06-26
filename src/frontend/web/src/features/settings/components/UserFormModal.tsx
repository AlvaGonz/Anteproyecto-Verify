import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { UserSettings, CreateUserDto } from "../types/settings.types";
import { usePhoneInput } from "@/shared/hooks/usePhoneInput";

interface UserFormModalProps {
  isOpen: boolean;
  editingUser: UserSettings | null;
  formData: CreateUserDto;
  isProcessing: boolean;
  onChange: (data: CreateUserDto) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  editingUser,
  formData,
  isProcessing,
  onChange,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  const update = (partial: Partial<CreateUserDto>) => onChange({ ...formData, ...partial });
  const phone = usePhoneInput(
    formData.telefono ? formData.telefono.replace(/\D/g, '') : "",
    (formattedValue) => {
      const digits = formattedValue.replace(/\D/g, '');
      update({ telefono: digits });
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-raised/30">
          <h2 className="text-lg font-bold text-[#223382]">
            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Nombre</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={e => update({ nombre: e.target.value })}
                className="vf-input w-full"
                placeholder="Ej. Juan"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Apellido</label>
              <input
                type="text"
                required
                value={formData.apellido}
                onChange={e => update({ apellido: e.target.value })}
                className="vf-input w-full"
                placeholder="Ej. Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Correo Electrónico</label>
            <input
              type="email"
              required={!editingUser}
              value={formData.email}
              readOnly={!!editingUser}
              onChange={editingUser ? undefined : (e) => update({ email: e.target.value })}
              className={`vf-input w-full ${editingUser ? "bg-surface-raised/30 opacity-60 cursor-not-allowed select-none" : ""
                }`}
              placeholder="ejemplo@empresa.com"
            />
            {editingUser && (
              <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                <span>⚠</span> El correo es inmutable post-registro. Use el flujo de cambio de email.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Teléfono</label>
              <input
                type="text"
                maxLength={14}
                inputMode="numeric"
                value={phone.value}
                onChange={phone.handleChange}
                onKeyDown={(e) => {
                  const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
                  if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className="vf-input w-full"
                placeholder="(809) 000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Cédula</label>
              <input
                type="text"
                readOnly={!!editingUser}
                value={formData.cedula || ""}
                onChange={editingUser ? undefined : e => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length > 3 && val.length <= 10) val = `${val.slice(0, 3)}-${val.slice(3)}`;
                  else if (val.length > 10) val = `${val.slice(0, 3)}-${val.slice(3, 10)}-${val.slice(10, 11)}`;
                  update({ cedula: val });
                }}
                onKeyDown={editingUser ? undefined : (e) => {
                  const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
                  if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`vf-input w-full ${editingUser ? "bg-surface-raised/30 opacity-60 cursor-not-allowed select-none" : ""
                  }`}
                placeholder="000-0000000-0"
              />
              {editingUser && (
                <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                  <span>⚠</span> La cédula es un dato de identidad legal y no puede modificarse.
                </p>
              )}
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Contraseña Temporal (Opcional)</label>
              <input
                type="text"
                value={formData.password || ""}
                onChange={e => update({ password: e.target.value })}
                className="vf-input w-full"
                placeholder="Dejar en blanco para usar clave por defecto"
              />
              <p className="text-[10px] text-text-secondary mt-1">El usuario recibirá una alerta para cambiar esta contraseña al iniciar sesión.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Rol de Acceso</label>
            <select
              value={formData.role}
              onChange={e => update({ role: e.target.value as any })}
              className="vf-input w-full"
            >
              <option value="user">Usuario Regular</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="vf-btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="vf-btn-primary"
            >
              {isProcessing ? "Guardando..." : "Guardar Usuario"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
