import React, { useState } from 'react';
import { useGeneratePdf, useGenerateExcel } from '../api/useReports';
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ReportExportPanelProps {
  projectId: string;
}

export const ReportExportPanel: React.FC<ReportExportPanelProps> = ({ projectId }) => {
  const [error, setError] = useState<string | null>(null);

  const generatePdfMutation = useGeneratePdf();
  const generateExcelMutation = useGenerateExcel();

  const handleExport = async (type: 'pdf' | 'excel') => {
    setError(null);

    try {
      const blob = type === 'pdf' 
        ? await generatePdfMutation.mutateAsync(projectId)
        : await generateExcelMutation.mutateAsync(projectId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VeriFinca_${projectId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || `Error al generar el reporte ${type.toUpperCase()}`);
    }
  };

  const loadingPdf = generatePdfMutation.isPending;
  const loadingExcel = generateExcelMutation.isPending;

  return (
    <div className="bg-white shadow sm:rounded-lg border border-gray-200 mt-6 overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Exportar Reporte de Validaciones
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Descargue el reporte detallado de hallazgos y validaciones en formato PDF o Excel.
          </p>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-4">
          <button
            type="button"
            data-testid="export-pdf-btn"
            onClick={() => handleExport('pdf')}
            disabled={loadingPdf || loadingExcel}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loadingPdf ? (
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
            ) : (
              <FileDown className="-ml-1 mr-2 h-5 w-5" />
            )}
            Exportar PDF
          </button>
          
          <button
            type="button"
            onClick={() => handleExport('excel')}
            disabled={loadingPdf || loadingExcel}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loadingExcel ? (
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
            ) : (
              <FileSpreadsheet className="-ml-1 mr-2 h-5 w-5" />
            )}
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
};
