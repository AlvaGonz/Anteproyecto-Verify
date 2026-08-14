import React from 'react';
import { ProjectStatus } from '../types';
import { useProjectStatusBar } from '../hooks/useProjectStatusBar';
import { useEstadosCatalogo } from '../api/useEstadosCatalogo';

interface ProjectStatusBarProps {
  projectId: string;
  currentStatus?: ProjectStatus;
}

export const ProjectStatusBar: React.FC<ProjectStatusBarProps> = React.memo(({ projectId, currentStatus }) => {
  const { eligibility, isLoading } = useProjectStatusBar(projectId);
  const { data: catalog, isLoading: catalogLoading } = useEstadosCatalogo();

  if (isLoading || catalogLoading) {
    return (
      <div className="w-full flex justify-center py-4">
        <div className="animate-pulse h-12 w-full max-w-4xl bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  const steps = catalog ?? [];
  const hasObservaciones = eligibility?.hasObservaciones || false;
  const actualStatus = eligibility?.currentStatus !== undefined ? eligibility.currentStatus : (currentStatus ?? ProjectStatus.Draft);
  const isObserved = hasObservaciones || actualStatus === ProjectStatus.Observed;
  const displayStatus = isObserved ? ProjectStatus.Observed : actualStatus;

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="relative flex flex-wrap items-center justify-center gap-2 md:flex-nowrap md:justify-between md:gap-4">
        <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>

        {steps.map((step) => {
          const isActive = displayStatus === step.codigoUnico;

          let buttonClass = "relative z-10 flex items-center justify-center h-9 px-3.5 rounded-full font-semibold text-xs border-2 transition-all duration-300 md:h-10 md:px-6 md:text-sm ";

          if (isActive) {
            buttonClass += "text-white shadow-md";
          } else {
            buttonClass += `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`;
          }

          return (
            <div key={step.estadoId} className="group relative">
              <button
                type="button"
                disabled
                className={buttonClass}
                style={isActive ? { backgroundColor: step.colorHex, borderColor: step.colorHex } : undefined}
              >
                {step.nombre}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});
