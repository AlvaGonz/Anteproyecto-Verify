import { PublicProjectVerificationDto } from "../../features/public-verification/types";

export const mockPublicProjectVerifications: PublicProjectVerificationDto[] = [
  {
    publicCode: "VF-2026-ABC123XYZ",
    projectName: "Torre Bella Vista Piantini",
    publicLocation: "Ensanche Piantini, Distrito Nacional, Santo Domingo",
    publicProjectStatus: "En Construcción",
    integrityStatus: "Valid",
    verificationMessage: "El proyecto cuenta con todas las validaciones de integridad y permisos vigentes.",
    lastVerifiedUtc: "2026-01-25T10:00:00Z",
    isVerifiable: true,
    summary: "Proyecto verificado exitosamente."
  }
];
