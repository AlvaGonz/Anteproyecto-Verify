import React from 'react';
import { ProjectStatus } from '../types';
import { useProjectStatusBar } from '../hooks/useProjectStatusBar';
import { useAuth } from '@/shared/context/AuthContext';
import { PLAN_CAPABILITIES, normalizePlanKey } from '@/features/pricing/utils/planCapabilities';

interface ProjectStatusBarProps {
  projectId: string;
  currentStatus: ProjectStatus;
}

export const ProjectStatusBar: React.FC<ProjectStatusBarProps> = ({ projectId, currentStatus }) => {
  const { eligibility, isLoading, isUpdating, handleStatusChange } = useProjectStatusBar(projectId);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-4">
        <div className="animate-pulse h-12 w-full max-w-4xl bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  // Fallback defaults if eligibility not loaded
  const docCount = eligibility?.documentCount || 0;
  const hasObservaciones = eligibility?.hasObservaciones || false;
  // If the backend says the status is different (e.g., auto-updated), prefer that
  const actualStatus = eligibility?.currentStatus !== undefined ? eligibility.currentStatus : currentStatus;

  // Plan capability check
  const planKey = normalizePlanKey(user?.plan as string);
  const capabilities = PLAN_CAPABILITIES[planKey];
  const canPublishPlan = capabilities.publicPresentation;

  // Determine enabled states
  const canDraft = true; // Always can be draft (or stay draft)
  const canReview = docCount >= 1;
  const canPublish = docCount >= 3 && canPublishPlan;
  // Observation is auto-triggered, user cannot click it. It becomes the active state if hasObservaciones.

  // If system sets hasObservaciones, it technically forces "Con Observaciones".
  // Note: the backend might have already set actualStatus = Observed, but we'll reflect it visually.
  const isObserved = hasObservaciones || actualStatus === ProjectStatus.Observed;
  const displayStatus = isObserved ? ProjectStatus.Observed : actualStatus;

  const steps = [
    {
      status: ProjectStatus.Draft,
      label: 'Creado',
      enabled: canDraft,
      activeColor: 'bg-gray-500',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-500',
      tooltip: 'Estado inicial del proyecto',
    },
    {
      status: ProjectStatus.Edited,
      label: 'Editado',
      enabled: canDraft, // As long as it is created, it can be edited
      activeColor: 'bg-indigo-500',
      textColor: 'text-indigo-500',
      borderColor: 'border-indigo-500',
      tooltip: 'El proyecto tiene datos guardados',
    },
    {
      status: ProjectStatus.InReview,
      label: 'En Revisión',
      enabled: canReview,
      activeColor: 'bg-blue-500',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500',
      tooltip: canReview ? 'Listo para revisión' : 'Requiere al menos 1 documento',
    },
    {
      status: ProjectStatus.Published,
      label: 'Publicado',
      enabled: canPublish,
      activeColor: 'bg-green-500',
      textColor: 'text-green-500',
      borderColor: 'border-green-500',
      tooltip: !canPublishPlan 
        ? 'Su plan (Consultor) no permite presentar el proyecto públicamente' 
        : canPublish 
          ? 'Listo para publicar' 
          : 'Requiere al menos 3 documentos',
    },
    {
      status: ProjectStatus.Observed,
      label: 'Con Observaciones',
      enabled: isObserved, // Only enabled/clickable if already observed (or rather, visually active)
      activeColor: 'bg-orange-500',
      textColor: 'text-orange-500',
      borderColor: 'border-orange-500',
      tooltip: isObserved ? 'El proyecto tiene observaciones' : 'Se activa automáticamente si hay observaciones',
      isSystemOnly: true, // User shouldn't manually click this
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="relative flex items-center justify-between">
        {/* Background connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>

        {steps.map((step) => {
          const isActive = displayStatus === step.status;
          
          // Styling logic
          let buttonClass = "relative z-10 flex items-center justify-center h-10 px-6 rounded-full font-semibold text-sm border-2 transition-all duration-300 ";
          
          if (isActive) {
            // Filled active state
            buttonClass += `${step.activeColor} text-white ${step.borderColor} shadow-md`;
          } else if (step.enabled) {
            // Unlocked but not active state (clickable)
            buttonClass += `bg-white ${step.textColor} ${step.borderColor} hover:bg-gray-50 cursor-pointer`;
          } else {
            // Locked/Disabled state
            buttonClass += `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`;
          }

          // System-only statuses should not be clickable to become them unless we want to allow reverting?
          // The prompt says "No clickeable por el usuario, solo por el sistema"
          const isClickable = step.enabled && !step.isSystemOnly && !isActive && !isUpdating;

          return (
            <div key={step.status} className="group relative" title={step.tooltip}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => {
                  if (isClickable) {
                    handleStatusChange(step.status);
                  }
                }}
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
