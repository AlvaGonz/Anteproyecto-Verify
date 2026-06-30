import React, { useState } from "react";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { useUpdateUserRole, useUpdateUserPlan } from "../api/useSettings";
import { UserSettings, SubscriptionPlan } from "../types/settings.types";
import { 
  Mail, Phone, Layers, Pencil, Trash2, Plus, ChevronDown, ChevronRight, Shield
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRoleMutation.mutateAsync({ userId, role: newRole as any });
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

  // Group users by role categories
  const groupedUsers = {
    "Administradores": users.filter(u => u.role === "admin" || u.role === "owner"),
    "Enterprise": users.filter(u => u.role === "enterprise"),
    "Business": users.filter(u => u.role === "business"),
    "Professional": users.filter(u => u.role === "professional" || u.role === "dev" || u.role === "validator"), // Mapping legacy roles to professional for display if needed
    "Consultation": users.filter(u => u.role === "consultation" || u.role === "user")
  };

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Administradores": true,
    "Enterprise": true,
    "Business": true,
    "Professional": true,
    "Consultation": true
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const renderUserCard = (u: UserSettings) => (
    <div key={u.id} className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-text-primary text-base truncate">{u.nombre} {u.apellido}</h4>
          {u.role === "owner" && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" /> OWNER
            </span>
          )}
          {u.role === "admin" && (
            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {u.email}</span>
          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {u.telefono || "N/A"}</span>
          <span className="font-mono text-[11px] bg-surface-raised px-1.5 py-0.5 rounded text-text-primary">{u.cedula || "N/A"}</span>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
        <div className="flex flex-col gap-1 w-full md:w-auto min-w-[140px]">
          <label className="text-[10px] font-bold text-text-secondary uppercase">Rol en Sistema</label>
          <select
            value={u.role}
            onChange={(e) => handleRoleChange(u.id, e.target.value)}
            disabled={isUpdating || u.role === "owner"}
            className="vf-input py-1.5 px-2 text-xs w-full"
          >
            <option value="owner" disabled>Owner (Super Admin)</option>
            <option value="admin">Administrador</option>
            <option value="enterprise">Enterprise</option>
            <option value="business">Business</option>
            <option value="professional">Professional</option>
            <option value="consultation">Consultation (Free)</option>
            {/* Legacy Fallbacks */}
            <option value="dev" disabled>Developer (Legacy)</option>
            <option value="validator" disabled>Validator (Legacy)</option>
            <option value="user" disabled>User (Legacy)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full md:w-auto min-w-[140px]">
          <label className="text-[10px] font-bold text-text-secondary uppercase">Suscripción</label>
          <select
            value={u.planId || ""}
            onChange={(e) => handlePlanChange(u.id, e.target.value)}
            disabled={isUpdating || u.role === "owner"}
            className="vf-input py-1.5 px-2 text-xs w-full"
          >
            <option value="" disabled>Seleccionar Plan...</option>
            {plans.map(p => (
              <option key={p.planId} value={p.planId}>
                {p.name} {p.price > 0 ? `(RD$${p.price})` : "(Free)"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-end w-full md:w-auto pt-2 md:pt-0">
          <button 
            onClick={() => onEdit(u)} 
            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
            title="Editar Perfil"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(u.id)} 
            disabled={u.role === "owner"}
            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors" 
            title="Eliminar Usuario"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h3 className="font-display font-bold text-[#223382] text-lg">Usuarios y Accesos</h3>
          <p className="text-sm text-text-secondary">
            Gestión estructurada por niveles de suscripción y perfil de usuario.
          </p>
        </div>
        <button onClick={onAddNew} className="vf-btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedUsers).map(([groupName, groupUsers]) => {
          const isExpanded = expandedGroups[groupName];
          if (groupUsers.length === 0 && groupName === "Administradores") return null; // Hide empty admin section by default unless needed

          return (
            <div key={groupName} className="bg-surface-raised/20 border border-border rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-surface-raised/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-text-secondary" /> : <ChevronRight className="w-5 h-5 text-text-secondary" />}
                  <h4 className="font-bold text-text-primary text-md">
                    {groupName} <span className="text-xs font-normal text-text-secondary ml-2 bg-surface-raised px-2 py-0.5 rounded-full">{groupUsers.length} usuarios</span>
                  </h4>
                </div>
              </button>
              
              {isExpanded && (
                <div className="p-4 bg-surface-raised/10 border-t border-border flex flex-col gap-3">
                  {groupUsers.length > 0 ? (
                    groupUsers.map(renderUserCard)
                  ) : (
                    <div className="text-center py-6 text-sm text-text-secondary bg-white rounded-xl border border-dashed border-border">
                      No hay usuarios registrados en el grupo {groupName}.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
