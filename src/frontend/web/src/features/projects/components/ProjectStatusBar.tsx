import React from 'react';
import { ProjectStatus } from '../types';
import { useProjectStatusBar } from '../hooks/useProjectStatusBar';
interface ProjectStatusBarProps {
  projectId: string;
  currentStatus?: ProjectStatus;
}

export const ProjectStatusBar: React.FC<ProjectStatusBarProps> = ({ projectId, currentStatus }) => {
  const { eligibility, isLoading } = useProjectStatusBar(projectId);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-4">
        <div className="animate-pulse h-12 w-full max-w-4xl bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  const hasObservaciones = eligibility?.hasObservaciones || false;
  const actualStatus = eligibility?.currentStatus !== undefined ? eligibility.currentStatus : (currentStatus ?? ProjectStatus.Draft);
  const isObserved = hasObservaciones || actualStatus === ProjectStatus.Observed;
  const displayStatus = isObserved ? ProjectStatus.Observed : actualStatus;

  const steps = [
    {
      status: ProjectStatus.Draft,
      label: 'Creado',
      activeColor: 'bg-gray-500',
      borderColor: 'border-gray-500',
      tooltip: 'Estado inicial del proyecto',
    },
    {
      status: ProjectStatus.Edited,
      label: 'Editado',
      activeColor: 'bg-indigo-500',
      borderColor: 'border-indigo-500',
      tooltip: 'El proyecto tiene datos guardados',
    },
    {
      status: ProjectStatus.InReview,
      label: 'En Revisión',
      activeColor: 'bg-blue-500',
      borderColor: 'border-blue-500',
      tooltip: 'Requiere al menos 1 documento',
    },
    {
      status: ProjectStatus.Published,
      label: 'Publicado',
      activeColor: 'bg-green-500',
      borderColor: 'border-green-500',
      tooltip: 'Requiere al menos 3 documentos',
    },
    {
      status: ProjectStatus.Observed,
      label: 'Con Observaciones',
      activeColor: 'bg-orange-500',
      borderColor: 'border-orange-500',
      tooltip: 'Se activa automáticamente si hay observaciones',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4 overflow-x-auto no-scrollbar pb-2">
      <div className="relative flex items-center justify-between min-w-max gap-4 sm:gap-8">
        {/* Background connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>

        {steps.map((step) => {
          const isActive = displayStatus === step.status;

          let buttonClass = "relative z-10 flex items-center justify-center h-10 px-6 rounded-full font-semibold text-sm border-2 transition-all duration-300 ";

          if (isActive) {
            buttonClass += `${step.activeColor} text-white ${step.borderColor} shadow-md`;
          } else {
            buttonClass += `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`;
          }

          return (
            <div key={step.status} className="group relative" title={step.tooltip}>
              <button
                type="button"
                disabled
                className={buttonClass}
              >
                {step.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
