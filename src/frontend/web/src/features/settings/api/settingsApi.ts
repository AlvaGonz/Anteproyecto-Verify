import { Result, success, failure } from "../../../shared/utils/functional";
import { UserSettings, ProfilePermissions, SubscriptionPlan } from "../types/settings.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

// Fallback mock user settings for offline development
let mockUserSettings: UserSettings[] = [
  {
    id: "admin-guid-1",
    name: "Admin VeriFinca",
    email: "admin@verifinca.do",
    role: "admin",
    telefono: "809-555-0100",
    cedula: "001-0000000-1",
    profileId: 1,
    profileName: "ADMIN",
    planId: 2,
    planName: "Profesional",
    planPrice: 3500.00
  },
  {
    id: "dev-guid-2",
    name: "Desarrollador Inmobiliario",
    email: "dev@constructora.do",
    role: "dev",
    telefono: "809-555-0200",
    cedula: "001-0000000-2",
    profileId: 2,
    profileName: "DEVELOPER",
    planId: 1,
    planName: "Gratuito",
    planPrice: 0.00
  },
  {
    id: "val-guid-3",
    name: "Usuario Consulta",
    email: "consulta@publico.do",
    role: "validator",
    telefono: "809-555-0300",
    cedula: "001-0000000-3",
    profileId: 3,
    profileName: "VALIDATOR",
    planId: 1,
    planName: "Gratuito",
    planPrice: 0.00
  }
];

const mockProfiles: ProfilePermissions[] = [
  { perfilId: 1, name: "ADMIN", permissions: ["GestionarUsuarios", "ConfigurarReglas", "VisualizarAuditoria", "CrearProyectos", "ValidarProyectos"] },
  { perfilId: 2, name: "DEVELOPER", permissions: ["CrearProyectos"] },
  { perfilId: 3, name: "VALIDATOR", permissions: ["CrearProyectos", "ValidarProyectos"] }
];

const mockPlans: SubscriptionPlan[] = [
  { planId: 1, name: "Gratuito", price: 0.00 },
  { planId: 2, name: "Profesional", price: 3500.00 },
  { planId: 3, name: "Empresa", price: 10000.00 },
  { planId: 4, name: "Enterprise", price: 30000.00 }
];

export type SettingsError = 
  | { _tag: "ServerError"; message: string }
  | { _tag: "Unauthorized" }
  | { _tag: "UnknownError"; original: unknown };

export const settingsApi = {
  getUsers: async (): Promise<Result<UserSettings[], SettingsError>> => {
    try {
      if (USE_MOCK) {
        return new Promise((resolve) =>
          setTimeout(() => resolve(success([...mockUserSettings])), 500)
        );
      }

      const response = await fetch(`${API_BASE_URL}/admin/settings/users`, {
        credentials: "include"
      });

      if (response.status === 401 || response.status === 403) {
        return failure({ _tag: "Unauthorized" });
      }

      if (!response.ok) {
        return failure({ _tag: "ServerError", message: "Failed to fetch user settings" });
      }

      const data = await response.json();
      return success(data);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  },

  updateUserRole: async (userId: string, role: "admin" | "dev" | "validator" | "user"): Promise<Result<{ message: string }, SettingsError>> => {
    try {
      if (USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const index = mockUserSettings.findIndex(u => u.id === userId);
            if (index !== -1) {
              mockUserSettings[index].role = role;
              mockUserSettings[index].profileName = role === "admin" ? "ADMIN" : role === "dev" ? "DEVELOPER" : "VALIDATOR";
              resolve(success({ message: "Rol y perfil actualizados exitosamente." }));
            } else {
              resolve(failure({ _tag: "ServerError", message: "User not found" }));
            }
          }, 500);
        });
      }

      const response = await fetch(`${API_BASE_URL}/admin/settings/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include"
      });

      if (response.status === 401 || response.status === 403) {
        return failure({ _tag: "Unauthorized" });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Failed to update role" }));
        return failure({ _tag: "ServerError", message: err.message || "Failed to update role" });
      }

      const data = await response.json();
      return success(data);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  },

  updateUserPlan: async (userId: string, planId: number): Promise<Result<{ message: string }, SettingsError>> => {
    try {
      if (USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const index = mockUserSettings.findIndex(u => u.id === userId);
            const plan = mockPlans.find(p => p.planId === planId);
            if (index !== -1 && plan) {
              mockUserSettings[index].planId = planId;
              mockUserSettings[index].planName = plan.name;
              mockUserSettings[index].planPrice = plan.price;
              resolve(success({ message: "Suscripción asignada exitosamente." }));
            } else {
              resolve(failure({ _tag: "ServerError", message: "User or plan not found" }));
            }
          }, 500);
        });
      }

      const response = await fetch(`${API_BASE_URL}/admin/settings/users/${userId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
        credentials: "include"
      });

      if (response.status === 401 || response.status === 403) {
        return failure({ _tag: "Unauthorized" });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Failed to update plan" }));
        return failure({ _tag: "ServerError", message: err.message || "Failed to update plan" });
      }

      const data = await response.json();
      return success(data);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  },

  getProfiles: async (): Promise<Result<ProfilePermissions[], SettingsError>> => {
    try {
      if (USE_MOCK) {
        return new Promise((resolve) =>
          setTimeout(() => resolve(success([...mockProfiles])), 500)
        );
      }

      const response = await fetch(`${API_BASE_URL}/admin/settings/profiles`, {
        credentials: "include"
      });

      if (response.status === 401 || response.status === 403) {
        return failure({ _tag: "Unauthorized" });
      }

      if (!response.ok) {
        return failure({ _tag: "ServerError", message: "Failed to fetch profiles" });
      }

      const data = await response.json();
      return success(data);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  },

  getPlans: async (): Promise<Result<SubscriptionPlan[], SettingsError>> => {
    try {
      if (USE_MOCK) {
        return new Promise((resolve) =>
          setTimeout(() => resolve(success([...mockPlans])), 500)
        );
      }

      const response = await fetch(`${API_BASE_URL}/admin/settings/plans`, {
        credentials: "include"
      });

      if (response.status === 401 || response.status === 403) {
        return failure({ _tag: "Unauthorized" });
      }

      if (!response.ok) {
        return failure({ _tag: "ServerError", message: "Failed to fetch plans" });
      }

      const data = await response.json();
      return success(data);
    } catch (e) {
      return failure({ _tag: "UnknownError", original: e });
    }
  }
};
