export interface ValidationResultDto {
  idValidacion: number;
  idProyecto: number;
  tipoValidacion: string;
  estado: "Pendiente" | "Aprobado" | "Rechazado" | "Observacion";
  fechaValidacion: string;
  observaciones?: string;
  idUsuarioValidador?: number;
}
