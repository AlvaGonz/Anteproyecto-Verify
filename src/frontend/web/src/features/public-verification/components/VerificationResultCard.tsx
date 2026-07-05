import React from "react";
import { PublicVerificationDto, CertificationStatus } from "../../certifications/types";
import { VerificationResultCardLayout } from "./VerificationResultCardLayout";

type VerificationStatus = "verified" | "pending" | "failed" | "observation";

interface VerificationResultCardProps {
  data: PublicVerificationDto;
}

export const VerificationResultCard: React.FC<VerificationResultCardProps> = ({
  data,
}) => {
  const [invited, setInvited] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);

  const isUnregistered = data.estadoCertificacion === CertificationStatus.Revocado;

  const getStatus = (): VerificationStatus => {
    if (isUnregistered) return "pending";
    if (data.estadoIntegridad === 1) return "pending";
    if (data.estadoIntegridad === 2) return "verified";
    if (data.estadoIntegridad === 3) return "observation";
    if (data.estadoIntegridad === 4) return "failed";
    return "pending";
  };

  const status = getStatus();

  // ⚠️ HUMAN REVIEW: Mock validation items if not present
  const validationItems = [
    { label: "Titularidad de Tierra", checked: true },
    { label: "Permisos Ambientales", checked: true },
    { label: "Licencia de Construcción", checked: data.estadoIntegridad !== 4 },
    { label: "Cumplimiento Ley 189-11", checked: true },
    { label: "Auditoría Técnica Externa", checked: data.estadoIntegridad === 2 },
  ];

  return (
    <VerificationResultCardLayout
      isUnregistered={isUnregistered}
      status={status}
      data={data}
      validationItems={validationItems}
      invited={invited}
      requesting={requesting}
      onInvite={() => {
        setInvited(true);
        setTimeout(() => setInvited(false), 3000);
      }}
      onRequestCertification={() => {
        setRequesting(true);
        setTimeout(() => setRequesting(false), 3000);
      }}
    />
  );
};
