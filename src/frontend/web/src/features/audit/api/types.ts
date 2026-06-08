export interface LogProyectoDto {
  idLog: number;
  idProyecto: number;
  accion: string;
  descripcion: string;
  fecha: string;
  idUsuario: number;
  nombreUsuario?: string;
}
