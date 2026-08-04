import React from "react";

interface CertificationStatusBadgeProps {
  status: number;
}

export const CertificationStatusBadge: React.FC<
  CertificationStatusBadgeProps
> = ({ status }) => {
  let colorClass = "bg-[#DAD1C8] text-[#5C5C5C]";
  let label = "Desconocido";

  switch (status) {
    case 1:
    case 2:
      colorClass = "bg-[#E8F5E9] text-[#2E7D32]";
      label = status === 1 ? "Emitido" : "Activo";
      break;
    case 3:
      colorClass = "bg-[#F9A825]/[0.15] text-[#F9A825]";
      label = "Expirado";
      break;
    case 4:
      colorClass = "bg-[#FFEBEE] text-[#C62828]";
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
