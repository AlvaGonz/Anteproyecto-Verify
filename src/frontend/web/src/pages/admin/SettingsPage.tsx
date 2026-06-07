import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { settingsApi } from "../../features/settings/api/settingsApi";
import { UserSettings, ProfilePermissions, SubscriptionPlan } from "../../features/settings/types/settings.types";
import { isSuccess } from "../../shared/utils/functional";
import { 
  Users, 
  Shield, 
  CreditCard, 
  Settings, 
  Loader2, 
  UserCheck, 
  Check, 
  RefreshCw,
  Mail,
  Phone,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TabId = "users" | "permissions" | "plans";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("users");
  const [users, setUsers] = useState<UserSettings[]>([]);
  const [profiles, setProfiles] = useState<ProfilePermissions[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Security Check: Only admin allowed
  useEffect(() => {
    if (user && user.role !== "admin") {
      addToast("Acceso denegado. Se requieren permisos de administrador.", "error");
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const usersResult = await settingsApi.getUsers();
      const profilesResult = await settingsApi.getProfiles();
      const plansResult = await settingsApi.getPlans();

      if (isSuccess(usersResult)) {
        setUsers(usersResult.data);
      } else {
        addToast("Error al cargar usuarios", "error");
      }

      if (isSuccess(profilesResult)) {
        setProfiles(profilesResult.data);
      }

      if (isSuccess(plansResult)) {
        setPlans(plansResult.data);
      }
    } catch (error) {
      addToast("Error de conexión con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      loadData();
    }
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: "admin" | "dev" | "validator" | "user") => {
    setUpdatingUserId(userId);
    try {
      const result = await settingsApi.updateUserRole(userId, newRole);
      if (isSuccess(result)) {
        addToast("Rol y perfil actualizados exitosamente", "success");
        // Update local state
        setUsers(prev => prev.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              role: newRole,
              profileName: newRole === "admin" ? "ADMIN" : newRole === "dev" ? "DEVELOPER" : "VALIDATOR"
            };
          }
          return u;
        }));
      } else {
        addToast("Error al actualizar el rol", "error");
      }
    } catch {
      addToast("Error de red al actualizar rol", "error");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handlePlanChange = async (userId: string, newPlanId: number) => {
    setUpdatingUserId(userId);
    try {
      const result = await settingsApi.updateUserPlan(userId, newPlanId);
      if (isSuccess(result)) {
        addToast("Plan de suscripción asignado exitosamente", "success");
        const selectedPlan = plans.find(p => p.planId === newPlanId);
        // Update local state
        setUsers(prev => prev.map(u => {
          if (u.id === userId && selectedPlan) {
            return {
              ...u,
              planId: newPlanId,
              planName: selectedPlan.name,
              planPrice: selectedPlan.price
            };
          }
          return u;
        }));
      } else {
        addToast("Error al actualizar la suscripción", "error");
      }
    } catch {
      addToast("Error de red al actualizar suscripción", "error");
    } finally {
      setUpdatingUserId(null);
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
        <button
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${
            activeTab === "plans"
              ? "border-[#223382] text-[#223382]"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Planes Disponibles
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
              <div className="p-6 border-b border-border bg-surface-raised/40">
                <h3 className="font-display font-bold text-[#223382] text-lg">Listado de Usuarios Registrados</h3>
                <p className="text-xs text-text-secondary mt-1">
                  Modifique la jerarquía organizativa y asigne planes de facturación a los usuarios sincronizados de la base de datos real.
                </p>
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
                                onChange={(e) => handlePlanChange(u.id, Number(e.target.value))}
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
                          <span className="font-medium font-mono">{perm}</span>
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

          {activeTab === "plans" && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 md:grid-cols-4"
            >
              {plans.map(p => (
                <div key={p.planId} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all relative overflow-hidden group">
                  {p.price > 0 && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
                  )}
                  <div>
                    <h4 className="font-display font-black text-xl text-text-primary mb-1">{p.name}</h4>
                    <div className="mt-4 mb-6">
                      <span className="text-3xl font-display font-black text-[#223382]">
                        RD$ {p.price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-text-secondary font-medium ml-1">/ mes</span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      Plan aplicable a usuarios operativos. Incluye configuración automática en la base de datos de auditoría legacy.
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-[11px] font-bold text-text-secondary">
                    <span>ID PLAN: {p.planId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                      p.price === 0 ? "bg-surface-raised text-text-secondary" : "bg-primary/10 text-primary"
                    }`}>
                      {p.price === 0 ? "Gratuito" : "Comercial"}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
