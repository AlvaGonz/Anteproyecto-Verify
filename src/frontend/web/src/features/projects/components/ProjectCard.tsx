import React, { useEffect, useState } from "react";
import { ProyectoDto, ProjectStatus } from "../types";
import { Link } from "react-router-dom";
import { documentsApi } from "../../documents/api/documentsApi";
import { DocumentStatus } from "../../documents/types";

interface ProjectCardProps {
  project: ProyectoDto;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [documentCount, setDocumentCount] = useState<number | null>(null);
  const [allVerified, setAllVerified] = useState<boolean>(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentsApi.getProjectDocuments(project.id);
        setDocumentCount(docs.length);
        // Check if there are at least 20 documents and all are Valid
        const isAllVerified = docs.length >= 20 && docs.every(d => d.estadoDocumento === DocumentStatus.Valid);
        setAllVerified(isAllVerified);
      } catch (error) {
        console.error("Error fetching documents for project", project.id, error);
        setDocumentCount(0);
        setAllVerified(false);
      }
    };
    fetchDocuments();
  }, [project.id]);

  const displayStatus = project.estadoProyecto === ProjectStatus.Validated
    ? (allVerified ? "Verified" : "Pending Verification")
    : ProjectStatus[project.estadoProyecto];

  return (
    <div className="clay-card p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-200">
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-strong)' }}>{project.nombre}</h3>
      <p className="text-sm mb-2" style={{ color: 'var(--color-text-main)' }}>{project.ubicacionTexto}</p>
      
      <div className="text-sm mb-4 flex-grow" style={{ color: 'var(--color-text-main)' }}>
        {documentCount !== null ? (
          <span className="inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {documentCount} documentos entregados
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Cargando...
          </span>
        )}
      </div>

      <div className="flex justify-between items-center mt-auto pt-4 border-t" style={{ borderColor: 'var(--color-border-warm)' }}>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.estadoProyecto)}`}
        >
          {displayStatus}
        </span>
        <Link
          to={`/projects/${project.id}`}
          className="text-sm font-semibold hover:underline"
          style={{ color: 'var(--color-brand-primary)' }}
        >
          Ver Detalle
        </Link>
      </div>
    </div>
  );
};

function getStatusColor(status: ProjectStatus) {
  switch (status) {
    case ProjectStatus.Published:
      return "bg-[var(--color-surface-alt)] text-[var(--color-text-strong)] border border-[var(--color-accent-warm)]";
    case ProjectStatus.InReview:
      return "bg-[var(--color-surface-alt)] text-[var(--color-highlight)] border border-[var(--color-highlight)]";
    case ProjectStatus.Observed:
      return "bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border-warm)]";
    case ProjectStatus.Validated:
      return "bg-[#e8ebf4] text-[var(--color-brand-primary)] border border-[var(--color-info)]";
    case ProjectStatus.Rejected:
      return "bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border-warm)]";
    default:
      return "bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border-warm)]";
  }
}
