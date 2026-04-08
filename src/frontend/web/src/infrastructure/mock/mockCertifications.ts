import { CertificationDto, PublicVerificationDto, CertificationStatus } from "../../features/certifications/types";

export const mockCertifications: CertificationDto[] = [
  {
    id: "cert-001",
    proyectoId: "proj-001",
    codigoVerificacion: "VF-2026-ABC123XYZ",
    estadoCertificacion: CertificationStatus.Vigente,
    fechaEmisionUtc: "2026-01-25T10:00:00Z",
    fechaVigenciaUtc: "2027-01-25T10:00:00Z",
    urlVerificacion: "https://verifinca.do/verify/VF-2026-ABC123XYZ",
    scoreIntegridad: 95,
    estadoIntegridad: 2,
    revocado: false
  }
];

export const mockPublicVerifications: PublicVerificationDto[] = [
  {
    nombreProyecto: "Torre Bella Vista Piantini",
    ubicacion: "Ensanche Piantini, Distrito Nacional, Santo Domingo",
    codigoVerificacion: "VF-2026-ABC123XYZ",
    estadoCertificacion: CertificationStatus.Vigente,
    fechaEmisionUtc: "2026-01-25T10:00:00Z",
    fechaVigenciaUtc: "2027-01-25T10:00:00Z",
    estadoIntegridad: 2
  }
];
