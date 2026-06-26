import React, { useState } from "react";
import { Building2 } from "lucide-react";
import { useDocuments } from "../../documents/api/useDocuments";
import { getProjectCoverUrl } from "../utils/imageUtils";

interface ProjectCoverImageProps {
  projectId: string;
  projectName: string;
  imagenUrl?: string;
  /** "sm" = 56×56 lista row | "lg" = full bleed hero */
  size?: "sm" | "lg";
  className?: string;
}

export const ProjectCoverImage: React.FC<ProjectCoverImageProps> = ({
  projectId,
  projectName,
  imagenUrl,
  size = "sm",
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);
  const { data: documents = [] } = useDocuments(projectId);

  // Derivar cover desde documentos si no hay imagenUrl en el DTO
  const coverUrl = !imgError
    ? getProjectCoverUrl(imagenUrl, documents)
    : null;

  const sizeClasses = {
    sm: "w-14 h-14 rounded-2xl",
    lg: "w-full h-full",
  };

  if (!coverUrl) {
    // Fallback: ícono de edificio
    return (
      <div
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-br from-gray-100 to-gray-200
          flex items-center justify-center
          flex-shrink-0 overflow-hidden
          ${className}
        `}
        role="img"
        aria-label={`Sin imagen de portada para ${projectName}`}
      >
        <Building2
          className={`text-gray-400 ${size === "sm" ? "w-6 h-6" : "w-16 h-16"}`}
        />
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={`Portada de ${projectName}`}
      loading="lazy"
      onError={() => setImgError(true)}
      className={`
        ${sizeClasses[size]}
        object-cover flex-shrink-0
        ${className}
      `}
    />
  );
};
