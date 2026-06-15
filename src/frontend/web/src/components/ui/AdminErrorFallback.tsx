import React from "react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export const AdminErrorFallback: React.FC<{ error?: any }> = ({ error: propError }) => {
  const routeError = useRouteError();
  const error = propError || routeError;
  const navigate = useNavigate();
  const { t } = useTranslation();

  let errorMessage = t("errors.unexpected", "Ha ocurrido un error inesperado.");
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-[var(--color-text-strong)] mb-2">
        Error en el Panel de Administración
      </h2>
      <p className="text-[var(--color-text-strong)] opacity-70 mb-6 max-w-md">
        {errorMessage}
      </p>
      <button 
        onClick={() => navigate("/admin/dashboard")}
        className="vf-btn-primary flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Dashboard
      </button>
    </div>
  );
};
