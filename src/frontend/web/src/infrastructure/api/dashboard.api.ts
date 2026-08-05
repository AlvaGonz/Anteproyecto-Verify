import { apiClient } from "./client";

export interface DashboardStatsDto {
  totalUsuarios: number;
  suscripcionesActivas: number;
  ingresosMensualesEstimados: number;
  suscripcionesRecientes: SuscripcionRecienteDto[];
  proyectosRecientes: ProyectoRecienteDto[];
  totalProyectos: number;
  proyectosPendientes: number;
  proyectosAprobados: number;
  proyectosRechazados: number;
  usuariosPorPlan: Record<string, number>;
  totalConsultasRealizadas: number;
  totalProyectosRegistrados: number;
  totalIntereses: number;
  proyectosPorMes: ProyectosPorMesDto[];
  usuariosPorMes: UsuariosPorMesDto[];
}

export interface ProyectosPorMesDto {
  year: number;
  month: number;
  count: number;
}

export interface UsuariosPorMesDto {
  year: number;
  month: number;
  count: number;
}

export interface SuscripcionRecienteDto {
  fechaAlta: string;
  plan: string;
  correo: string;
  estado: string;
}

export interface ProyectoRecienteDto {
  fechaRegistro: string;
  nombre: string;
  desarrollador: string;
  estado: string;
  imagenUrl?: string | null;
}

export const adminDashboardApi = {
  getStats: async (): Promise<DashboardStatsDto> => {
    const response = await apiClient.get<DashboardStatsDto>("/admin/dashboard/stats");
    return response.data;
  },
  getUserStats: async (): Promise<DashboardStatsDto> => {
    const response = await apiClient.get<DashboardStatsDto>("/admin/dashboard/user-stats");
    return response.data;
  },
};
