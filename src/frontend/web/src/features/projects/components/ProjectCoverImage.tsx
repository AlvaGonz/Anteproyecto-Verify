import React, { useState } from "react";
import { Building2 } from "lucide-react";

interface ProjectCoverImageProps {
  /** URL directa — ya resuelta externamente. No hace fetch. */
  coverUrl?: string | null;
  projectName: string;
  size?: "sm" | "lg";
  className?: string;
}

export const ProjectCoverImage: React.FC<ProjectCoverImageProps> = ({
  coverUrl,
  projectName,
  size = "sm",
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = size === "sm" ? "w-14 h-14 rounded-2xl" : "w-full h-full";

  if (!coverUrl || imgError) {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
        role="img"
        aria-label={`Sin imagen de portada para ${projectName}`}
      >
        <Building2 className={`text-gray-400 ${size === "sm" ? "w-6 h-6" : "w-16 h-16"}`} />
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={`Portada de ${projectName}`}
      loading="lazy"
      onError={() => setImgError(true)}
      className={`${sizeClasses} object-cover flex-shrink-0 ${className}`}
    />
  );
};
