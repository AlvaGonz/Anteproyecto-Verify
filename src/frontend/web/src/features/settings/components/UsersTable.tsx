import React, { useState, useMemo } from "react";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";
import { useUpdateUserPlan } from "../api/useSettings";
import { UserSettings, SubscriptionPlan } from "../types/settings.types";
import { 
  Mail, Phone, Layers, Pencil, Trash2, Plus, Shield, Search, ArrowUp, ArrowDown
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
  const updateUserPlanMutation = useUpdateUserPlan();

  const isUpdating = updateUserPlanMutation.isPending;

  const handlePlanChange = async (userId: string, newPlanId: string) => {
    try {
      await updateUserPlanMutation.mutateAsync({ userId, planId: newPlanId });
      addToast("Plan de suscripción asignado exitosamente", "success");
    } catch {
      addToast("Error de red al actualizar suscripción", "error");
    }
  };

  const sortedPlans = useMemo(() => {
    return [...plans]
      .filter(p => p.name !== "Consultation" && p.name !== "Consultor")
      .sort((a, b) => b.price - a.price);
  }, [plans]);

  // Group users by plan categories
  const groupedUsers = {
    "Administradores": users.filter(u => u.role === "admin" || u.role === "owner"),
    "Enterprise": users.filter(u => u.planName === "Enterprise" && u.role !== "admin" && u.role !== "owner"),
    "Empresa": users.filter(u => u.planName === "Empresa" && u.role !== "admin" && u.role !== "owner"),
    "Profesional": users.filter(u => u.planName === "Profesional" && u.role !== "admin" && u.role !== "owner"),
    "Gratuito": users.filter(u => (u.planName === "Gratuito" || u.planName === "Sin Plan" || !u.planName) && u.role !== "admin" && u.role !== "owner")
  };

  const [activeTab, setActiveTab] = useState<string>("Enterprise");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [sortField, setSortField] = useState<"planCreatedAt" | "usedProjects" | "usedQueries" | "nombre" | "availableUsers">("planCreatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  React.useEffect(() => {
    setCurrentPage(1);
    setPageInput("1");
    if (sortField === "availableUsers" && activeTab !== "Enterprise" && activeTab !== "Empresa") {
      setSortField("planCreatedAt");
    }
  }, [activeTab, searchQuery]);

  React.useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const tabs = [
    { id: "Enterprise", label: "Enterprise", count: groupedUsers["Enterprise"].length },
    { id: "Empresa", label: "Empresa", count: groupedUsers["Empresa"].length },
    { id: "Profesional", label: "Profesional", count: groupedUsers["Profesional"].length },
    { id: "Gratuito", label: "Gratuito", count: groupedUsers["Gratuito"].length },
    { id: "Administradores", label: "Admin/Owner", count: groupedUsers["Administradores"].length }
  ];

  const currentTabUsers = groupedUsers[activeTab as keyof typeof groupedUsers] || [];
  
  const filteredUsers = useMemo(() => {
    let result = currentTabUsers;
    
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.nombre.toLowerCase().includes(lowerQ) ||
        u.apellido.toLowerCase().includes(lowerQ) ||
        u.email.toLowerCase().includes(lowerQ) ||
        (u.cedula && u.cedula.toLowerCase().includes(lowerQ))
      );
    }
    
    return result.sort((a, b) => {
      let valA: any;
      let valB: any;
      
      if (sortField === "availableUsers") {
        valA = (a.maxInvitees || 0) - (a.inviteesCount || 0);
        valB = (b.maxInvitees || 0) - (b.inviteesCount || 0);
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }
      
      // Default to 0 if undefined for numbers, or empty string for strings
      if (sortField === "usedProjects" || sortField === "usedQueries" || sortField === "availableUsers") {
        valA = valA || 0;
        valB = valB || 0;
      } else if (sortField === "planCreatedAt") {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      } else {
        valA = (valA || "").toString().toLowerCase();
        valB = (valB || "").toString().toLowerCase();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [currentTabUsers, searchQuery, sortField, sortDirection]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderUserCard = (u: UserSettings) => (
    <div key={u.id} className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 items-start md:items-stretch h-full">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-text-primary text-base truncate">{u.nombre} {u.apellido}</h4>
          {(u.nombreComercial || u.razonSocial) && (
            <span className="text-sm text-text-secondary truncate font-medium">
              - {u.nombreComercial || u.razonSocial} {u.rnc && `(RNC: ${u.rnc})`}
            </span>
          )}
          {u.role === "owner" && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <Shield className="w-3 h-3" /> OWNER
            </span>
          )}
          {u.role === "admin" && (
            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">ADMIN</span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {u.email}</span>
          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {u.telefono || "N/A"}</span>
          <span className="font-mono text-[11px] bg-surface-raised px-1.5 py-0.5 rounded text-text-primary">{u.cedula || "N/A"}</span>
        </div>
        
        {/* Additional Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
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
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end w-full md:w-auto">
        <div className="flex flex-col gap-1 w-full md:w-auto min-w-[140px]">
          <label htmlFor={`plan-${u.id}`} className="text-[10px] font-bold text-text-secondary uppercase">Suscripción</label>
          <select
            id={`plan-${u.id}`}
            value={u.planId || ""}
            onChange={(e) => handlePlanChange(u.id, e.target.value)}
            disabled={isUpdating || u.role === "owner"}
            className="vf-input h-10 px-3 text-sm w-full"
          >
            <option value="" disabled>Seleccionar Plan...</option>
            {sortedPlans.map(p => (
              <option key={p.planId} value={p.planId}>
                {p.name === "Gratuito" ? "Gratuito (Free)" : p.name} {p.price > 0 ? `($${p.price} USD)` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-end w-full md:w-auto pt-2 md:pt-0">
          <button type="button" 
            onClick={() => onEdit(u)} 
            className="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
            title="Editar Perfil"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button type="button" 
            onClick={() => onDelete(u.id)} 
            disabled={u.role === "owner"}
            className="w-10 h-10 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors" 
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
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-border shadow-sm flex-wrap gap-4">
        <div>
          <h3 className="font-display font-bold text-[#223382] text-lg">Usuarios y Accesos</h3>
          <p className="text-sm text-text-secondary">
            Gestión estructurada por niveles de suscripción y perfil de usuario.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:flex-1 justify-end flex-wrap">
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="vf-input h-10 px-3 text-sm border border-border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#223382]/20"
            >
              <option value="planCreatedAt">Fecha de creación</option>
              <option value="usedProjects">Proyectos</option>
              <option value="usedQueries">Consultas</option>
              <option value="nombre">Nombre</option>
              {(activeTab === "Enterprise" || activeTab === "Empresa") && (
                <option value="availableUsers">Usuarios</option>
              )}
            </select>
            <button
              type="button"
              onClick={() => setSortDirection(d => d === "asc" ? "desc" : "asc")}
              className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-border rounded-xl hover:bg-gray-100 text-text-secondary transition-colors"
              title={sortDirection === "asc" ? "Orden Ascendente (A-Z)" : "Orden Descendente (Z-A)"}
            >
              {sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative w-full flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, cédula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-[#223382]/20 transition-all outline-none"
            />
          </div>
          <button type="button" onClick={onAddNew} className="vf-btn-primary flex items-center justify-center gap-2 text-sm px-4 h-10 shrink-0">
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* TABS HEADER */}
        <div className="flex overflow-x-auto border-b border-border bg-surface-raised/20">
          {tabs.map((tab) => {
             if (tab.id === "Administradores" && tab.count === 0) return null;
             
             const isActive = activeTab === tab.id;
             return (
               <button type="button"
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
        <div className="p-6 bg-surface-raised/10 min-h-[400px] flex flex-col">
          <div className="flex flex-col gap-4 flex-1">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map(renderUserCard)
            ) : (
              <div className="text-center py-10 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-border shadow-sm h-full flex-1">
                <Layers className="w-10 h-10 text-text-secondary/50 mb-3" />
                <h4 className="text-text-primary font-bold">No se encontraron usuarios</h4>
                <p className="text-sm text-text-secondary">
                  {searchQuery ? "Intenta con otros términos de búsqueda." : "Los usuarios asignados a este nivel aparecerán aquí."}
                </p>
              </div>
            )}
            
            {/* Empty slots to maintain fixed height if fewer than 5 items */}
            {paginatedUsers.length > 0 && paginatedUsers.length < itemsPerPage && (
              Array.from({ length: itemsPerPage - paginatedUsers.length }).map((_, i) => (
                <div key={`empty-${i}`} className="invisible p-4 border border-transparent rounded-xl h-[120px] shrink-0" />
              ))
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <span className="text-sm text-text-secondary font-medium flex items-center gap-1.5">
                Página 
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPageInput(val);
                    if (val.trim() === "" || val === "-") return;
                    let num = parseInt(val, 10);
                    if (isNaN(num)) return;
                    if (num > totalPages) {
                      num = totalPages;
                      setPageInput(num.toString());
                    } else if (num < 1) {
                      num = 1;
                      setPageInput(num.toString());
                    }
                    setCurrentPage(num);
                  }}
                  onBlur={() => {
                    if (pageInput.trim() === "" || pageInput === "-" || isNaN(parseInt(pageInput, 10))) {
                      setPageInput(currentPage.toString());
                    }
                  }}
                  className="w-10 h-7 text-center font-bold text-[#223382] bg-white border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#223382]/20"
                />
                de {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
