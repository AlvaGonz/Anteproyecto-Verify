export interface ProjectRegistrant {
  id: string;
  nombreCompleto: string;
  razonSocial?: string | null;
  rol: string;
  email: string;
  telefono?: string | null;
  avatarUrl?: string | null;
  fechaRegistro: string;
  verificado: boolean;
  titularId?: string | null;
}

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
  estadoJuridico: LegalStatus;
  propietario?: string;
  cedulaRncPropietario?: string;
  ipi?: string;
  estatusIpi?: string;
  estatusDescripcion: string;
  estadoProyecto: ProjectStatus;
  estadoIntegridad: IntegrityStatus;
  integrityScore?: number;
  sealName?: string;
  usuarioCreadorId: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  imagenUrl?: string;
  imagenAdicional1?: string;
  imagenAdicional2?: string;
  imagenAdicional3?: string;
  imagenAdicional4?: string;
  imagenAdicional5?: string;
  completionRate?: number;
  superficieM2?: number;
  fotoUrls?: string[];
  planNombre?: string | null;
  registradoPor?: ProjectRegistrant | null;
}

export interface CreateProyectoDto {
  nombre: string;
  ubicacionTexto: string;
  usuarioCreadorId: string;
  categoria?: ProjectCategory;
  datosDesarrollador?: string;
  rncDesarrollador?: string;
  designacionCatastral?: string;
  ubicacionGps?: string;
  matricula?: string;
  propietario?: string;
  cedulaRncPropietario?: string;
  ipi?: string;
  estatusIpi?: string;
  superficieM2?: number;
  imagenUrl?: string;
  imagenAdicional1?: string;
  imagenAdicional2?: string;
  imagenAdicional3?: string;
  imagenAdicional4?: string;
  imagenAdicional5?: string;
}

export interface UpdateProyectoDto {
  nombre: string;
  ubicacionTexto: string;
  ubicacionGps?: string;
  valorEstimado?: number;
  categoria: ProjectCategory;
  datosDesarrollador?: string;
  rncDesarrollador?: string;
  designacionCatastral?: string;
  matricula?: string;
  propietario?: string;
  cedulaRncPropietario?: string;
  ipi?: string;
  estatusIpi?: string;
  superficieM2?: number;
  fotosNuevas?: File[];
  imagenUrl?: string;
  imagenAdicional1?: string;
  imagenAdicional2?: string;
  imagenAdicional3?: string;
  imagenAdicional4?: string;
  imagenAdicional5?: string;
}

export enum ProjectCategory {
  Residencial = 1,
  Comercial = 2,
  Turistico = 3,
  Mixto = 4,
  Otro = 99
}

export enum ProjectStatus {
  Draft = 'CREADO',
  Edited = 'EDITADO',
  InReview = 'REVISION',
  Observed = 'OBSERVACION',
  Published = 'PUBLICADO',
  Validated = 'PUBLICADO', // Mapping old Validated to Publicado for compatibility if needed
  Rejected = 'RECHAZADO' // Keep old just in case
}

export interface StatusEligibility {
  documentCount: number;
  hasObservaciones: boolean;
  currentStatus: ProjectStatus;
}

export enum LegalStatus {
  Pending = 0,
  Valid = 1,
  WithObservations = 2,
  Invalid = 3,
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

export type ProjectError =
  | { _tag: "NotFound"; id: string }
  | { _tag: "Unauthorized" }
  | { _tag: "ValidationError"; errors: string[] }
  | { _tag: "ServerError"; message: string }
  | { _tag: "UnknownError"; original: unknown }
  | { _tag: "LimitReached"; message: string };

export const getProjectErrorMessage = (error: ProjectError): string => {
  switch (error._tag) {
    case "NotFound": return `Proyecto no encontrado (ID: ${error.id})`;
    case "Unauthorized": return "No tiene permisos para realizar esta acción";
    case "ValidationError": return `Error de validación: ${error.errors.join(", ")}`;
    case "ServerError": return error.message;
    case "LimitReached": return error.message || "Has alcanzado el límite permitido de proyectos para tu plan.";
    case "UnknownError": return "Ocurrió un error inesperado";
    default: return "Error desconocido";
  }
};



export interface CatastroLookupDto {
  designacionCatastral?: string;
  matricula?: string;
  superficieM2?: number;
  propietario?: string;
  cedulaRncPropietario?: string;
  ipi?: string;
  estatusIpi?: string;
  provincia?: string;
}
