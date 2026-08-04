import React from "react";
import { AlertTriangle, Check } from "lucide-react";
import { useValidationDisclaimer } from "../../validations/api/useValidationDisclaimer";

const DISCLAIMER_TEXT = "Importante: Para extraer los datos de los documentos adjuntos usamos tecnología OCR. Debido a que esta tecnología puede presentar errores, omisiones o interpretaciones incorrectas, la información resultante debe ser revisada por usted antes de enviar la validación. Los datos mostrados y prellenados por el sistema son solo de apoyo. La exactitud, integridad y veracidad de los datos enviados es responsabilidad exclusiva del usuario.";

interface OcrDisclaimerBannerProps {
  projectId: string;
}

export const OcrDisclaimerBanner: React.FC<OcrDisclaimerBannerProps> = ({ projectId }) => {
  const { accepted, isLoading, accept } = useValidationDisclaimer(projectId);
  const [dismissed, setDismissed] = React.useState(false);

  if (isLoading || accepted || dismissed) return null;

  const handleDismiss = async () => {
    setDismissed(true);
    try {
      await accept();
    } catch {
      // If the POST fails, the disclaimer will reappear on next visit
    }
  };

  return (
    <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-amber-900 leading-relaxed">{DISCLAIMER_TEXT}</p>
        <button
          type="button"
          onClick={handleDismiss}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
        >
          <Check size={14} strokeWidth={3} />
          Entendido
        </button>
      </div>
    </div>
  );
};
