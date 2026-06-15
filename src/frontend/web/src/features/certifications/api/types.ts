export interface SelloIntegridadDto {
  idSello: number;
  idProyecto: number;
  codigoQR: string;
  urlVerificacion: string;
  fechaEmision: string;
  fechaExpiracion?: string;
  estado: "Activo" | "Revocado" | "Expirado";
}
