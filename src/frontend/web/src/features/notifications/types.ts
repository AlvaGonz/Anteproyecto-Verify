export interface NotificationDto {
  id: string;
  codigoReferencia: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fechaUtc: string;
  enlaceRelacionado?: string;
  email?: string;
  telefono?: string;
  tipoNotificacionCodigo?: string;
  categoria?: string;
  prioridad?: number;
  canales?: string;
  entidadReferenciaId?: string;
  entidadReferenciaTipo?: string;
}
