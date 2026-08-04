import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobalSearch } from "../../features/projects/api/useGlobalSearch";
import { Search, AlertCircle, CheckCircle2, ArrowLeft, FileText, Activity, Home } from "lucide-react";
import { VerificationNetworkGraph } from "./VerificationNetworkGraph";
import { PublicPageLayout } from "../../shared/components/layout/PublicPageLayout";
import { Button } from "../../shared/components/ui/button";

export const VerificationResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "";
  const query = searchParams.get("q") || "";
  const { t } = useTranslation();

  const { data, isLoading, error } = useGlobalSearch(type, query);

  return (
    <PublicPageLayout>
      <div className="bg-gray-50 min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/#projects">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Nueva Búsqueda
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
              Resultados de Verificación
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Buscando <span className="font-semibold text-primary">{type.toUpperCase()}</span> coincidente con <span className="font-semibold text-primary">"{query}"</span>
            </p>
          </div>

          {/* States */}
          {isLoading && (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center max-w-2xl mx-auto shadow-sm">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">No se encontraron resultados</h2>
              <p className="text-red-600 dark:text-red-400">
                No pudimos encontrar ninguna coincidencia en nuestras bases de datos institucionales para la consulta especificada.
              </p>
            </div>
          )}

          {/* Results Dossier */}
          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Entity Info */}
              <div className="col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white flex flex-col items-center">
                    <CheckCircle2 className="h-16 w-16 mb-4 text-green-300" />
                    <h2 className="text-xl font-bold text-center">{data.tituloPrincipal}</h2>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                      Entidad Validada
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center mb-4 text-lg border-b pb-2">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      Detalles Oficiales
                    </h3>
                    
                    <dl className="space-y-4">
                      {Object.entries(data.detalles).map(([key, value]) => (
                        <div key={key} className="flex justify-between flex-col">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{key}</dt>
                          <dd className="mt-1 text-base text-gray-900 dark:text-white break-words">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center mb-4 text-lg border-b pb-2">
                    <Home className="h-5 w-5 mr-2 text-primary" />
                    Proyectos Vinculados ({data.proyectosRelacionados.length})
                  </h3>
                  {data.proyectosRelacionados.length > 0 ? (
                    <ul className="space-y-3">
                      {data.proyectosRelacionados.map((p) => (
                        <li key={p.id} className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 dark:border-gray-700">
                          <Link to={`/projects/${p.id}`} className="block">
                            <span className="block font-medium text-gray-900 dark:text-white">{p.nombre}</span>
                            <span className="block text-sm text-gray-500 mt-1 flex items-center">
                              <Activity className="h-3 w-3 mr-1" /> {p.estado}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No hay proyectos asociados a esta entidad.</p>
                  )}
                </div>
              </div>

              {/* Network Graph */}
              <div className="col-span-1 lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-full min-h-[600px] flex flex-col border border-gray-100 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Grafo de Relaciones</h3>
                    <p className="text-sm text-gray-500 mt-1">Visualización de entidades y proyectos vinculados</p>
                  </div>
                  <div className="flex-1 p-2 bg-slate-50 dark:bg-gray-900 flex justify-center items-center">
                    <VerificationNetworkGraph graph={data.grafoRed} />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </PublicPageLayout>
  );
};
