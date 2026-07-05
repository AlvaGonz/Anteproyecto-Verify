import React from "react";
import { CertificationDto } from "../types";
import { useCertification, useIssueSeal } from "../api/useCertifications";
import { CertificationQr } from "./CertificationQr";
import { CertificationStatusBadge } from "./CertificationStatusBadge";

interface CertificationSectionProps {
  projectId: string;
}

export const CertificationSection: React.FC<CertificationSectionProps> = ({
  projectId,
}) => {
  const { data: rawCertification, isLoading, error: queryError } = useCertification(projectId || "");
  const issueSealMutation = useIssueSeal(projectId || "");

  const certification = React.useMemo(() => {
    if (!rawCertification) return null;
    return {
      ...rawCertification,
      id: String(rawCertification.idSello),
      proyectoId: String(rawCertification.idProyecto),
      codigoVerificacion: rawCertification.codigoQR,
      estadoCertificacion: rawCertification.estado === "Activo" ? 2 : rawCertification.estado === "Revocado" ? 4 : 3,
      fechaEmisionUtc: rawCertification.fechaEmision,
      fechaVigenciaUtc: rawCertification.fechaExpiracion,
      urlVerificacion: rawCertification.urlVerificacion,
      estadoIntegridad: 2,
      revocado: rawCertification.estado === "Revocado",
    } as unknown as CertificationDto;
  }, [rawCertification]);

  const error = queryError?.message || issueSealMutation.error?.message || null;
  const isIssuing = issueSealMutation.isPending;

  const handleIssue = async () => {
    if (
      !window.confirm(
        certification
          ? "¿Estás seguro de regenerar la certificación? Esto revocará el código actual."
          : "¿Emitir nueva certificación?",
      )
    ) {
      return;
    }

    try {
      await issueSealMutation.mutateAsync();
    } catch (err: any) {
      console.error("Error al emitir la certificación.", err);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  if (isLoading)
    return (
      <div className="text-gray-500 text-sm">Cargando certificación...</div>
    );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border mt-6 print-section">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Certificación Verificable
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Constancia pública del estado de validación del proyecto.
          </p>
        </div>
        <div className="flex space-x-2 no-print">
          {certification && (
            <button type="button"
              onClick={handleDownload}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Imprimir Constancia
            </button>
          )}
          <button type="button"
            onClick={handleIssue}
            disabled={isIssuing}
            className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {isIssuing
              ? "Procesando..."
              : certification
                ? "Regenerar Código"
                : "Emitir Certificación"}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm border-b border-red-200 no-print">
          {error}
        </div>
      )}

      {certification ? (
        <div className="px-4 py-5 sm:p-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-shrink-0 text-center">
            <CertificationQr url={certification.urlVerificacion} size={150} />
            <p className="mt-2 text-xs text-gray-500 font-mono">
              {certification.codigoVerificacion}
            </p>
          </div>
          <div className="flex-grow">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Código de Verificación
                </dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono font-bold">
                  {certification.codigoVerificacion}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <CertificationStatusBadge
                    status={certification.estadoCertificacion}
                  />
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Fecha de Emisión
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(certification.fechaEmisionUtc).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  URL Pública
                </dt>
                <dd className="mt-1 text-sm text-indigo-600 truncate">
                  <a
                    href={certification.urlVerificacion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {certification.urlVerificacion}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-xs text-gray-500 italic">
                <strong>Aviso Legal:</strong> Constancia informativa. No
                sustituye documentación legal oficial emitida por las
                instituciones correspondientes.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-5 sm:p-6 text-center text-gray-500 text-sm">
          Este proyecto aún no cuenta con una certificación verificable emitida.
        </div>
      )}
    </div>
  );
};
