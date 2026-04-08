import React, { useState } from "react";
import { DocumentType, UploadDocumentDto } from "../types";

interface DocumentUploadFormProps {
  projectId: string;
  onUpload: (dto: UploadDocumentDto, file: File) => Promise<void>;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<DocumentType>(
    DocumentType.Other,
  );
  const [fechaEmision, setFechaEmision] = useState("");
  const [institucionEmisora, setInstitucionEmisora] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Basic validation
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("El archivo excede el tamaño máximo de 10MB.");
        setFile(null);
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor selecciona un archivo.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dto: UploadDocumentDto = {
        tipoDocumento: Number(tipoDocumento),
        fechaEmision: fechaEmision || undefined,
        institucionEmisora: institucionEmisora || undefined,
        observaciones: observaciones || undefined,
      };

      await onUpload(dto, file);

      // Reset form
      setFile(null);
      setTipoDocumento(DocumentType.Other);
      setFechaEmision("");
      setInstitucionEmisora("");
      setObservaciones("");

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setError(err.message || "Error al subir el documento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow border mb-6"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Subir Nuevo Documento
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo *
          </label>
          <input
            id="file-upload"
            type="file"
            required
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            PDF, JPG, PNG hasta 10MB.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento *
          </label>
          <select
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(Number(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          >
            <option value={DocumentType.CertificadoTitulo}>Certificado de Título</option>
            <option value={DocumentType.CertificacionEstadoJuridico}>Certificación de Estado Jurídico</option>
            <option value={DocumentType.PlanosArquitectonicos}>Planos Arquitectónicos</option>
            <option value={DocumentType.PlanoMensuraCatastral}>Plano de Mensura Catastral</option>
            <option value={DocumentType.PermisoConstruccion}>Permiso de Construcción</option>
            <option value={DocumentType.CertificadoUsoSuelo}>Certificado de Uso de Suelo</option>
            <option value={DocumentType.FormularioFIDVB009}>Formulario FI-DVB-009</option>
            <option value={DocumentType.CertificacionIPI}>Certificación IPI</option>
            <option value={DocumentType.RegistroMercantil}>Registro Mercantil</option>
            <option value={DocumentType.ActaConstitutiva}>Acta Constitutiva</option>
            <option value={DocumentType.PoderNotarial}>Poder Notarial</option>
            <option value={DocumentType.RNC}>RNC</option>
            <option value={DocumentType.EstadosFinancieros}>Estados Financieros</option>
            <option value={DocumentType.CertificacionesBancarias}>Certificaciones Bancarias</option>
            <option value={DocumentType.FormularioKYCAML}>Formulario KYC/AML</option>
            <option value={DocumentType.DeclaracionPEP}>Declaración PEP</option>
            <option value={DocumentType.CertificadoEIA}>Certificado EIA</option>
            <option value={DocumentType.NoObjecionINAPACAASD}>No objeción INAPA/CAASD</option>
            <option value={DocumentType.DocumentosNotariales}>Documentos notariales</option>
            <option value={DocumentType.DocumentosSupletorios}>Documentos supletorios</option>
            <option value={DocumentType.Other}>Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institución Emisora
          </label>
          <input
            type="text"
            value={institucionEmisora}
            onChange={(e) => setInstitucionEmisora(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Emisión
          </label>
          <input
            type="date"
            value={fechaEmision}
            onChange={(e) => setFechaEmision(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={2}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !file}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Subiendo..." : "Subir Documento"}
        </button>
      </div>
    </form>
  );
};
