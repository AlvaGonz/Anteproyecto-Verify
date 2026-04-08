export interface PublicProjectVerificationDto {
  publicCode: string;
  projectName: string;
  publicLocation: string;
  publicProjectStatus: string;
  integrityStatus: string;
  verificationMessage: string;
  lastVerifiedUtc?: string;
  isVerifiable: boolean;
  summary: string;
}
