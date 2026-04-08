import React, { useState, useEffect } from "react";
import { DocumentDto, DocumentType, DocumentStatus } from "../types";
import { documentsApi } from "../api/documentsApi";
import { AlertTriangle, CheckCircle, Clock, FileText, ShieldAlert } from "lucide-react";
import { ProjectCategory } from "../../projects/types";

interface ProjectDocumentStatusProps {
  projectId: string;
  projectCategory?: ProjectCategory;
}

// Map enum to readable names and entities
const DOCUMENT_INFO: Record<number, { name: string; entity: string; norm: string; categories: ProjectCategory[] }> = {
  [DocumentType.CertificadoTitulo]: { name: "Certificado de Título (Duplicado del Dueño)", entity: "Registro de Títulos", norm: "Ley 108-05", categories: [1, 2, 3, 4, 99] },
  [DocumentType.CertificacionEstadoJuridico]: { name: "Certificación de Estado Jurídico + Cargas y Gravámenes", entity: "Registro de Títulos", norm: "Ley 108-05", categories: [1, 2, 3, 4, 99] },
  [DocumentType.PlanosArquitectonicos]: { name: "Planos Arquitectónicos aprobados", entity: "Ayuntamiento / MOPC", norm: "Ley 687-00", categories: [1, 2, 3, 4, 99] },
  [DocumentType.PlanoMensuraCatastral]: { name: "Plano de Mensura Catastral", entity: "Tribunal de Tierras", norm: "Ley 108-05", categories: [1, 2, 3, 4, 99] },
  [DocumentType.PermisoConstruccion]: { name: "Permiso de Construcción vigente", entity: "Ayuntamiento Municipal", norm: "Ordenanzas", categories: [1, 2, 3, 4, 99] },
  [DocumentType.CertificadoUsoSuelo]: { name: "Certificado de Uso de Suelo / No Objeción Municipal", entity: "Ayuntamiento", norm: "Ordenanzas", categories: [1, 2, 3, 4, 99] },
  [DocumentType.FormularioFIDVB009]: { name: "Formulario FI-DVB-009 registrado en DGII", entity: "DGII", norm: "Norma Gral. 07-2007", categories: [1, 2, 3, 4, 99] },
  [DocumentType.CertificacionIPI]: { name: "Certificación IPI al día", entity: "DGII", norm: "Ley 18-88", categories: [1, 2, 3, 4, 99] },
  [DocumentType.RegistroMercantil]: { name: "Registro Mercantil activo", entity: "Cámara de Comercio", norm: "Ley 3-02", categories: [1, 2, 3, 4, 99] },
  [DocumentType.ActaConstitutiva]: { name: "Acta Constitutiva + Estatutos Sociales", entity: "Cámara / Notaría", norm: "Ley 479-08", categories: [1, 2, 3, 4, 99] },
  [DocumentType.PoderNotarial]: { name: "Poder Notarial del Representante Legal", entity: "Notaría Pública", norm: "Ley 301 Notarial", categories: [1, 2, 3, 4, 99] },
  [DocumentType.RNC]: { name: "RNC activo + estatus fiscal", entity: "DGII", norm: "-", categories: [1, 2, 3, 4, 99] },
  [DocumentType.EstadosFinancieros]: { name: "Estados Financieros Auditados", entity: "Firma Auditora Certificada", norm: "-", categories: [2, 3, 4] }, // Only for commercial/touristic/mixed
  [DocumentType.CertificacionesBancarias]: { name: "Certificaciones bancarias / origen de fondos", entity: "Banco / Institución Financiera", norm: "-", categories: [1, 2, 3, 4, 99] },
  [DocumentType.FormularioKYCAML]: { name: "Formulario de Debida Diligencia KYC/AML", entity: "Propia empresa (sujeto obligado)", norm: "Ley 155-17, Art. 32", categories: [1, 2, 3, 4, 99] },
  [DocumentType.DeclaracionPEP]: { name: "Declaración PEP", entity: "Propia empresa", norm: "Ley 155-17", categories: [1, 2, 3, 4, 99] },
  [DocumentType.CertificadoEIA]: { name: "Certificado EIA", entity: "Min. Medio Ambiente", norm: "Ley 64-00", categories: [2, 3, 4] }, // Mostly for commercial/touristic/mixed
  [DocumentType.NoObjecionINAPACAASD]: { name: "No objeción INAPA/CAASD", entity: "INAPA / CAASD", norm: "-", categories: [1, 2, 3, 4, 99] },
  [DocumentType.DocumentosNotariales]: { name: "Documentos notariales firmados digitalmente", entity: "Notaría / e-firma", norm: "Ley 126-02", categories: [1, 2, 3, 4, 99] },
  [DocumentType.DocumentosSupletorios]: { name: "Documentos supletorios (inmuebles no registrados)", entity: "Tribunal de Tierras", norm: "Ley 108-05", categories: [1, 2, 3, 4, 99] },
};

export const ProjectDocumentStatus: React.FC<ProjectDocumentStatusProps> = ({ projectId, projectCategory = ProjectCategory.Residencial }) => {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await documentsApi.getProjectDocuments(projectId);
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [projectId]);

  if (loading) return <div className="py-4 text-center text-sm text-gray-500">Cargando estado de documentos...</div>;

  // Filter required types based on project category
  const requiredTypes = Object.keys(DOCUMENT_INFO)
    .map(Number)
    .filter(typeId => DOCUMENT_INFO[typeId].categories.includes(projectCategory));

  const uploadedDocs = documents.filter(d => d.estadoDocumento !== DocumentStatus.Invalid && requiredTypes.includes(d.tipoDocumento));
  const verifiedDocs = documents.filter(d => d.estadoDocumento === DocumentStatus.Valid && requiredTypes.includes(d.tipoDocumento));
  
  const missingCount = requiredTypes.length - uploadedDocs.length;
  const pendingVerificationCount = uploadedDocs.length - verifiedDocs.length;
  
  let riskScore = 0;
  let riskLevel = "Bajo";
  let riskColor = "text-green-600 bg-green-50 border-green-200";

  if (missingCount > 10) {
    riskScore = 85;
    riskLevel = "Crítico";
    riskColor = "text-red-700 bg-red-50 border-red-200";
  } else if (missingCount > 5 || pendingVerificationCount > 5) {
    riskScore = 50;
    riskLevel = "Medio";
    riskColor = "text-yellow-700 bg-yellow-50 border-yellow-200";
  } else if (missingCount > 0) {
    riskScore = 20;
    riskLevel = "Bajo-Medio";
    riskColor = "text-blue-700 bg-blue-50 border-blue-200";
  }

  const getStatusIcon = (typeId: number) => {
    const doc = documents.find(d => d.tipoDocumento === typeId);
    if (!doc) return <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-gray-400"></div></div>;
    if (doc.estadoDocumento === DocumentStatus.Valid) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (doc.estadoDocumento === DocumentStatus.Invalid) return <AlertTriangle className="w-6 h-6 text-red-500" />;
    return <Clock className="w-6 h-6 text-yellow-500" />;
  };

  const getStatusText = (typeId: number) => {
    const doc = documents.find(d => d.tipoDocumento === typeId);
    if (!doc) return <span className="text-gray-500 text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">Ausente</span>;
    if (doc.estadoDocumento === DocumentStatus.Valid) return <span className="text-green-700 text-xs font-medium px-2 py-1 bg-green-100 rounded-full">Presente (Verificado)</span>;
    if (doc.estadoDocumento === DocumentStatus.Invalid) return <span className="text-red-700 text-xs font-medium px-2 py-1 bg-red-100 rounded-full">Incompleto/Inconsistente</span>;
    return <span className="text-yellow-700 text-xs font-medium px-2 py-1 bg-yellow-100 rounded-full">Presente (En Espera)</span>;
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Risk Scoring Module */}
      <div className={`p-4 rounded-lg border ${riskColor} flex items-start gap-4`}>
        <ShieldAlert className="w-8 h-8 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-lg">Scoring de Riesgo Documental: {riskLevel}</h3>
          <p className="text-sm mt-1 opacity-90">
            {missingCount} documentos esenciales ausentes, {pendingVerificationCount} presentes pero en espera de verificación.
            Puntuación de riesgo calculada: {riskScore}/100.
          </p>
          {riskScore > 50 && (
            <div className="mt-2 text-sm font-medium">
              ⚠️ Alerta: El proyecto no puede alcanzar el Sello de Integridad hasta que se resuelvan los documentos ausentes o incompletos.
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Lista de Documentos Esenciales Requeridos
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Progreso hacia el sello de integridad VeriFinca ({Math.round((uploadedDocs.length / requiredTypes.length) * 100)}% completado).
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento / Certificación
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Entidad Emisora
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Norma Aplicable
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estatus
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requiredTypes.map((typeId) => {
                const info = DOCUMENT_INFO[typeId];
                if (!info) return null;
                
                return (
                  <tr key={typeId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusIcon(typeId)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{info.name}</div>
                      <div className="text-xs text-gray-500 md:hidden mt-1">{info.entity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {info.entity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono hidden lg:table-cell">
                      {info.norm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {getStatusText(typeId)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
