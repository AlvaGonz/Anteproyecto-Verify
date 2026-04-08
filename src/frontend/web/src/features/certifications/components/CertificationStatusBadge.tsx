import React from "react";
import { CertificationStatus } from "../types";

interface CertificationStatusBadgeProps {
  status: CertificationStatus;
}

export const CertificationStatusBadge: React.FC<
  CertificationStatusBadgeProps
> = ({ status }) => {
  let colorClass = "bg-gray-100 text-gray-800";
  let label = "Desconocido";

  switch (status) {
    case CertificationStatus.Emitido:
    case CertificationStatus.Vigente:
      colorClass = "bg-green-100 text-green-800";
      label = CertificationStatus[status];
      break;
    case CertificationStatus.Expirado:
      colorClass = "bg-yellow-100 text-yellow-800";
      label = "Expirado";
      break;
    case CertificationStatus.Revocado:
      colorClass = "bg-red-100 text-red-800";
      label = "Revocado";
      break;
  }

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}
    >
      {label}
    </span>
  );
};
