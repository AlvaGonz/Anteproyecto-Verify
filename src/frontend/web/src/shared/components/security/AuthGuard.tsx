import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  // En un entorno real, aquí verificaríamos el estado de autenticación (ej. token JWT)
  const isAuthenticated = true; // Mocked as true for now

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
