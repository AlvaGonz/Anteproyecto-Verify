import React from 'react';

interface ProjectStatusBadgeProps {
  status: string;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let label = status;

  switch (status) {
    case 'Publicado':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'En Revisión':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'Con Observación':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-800';
      break;
    case 'Creado':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-600';
      break;
    case 'Editado':
      bgColor = 'bg-indigo-100';
      textColor = 'text-indigo-800';
      break;
  }

  return (
    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};
