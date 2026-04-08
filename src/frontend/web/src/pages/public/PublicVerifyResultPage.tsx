import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicProjectVerificationDto } from "../../features/public-verification/types";
import { publicVerificationApi } from "../../features/public-verification/api/publicVerificationApi";
import { VerificationResultCard } from "../../features/public-verification/components/VerificationResultCard";

export const PublicVerifyResultPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<PublicProjectVerificationDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!code) return;
      setIsLoading(true);
      try {
        const result = await publicVerificationApi.verifyCode(code);
        if (result) {
          setData(result);
        } else {
          setError("Código de verificación no válido o no encontrado.");
        }
      } catch (err: any) {
        setError("Error al verificar el código. Por favor intente más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [code]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verificando...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center border-t-4 border-red-500">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Verificación Fallida
            </h2>
            <p className="text-gray-600">{error || "Código no encontrado."}</p>
            <div className="mt-6 space-y-4">
              <Link
                to="/verify"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                Intentar con otro código
              </Link>
              <Link
                to="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">VeriFinca</h1>
          <p className="mt-2 text-sm text-gray-600">
            Portal Público de Verificación
          </p>
        </div>

        <VerificationResultCard data={data} />

        <div className="mt-8 text-center">
          <Link
            to="/verify"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Verificar otro proyecto
          </Link>
        </div>
      </div>
    </div>
  );
};
