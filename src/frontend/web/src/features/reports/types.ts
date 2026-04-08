export interface PublicProjectReportDto {
  id: string;
  proyectoId: string;
  estadoReporte: string;
  resumenPublico: string;
  estadoProyectoVisible: string;
  estadoExpedienteVisible: string;
  fechaGeneracionUtc: string;
  ultimaActualizacionUtc: string;
  version: number;
  esPublico: boolean;
}

export interface ProjectReportDto {
  id: string;
  proyectoId: string;
  estadoReporte: string;
  resumen?: string;
  version: number;
  generadoPorUsuarioId?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
}
