export interface PublicVerificationDto {
  idSello: number;
  codigoQR: string;
  nombreProyecto: string;
  estado: "Activo" | "Revocado" | "Expirado";
  fechaEmision: string;
  urlProyecto?: string;
}
