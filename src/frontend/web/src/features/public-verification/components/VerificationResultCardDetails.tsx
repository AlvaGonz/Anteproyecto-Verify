import React from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Calendar,
  Globe,
  MapIcon,
  MapPin,
  Verified,
} from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { PublicVerificationDto } from "../../certifications/types";

type VerificationStatus = "verified" | "pending" | "failed" | "observation";

interface VerificationResultCardDetailsProps {
  isUnregistered: boolean;
  status: VerificationStatus;
  data: PublicVerificationDto;
  invited: boolean;
  requesting: boolean;
  onInvite: () => void;
  onRequestCertification: () => void;
}

export const VerificationResultCardDetails: React.FC<
  VerificationResultCardDetailsProps
> = ({
  isUnregistered,
  status,
  data,
  invited,
  requesting,
  onInvite,
  onRequestCertification,
}) => {
  return (
    <>
      <div
        className={cn(
          "flex items-center gap-6 p-6 rounded-3xl border transition-all duration-500",
          isUnregistered
            ? "bg-amber-500/5 border-amber-500/20"
            : "bg-surface-raised border-outline-variant/10",
        )}
      >
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center shrink-0 shadow-lg transition-all duration-500",
            isUnregistered
              ? "bg-amber-500 text-white"
              : status === "verified"
                ? "bg-emerald-500 text-white"
                : status === "observation"
                  ? "bg-primary text-white"
                  : "bg-error text-white",
          )}
        >
          {isUnregistered ? (
            <AlertTriangle className="w-10 h-10 animate-pulse" />
          ) : (
            <Verified className="w-12 h-12" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black tracking-widest uppercase opacity-40">
              Status Actual
            </span>
            <div className="h-px flex-1 bg-outline-variant/20" />
          </div>
          <h2
            className={cn(
              "text-3xl font-['Manrope'] font-black tracking-tight",
              isUnregistered
                ? "text-amber-600"
                : status === "verified"
                  ? "text-emerald-600"
                  : status === "observation"
                    ? "text-primary"
                    : "text-error",
            )}
          >
            {isUnregistered
              ? "REGISTRO EXTERNO"
              : status === "verified"
                ? "VERIFICADO"
                : status === "observation"
                  ? "OBSERVACIONES"
                  : "NO VÁLIDO"}
          </h2>
          <p className="text-on-surface-variant text-sm font-medium mt-1 leading-relaxed">
            {isUnregistered
              ? "Esta persona o entidad posee un registro oficial válido en las instituciones gubernamentales de la República Dominicana, pero no está afiliada a VeriFinca."
              : "Este proyecto ha completado exitosamente las fases de debida diligencia institucional y validación de campo."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary/5">
            <Building2 className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block mb-1">
              {isUnregistered ? "Tipo de Registro" : "Identidad de Proyecto"}
            </span>
            <h3 className="text-lg font-bold text-on-surface leading-tight">
              {data.nombreProyecto}
            </h3>
            <p className="text-xs text-secondary font-bold mt-1">
              Origen: {"N/A"}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary/5">
            <MapIcon className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block mb-1">
              Sectores / Localización
            </span>
            <p className="text-sm font-bold text-on-surface leading-snug">
              {data.ubicacion}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[#223382] hover:underline cursor-pointer">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase">
                Ver en Mapa de Catastro
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary/5">
            <Calendar className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block mb-1">
              Fecha de Consulta
            </span>
            <p className="text-sm font-black text-on-surface" suppressHydrationWarning>
              {new Date().toLocaleDateString()}
            </p>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">
              Sincronizado vía VF-NODE-01
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary/5">
            <Globe className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block mb-1">
              Visibilidad Digital
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm font-black text-on-surface">
                Registro Externo Activo
              </span>
            </div>
          </div>
        </div>
      </div>

      {isUnregistered ? (
        <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-6">
          <div className="flex gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-amber-700 uppercase tracking-wider mb-1">
                Entidad No Certificada en VeriFinca
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                Para garantizar la inmutabilidad de los fondos, auditoría
                de permisos y transparencia total vía blockchain, es
                necesario que la entidad complete su registro en VeriFinca.
                Puede invitar al titular a iniciar este proceso de forma
                gratuita.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={onInvite}
              disabled={invited}
              className={cn(
                "flex-1 h-14 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2",
                invited
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-secondary text-[#F4F1EC] hover:bg-primary active:scale-95 cursor-pointer shadow-md",
              )}
            >
              {invited ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> ¡Invitación
                  Enviada!
                </>
              ) : (
                <>Invitar a Registrarse</>
              )}
            </button>

            <button
              type="button"
              onClick={onRequestCertification}
              disabled={requesting}
              className={cn(
                "flex-1 h-14 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 border-2",
                requesting
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg"
                  : "border-amber-500/20 text-amber-700 bg-amber-500/5 hover:bg-amber-500/10 active:scale-95 cursor-pointer",
              )}
            >
              {requesting ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> ¡Solicitud
                  Enviada!
                </>
              ) : (
                <>Solicitar Certificación</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-primary-subtle border border-primary/10 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-primary shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-primary mb-1">
              Aviso al Inversionista
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              Esta certificación confirma que el proyecto cumple con los
              estándares documentales de VeriFinca. Se recomienda validar
              con su asesor legal antes de realizar cualquier desembolso.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
