export interface ProyectoDto {
  idProyecto: number;
  nombre: string;
  descripcion: string;
  estado: "Activo" | "Inactivo" | "Pendiente" | "Completado";
  fechaCreacion: string; // ISO string
  idUsuario: number;
  ubicacion?: string;
  tipoProyecto?: string;
}
