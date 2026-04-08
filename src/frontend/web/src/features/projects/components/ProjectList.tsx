import React from "react";
import { ProyectoDto } from "../types";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  projects: ProyectoDto[];
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay proyectos disponibles.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
