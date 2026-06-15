export interface ReporteDto {
  idReporte: number;
  idProyecto: number;
  tipo: string;
  fechaGeneracion: string;
  urlDescarga?: string;
  estado: "Generando" | "Listo" | "Error";
}
