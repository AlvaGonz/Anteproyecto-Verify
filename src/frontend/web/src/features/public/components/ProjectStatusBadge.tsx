import React from 'react';

interface ProjectStatusBadgeProps {
  status: string;
  integridadValidada?: number;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status, integridadValidada }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let label = status;

  if (status === 'Verificado' && integridadValidada !== undefined && integridadValidada < 50) {
    label = 'En Proceso';
    bgColor = 'bg-gray-100';
    textColor = 'text-gray-800';
  } else {
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
  }

  return (
    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};
