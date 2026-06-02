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
  developerName?: string;
  numSuelo?: string;
  ipi?: string;
  rnc?: string;
  cedula?: string;
  validationDimensions?: {
    label: string;
    checked: boolean;
  }[];
  isRegistered?: boolean;
}

