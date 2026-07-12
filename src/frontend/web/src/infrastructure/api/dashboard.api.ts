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
}

export const adminDashboardApi = {
  getStats: async (): Promise<DashboardStatsDto> => {
    const response = await apiClient.get<DashboardStatsDto>("/admin/dashboard/stats");
    return response.data;
  },
};
