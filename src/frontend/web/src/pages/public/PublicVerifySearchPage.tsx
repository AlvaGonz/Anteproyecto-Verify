import React from "react";
import { VerifySearchForm } from "../../features/public-verification/components/VerifySearchForm";

export const PublicVerifySearchPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          VeriFinca
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Portal Público de Verificación
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <p className="text-sm text-gray-500 mb-4 text-center">
            Ingrese el código público del proyecto para consultar su estado de
            validación y confiabilidad.
          </p>
          <VerifySearchForm />
        </div>
      </div>
    </div>
  );
};
