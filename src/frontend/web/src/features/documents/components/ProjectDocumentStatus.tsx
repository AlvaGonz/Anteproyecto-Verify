import React, { useState, useEffect } from "react";
import { DocumentDto, DocumentType, DocumentStatus } from "../types";
import { documentsApi } from "../api/documentsApi";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { ProjectCategory } from "../../projects/types";

interface ProjectDocumentStatusProps {
  projectId: string;
  projectCategory?: ProjectCategory;
}

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
  [DocumentType.EstadosFinancieros]: { name: "Estados Financieros Auditados", entity: "Firma Auditora Certificada", norm: "-", categories: [2, 3, 4] },
  [DocumentType.CertificacionesBancarias]: { name: "Certificaciones bancarias / origen de fondos", entity: "Banco / Institución Financiera", norm: "-", categories: [1, 2, 3, 4, 99] },
  [DocumentType.FormularioKYCAML]: { name: "Formulario de Debida Diligencia KYC/AML", entity: "Propia empresa (sujeto obligado)", norm: "Ley 155-17, Art. 32", categories: [1, 2, 3, 4, 99] },
  [DocumentType.DeclaracionPEP]: { name: "Declaración PEP", entity: "Propia empresa", norm: "Ley 155-17", categories: [1, 2, 3, 4, 99] },
  [DocumentType.CertificadoEIA]: { name: "Certificado EIA", entity: "Min. Medio Ambiente", norm: "Ley 64-00", categories: [2, 3, 4] },
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

  if (loading) return <div className="py-4 text-center text-sm text-[var(--color-text-strong)] opacity-60">Cargando estado de documentos...</div>;

  const requiredTypes = Object.keys(DOCUMENT_INFO)
    .map(Number)
    .filter(typeId => DOCUMENT_INFO[typeId].categories.includes(projectCategory));

  const uploadedDocs = documents.filter(d => d.estadoDocumento !== DocumentStatus.Invalid && requiredTypes.includes(d.tipoDocumento));
  const verifiedDocs = documents.filter(d => d.estadoDocumento === DocumentStatus.Valid && requiredTypes.includes(d.tipoDocumento));
  
  const missingCount = requiredTypes.length - uploadedDocs.length;
  const pendingVerificationCount = uploadedDocs.length - verifiedDocs.length;
  
  let riskScore = 0;
  let riskLevel = "Bajo";

  if (missingCount > 10) {
    riskScore = 85;
    riskLevel = "Crítico";
  } else if (missingCount > 5 || pendingVerificationCount > 5) {
    riskScore = 50;
    riskLevel = "Medio";
  } else if (missingCount > 0) {
    riskScore = 20;
    riskLevel = "Bajo-Medio";
  }

  const renderDocItem = (typeId: number) => {
    const info = DOCUMENT_INFO[typeId];
    if (!info) return null;
    
    const doc = documents.find(d => d.tipoDocumento === typeId);

    if (doc?.estadoDocumento === DocumentStatus.Valid) {
      return (
        <div key={typeId} className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-lg group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-primary-container text-on-primary-container p-2 rounded-full">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="font-semibold text-on-surface">{info.name}</span>
          </div>
          <span className="text-xs font-bold text-on-surface-variant opacity-60">VERIFICADO</span>
        </div>
      );
    }
    
    if (doc && doc.estadoDocumento !== DocumentStatus.Invalid) {
      return (
        <div key={typeId} className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-lg group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-tertiary-container text-on-tertiary-container p-2 rounded-full">
              <Clock className="w-5 h-5" />
            </div>
            <span className="font-semibold text-on-surface">{info.name}</span>
          </div>
          <span className="text-xs font-bold text-on-surface-variant opacity-60">EN REVISIÓN</span>
        </div>
      );
    }

    return (
      <div key={typeId} className="flex items-center justify-between p-5 bg-surface-container-lowest border-l-4 border-error rounded-lg opacity-80 mix-blend-luminosity">
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-high p-2 rounded-full">
            <Clock className="w-5 h-5 text-on-surface-variant" />
          </div>
          <span className="font-semibold text-on-surface line-through">{info.name}</span>
        </div>
        <span className="text-xs font-bold text-error opacity-60">PENDIENTE</span>
      </div>
    );
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-[#223382] font-headline">Documentación Legal</h2>
        <span className="text-sm font-medium text-secondary">
          {Math.round((verifiedDocs.length / requiredTypes.length) * 100)}% verificado
        </span>
      </div>

      {riskScore > 50 && (
        <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Scoring de Riesgo: {riskLevel}</h4>
            <p className="text-sm mt-1">Faltan {missingCount} documentos esenciales. Este proyecto no cumple con los estándares mínimos para completar su validación.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {requiredTypes.map(renderDocItem)}
      </div>
    </section>
  );
};

