import React from "react";
import { ShieldCheck, Cpu, Lock } from "lucide-react";
import { PublicVerificationDto } from "../../certifications/types";
import { VerificationResultCardActions } from "./VerificationResultCardActions";
import { VerificationResultCardHeader } from "./VerificationResultCardHeader";
import { VerificationResultCardDetails } from "./VerificationResultCardDetails";
import { VerificationResultCardValidation } from "./VerificationResultCardValidation";

type VerificationStatus = "verified" | "pending" | "failed" | "observation";

export interface VerificationResultCardLayoutProps {
  isUnregistered: boolean;
  status: VerificationStatus;
  data: PublicVerificationDto;
  validationItems: Array<{ label: string; checked: boolean }>;
  invited: boolean;
  requesting: boolean;
  onInvite: () => void;
  onRequestCertification: () => void;
}

export const VerificationResultCardLayout: React.FC<
  VerificationResultCardLayoutProps
> = ({
  isUnregistered,
  status,
  data,
  validationItems,
  invited,
  requesting,
  onInvite,
  onRequestCertification,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <VerificationResultCardActions />

      <div className="bg-white rounded-3xl overflow-hidden shadow-premium border border-outline-variant/10 relative print:shadow-none print:border-none">
        {/* Certificate Watermark Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.03]">
          <ShieldCheck className="w-[800px] h-[800px] -rotate-12" />
        </div>

        <VerificationResultCardHeader
          isUnregistered={isUnregistered}
          data={data}
        />

        {/* Content Body */}
        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          <div className="lg:col-span-7 space-y-10">
            <VerificationResultCardDetails
              isUnregistered={isUnregistered}
              status={status}
              data={data}
              invited={invited}
              requesting={requesting}
              onInvite={onInvite}
              onRequestCertification={onRequestCertification}
            />
          </div>

          <div className="lg:col-span-5 space-y-8">
            <VerificationResultCardValidation
              validationItems={validationItems}
            />
          </div>
        </div>

        {/* Technical Footer */}
        <div className="bg-secondary/5 py-4 px-8 border-t border-outline-variant/10 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-secondary">
              <Cpu className="w-3 h-3" /> INFRAESTRUCTURA DISTRIBUIDA
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-secondary">
              <Lock className="w-3 h-3" /> CIFRADO SHA-256
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> EN TIEMPO
            REAL
          </div>
        </div>
      </div>
    </div>
  );
};
