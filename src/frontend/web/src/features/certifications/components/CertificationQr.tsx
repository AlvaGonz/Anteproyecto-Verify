import React from "react";
import QRCode from "react-qr-code";

interface CertificationQrProps {
  url: string;
  size?: number;
}

export const CertificationQr: React.FC<CertificationQrProps> = ({
  url,
  size = 128,
}) => {
  return (
    <div className="bg-white p-2 rounded-lg border inline-block">
      <QRCode value={url} size={size} level="M" />
    </div>
  );
};
