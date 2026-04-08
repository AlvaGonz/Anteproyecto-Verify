export interface NotificationDto {
  id: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fechaUtc: string;
  enlaceRelacionado?: string;
}
