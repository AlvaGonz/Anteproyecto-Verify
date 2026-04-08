import React from "react";
import { DocumentDto, DocumentType } from "../types";

interface ProjectDocumentsListProps {
  documents: DocumentDto[];
  onDownload: (documentId: string) => Promise<void>;
  onToggleStatus: (documentId: string, isActive: boolean) => Promise<void>;
}

const DOCUMENT_TYPE_NAMES: Record<number, string> = {
  [DocumentType.CertificadoTitulo]: "Certificado de Título",
  [DocumentType.CertificacionEstadoJuridico]: "Certificación Estado Jurídico",
  [DocumentType.PlanosArquitectonicos]: "Planos Arquitectónicos",
  [DocumentType.PlanoMensuraCatastral]: "Plano Mensura Catastral",
  [DocumentType.PermisoConstruccion]: "Permiso de Construcción",
  [DocumentType.CertificadoUsoSuelo]: "Certificado Uso de Suelo",
  [DocumentType.FormularioFIDVB009]: "Formulario FI-DVB-009",
  [DocumentType.CertificacionIPI]: "Certificación IPI",
  [DocumentType.RegistroMercantil]: "Registro Mercantil",
  [DocumentType.ActaConstitutiva]: "Acta Constitutiva",
  [DocumentType.PoderNotarial]: "Poder Notarial",
  [DocumentType.RNC]: "RNC",
  [DocumentType.EstadosFinancieros]: "Estados Financieros",
  [DocumentType.CertificacionesBancarias]: "Certificaciones Bancarias",
  [DocumentType.FormularioKYCAML]: "Formulario KYC/AML",
  [DocumentType.DeclaracionPEP]: "Declaración PEP",
  [DocumentType.CertificadoEIA]: "Certificado EIA",
  [DocumentType.NoObjecionINAPACAASD]: "No objeción INAPA/CAASD",
  [DocumentType.DocumentosNotariales]: "Documentos Notariales",
  [DocumentType.DocumentosSupletorios]: "Documentos Supletorios",
  [DocumentType.Other]: "Otro",
};

export const ProjectDocumentsList: React.FC<ProjectDocumentsListProps> = ({
  documents,
  onDownload,
  onToggleStatus,
}) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border">
        No hay documentos registrados para este proyecto.
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md border">
      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <li key={doc.id}>
            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-blue-600 truncate">
                  {doc.nombreArchivoOriginal}
                </p>
                <div className="mt-2 flex">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {DOCUMENT_TYPE_NAMES[doc.tipoDocumento] || "Desconocido"}
                    </span>
                    <span className="mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      v{doc.version}
                    </span>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {doc.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Subido el: {new Date(doc.createdAtUtc).toLocaleDateString()} |
                  Tamaño: {(doc.tamanoBytes / 1024).toFixed(2)} KB
                </div>
              </div>

              <div className="flex flex-col space-y-2 items-end">
                <button
                  onClick={() => onDownload(doc.id)}
                  className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                >
                  Descargar
                </button>
                <button
                  onClick={() => onToggleStatus(doc.id, !doc.activo)}
                  className={`text-sm font-medium ${doc.activo ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}`}
                >
                  {doc.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
