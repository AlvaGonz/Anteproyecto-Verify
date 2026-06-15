export interface NotificacionDto {
  idNotificacion: number;
  idUsuario: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  tipo: "Info" | "Alerta" | "Error" | "Exito";
}
