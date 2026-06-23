import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { useUsers, useProfiles, usePlans, useUpdateUserRole, useUpdateUserPlan, useCreateUser, useUpdateUser, useDeleteUser } from "../../features/settings/api/useSettings";
import { CreateUserDto, UserSettings } from "../../features/settings/types/settings.types";
import { 
  Users, 
  Shield, 
  Settings, 
  Loader2, 
  UserCheck, 
  Check, 
  RefreshCw,
  Mail,
  Phone,
  Layers,
  Plus,
  X,
  Pencil,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TabId = "users" | "permissions";

const permissionLabels: Record<string, string> = {
  "GestionarUsuarios": "Gestión de Usuarios",
  "ConfigurarReglas": "Configuración de Reglas",
  "VisualizarAuditoria": "Visualización de Auditoría",
  "CrearProyectos": "Creación de Proyectos",
  "ValidarProyectos": "Validación de Proyectos"
};

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("users");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSettings | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({ name: "", email: "", role: "user", telefono: "", cedula: "" });
  
  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers();
  const { data: profiles = [], isLoading: isLoadingProfiles, refetch: refetchProfiles } = useProfiles();
  const { data: plans = [], isLoading: isLoadingPlans, refetch: refetchPlans } = usePlans();

  const updateUserRoleMutation = useUpdateUserRole();
  const updateUserPlanMutation = useUpdateUserPlan();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const loading = isLoadingUsers || isLoadingProfiles || isLoadingPlans;
  const updatingUserId = updateUserRoleMutation.isPending || updateUserPlanMutation.isPending || deleteUserMutation.isPending ? "updating" : null;

  // Security Check: Only admin allowed
  useEffect(() => {
    if (user && user.role !== "admin") {
      addToast("Acceso denegado. Se requieren permisos de administrador.", "error");
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  const loadData = () => {
    refetchUsers();
    refetchProfiles();
    refetchPlans();
  };

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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({ userId: editingUser.id, data: formData });
        addToast("Usuario actualizado exitosamente", "success");
      } else {
        await createUserMutation.mutateAsync(formData);
        addToast("Usuario creado exitosamente", "success");
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch {
      addToast("Error al guardar el usuario", "error");
    }
  };

  const handleEditClick = (u: UserSettings) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, telefono: u.telefono || "", cedula: u.cedula || "" });
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "user", telefono: "", cedula: "" });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUserMutation.mutateAsync(deleteId);
      addToast("Usuario eliminado exitosamente", "success");
      setDeleteId(null);
    } catch {
      addToast("Error al eliminar", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#223382]" />
        <p className="mt-4 text-sm font-medium text-text-secondary">Cargando configuración del sistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#223382] flex items-center gap-3">
            <Settings className="w-7 h-7" />
            Configuración del Sistema
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Administre roles, accesos, asignación de planes y permisos de la plataforma.
          </p>
        </div>
        <button
          onClick={loadData}
          className="vf-btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar Datos
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${
            activeTab === "users"
              ? "border-[#223382] text-[#223382]"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Users className="w-4 h-4" />
          Usuarios y Accesos
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${
            activeTab === "permissions"
              ? "border-[#223382] text-[#223382]"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Shield className="w-4 h-4" />
          Perfiles y Permisos
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-surface-raised/40 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-[#223382] text-lg">Listado de Usuarios Registrados</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Gestione la información, roles y suscripciones de los usuarios en el sistema.
                  </p>
                </div>
                <button onClick={handleAddNewClick} className="vf-btn-primary flex items-center gap-2 text-sm px-4 py-2">
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
                            <span className="font-bold text-text-primary">{u.name}</span>
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
                                disabled={updatingUserId !== null}
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
                                disabled={updatingUserId !== null}
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
                                <button onClick={() => handleEditClick(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleteId(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
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
            </motion.div>
          )}

          {activeTab === "permissions" && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {profiles.map(p => (
                <div key={p.perfilId} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                      <h3 className="font-display font-black text-lg text-[#223382] uppercase">{p.name}</h3>
                      <Shield className={`w-6 h-6 ${
                        p.name === "ADMIN" ? "text-red-500" : p.name === "DEVELOPER" ? "text-blue-500" : "text-green-500"
                      }`} />
                    </div>
                    
                    <p className="text-xs text-text-secondary mb-4 font-medium">
                      Permisos funcionales asignados en la capa legacy:
                    </p>

                    <ul className="space-y-2.5">
                      {p.permissions.map((perm, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-text-primary">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="font-medium font-mono">{permissionLabels[perm] || perm}</span>
                        </li>
                      ))}
                      {p.permissions.length === 0 && (
                        <li className="text-xs text-text-secondary italic">Sin permisos asignados</li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                    <UserCheck className="w-4 h-4 text-primary" />
                    ID de Perfil: {p.perfilId}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
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
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="vf-input w-full"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="vf-input w-full"
                  placeholder="ejemplo@empresa.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={formData.telefono || ""}
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                    className="vf-input w-full"
                    placeholder="809-000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Cédula</label>
                  <input 
                    type="text" 
                    value={formData.cedula || ""}
                    onChange={e => setFormData({...formData, cedula: e.target.value})}
                    className="vf-input w-full"
                    placeholder="000-0000000-0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Rol de Acceso</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="vf-input w-full"
                >
                  <option value="user">Usuario Regular</option>
                  <option value="validator">Validador</option>
                  <option value="dev">Desarrollador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-border mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="vf-btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={updatingUserId === "updating"}
                  className="vf-btn-primary"
                >
                  {updatingUserId === "updating" ? "Guardando..." : "Guardar Usuario"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
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
                onClick={() => setDeleteId(null)}
                className="vf-btn-secondary w-full"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                disabled={updatingUserId === "updating"}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
