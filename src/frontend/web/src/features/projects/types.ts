export interface ProyectoDto {
  id: string;
  codigoInterno: string;
  nombre: string;
  ubicacionTexto: string;
  ubicacionGps?: string;
  valorEstimado?: number;
  categoria: ProjectCategory;
  datosDesarrollador?: string;
  designacionCatastral?: string;
  estadoProyecto: ProjectStatus;
  estadoIntegridad: IntegrityStatus;
  usuarioCreadorId: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface CreateProyectoDto {
  nombre: string;
  ubicacionTexto: string;
  usuarioCreadorId: string;
  categoria?: ProjectCategory;
  datosDesarrollador?: string;
  designacionCatastral?: string;
}

export interface UpdateProyectoDto {
  nombre: string;
  ubicacionTexto: string;
  ubicacionGps?: string;
  valorEstimado?: number;
  categoria: ProjectCategory;
  datosDesarrollador?: string;
  designacionCatastral?: string;
}

export enum ProjectCategory {
  Residencial = 1,
  Comercial = 2,
  Turistico = 3,
  Mixto = 4,
  Otro = 99
}

export enum ProjectStatus {
  Draft = 0,
  Published = 1,
  InReview = 2,
  Observed = 3,
  Validated = 4,
  Rejected = 5,
}

export enum IntegrityStatus {
  Pending = 0,
  Verified = 1,
  Failed = 2,
}
