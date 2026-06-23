import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { useUsers, useProfiles, usePlans, useCreateUser, useUpdateUser, useDeleteUser } from "../../features/settings/api/useSettings";
import { CreateUserDto, UserSettings } from "../../features/settings/types/settings.types";
import { UsersTable, UserFormModal, DeleteModal } from "../../features/settings/components";
import {
  Settings,
  RefreshCw,
  Users,
  Shield,
  Loader2,
  UserCheck,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validateCedulaCheckDigit } from "../../features/auth/schemas";

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

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const loading = isLoadingUsers || isLoadingProfiles || isLoadingPlans;
  const isProcessing = createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending;

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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!nameRegex.test(formData.name)) {
      addToast("El nombre solo puede contener letras", "error");
      return;
    }

    if (formData.telefono) {
      const telDigits = formData.telefono.replace(/\D/g, "");
      if (telDigits.length > 0 && !/^(809|829|849)\d{7}$/.test(telDigits)) {
        addToast("Teléfono inválido. Solo códigos 809, 829 o 849", "error");
        return;
      }
    }

    if (formData.cedula) {
      const cedDigits = formData.cedula.replace(/\D/g, "");
      if (cedDigits.length > 0 && !validateCedulaCheckDigit(cedDigits)) {
        addToast("Cédula inválida o dígito verificador incorrecto", "error");
        return;
      }
    }

    if (!editingUser && formData.password) {
      const p = formData.password;
      if (p.length < 8 || !/[A-Z]/.test(p) || !/[a-z]/.test(p) || !/[0-9]/.test(p) || !/[!@#$%^&*\-]/.test(p)) {
        addToast("La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial", "error");
        return;
      }
    }

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
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.response?.data?.Message || "Error al guardar el usuario";
      addToast(errorMsg, "error");
    }
  };

  const handleEditClick = (u: UserSettings) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, telefono: u.telefono || "", cedula: u.cedula || "" });
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "user", telefono: "", cedula: "", password: "" });
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
            >
              <UsersTable
                users={users}
                plans={plans}
                onEdit={handleEditClick}
                onDelete={(id) => setDeleteId(id)}
                onAddNew={handleAddNewClick}
              />
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
      <UserFormModal
        isOpen={isModalOpen}
        editingUser={editingUser}
        formData={formData}
        isProcessing={isProcessing}
        onChange={setFormData}
        onSubmit={handleSaveUser}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        deleteId={deleteId}
        isProcessing={isProcessing}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
