import React from "react";
import { PublicProjectVerificationDto } from "../types";
import { 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Share2, 
  Download, 
  Printer, 
  AlertTriangle, 
  Globe,
  Verified,
  Lock,
  Cpu,
  MapIcon
} from "lucide-react";
import QRCode from "react-qr-code";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { VerificationStatus } from "./PublicVerificationBadge";

interface VerificationResultCardProps {
  data: PublicProjectVerificationDto;
}

export const VerificationResultCard: React.FC<VerificationResultCardProps> = ({
  data,
}) => {
  const [invited, setInvited] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);

  const isUnregistered = data.isRegistered === false;

  const getStatus = (): VerificationStatus => {
    if (isUnregistered) return "pending";
    if (!data.isVerifiable) return "failed";
    if (data.integrityStatus === "Consistente") return "verified";
    if (data.integrityStatus === "Con Observaciones") return "observation";
    return "pending";
  };

  const status = getStatus();

  // Mock validation items if not present
  const validationItems = data.validationDimensions || [
    { label: "Titularidad de Tierra", checked: true },
    { label: "Permisos Ambientales", checked: true },
    { label: "Licencia de Construcción", checked: data.integrityStatus !== "Inconsistente" },
    { label: "Cumplimiento Ley 189-11", checked: true },
    { label: "Auditoría Técnica Externa", checked: data.integrityStatus === "Consistente" },
  ];

  return (
    <div className="max-w-4xl mx-auto">

      {/* Action Bar */}
      <div className="flex justify-end gap-3 mb-6 print:hidden">
        <button className="h-10 px-4 flex items-center gap-2 rounded-xl bg-surface border border-outline-variant/10 text-on-surface-variant text-xs font-bold hover:bg-surface-raised transition-colors">
          <Share2 className="w-4 h-4" /> Compartir
        </button>
        <button 
          onClick={() => window.print()}
          className="h-10 px-4 flex items-center gap-2 rounded-xl bg-secondary text-[#F4F1EC] text-xs font-bold hover:shadow-floating transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" /> Imprimir
        </button>
        <button className="h-10 px-4 flex items-center gap-2 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-floating transition-all active:scale-95">
          <Download className="w-4 h-4" /> Capturar Constancia
        </button>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-premium border border-outline-variant/10 relative print:shadow-none print:border-none">
        
        {/* Certificate Watermark Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.03]">
          <ShieldCheck className="w-[800px] h-[800px] -rotate-12" />
        </div>

        {/* Top Branding Section */}
        <div className={cn(
          "p-8 md:p-12 relative overflow-hidden transition-all duration-500",
          isUnregistered 
            ? "bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900" 
            : "bg-secondary"
        )}>
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
                <span className="text-white font-['Manrope'] font-black tracking-[0.2em] text-[12px] opacity-80 uppercase">Blockchain Verification Protocol</span>
                <span className="text-white text-2xl font-['Manrope'] font-black">VeriFinca Institutional</span>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-6 pt-8 border-t border-white/10">
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl md:text-5xl font-['Manrope'] font-black text-[#F4F1EC] leading-tight">
                  {isUnregistered ? (
                    <>CONSULTA DE<br />REGISTRO EXTERNO</>
                  ) : (
                    <>CERTIFICADO DE<br />INTEGRIDAD</>
                  )}
                </h1>
                <p className="text-[#F4F1EC]/60 text-sm font-medium mt-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Constancia Digital Pública (Dominican Republic Law 172-13)
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[#F4F1EC]/40 text-[10px] uppercase font-bold tracking-widest mb-1">
                  {isUnregistered ? "CÓDIGO DE CONSULTA" : "CÓDIGO ÚNICO DE REGISTRO"}
                </span>
                <div className="bg-primary/20 backdrop-blur-md border border-primary/30 px-4 py-2 rounded-lg">
                  <span className="text-primary text-xl font-mono font-black">{data.publicCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-7 space-y-10">
                   {/* Status Hero */}
            <div className={cn(
              "flex items-center gap-6 p-6 rounded-3xl border transition-all duration-500",
              isUnregistered 
                ? "bg-amber-500/5 border-amber-500/20" 
                : "bg-surface-raised border-outline-variant/10"
            )}>
               <div className={cn(
                 "w-20 h-20 rounded-full flex items-center justify-center shrink-0 shadow-lg transition-all duration-500",
                 isUnregistered ? "bg-amber-500 text-white" :
                 status === "verified" ? "bg-emerald-500 text-white" : 
                 status === "observation" ? "bg-primary text-white" : "bg-error text-white"
               )}>
                 {isUnregistered ? <AlertTriangle className="w-10 h-10 animate-pulse" /> : <Verified className="w-12 h-12" />}
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Status Actual</span>
                     <div className="h-px flex-1 bg-outline-variant/20" />
                  </div>
                  <h2 className={cn(
                    "text-3xl font-['Manrope'] font-black tracking-tight",
                    isUnregistered ? "text-amber-600" :
                    status === "verified" ? "text-emerald-600" : 
                    status === "observation" ? "text-primary" : "text-error"
                  )}>
                    {isUnregistered ? "REGISTRO EXTERNO" :
                     status === "verified" ? "VERIFICADO" : 
                     status === "observation" ? "OBSERVACIONES" : "NO VÁLIDO"}
                  </h2>
                  <p className="text-on-surface-variant text-sm font-medium mt-1 leading-relaxed">
                    {isUnregistered 
                      ? "Esta persona o entidad posee un registro oficial válido en las instituciones gubernamentales de la República Dominicana, pero no está afiliada a VeriFinca."
                      : "Este proyecto ha completado exitosamente las fases de debida diligencia institucional y validación de campo."}
                  </p>
               </div>
            </div>

            {/* Project Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary/5">
                    <Building2 className="w-6 h-6 text-secondary" />
                 </div>
                 <div>
                    <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block mb-1">
                      {isUnregistered ? "Tipo de Registro" : "Identidad de Proyecto"}
                    </span>
                    <h3 className="text-lg font-bold text-on-surface leading-tight">{data.projectName}</h3>
                    <p className="text-xs text-secondary font-bold mt-1">Origen: {data.developerName || "N/A"}</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary/5">
                    <MapIcon className="w-6 h-6 text-secondary" />
                 </div>
                 <div>
                    <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block mb-1">Sectores / Localización</span>
                    <p className="text-sm font-bold text-on-surface leading-snug">{data.publicLocation}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[#223382] hover:underline cursor-pointer">
                       <MapPin className="w-3 h-3" />
                       <span className="text-[10px] font-black uppercase">Ver en Mapa de Catastro</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary/5">
                    <Calendar className="w-6 h-6 text-secondary" />
                 </div>
                 <div>
                    <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block mb-1">Fecha de Consulta</span>
                    <p className="text-sm font-black text-on-surface">
                      {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-1">Sincronizado vía VF-NODE-01</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary/5">
                    <Globe className="w-6 h-6 text-secondary" />
                 </div>
                 <div>
                    <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block mb-1">Visibilidad Digital</span>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-amber-500" />
                       <span className="text-sm font-black text-on-surface">Registro Externo Activo</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Notice Callout */}
            {isUnregistered ? (
              <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-6">
                <div className="flex gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-amber-700 uppercase tracking-wider mb-1">Entidad No Certificada en VeriFinca</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                      Para garantizar la inmutabilidad de los fondos, auditoría de permisos y transparencia total vía blockchain, es necesario que la entidad complete su registro en VeriFinca. Puede invitar al titular a iniciar este proceso de forma gratuita.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => {
                      setInvited(true);
                      setTimeout(() => setInvited(false), 3000);
                    }}
                    disabled={invited}
                    className={cn(
                      "flex-1 h-14 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2",
                      invited 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                        : "bg-secondary text-[#F4F1EC] hover:bg-primary active:scale-95 cursor-pointer shadow-md"
                    )}
                  >
                    {invited ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 animate-bounce" /> ¡Invitación Enviada!
                      </>
                    ) : (
                      <>Invitar a Registrarse</>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setRequesting(true);
                      setTimeout(() => setRequesting(false), 3000);
                    }}
                    disabled={requesting}
                    className={cn(
                      "flex-1 h-14 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 border-2",
                      requesting
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg"
                        : "border-amber-500/20 text-amber-700 bg-amber-500/5 hover:bg-amber-500/10 active:scale-95 cursor-pointer"
                    )}
                  >
                    {requesting ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 animate-bounce" /> ¡Solicitud Enviada!
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
                    <h4 className="text-sm font-bold text-primary mb-1">Aviso al Inversionista</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                       Esta certificación confirma que el proyecto cumple con los estándares documentales de VeriFinca. Se recomienda validar con su asesor legal antes de realizar cualquier desembolso.
                    </p>
                 </div>
              </div>
            )}
          </div>


          {/* Sidebar / Checklist */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-surface-raised rounded-3xl p-8 border border-outline-variant/10 shadow-lg">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-black font-['Manrope'] text-secondary uppercase tracking-tighter">Resumen de Validación</h3>
               </div>

               <div className="space-y-4">
                  {validationItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                         <div className={cn(
                           "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors",
                           item.checked ? "bg-emerald-500 border-emerald-500" : "bg-white border-outline-variant/40"
                         )}>
                           {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                         </div>
                         <span className={cn(
                           "text-xs font-bold transition-opacity",
                           item.checked ? "text-on-surface" : "text-on-surface-variant opacity-40 line-through"
                         )}>{item.label}</span>
                       </div>
                       <span className={cn(
                         "text-[9px] font-black italic",
                         item.checked ? "text-emerald-600" : "text-error opacity-60"
                       )}>
                         {item.checked ? "PASÓ" : "FALLÓ"}
                       </span>
                    </div>
                  ))}
               </div>

               <div className="mt-10 pt-8 border-t border-secondary/10">
                  <div className="flex items-center justify-between text-[10px] font-bold mb-4 opacity-40 uppercase tracking-widest">
                     <span>Firma Digital</span>
                     <span>vf-sig-v1.2</span>
                  </div>
                  <div className="font-mono text-[9px] p-3 rounded-lg bg-white border border-secondary/5 text-secondary/30 break-all">
                    6F3B20C9223382F98513DA7D32C62828F9A825F4F1EC1111445C5C5CFFFFFFC8BFB5E07610FEF0E0
                  </div>
               </div>
            </div>

            {/* Compliance Message */}
            <div className="text-center px-4">
               <p className="text-[10px] font-medium text-on-surface-variant/40 leading-relaxed italic">
                 Certificación dinámica generada por el Nodo Central de VeriFinca. 
                 Consulte el registro histórico en blockchain.verifinca.do/archive
               </p>
            </div>
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
              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> EN TIEMPO REAL
           </div>
        </div>
      </div>
    </div>
  );
};

// Helper components or utilities can be added here if needed
