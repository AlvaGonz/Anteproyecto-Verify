import React from "react";
import { ProjectRegistrant } from "../types";
import { Mail, Phone, ShieldCheck, Building2, CalendarDays, UserCircle2 } from "lucide-react";

interface RegistrantCardProps {
  registrant: ProjectRegistrant;
}

export const RegistrantCard: React.FC<RegistrantCardProps> = ({ registrant }) => {
  const {
    nombreCompleto,
    razonSocial,
    rol,
    razonSocial: empresa,
    telefono,
    email,
    avatarUrl,
    verificado,
    fechaRegistro,
  } = registrant;

  const fullName = nombreCompleto?.trim() || "";
  const initials = fullName ? fullName.substring(0, 2).toUpperCase() : "";

  return (
    <div data-testid="registrant-card" className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-surface-container-high/50 shadow-sm relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.02] rounded-full blur-2xl -mr-24 -mt-24 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col gap-8">

        {/* Header: Avatar and Role/Name */}
        <div className="flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-2xl font-display font-black text-primary bg-primary/10 border border-primary/20 shrink-0 overflow-hidden shadow-inner"
            data-testid="registrant-avatar"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={`Avatar de ${fullName}`} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60" data-testid="registrant-role">
                {rol || "Desarrollador / Vendedor"}
              </span>
              {verificado && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  data-testid="registrant-verified-badge"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Verificado</span>
                </div>
              )}
            </div>

            <h3 className="text-2xl font-display font-black text-secondary leading-tight truncate" data-testid="registrant-name">
              {fullName}
            </h3>

            {razonSocial && (
              <div className="flex items-center gap-1.5 mt-1.5 text-on-surface-variant/80">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sm font-medium truncate" data-testid="registrant-company">
                  {razonSocial}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-surface-container-highest/30"></div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {email && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50 block mb-0.5">Correo Electrónico</span>
                <a
                  href={`mailto:${email}`}
                  data-testid="registrant-email"
                  className="text-sm font-medium text-secondary hover:text-primary transition-colors truncate block"
                >
                  {email}
                </a>
              </div>
            </div>
          )}

          {telefono && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50 block mb-0.5">Teléfono Directo</span>
                <a
                  href={`tel:${telefono.replace(/\s+/g, '')}`}
                  data-testid="registrant-phone"
                  className="text-sm font-medium text-secondary hover:text-primary transition-colors truncate block"
                >
                  {telefono}
                </a>
              </div>
            </div>
          )}

          {fechaRegistro && (
            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="w-8 h-8 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50 block mb-0.5">Antigüedad en Plataforma</span>
                <span className="text-sm font-medium text-secondary" data-testid="registrant-since">
                  Miembro desde {new Date(fechaRegistro).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          className="w-full h-14 mt-2 bg-secondary hover:bg-secondary/90 text-white rounded-[1.25rem] flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] transition-all active:scale-[0.98] shadow-lg shadow-secondary/20"
        >
          <UserCircle2 className="w-4 h-4" />
          <span>Contactar Desarrollador</span>
        </button>

      </div>
    </div>
  );
};
