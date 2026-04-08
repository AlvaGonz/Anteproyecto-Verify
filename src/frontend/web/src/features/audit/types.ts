export interface AuditDto {
  id: string;
  proyectoId?: string;
  usuarioId?: string;
  tipoEvento: string;
  accion: string;
  entidad?: string;
  entidadId?: string;
  detalle?: string;
  ipOrigen?: string;
  userAgent?: string;
  fechaEventoUtc: string;
}

export interface AuditFilters {
  tipoEvento?: string;
  fromDate?: string;
  toDate?: string;
}
