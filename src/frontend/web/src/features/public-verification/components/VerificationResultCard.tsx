import React from "react";
import { PublicProjectVerificationDto } from "../types";

interface VerificationResultCardProps {
  data: PublicProjectVerificationDto;
}

export const VerificationResultCard: React.FC<VerificationResultCardProps> = ({
  data,
}) => {
  const getIntegrityColor = (status: string) => {
    switch (status) {
      case "Consistente":
        return "bg-green-500";
      case "Con Observaciones":
        return "bg-yellow-500";
      case "Inconsistente":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border-t-4 border-indigo-500">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Constancia de Validación
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detalles públicos del proyecto verificado.
          </p>
        </div>
        <div className="text-right">
          {data.isVerifiable ? (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Verificable
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
              No Verificable
            </span>
          )}
        </div>
      </div>

      {!data.isVerifiable && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{data.verificationMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Proyecto</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-bold">
              {data.projectName}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {data.publicLocation}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Estado del Proyecto
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {data.publicProjectStatus}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Estado de Integridad
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${getIntegrityColor(data.integrityStatus)}`}
              ></div>
              {data.integrityStatus}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Código de Verificación
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
              {data.publicCode}
            </dd>
          </div>
          {data.lastVerifiedUtc && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Fecha de Emisión
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(data.lastVerifiedUtc).toLocaleDateString()}
              </dd>
            </div>
          )}
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Resumen</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {data.summary}
            </dd>
          </div>
        </dl>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center italic">
          Constancia informativa. No sustituye documentación legal oficial
          emitida por las instituciones correspondientes.
        </p>
      </div>
    </div>
  );
};
