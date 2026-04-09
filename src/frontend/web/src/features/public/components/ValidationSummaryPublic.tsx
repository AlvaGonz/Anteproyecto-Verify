import React from 'react';
import { DimensionResumenDto } from '../api/publicApi';

interface ValidationSummaryPublicProps {
  dimensiones: DimensionResumenDto[];
}

export const ValidationSummaryPublic: React.FC<ValidationSummaryPublicProps> = ({ dimensiones }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Validaciones</h3>
      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {dimensiones.map((dim, index) => (
            <li key={index} className="px-6 py-4 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">{dim.dimension}</div>
              <div className="ml-2 flex-shrink-0 flex">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  dim.resultado === 'Verificado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {dim.resultado}
                </span>
              </div>
            </li>
          ))}
          {dimensiones.length === 0 && (
            <li className="px-6 py-4 text-sm text-gray-500">No hay validaciones registradas.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
