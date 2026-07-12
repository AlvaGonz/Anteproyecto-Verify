import React, { useState } from "react";
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
import {
  Settings,
  Users,
  Loader2,
  User,
  CreditCard,
  UserPlus
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { validateCedulaCheckDigit } from "../../features/auth/schemas";

type TabId = "profile" | "subscription" | "users" | "invitees";



export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSettings | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({ nombre: "", apellido: "", email: "", role: "user", telefono: "", cedula: "" });

  const isAdmin = user?.role === "admin" || user?.role === "owner";
  const isManagementTier = user?.plan === "Corporativo" || user?.plan === "Empresa";

  const { data: users = [], isLoading: isLoadingUsers } = useUsers(1, 50, isAdmin);

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

if (formData.telefono) {
       const telDigits = formData.telefono.replace(/\D/g, "");
       if (telDigits.length > 0 && !/^(809|829|849)\d{7}$/.test(telDigits)) {
         addToast("Teléfono inválido. Solo códigos 809, 829 o 849 (ej: 8095550199)", "error");
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
    setFormData({ nombre: u.nombre, apellido: u.apellido, email: u.email, role: (["admin", "dev", "validator", "user"].includes(u.role) ? u.role : "user") as CreateUserDto["role"], telefono: u.telefono || "", cedula: u.cedula || "" });
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingUser(null);
    setFormData({ nombre: "", apellido: "", email: "", role: "user", telefono: "", cedula: "", password: "" });
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
      <div className="flex border-b border-border">
        <button type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "profile"
            ? "border-[#223382] text-[#223382]"
            : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
        >
          <User className="w-4 h-4" />
          Mi Perfil
        </button>

        <button type="button"
          onClick={() => setActiveTab("subscription")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "subscription"
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
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "users"
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
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${activeTab === "invitees"
              ? "border-[#223382] text-[#223382]"
              : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
          >
            <UserPlus className="w-4 h-4" />
            Usuarios Invitados
          </button>
        )}
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
