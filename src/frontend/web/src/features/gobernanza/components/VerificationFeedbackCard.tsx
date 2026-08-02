import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { GobernanzaVerificationResponse } from '../types';

interface VerificationFeedbackCardProps {
  response: GobernanzaVerificationResponse | null;
  isLoading: boolean;
  error?: any;
}

export const VerificationFeedbackCard: React.FC<VerificationFeedbackCardProps> = ({ 
  response, 
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="mt-4 p-6 rounded-2xl bg-surface-container-low border border-[var(--color-border)]/20 shadow-sm animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary">
          <ShieldCheck className="w-5 h-5 animate-bounce" />
          <span className="text-sm font-medium">Validando con Gobernanza de Datos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-error">Error de Comunicación</h4>
          <p className="text-xs text-error/80 mt-1">No se pudo contactar al servicio de Gobernanza. Reintente más tarde.</p>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const { isValid, matchPercentage, message, matchedData } = response;
  
  const isPerfectMatch = matchPercentage === 100;
  const isPartialMatch = matchPercentage > 0 && matchPercentage < 100;
  const isNoMatch = matchPercentage === 0 || !isValid;

  // Determine styling based on state
  let bgColor = "bg-green-50";
  let borderColor = "border-green-200";
  let iconColor = "text-green-600";
  let textColor = "text-green-800";
  let Icon = CheckCircle2;
  let statusTitle = "Validación Exitosa";

  if (isPartialMatch) {
    bgColor = "bg-yellow-50";
    borderColor = "border-yellow-300";
    iconColor = "text-yellow-600";
    textColor = "text-yellow-800";
    Icon = AlertTriangle;
    statusTitle = "Coincidencia Parcial";
  } else if (isNoMatch) {
    bgColor = "bg-red-50";
    borderColor = "border-red-300";
    iconColor = "text-red-600";
    textColor = "text-red-800";
    Icon = XCircle;
    statusTitle = "Validación Fallida";
  }

  return (
    <div className={`mt-6 p-5 rounded-2xl border shadow-sm transition-all duration-300 ${bgColor} ${borderColor}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-full bg-white/50 shadow-sm ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${textColor}`}>{statusTitle}</h3>
            <span className={`text-sm font-black px-2 py-0.5 rounded-md bg-white/60 ${textColor}`}>
              {matchPercentage}% Match
            </span>
          </div>
          
          <p className={`text-sm mt-1 mb-3 ${textColor} opacity-90 font-medium`}>
            {message}
          </p>

          {/* Render matched data if available and partial/success */}
          {matchedData && Object.keys(matchedData).length > 0 && (
            <div className="mt-4 pt-4 border-t border-black/5">
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${textColor} opacity-80`}>
                Datos Confirmados en Fuente Oficial
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(matchedData).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className={`text-[10px] uppercase font-bold opacity-60 ${textColor}`}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`text-xs font-medium truncate ${textColor}`}>
                      {value !== null && value !== undefined ? String(value) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
