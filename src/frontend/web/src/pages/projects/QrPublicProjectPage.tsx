import React from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck, AlertTriangle, Loader2, MapPin, Calendar } from "lucide-react";

interface QrProjectData {
  codigoPublico?: string;
  nombreProyecto?: string;
  nombre?: string;
  ubicacion?: string;
  estadoValidacion?: string;
  estadoSello?: string;
  fechaEmision?: string;
  codigoSello?: string;
  mensaje?: string;
}

export const QrPublicProjectPage: React.FC = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [data, setData] = React.useState<QrProjectData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!qrToken) {
      setError("Token QR no proporcionado.");
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL ?? "";
        const apiUrl = `${baseUrl}/api/public/projects/qr/${encodeURIComponent(qrToken)}`;
        const resp = await fetch(apiUrl);
        if (!resp.ok) {
          if (resp.status === 404) {
            setError("Sello no encontrado, revocado o proyecto eliminado.");
          } else {
            setError("Error al verificar el sello de integridad.");
          }
          setLoading(false);
          return;
        }
        const json = await resp.json();
        setData(json);
      } catch {
        setError("Error de conexión al verificar el sello.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [qrToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#DAD1C8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#F98513]" />
          <p className="text-[#111144] font-medium">Verificando Sello de Integridad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#DAD1C8] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#C8BFB5] p-8 max-w-md w-full mx-4 shadow-sm text-center">
          <AlertTriangle className="w-12 h-12 text-[#C62828] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#111144] mb-2" style={{ fontFamily: "Manrope" }}>
            Sello No Válido
          </h1>
          <p className="text-[#5C5C5C]">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#DAD1C8] flex items-center justify-center">
        <p className="text-[#5C5C5C]">No se encontraron datos.</p>
      </div>
    );
  }

  const projectName = data.nombreProyecto || data.nombre || "Proyecto Verificado";
  const location = data.ubicacion || "";
  const sealCode = data.codigoSello || data.codigoPublico || "";
  const status = data.estadoSello || data.estadoValidacion || "";

  return (
    <div className="min-h-screen bg-[#DAD1C8]">
      <header className="bg-white border-b border-[#C8BFB5] py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#F98513]" />
          <div>
            <h2 className="text-lg font-bold text-[#111144]" style={{ fontFamily: "Manrope" }}>
              VeriFinca
            </h2>
            <p className="text-xs text-[#5C5C5C]">Sello de Integridad Digital</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-[#C8BFB5] p-8 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-[#FEF0E0] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-[#F98513]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#111144] mb-1" style={{ fontFamily: "Manrope" }}>
                {projectName}
              </h1>
              {location && (
                <p className="text-[#5C5C5C] flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location}
                </p>
              )}
            </div>
          </div>

          <div className="border border-[#C8BFB5] rounded-xl p-6 bg-[#F4F1EC]">
            <h3 className="text-lg font-semibold text-[#111144] mb-4" style={{ fontFamily: "Manrope" }}>
              Sello de Integridad
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sealCode && (
                <div>
                  <dt className="text-sm text-[#5C5C5C]">Código de Verificación</dt>
                  <dd className="text-[#111144] font-mono font-bold">{sealCode}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-[#5C5C5C]">Estado del Sello</dt>
                <dd>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32]">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    {status || "Activo"}
                  </span>
                </dd>
              </div>
              {data.fechaEmision && (
                <div>
                  <dt className="text-sm text-[#5C5C5C] flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Fecha de Emisión
                  </dt>
                  <dd className="text-[#111144]">{new Date(data.fechaEmision).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-6 bg-[#F4F1EC] rounded-xl p-4 border border-[#C8BFB5]">
            <p className="text-xs text-[#5C5C5C] italic">
              <strong>Aviso Legal:</strong> Esta constancia es informativa. No sustituye documentación legal oficial emitida por las instituciones correspondientes. VeriFinca certifica que este proyecto ha pasado por el proceso de verificación integral.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-[#5C5C5C]">
        &copy; {new Date().getFullYear()} VeriFinca &mdash; Sello de Integridad Digital
      </footer>
    </div>
  );
};

export default QrPublicProjectPage;
