export interface UserSettings {
  id: string;
  name: string;
  email: string;
  role: "admin" | "dev" | "validator" | "user";
  telefono: string;
  cedula: string;
  profileId: number | null;
  profileName: string;
  planId: number | null;
  planName: string;
  planPrice: number | null;
}

export interface ProfilePermissions {
  perfilId: number;
  name: string;
  permissions: string[];
}

export interface SubscriptionPlan {
  planId: number;
  name: string;
  price: number;
}
