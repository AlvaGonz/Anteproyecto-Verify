import React from 'react';

interface ProjectStatusBadgeProps {
  status: string;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let label = status;

  switch (status) {
    case 'Verificado':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'ConObservaciones':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      label = 'Con Observaciones';
      break;
    case 'NoVerificado':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'No Verificado';
      break;
  }

  return (
    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};
