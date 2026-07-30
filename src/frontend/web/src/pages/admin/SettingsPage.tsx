import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { useUsers, usePlans, useCreateUser, useUpdateUser, useDeleteUser } from "../../features/settings/api/useSettings";
import { CreateUserDto, UserSettings } from "../../features/settings/types/settings.types";
import { UsersTable } from "../../features/settings/components/UsersTable";
import { UserFormModal } from "../../features/settings/components/UserFormModal";
import { DeleteModal } from "../../features/settings/components/DeleteModal";
import { MyProfileForm } from "../../features/settings/components/MyProfileForm";
import { SubscriptionSettings } from "../../features/settings/components/SubscriptionSettings";
import { InviteesSettings } from "../../features/settings/components/InviteesSettings";
import { DeleteAccountSection } from "../../features/settings/components/DeleteAccountSection";
import {
  Settings,
  Users,
  Loader2,
  User,
  CreditCard,
  UserPlus,
  Shield
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { validateCedulaCheckDigit } from "../../features/auth/schemas";

type TabId = "profile" | "subscription" | "users" | "invitees" | "security";



export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>((location.state as any)?.tab || "profile");

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((location.state as any)?.tab) {
        setActiveTab((location.state as any).tab);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [location.state]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSettings | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({ nombre: "", apellido: "", email: "", role: "user", telefono: "", cedula: "" });

  const isAdmin = user?.role === "admin" || user?.role === "owner";
  const isManagementTier = user?.plan === "Corporativo" || user?.plan === "Empresa";

  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers(1, 50, isAdmin);

  useEffect(() => {
    if (activeTab === "users") {
      refetchUsers();
    }
  }, [activeTab, refetchUsers]);

  const { data: plans = [], isLoading: isLoadingPlans } = usePlans(isAdmin);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const loading = isAdmin && (isLoadingUsers || isLoadingPlans);
  const isProcessing = createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending;

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!nameRegex.test(formData.nombre)) {
      addToast("El nombre solo puede contener letras", "error");
      return;
    }

    if (!formData.telefono) {
      addToast("El teléfono es obligatorio", "error");
      return;
    }
    const telDigits = formData.telefono.replace(/\D/g, "");
    if (telDigits.length > 0 && !/^(809|829|849)\d{7}$/.test(telDigits)) {
      addToast("Teléfono inválido. Solo códigos 809, 829 o 849 (ej: 8095550199)", "error");
      return;
    }

    if (!editingUser && !formData.cedula) {
      addToast("La cédula es obligatoria", "error");
      return;
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
      await refetchUsers();
    } catch (error: any) {
      console.error("API Error Response:", error?.response?.data);
      let errorMsg = "Error al guardar el usuario";
      if (error?.response?.data) {
        const d = error.response.data;
        if (d.message) errorMsg = d.message;
        else if (d.Message) errorMsg = d.Message;
        else if (d.errors && typeof d.errors === 'object') {
          // Flatten ASP.NET Core validation errors
          errorMsg = Object.values(d.errors).flat().join(' ');
        }
      }
      addToast(errorMsg, "error");
    }
  };

  const handleEditClick = (u: UserSettings) => {
    setEditingUser(u);
    setFormData({ nombre: u.nombre, apellido: u.apellido, email: u.email, role: (["admin", "dev", "validator", "user"].includes(u.role) ? u.role : "user") as CreateUserDto["role"], telefono: u.telefono || "", cedula: u.cedula || "" });
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingUser(null);
    setFormData({ nombre: "", apellido: "", email: "", role: "user", telefono: "", cedula: "", password: "", planNombre: "Consultor" });
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
            Configuración
          </h1>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
        <button type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "profile"
            ? "border-[#223382] text-[#223382]"
            : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
        >
          <User className="w-4 h-4" />
          Mi Perfil
        </button>

        <button type="button"
          onClick={() => setActiveTab("subscription")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "subscription"
            ? "border-[#223382] text-[#223382]"
            : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
        >
          <CreditCard className="w-4 h-4" />
          Suscripción
        </button>

        {(user?.role === "admin" || user?.role === "owner") && (
          <>
            <button type="button"
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "users"
                ? "border-[#223382] text-[#223382]"
                : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
            >
              <Users className="w-4 h-4" />
              Usuarios y Accesos
            </button>

          </>
        )}

        {isManagementTier && (
          <button
            type="button"
            onClick={() => setActiveTab("invitees")}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "invitees"
              ? "border-[#223382] text-[#223382]"
              : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
          >
            <UserPlus className="w-4 h-4" />
            Usuarios Invitados
          </button>
        )}

        {/* Security tab - available for all authenticated users */}
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "security"
            ? "border-[#223382] text-[#223382]"
            : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
        >
          <Shield className="w-4 h-4" />
          Seguridad
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <m.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MyProfileForm />
            </m.div>
          )}

          {activeTab === "subscription" && (
            <m.div
              key="subscription"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SubscriptionSettings />
            </m.div>
          )}

          {activeTab === "users" && (
            <m.div
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
                onRefresh={refetchUsers}
              />
            </m.div>
          )}

          {activeTab === "invitees" && isManagementTier && (
            <m.div
              key="invitees"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <InviteesSettings />
            </m.div>
          )}

          {activeTab === "security" && (
            <m.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <section className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-red-700 mb-4">Zona de Peligro</h2>
                <p className="text-sm text-red-600 mb-4">
                  Las acciones en esta zona son irreversibles y afectarán tu cuenta de forma permanente.
                </p>
                <DeleteAccountSection />
              </section>
            </m.div>
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
