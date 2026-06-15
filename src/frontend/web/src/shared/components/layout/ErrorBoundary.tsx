import React from "react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export const ErrorBoundary: React.FC = () => {
  const error = useRouteError();

  let errorMessage = "Ha ocurrido un error inesperado.";
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    if (error.status === 404) {
      errorMessage = "La pagina que estas buscando no existe.";
    } else {
      errorMessage = error.statusText || error.data?.message || errorMessage;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img
              src="/brand/isotipo/ISOTIPO WHITE.optimized.svg"
              alt="VeriFinca"
              className="h-25 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>
        <div className="vf-card py-8 px-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-[var(--color-brand-accent)] mb-4" />
          <h2 className="text-2xl font-bold text-[var(--color-text-strong)] mb-2">
            {errorStatus === 404 ? "404 - Pagina no encontrada" : "Error en la aplicacion"}
          </h2>
          <p className="text-[var(--color-text-strong)] opacity-60 mb-6">
            {errorMessage}
          </p>
          <Link to="/" className="vf-btn-primary">
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};
