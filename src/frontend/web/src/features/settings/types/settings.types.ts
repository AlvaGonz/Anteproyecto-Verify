export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BasicUserDto {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  estado?: string;
}

export interface UserSettings {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: "admin" | "dev" | "validator" | "user" | "owner" | "corporativo" | "business" | "professional" | "consultation";
  telefono: string;
  cedula: string;
  rnc?: string;
  razonSocial?: string;
  nombreComercial?: string;
  profileId: string | null;
  profileName: string;
  planId: string | null;
  planName: string;
  planPrice: number | null;
  planCreatedAt?: string;
  planExpiresAt?: string;
  usedProjects?: number;
  usedQueries?: number;
  maxInvitees?: number;
  inviteesCount?: number;
  inviteesList?: BasicUserDto[];
  avatarUrl?: string;
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
  nombre: string;
  apellido: string;
  email: string;
  role: "admin" | "dev" | "validator" | "user";
  telefono?: string;
  cedula?: string;
  password?: string;
  planNombre?: string;
}

export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  // email and cedula are intentionally excluded — immutable post-registration
  // role is managed via PATCH /admin/users/:id/role (separate endpoint)
}
