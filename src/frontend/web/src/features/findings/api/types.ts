export interface HallazgoDto {
  idHallazgo: number;
  idProyecto: number;
  idValidacion: number;
  titulo: string;
  descripcion: string;
  severidad: "Critico" | "Alto" | "Medio" | "Bajo";
  estado: "Abierto" | "Resuelto" | "Descartado";
  fechaDeteccion: string;
}
