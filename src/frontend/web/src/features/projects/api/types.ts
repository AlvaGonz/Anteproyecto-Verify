import { ProjectCategory, ProjectStatus, IntegrityStatus, ProjectRegistrant } from "../types";

export interface ProyectoDto {
  id: string;
  codigoInterno: string;
  nombre: string;
  ubicacionTexto: string;
  ubicacionGps?: string;
  valorEstimado?: number;
  categoria: ProjectCategory;
  datosDesarrollador?: string;
  rncDesarrollador?: string;
  designacionCatastral?: string;
  matricula?: string;
  estadoJuridico: number;
  estatusDescripcion: string;
  estadoProyecto: ProjectStatus;
  estadoIntegridad: IntegrityStatus;
  usuarioCreadorId: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  imagenUrl?: string;
  imagenAdicional1?: string;
  imagenAdicional2?: string;
  imagenAdicional3?: string;
  imagenAdicional4?: string;
  imagenAdicional5?: string;
  planNombre?: string | null;
  registradoPor?: ProjectRegistrant | null;
}
