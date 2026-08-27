import React from "react";
import QRCode from "react-qr-code";

interface CertificationQrProps {
  url: string;
  size?: number;
  className?: string;
}

export const CertificationQr: React.FC<CertificationQrProps> = ({
  url,
  size = 128,
  className = "",
}) => {
  return (
    <div
      data-testid="integrity-seal-qr"
      aria-label="Código QR de verificación de integridad"
      role="img"
      className={`bg-white p-2 rounded-lg border border-[#C8BFB5] inline-block ${className}`}
    >
      <QRCode
        value={url}
        size={size}
        level="M"
        aria-label="Código QR de verificación de integridad"
      />
    </div>
  );
};
