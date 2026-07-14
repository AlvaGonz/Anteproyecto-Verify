export interface NotificacionDto {
  idNotificacion: number;
  idUsuario: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaUtc: string; // ponytail: matches backend NotificationDto.FechaUtc
  tipo: "Info" | "Alerta" | "Error" | "Exito";
}
