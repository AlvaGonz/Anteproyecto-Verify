export enum CertificationStatus {
  Emitido = 1,
  Vigente = 2,
  Expirado = 3,
  Revocado = 4,
}

export interface CertificationDto {
  id: string;
  proyectoId: string;
  codigoVerificacion: string;
  estadoCertificacion: CertificationStatus;
  fechaEmisionUtc: string;
  fechaVigenciaUtc?: string;
  urlVerificacion: string;
  scoreIntegridad?: number;
  estadoIntegridad: number; // 1: Pending, 2: Valid, 3: Warning, 4: Critical
  revocado: boolean;
  motivoRevocacion?: string;
}

export interface PublicVerificationDto {
  nombreProyecto: string;
  ubicacion: string;
  codigoVerificacion: string;
  estadoCertificacion: CertificationStatus;
  fechaEmisionUtc: string;
  fechaVigenciaUtc?: string;
  estadoIntegridad: number;
}
