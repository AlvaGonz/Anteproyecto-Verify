import React from "react";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { useUpdateUserRole, useUpdateUserPlan } from "../api/useSettings";
import { UserSettings, SubscriptionPlan } from "../types/settings.types";
import { 
  Mail, Phone, Layers, Pencil, Trash2, Plus
} from "lucide-react";

interface UsersTableProps {
  users: UserSettings[];
  plans: SubscriptionPlan[];
  onEdit: (user: UserSettings) => void;
  onDelete: (userId: string) => void;
  onAddNew: () => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, plans, onEdit, onDelete, onAddNew }) => {
  const { addToast } = useToast();
  const updateUserRoleMutation = useUpdateUserRole();
  const updateUserPlanMutation = useUpdateUserPlan();

  const isUpdating = updateUserRoleMutation.isPending || updateUserPlanMutation.isPending;

  const handleRoleChange = async (userId: string, newRole: "admin" | "dev" | "validator" | "user") => {
    try {
      await updateUserRoleMutation.mutateAsync({ userId, role: newRole });
      addToast("Rol y perfil actualizados exitosamente", "success");
    } catch {
      addToast("Error de red al actualizar rol", "error");
    }
  };

  const handlePlanChange = async (userId: string, newPlanId: string) => {
    try {
      await updateUserPlanMutation.mutateAsync({ userId, planId: newPlanId });
      addToast("Plan de suscripción asignado exitosamente", "success");
    } catch {
      addToast("Error de red al actualizar suscripción", "error");
    }
  };

  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-surface-raised/40 flex justify-between items-center">
        <div>
          <h3 className="font-display font-bold text-[#223382] text-lg">Listado de Usuarios Registrados</h3>
          <p className="text-xs text-text-secondary mt-1">
            Gestione la información, roles y suscripciones de los usuarios en el sistema.
          </p>
        </div>
        <button onClick={onAddNew} className="vf-btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-raised/20 border-b border-border text-[11px] font-black uppercase tracking-wider text-text-secondary">
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Identificación</th>
              <th className="px-6 py-4">Rol en Sistema</th>
              <th className="px-6 py-4">Suscripción</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-surface-raised/10 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-text-primary">{u.nombre} {u.apellido}</span>
                    <span className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      {u.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-text-secondary flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {u.telefono || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs">
                  {u.cedula || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    u.role === "admin"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : u.role === "dev"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}>
                    {u.profileName || u.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-text-primary flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                      {u.planName || "Ninguno"}
                    </span>
                    {u.planPrice !== null && (
                      <span className="text-[11px] text-text-secondary mt-0.5">
                        RD$ {u.planPrice.toLocaleString("es-DO", { minimumFractionDigits: 2 })} / mes
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {/* Role selection dropdown */}
                    <div className="flex flex-col items-start gap-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Cambiar Rol</label>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                        disabled={isUpdating}
                        className="vf-input py-1 px-2 text-xs h-8 min-w-[120px]"
                      >
                        <option value="admin">Administrador</option>
                        <option value="dev">Desarrollador</option>
                        <option value="validator">Validador</option>
                      </select>
                    </div>

                    {/* Plan selection dropdown */}
                    <div className="flex flex-col items-start gap-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Cambiar Plan</label>
                      <select
                        value={u.planId || ""}
                        onChange={(e) => handlePlanChange(u.id, e.target.value)}
                        disabled={isUpdating}
                        className="vf-input py-1 px-2 text-xs h-8 min-w-[130px]"
                      >
                        <option value="" disabled>Seleccionar...</option>
                        {plans.map(p => (
                          <option key={p.planId} value={p.planId}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col items-center gap-1 justify-center ml-2 border-l border-border pl-3">
                      <div className="flex gap-1">
                        <button onClick={() => onEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
