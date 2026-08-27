import React, { useState, useEffect } from "react";
import { useCertification, useIssueSeal } from "../api/useCertifications";
import { usePlanLimits } from "../../settings/api/useSettings";
import { useProject } from "../../projects/api/useProjects";
import { CertificationQr } from "./CertificationQr";
import { CertificationStatusBadge } from "./CertificationStatusBadge";
import { toUtcDate } from "../../../shared/utils/dates";
import { ShieldCheck, Download, Printer } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface SelloIntegridadResponse {
  id?: string | number;
  proyectoId?: string | number;
  codigoSello?: string;
  nombre?: string;
  nivel?: string;
  urlQr?: string;
  qrToken?: string;
  contadorAccesos?: number;
  fechaEmisionUtc?: string;
  fechaExpiracionUtc?: string;
  estado?: string;
  vigente?: boolean;
  // Legacy fields
  idSello?: number;
  idProyecto?: number;
  codigoQR?: string;
  urlVerificacion?: string;
  fechaEmision?: string;
  fechaExpiracion?: string;
  accessCount?: number;
}

interface CertificationSectionProps {
  projectId: string;
  projectStatus?: string;
}

const handleDownloadSvg = (svgElement: SVGSVGElement | null) => {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sello-integridad.svg";
  a.click();
  URL.revokeObjectURL(url);
};

export const CertificationSection: React.FC<CertificationSectionProps> = ({
  projectId,
  projectStatus,
}) => {
  const isPublished = projectStatus === "PUBLICADO";
  const { data: rawCertification, isLoading, error: queryError } = useCertification(projectId || "");
  const { data: project } = useProject(projectId || "");
  const issueSealMutation = useIssueSeal(projectId || "");
  const { planLimits, isLoading: limitsLoading } = usePlanLimits();
  const qrSvgRef = React.useRef<SVGSVGElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const hasQrIncluido = planLimits?.qrIncluido ?? false;
  const canIssue = isPublished && hasQrIncluido && !issueSealMutation.isPending;

  const selloData = React.useMemo((): SelloIntegridadResponse | null => {
    if (!rawCertification) return null;
    return rawCertification as unknown as SelloIntegridadResponse;
  }, [rawCertification]);

  const error = queryError?.message || issueSealMutation.error?.message || null;
  const isIssuing = issueSealMutation.isPending;

  const hasSeal = Boolean(selloData && (selloData.vigente !== false && selloData.estado !== "Revocado" && selloData.estado !== "Expirado"));
  const sealCode = selloData?.codigoSello || selloData?.codigoQR || "";
  const qrUrl = `${window.location.origin}/#/p/${projectId}`;
  const accessCount = selloData?.contadorAccesos ?? selloData?.accessCount ?? 0;
  const sealStatus = selloData?.estado === "Revocado" ? 4 : selloData?.estado === "Expirado" ? 3 : 2;
  const isPrintReady = Boolean(hasSeal && sealCode);

  const fechaEmisionFormatted = React.useMemo(() => {
    const rawDate = selloData?.fechaEmisionUtc || selloData?.fechaEmision;
    if (!rawDate) return "";
    return toUtcDate(rawDate)?.toLocaleDateString() ?? "";
  }, [selloData?.fechaEmisionUtc, selloData?.fechaEmision]);

  const fechaExpiracionFormatted = React.useMemo(() => {
    const rawDate = selloData?.fechaExpiracionUtc || selloData?.fechaExpiracion;
    if (!rawDate) return "";
    return toUtcDate(rawDate)?.toLocaleDateString() ?? "";
  }, [selloData?.fechaExpiracionUtc, selloData?.fechaExpiracion]);

  useEffect(() => {
    if (!confirmOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirmOpen]);

  const handleIssue = () => {
    if (!isPublished) return;
    setConfirmOpen(true);
  };

  const handleConfirmIssue = async () => {
    setConfirmOpen(false);
    try {
      await issueSealMutation.mutateAsync();
    } catch (err: unknown) {
      console.error("Error al emitir la certificación.", err);
    }
  };

  const handlePrint = () => {
    if (!isPrintReady) return;
    window.print();
  };

  if (isLoading || limitsLoading) {
    return (
      <div className="text-[#5C5C5C] text-sm">Cargando certificación...</div>
    );
  }

  if (!isPublished) {
    return (
      <div className="bg-white border border-[#C8BFB5] rounded-xl p-6 mt-6 text-center">
        <ShieldCheck className="w-8 h-8 text-[#DAD1C8] mx-auto mb-2" />
        <p className="text-sm text-[#5C5C5C]">
          El sello de integridad solo está disponible para proyectos publicados.
        </p>
      </div>
    );
  }

  if (!hasQrIncluido) {
    return (
      <div className="bg-white border border-[#C8BFB5] rounded-xl p-6 mt-6 text-center">
        <ShieldCheck className="w-8 h-8 text-[#DAD1C8] mx-auto mb-2" />
        <p className="text-sm text-[#5C5C5C]">
          Tu plan actual no incluye el Sello de Integridad. Actualiza tu suscripción para emitir sellos QR.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* SCREEN REPRESENTATION */}
      <div
        className="integrity-seal-screen bg-white border border-[#C8BFB5] rounded-xl overflow-hidden mt-6 print-section"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
      >
        <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 border-b border-[#DAD1C8]">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[#111144]" style={{ fontFamily: "Manrope" }}>
              Certificación Verificable
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-[#5C5C5C]">
              Sello de Integridad &mdash; Constancia pública del estado de validación del proyecto.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 no-print">
            {hasSeal && (
              <>
                <button
                  type="button"
                  onClick={() => handleDownloadSvg(qrSvgRef.current)}
                  aria-label="Descargar código QR en formato SVG"
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#C8BFB5] rounded-lg text-sm font-medium text-[#111144] bg-white hover:bg-[#F4F1EC] transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Descargar QR
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  aria-label="Imprimir certificación"
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#C8BFB5] rounded-lg text-sm font-medium text-[#111144] bg-white hover:bg-[#F4F1EC] transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleIssue}
              disabled={!canIssue}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#F98513] hover:bg-[#E07610] disabled:opacity-50 disabled:bg-[#DAD1C8] disabled:text-[#9E9E9E] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              {isIssuing
                ? "Procesando..."
                : hasSeal
                  ? "Regenerar"
                  : "Emitir Certificación"}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-[#FFEBEE] text-[#C62828] text-sm border-b border-red-200 no-print">
            {error}
          </div>
        )}

        {hasSeal ? (
          <div className="px-4 py-5 sm:p-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 text-center">
              <div ref={(el) => { (qrSvgRef as React.MutableRefObject<SVGSVGElement | null>).current = el?.querySelector("svg") || null; }}>
                <CertificationQr url={qrUrl} size={160} />
              </div>
              <p className="mt-2 text-xs text-[#5C5C5C] font-mono">
                {sealCode}
              </p>
            </div>
            <div className="flex-grow">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-[#5C5C5C]">
                    Código de Verificación
                  </dt>
                  <dd className="mt-1 text-sm text-[#111144] font-mono font-bold">
                    {sealCode}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-[#5C5C5C]">Estado</dt>
                  <dd className="mt-1">
                    <CertificationStatusBadge
                      status={sealStatus}
                    />
                  </dd>
                </div>
                {fechaEmisionFormatted && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-[#5C5C5C]">
                      Fecha de Emisión
                    </dt>
                    <dd className="mt-1 text-sm text-[#111144]">
                      {fechaEmisionFormatted}
                    </dd>
                  </div>
                )}
                {fechaExpiracionFormatted && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-[#5C5C5C]">
                      Vigencia
                    </dt>
                    <dd className="mt-1 text-sm text-[#111144]">
                      {fechaExpiracionFormatted}
                    </dd>
                  </div>
                )}
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-[#5C5C5C]">
                    Consultas Recibidas
                  </dt>
                  <dd className="mt-1 text-sm text-[#111144] font-semibold">
                    {accessCount}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 bg-[#F4F1EC] p-4 rounded-xl border border-[#C8BFB5]">
                <p className="text-xs text-[#5C5C5C] italic">
                  <strong>Aviso Legal:</strong> Constancia informativa. No
                  sustituye documentación legal oficial emitida por las
                  instituciones correspondientes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-5 sm:p-6 text-center text-[#5C5C5C] text-sm">
            <ShieldCheck className="w-8 h-8 text-[#DAD1C8] mx-auto mb-2" />
            Este proyecto aún no cuenta con un sello de integridad emitido.
          </div>
        )}
      </div>

      {/* DEDICATED PRINTABLE REPRESENTATION */}
      {hasSeal && (
        <div
          data-testid="integrity-seal-print-root"
          data-print-ready={isPrintReady ? "true" : "false"}
          className="integrity-seal-print print-only"
        >
          <div className="border-4 border-[#111144] rounded-2xl p-8 bg-white text-[#111144] shadow-none">
            {/* Header / Brand */}
            <div className="flex items-center justify-between border-b-2 border-[#111144] pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#111144] uppercase font-display">
                  VERIFINCA
                </h1>
                <p className="text-xs text-[#5C5C5C] uppercase tracking-wider font-semibold">
                  Sistema de Verificación y Autenticación de Proyectos Inmobiliarios
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-[#111144] text-white text-xs font-bold uppercase tracking-widest rounded">
                  Certificado Oficial
                </span>
                <p className="text-[10px] text-[#5C5C5C] mt-1 font-mono">
                  Ley 126-02 &bull; Ley 172-13
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-6">
              <h2 className="text-xl font-extrabold uppercase tracking-wide text-[#111144]">
                Certificación Verificable de Integridad
              </h2>
              <p className="text-sm text-[#5C5C5C] mt-1">
                Constancia de Validación Documental y Estatus Legal
              </p>
            </div>

            {/* Body: QR & Details */}
            <div className="grid grid-cols-3 gap-8 items-center my-8 border-y border-[#DAD1C8] py-6">
              {/* QR Container */}
              <div className="col-span-1 flex flex-col items-center justify-center text-center">
                <div className="qr-container p-2 border-2 border-[#111144] rounded-xl bg-white">
                  <CertificationQr url={qrUrl} size={160} />
                </div>
              </div>

              {/* Metadata Details */}
              <div className="col-span-2 space-y-4">
                <div>
                  <span className="text-xs font-bold text-[#5C5C5C] uppercase tracking-wider block">
                    Proyecto Inmobiliario
                  </span>
                  <p className="text-lg font-black text-[#111144]">
                    {project?.nombre || selloData?.nombre || "Proyecto Verificado"}
                  </p>
                  {project?.codigoInterno && (
                    <p className="text-xs font-mono text-[#5C5C5C]">
                      Código Interno: {project.codigoInterno}
                    </p>
                  )}
                  {project?.ubicacionTexto && (
                    <p className="text-xs text-[#5C5C5C]">
                      Ubicación: {project.ubicacionTexto}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[11px] font-bold text-[#5C5C5C] uppercase tracking-wider block">
                      Código de Verificación
                    </span>
                    <span className="text-sm font-mono font-bold text-[#111144]">
                      {sealCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#5C5C5C] uppercase tracking-wider block">
                      Estado de Validación
                    </span>
                    <span className="inline-block text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]">
                      {selloData?.estado === "Revocado" ? "Revocado" : selloData?.estado === "Expirado" ? "Expirado" : "Activo / Verificado"}
                    </span>
                  </div>

                  {fechaEmisionFormatted && (
                    <div>
                      <span className="text-[11px] font-bold text-[#5C5C5C] uppercase tracking-wider block">
                        Fecha de Emisión
                      </span>
                      <span className="text-xs text-[#111144] font-medium">
                        {fechaEmisionFormatted}
                      </span>
                    </div>
                  )}

                  {fechaExpiracionFormatted && (
                    <div>
                      <span className="text-[11px] font-bold text-[#5C5C5C] uppercase tracking-wider block">
                        Vigencia Hasta
                      </span>
                      <span className="text-xs text-[#111144] font-medium">
                        {fechaExpiracionFormatted}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Legal Notice Footer */}
            <div className="mt-6 pt-4 border-t border-[#DAD1C8] text-[10px] text-[#5C5C5C] leading-relaxed">
              <p className="font-bold text-[#111144] mb-1">
                AVISO LEGAL Y CLÁUSULA DE RESPONSABILIDAD:
              </p>
              <p>
                Este certificado es emitido por la plataforma VeriFinca como constancia informativa del estado de integridad y validación de los documentos registrados. No sustituye la documentación legal oficial ni las certificaciones emitidas por las instituciones correspondientes (Registro de Títulos, DGII, MIVED, Ayuntamientos).
              </p>
              <p className="mt-1">
                Para verificar la autenticidad y vigencia de este certificado en tiempo real, escanee el código QR o consulte en el portal oficial de VeriFinca.
              </p>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {confirmOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="issue-cert-title"
            className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-default"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#C8BFB5] flex flex-col"
            >
              <div className="p-6 border-b border-[#DAD1C8] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F98513]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#F98513]" />
                </div>
                <div>
                  <h2 id="issue-cert-title" className="text-lg font-semibold text-[#111144]" style={{ fontFamily: "Manrope" }}>
                    {hasSeal ? "Regenerar Certificación" : "Emitir Certificación"}
                  </h2>
                  <p className="text-xs text-[#5C5C5C] mt-0.5">Sello de Integridad del proyecto</p>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-[#111144] font-medium leading-relaxed">
                  {hasSeal ? "¿Estás seguro de regenerar la certificación?" : "¿Emitir nueva certificación?"}
                </p>
                {hasSeal && (
                  <div className="mt-4 bg-[#F4F1EC] border border-[#C8BFB5] rounded-xl p-4">
                    <p className="text-xs text-[#5C5C5C] leading-relaxed">
                      <strong className="text-[#111144]">Esto revocará el código actual.</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 pt-0 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirmOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#C8BFB5] rounded-lg text-sm font-semibold text-[#111144] bg-white hover:bg-[#F4F1EC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F98513]/50 focus-visible:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmIssue}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#F98513] hover:bg-[#E07610] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F98513]/50 focus-visible:ring-offset-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {hasSeal ? "Sí, Regenerar" : "Sí, Emitir"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
