import React from "react";
import { PublicProjectVerificationDto } from "../types";
import { PublicVerificationBadge, VerificationStatus } from "./PublicVerificationBadge";
import { MapPin, Building2, Calendar, ShieldCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PublicProjectCardProps {
  data: PublicProjectVerificationDto;
  onClick?: () => void;
}

export const PublicProjectCard: React.FC<PublicProjectCardProps> = ({
  data,
}) => {
  /* Derive status from integrityStatus and isVerifiable */
  const getStatus = (): VerificationStatus => {
    if (!data.isVerifiable) return "failed";
    if (data.integrityStatus === "Consistente") return "verified";
    if (data.integrityStatus === "Con Observaciones") return "observation";
    return "pending";
  };

  return (
    <Link
      to={`/verify/${data.publicCode}`}
      className="group relative block bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-raised hover:shadow-floating transition-all duration-300 hover:scale-[1.01]"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-80">Checklist Validado</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface font-['Manrope'] group-hover:text-secondary transition-colors leading-tight">
            {data.projectName}
          </h3>
        </div>
        <PublicVerificationBadge status={getStatus()} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-50">Localización pública</span>
            <span className="text-sm font-medium line-clamp-1">{data.publicLocation}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-on-surface-variant">
          <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-50">Estatus del proyecto</span>
            <span className="text-sm font-medium">{data.publicProjectStatus}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-outline-variant/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Calendar className="w-4 h-4 opacity-50" />
          <span className="text-xs font-mono font-black opacity-60 uppercase">{data.publicCode}</span>
        </div>
        <div className="flex items-center gap-1.5 text-secondary text-sm font-bold group-hover:translate-x-1 transition-transform">
          Ver Detalles <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Hover decoration */}
      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-10 transition-opacity">
        <Building2 className="w-24 h-24 -mr-10 -mt-8 rotate-12" />
      </div>
    </Link>
  );
};
