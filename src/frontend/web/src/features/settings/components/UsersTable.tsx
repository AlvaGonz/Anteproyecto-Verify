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

  // Group users by plan categories
  const groupedUsers = {
    "Administradores": users.filter(u => u.role === "admin" || u.role === "owner"),
    "Enterprise": users.filter(u => u.planName === "Enterprise" && u.role !== "admin" && u.role !== "owner"),
    "Business": users.filter(u => u.planName === "Empresa" && u.role !== "admin" && u.role !== "owner"),
    "Professional": users.filter(u => u.planName === "Profesional" && u.role !== "admin" && u.role !== "owner"),
    "Consultation": users.filter(u => (u.planName === "Gratuito" || u.planName === "Sin Plan" || !u.planName) && u.role !== "admin" && u.role !== "owner")
  };

  const [activeTab, setActiveTab] = useState<string>("Enterprise");

  const tabs = [
    { id: "Enterprise", label: "Enterprise", count: groupedUsers["Enterprise"].length },
    { id: "Business", label: "Business", count: groupedUsers["Business"].length },
    { id: "Professional", label: "Professional", count: groupedUsers["Professional"].length },
    { id: "Consultation", label: "Consultation", count: groupedUsers["Consultation"].length },
    { id: "Administradores", label: "Admin/Owner", count: groupedUsers["Administradores"].length }
  ];

  const renderUserCard = (u: UserSettings) => (
    <div key={u.id} className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 items-start md:items-stretch">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full">
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
        
        {/* Additional Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {u.razonSocial && (
            <span className="bg-blue-50 text-blue-800 text-[11px] px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
              <span className="font-bold">Razn Social:</span> {u.razonSocial} {u.rnc && `(RNC: ${u.rnc})`}
            </span>
          )}
          {u.planCreatedAt && (
            <span className="bg-gray-50 text-gray-700 text-[11px] px-2 py-0.5 rounded border border-gray-200">
              <span className="font-bold">Creado:</span> {new Date(u.planCreatedAt).toLocaleDateString()}
            </span>
          )}
          {u.planExpiresAt && (
            <span className="bg-gray-50 text-gray-700 text-[11px] px-2 py-0.5 rounded border border-gray-200">
              <span className="font-bold">Expira:</span> {new Date(u.planExpiresAt).toLocaleDateString()}
            </span>
          )}
          {u.maxInvitees !== undefined && u.maxInvitees > 0 && (
            <span className="bg-purple-50 text-purple-800 text-[11px] px-2 py-0.5 rounded border border-purple-100">
              <span className="font-bold">Usuarios:</span> {u.inviteesCount || 0} / {u.maxInvitees}
            </span>
          )}
          {u.usedProjects !== undefined && (
            <span className="bg-green-50 text-green-800 text-[11px] px-2 py-0.5 rounded border border-green-100">
              <span className="font-bold">Proyectos:</span> {u.usedProjects}
            </span>
          )}
          {u.usedQueries !== undefined && (
            <span className="bg-amber-50 text-amber-800 text-[11px] px-2 py-0.5 rounded border border-amber-100">
              <span className="font-bold">Consultas:</span> {u.usedQueries}
            </span>
          )}
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
            <option value="dev">Developer (Legacy)</option>
            <option value="validator">Validator (Legacy)</option>
            <option value="user">Usuario (Consulta)</option>
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

      {/* Invitees List */}
      {u.inviteesList && u.inviteesList.length > 0 && (
        <div className="w-full mt-4 pt-4 border-t border-dashed border-border">
          <h5 className="text-xs font-bold text-text-secondary uppercase mb-2">Usuarios Invitados</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {u.inviteesList.map(invitee => (
              <div key={invitee.id} className="bg-surface-raised p-2 rounded flex items-center gap-2 border border-border/50">
                <div className="w-6 h-6 rounded-full bg-[#223382]/10 flex items-center justify-center text-[10px] font-bold text-[#223382]">
                  {invitee.nombre.charAt(0)}{invitee.apellido.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{invitee.nombre} {invitee.apellido}</p>
                  <p className="text-[10px] text-text-secondary truncate">{invitee.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* TABS HEADER */}
        <div className="flex overflow-x-auto border-b border-border bg-surface-raised/20">
          {tabs.map((tab) => {
             // Hide admin tab if empty
             if (tab.id === "Administradores" && tab.count === 0) return null;
             
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap border-b-2 
                   ${isActive ? 'border-[#223382] text-[#223382] bg-white' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-raised/50'}`}
               >
                 {tab.label}
                 <span className={`px-2 py-0.5 rounded-full text-xs font-mono
                   ${isActive ? 'bg-[#223382]/10 text-[#223382]' : 'bg-surface-raised text-text-secondary'}`}
                 >
                   {tab.count}
                 </span>
               </button>
             );
          })}
        </div>

        {/* TAB CONTENT */}
        <div className="p-6 bg-surface-raised/10">
          <div className="flex flex-col gap-4">
            {groupedUsers[activeTab as keyof typeof groupedUsers]?.length > 0 ? (
              groupedUsers[activeTab as keyof typeof groupedUsers].map(renderUserCard)
            ) : (
              <div className="text-center py-10 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-border shadow-sm">
                <Layers className="w-10 h-10 text-text-secondary/50 mb-3" />
                <h4 className="text-text-primary font-bold">No hay usuarios en este nivel</h4>
                <p className="text-sm text-text-secondary">
                  Los usuarios asignados a este rol aparecerán aquí.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
