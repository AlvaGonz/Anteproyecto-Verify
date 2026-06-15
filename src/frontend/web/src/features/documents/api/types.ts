export interface DocumentoDto {
  idDocumento: number;
  idProyecto: number;
  nombre: string;
  tipo: string;
  url: string;
  fechaSubida: string;
  estado: "Pendiente" | "Aprobado" | "Rechazado";
  tamanio?: number;
}
