import React, { useState, useEffect } from "react";
import { m } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import { UserSettings, CreateUserDto } from "../types/settings.types";
import { usePhoneInput } from "@/shared/hooks/usePhoneInput";

interface UserFormModalProps {
  isOpen: boolean;
  editingUser: UserSettings | null;
  formData: CreateUserDto;
  error?: string | null;
  isProcessing: boolean;
  onChange: (data: CreateUserDto) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  editingUser,
  formData,
  error,
  isProcessing,
  onChange,
  onSubmit,
  onClose,
}) => {
  const update = (partial: Partial<CreateUserDto>) => onChange({ ...formData, ...partial });
  const phone = usePhoneInput(
    formData.telefono ? formData.telefono.replace(/\D/g, '') : "",
    (formattedValue) => {
      const digits = formattedValue.replace(/\D/g, '');
      update({ telefono: digits });
    }
  );
  
  const [showPassword, setShowPassword] = useState(false);
  const [documentType, setDocumentType] = useState<"cedula" | "rnc">("cedula");

  useEffect(() => {
    if (!isOpen) return;
    if (editingUser) {
      setDocumentType(editingUser.rnc ? "rnc" : "cedula");
    } else {
      setDocumentType("cedula");
    }
  }, [editingUser, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <m.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-modal-title"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-raised/30">
          <h2 id="user-form-modal-title" className="text-lg font-bold text-[#223382]">
            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="uf-nombre" className="block text-xs font-bold text-text-secondary uppercase mb-1">Nombre</label>
              <input
                id="uf-nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={e => update({ nombre: e.target.value })}
                className="vf-input w-full"
                placeholder="Ej. Juan"
              />
            </div>
            <div>
              <label htmlFor="uf-apellido" className="block text-xs font-bold text-text-secondary uppercase mb-1">Apellido</label>
              <input
                id="uf-apellido"
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
            <label htmlFor="uf-email" className="block text-xs font-bold text-text-secondary uppercase mb-1">Correo Electrónico</label>
            <input
              id="uf-email"
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

          {!editingUser && (
            <div>
              <span className="block text-xs font-bold text-[#8a9bb4] uppercase mb-1">Tipo de Identificación</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDocumentType("cedula");
                    update({ rnc: "", cedula: "" });
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    documentType === "cedula"
                      ? "bg-[#223382] text-white border-[#223382]"
                      : "bg-white text-text-secondary border-border hover:bg-surface"
                  }`}
                >
                  Cédula
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDocumentType("rnc");
                    update({ cedula: "", rnc: "" });
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    documentType === "rnc"
                      ? "bg-[#223382] text-white border-[#223382]"
                      : "bg-white text-text-secondary border-border hover:bg-surface"
                  }`}
                >
                  RNC
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="uf-telefono" className="block text-xs font-bold text-text-secondary uppercase mb-1">Teléfono</label>
              <input
                id="uf-telefono"
                type="text"
                required
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
              <label htmlFor="uf-identificacion" className="block text-xs font-bold text-text-secondary uppercase mb-1">
                {documentType === "cedula" ? "Cédula" : "RNC"}
              </label>
              {documentType === "cedula" ? (
                <input
                  id="uf-cedula"
                  type="text"
                  required={!editingUser}
                  readOnly={!!editingUser}
                  value={formData.cedula || ""}
                  onChange={editingUser ? undefined : e => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length > 3 && val.length <= 10) val = `${val.slice(0, 3)}-${val.slice(3)}`;
                    else if (val.length > 10) val = `${val.slice(0, 3)}-${val.slice(3, 10)}-${val.slice(10, 11)}`;
                    update({ cedula: val, rnc: "" });
                  }}
                  onKeyDown={editingUser ? undefined : (e) => {
                    const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
                    if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={`vf-input w-full ${editingUser ? "bg-surface-raised/30 opacity-60 cursor-not-allowed select-none" : ""}`}
                  placeholder="000-0000000-0"
                />
              ) : (
                <input
                  id="uf-rnc"
                  type="text"
                  required={!editingUser}
                  readOnly={!!editingUser}
                  maxLength={13}
                  value={formData.rnc || ""}
                  onChange={editingUser ? undefined : e => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length > 9) {
                      val = val.slice(0, 11);
                      if (val.length > 3 && val.length <= 10) val = `${val.slice(0, 3)}-${val.slice(3)}`;
                      else if (val.length > 10) val = `${val.slice(0, 3)}-${val.slice(3, 10)}-${val.slice(10, 11)}`;
                    } else {
                      val = val.slice(0, 9);
                    }
                    update({ rnc: val, cedula: "" });
                  }}
                  onKeyDown={editingUser ? undefined : (e) => {
                    const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
                    if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={`vf-input w-full ${editingUser ? "bg-surface-raised/30 opacity-60 cursor-not-allowed select-none" : ""}`}
                  placeholder="000000000 o 000-0000000-0"
                />
              )}
              {editingUser && (
                <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                  <span>⚠</span> La identificación es un dato de identidad legal y no puede modificarse.
                </p>
              )}
            </div>
          </div>

          {!editingUser && (
            <>
              <div>
                <label htmlFor="uf-plan" className="block text-xs font-bold text-text-secondary uppercase mb-1">Plan de Suscripción</label>
                <select
                  id="uf-plan"
                  value={formData.planNombre || "Consultor"}
                  onChange={e => update({ planNombre: e.target.value })}
                  className="vf-input w-full bg-white"
                >
                  <option value="Consultor">Consultor</option>
                  <option value="Profesional">Profesional</option>
                  <option value="Empresa">Empresa</option>
                  <option value="Corporativo">Corporativo</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="uf-password" className="block text-xs font-bold text-text-secondary uppercase mb-1">Contraseña Temporal (Opcional)</label>
                <div className="relative">
                  <input
                    id="uf-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ""}
                    onChange={e => update({ password: e.target.value })}
                    className="vf-input w-full pr-10"
                    placeholder="Dejar en blanco para usar clave por defecto"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-text-secondary mt-1">El usuario recibirá una alerta para cambiar esta contraseña al iniciar sesión.</p>
              </div>
            </>
          )}

          {/* Role access selection removed */}

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
      </m.div>
    </div>
  );
};
