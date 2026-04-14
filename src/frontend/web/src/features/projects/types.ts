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
  imagenUrl?: string;
  completionRate?: number;
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

export interface ValidationDocument {
  id: string;
  name: string;
  status: 'verified' | 'pending' | 'rejected';
}

export interface ValidationProjectMetadata {
  developer: string;
  completionYear: number;
  registrationNumber: string;
  propertyType: string;
}

export interface ValidationTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'ongoing' | 'pending';
}

export interface ValidationProjectData {
  id: string;
  name: string;
  location: string;
  status: 'approved' | 'pending' | 'rejected';
  integrityScore: number;
  riskLevel: 'minimo' | 'medio' | 'alto';
  metadata: ValidationProjectMetadata;
  documents: ValidationDocument[];
  timeline: ValidationTimelineEvent[];
}
