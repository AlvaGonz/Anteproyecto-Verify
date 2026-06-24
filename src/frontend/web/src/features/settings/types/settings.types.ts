export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface UserSettings {
  id: string;
  name: string;
  email: string;
  role: "admin" | "dev" | "validator" | "user";
  telefono: string;
  cedula: string;
  profileId: string | null;
  profileName: string;
  planId: string | null;
  planName: string;
  planPrice: number | null;
}

export interface ProfilePermissions {
  perfilId: string;
  name: string;
  permissions: string[];
}

export interface SubscriptionPlan {
  planId: string;
  name: string;
  price: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: "admin" | "dev" | "validator" | "user";
  telefono?: string;
  cedula?: string;
  password?: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: "admin" | "dev" | "validator" | "user";
  telefono?: string;
  // email and cedula intentionally excluded — immutable post-registration
}
