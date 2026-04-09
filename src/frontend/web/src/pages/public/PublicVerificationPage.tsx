import React, { useState } from 'react';
import { publicApi, PublicProjectStatusDto } from '../../features/public/api/publicApi';
import { ProjectStatusBadge } from '../../features/public/components/ProjectStatusBadge';
import { ValidationSummaryPublic } from '../../features/public/components/ValidationSummaryPublic';

export const PublicVerificationPage: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [result, setResult] = useState<PublicProjectStatusDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await publicApi.getProjectStatus(codigo);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error al consultar el proyecto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Verificación Pública de Proyecto
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Ingrese el código público o token QR para verificar el estado de validación de un proyecto inmobiliario.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
                Código Público o Token QR
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="codigo"
                  id="codigo"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                  placeholder="Ej. VERIFINCA-2026-ABC123"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Buscando...' : 'Verificar'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{result.nombreProyecto}</h3>
                  <p className="text-sm text-gray-500 mt-1">Código: {result.codigoPublico}</p>
                  <p className="text-sm text-gray-500">Emitido: {new Date(result.fechaEmision).toLocaleDateString()}</p>
                </div>
                <ProjectStatusBadge status={result.estadoValidacion} />
              </div>

              <ValidationSummaryPublic dimensiones={result.resumenDimensiones} />
              
              <div className="mt-8 bg-blue-50 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-blue-700">
                      Esta es una constancia informativa. No expone datos personales protegidos por la Ley 172-13.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
