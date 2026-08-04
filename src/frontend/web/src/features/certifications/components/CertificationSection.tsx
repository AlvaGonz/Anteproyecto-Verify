import React from "react";
import { useCertification, useIssueSeal } from "../api/useCertifications";
import { usePlanLimits } from "../../settings/api/useSettings";
import { CertificationQr } from "./CertificationQr";
import { CertificationStatusBadge } from "./CertificationStatusBadge";
import { toUtcDate } from "../../../shared/utils/dates";
import { ShieldCheck, Download } from "lucide-react";

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

const handlePrint = () => {
  window.print();
};

export const CertificationSection: React.FC<CertificationSectionProps> = ({
  projectId,
  projectStatus,
}) => {
  const isPublished = projectStatus === "PUBLICADO";
  const { data: rawCertification, isLoading, error: queryError } = useCertification(projectId || "");
  const issueSealMutation = useIssueSeal(projectId || "");
  const { planLimits, isLoading: limitsLoading } = usePlanLimits();
  const qrSvgRef = React.useRef<SVGSVGElement>(null);

  const hasQrIncluido = planLimits?.qrIncluido ?? false;
  const canIssue = isPublished && hasQrIncluido && !issueSealMutation.isPending;

  const selloData = React.useMemo((): SelloIntegridadResponse | null => {
    if (!rawCertification) return null;
    return rawCertification as unknown as SelloIntegridadResponse;
  }, [rawCertification]);

  const error = queryError?.message || issueSealMutation.error?.message || null;
  const isIssuing = issueSealMutation.isPending;

  const hasSeal = selloData && (selloData.vigente !== false && selloData.estado !== "Revocado" && selloData.estado !== "Expirado");
  const sealCode = selloData?.codigoSello || selloData?.codigoQR || "";
  const qrUrl = selloData?.urlQr || selloData?.urlVerificacion || "";
  const accessCount = selloData?.contadorAccesos ?? selloData?.accessCount ?? 0;
  const sealStatus = selloData?.estado === "Revocado" ? 4 : selloData?.estado === "Expirado" ? 3 : 2;

  const handleIssue = async () => {
    if (!isPublished) return;
    if (
      !window.confirm(
        selloData
          ? "¿Estás seguro de regenerar la certificación? Esto revocará el código actual."
          : "¿Emitir nueva certificación?",
      )
    ) {
      return;
    }

    try {
      await issueSealMutation.mutateAsync();
    } catch (err: unknown) {
      console.error("Error al emitir la certificación.", err);
    }
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
    <div className="bg-white border border-[#C8BFB5] rounded-xl overflow-hidden mt-6 print-section" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-[#DAD1C8]">
        <div>
          <h3 className="text-lg font-semibold text-[#111144]" style={{ fontFamily: "Manrope" }}>
            Certificación Verificable
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-[#5C5C5C]">
            Sello de Integridad &mdash; Constancia pública del estado de validación del proyecto.
          </p>
        </div>
        <div className="flex space-x-2 no-print">
          {hasSeal && (
            <>
              <button type="button"
                onClick={() => handleDownloadSvg(qrSvgRef.current)}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#C8BFB5] rounded-lg text-sm font-medium text-[#111144] bg-white hover:bg-[#F4F1EC] transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar QR
              </button>
              <button type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#C8BFB5] rounded-lg text-sm font-medium text-[#111144] bg-white hover:bg-[#F4F1EC] transition-colors"
              >
                Imprimir
              </button>
            </>
          )}
          <button type="button"
            onClick={handleIssue}
            disabled={!canIssue}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#F98513] hover:bg-[#E07610] disabled:opacity-50 disabled:bg-[#DAD1C8] disabled:text-[#9E9E9E] transition-colors"
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
              {selloData?.fechaEmisionUtc && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-[#5C5C5C]">
                    Fecha de Emisión
                  </dt>
                  <dd className="mt-1 text-sm text-[#111144]">
                    {toUtcDate(selloData.fechaEmisionUtc)?.toLocaleDateString() ?? ''}
                  </dd>
                </div>
              )}
              {selloData?.fechaExpiracionUtc && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-[#5C5C5C]">
                    Vigencia
                  </dt>
                  <dd className="mt-1 text-sm text-[#111144]">
                    {toUtcDate(selloData.fechaExpiracionUtc)?.toLocaleDateString() ?? ''}
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
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-[#5C5C5C]">
                  Nivel del Sello
                </dt>
                <dd className="mt-1 text-sm text-[#111144]">
                  {selloData?.nivel || "Bronce"}
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
  );
};
