import React from "react";
import { ShieldCheck, Lock } from "lucide-react";
import QRCode from "react-qr-code";
import { cn } from "../../../shared/utils/cn";
import { PublicVerificationDto } from "../../certifications/types";

interface VerificationResultCardHeaderProps {
  isUnregistered: boolean;
  data: PublicVerificationDto;
}

export const VerificationResultCardHeader: React.FC<
  VerificationResultCardHeaderProps
> = ({ isUnregistered, data }) => {
  return (
    <div
      className={cn(
        "p-8 md:p-12 relative overflow-hidden transition-all duration-500",
        isUnregistered
          ? "bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900"
          : "bg-secondary",
      )}
    >
      <div className="absolute top-0 right-0 p-8">
        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
          <QRCode
            value={window.location.href}
            size={80}
            bgColor="transparent"
            fgColor={isUnregistered ? "#F59E0B" : "#F4F1EC"}
          />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-['Manrope'] font-black tracking-[0.2em] text-[12px] opacity-80 uppercase">
              Blockchain Verification Protocol
            </span>
            <span className="text-white text-2xl font-['Manrope'] font-black">
              VeriFinca Institutional
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6 pt-8 border-t border-white/10">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl md:text-5xl font-['Manrope'] font-black text-[#F4F1EC] leading-tight">
              {isUnregistered ? (
                <>
                  CONSULTA DE
                  <br />
                  REGISTRO EXTERNO
                </>
              ) : (
                <>
                  CERTIFICADO DE
                  <br />
                  INTEGRIDAD
                </>
              )}
            </h1>
            <p className="text-[#F4F1EC]/60 text-sm font-medium mt-2 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Constancia Digital Pública
              (Dominican Republic Law 172-13)
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#F4F1EC]/40 text-[10px] uppercase font-bold tracking-widest mb-1">
              {isUnregistered
                ? "CÓDIGO DE CONSULTA"
                : "CÓDIGO ÚNICO DE REGISTRO"}
            </span>
            <div className="bg-primary/20 backdrop-blur-md border border-primary/30 px-4 py-2 rounded-lg">
              <span className="text-primary text-xl font-mono font-black">
                {data.codigoVerificacion}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
