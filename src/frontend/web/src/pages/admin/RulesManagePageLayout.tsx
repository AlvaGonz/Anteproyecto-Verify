import React from "react";
import {
  LayoutDashboard,
  Check,
  FileWarning,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useCreateRule, useToggleRule } from "../../features/rules/api/useRules";

export const RulesManagePageLayout: React.FC = React.memo(() => (
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
    {/* Page Header */}
    <div className="mb-10 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link to="/admin/projects" className="text-on-surface-variant hover:text-primary transition-colors">
          <LayoutDashboard className="w-4 h-4" />
        </Link>
        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
        <span className="text-[10px] font-black text-primary uppercase tracking-widest">MOTOR DE INTELIGENCIA</span>
      </div>

      <div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-secondary tracking-tighter leading-none mb-3">
          Parámetros de <span className="text-primary italic">Validación</span>
        </h1>
        <p className="text-base text-on-surface-variant font-medium max-w-2xl">
          Edite los parámetros de cumplimiento que orquestan el motor de validación. Cada regla determina el estado de integridad jurídica de los proyectos inmobiliarios.
        </p>
      </div>
    </div>

    {/* IPI Oposición Rule Banner — first-class configurable parameter */}
    <div className="mb-8">
      <IpiOposicionCard />
    </div>
  </div>
));

// ─── IPI Oposición Configurable Card ──────────────────────────────────────────

const IPI_RULE_ID_KEY = "vf_ipi_rule_id";

const IpiOposicionCard: React.FC = () => {
  const createRule = useCreateRule();
  const toggleRule = useToggleRule();

  const [blockOnOposicion, setBlockOnOposicion] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(IPI_RULE_ID_KEY) !== null;
    } catch {
      return false;
    }
  });
  const [saved, setSaved] = React.useState(false);

  const handleToggle = async () => {
    const next = !blockOnOposicion;
    setBlockOnOposicion(next);

    try {
      if (next) {
        const result = await createRule.mutateAsync({
          nombre: "Denegación de Publicación por Estatus IPI",
          descripcion: "Bloquea la publicación cuando el estatus IPI es No Pagado",
          condicionLogica: "ipi.estatus == 'No Pagado' → BLOCK_PUBLISH",
          tipoDocumentoAplicable: 8,
          nivelAlerta: 2,
          tipoProyecto: 99,
        });
        localStorage.setItem(IPI_RULE_ID_KEY, result.id);
      } else {
        const ruleId = localStorage.getItem(IPI_RULE_ID_KEY);
        if (ruleId) {
          await toggleRule.mutateAsync(ruleId);
          localStorage.removeItem(IPI_RULE_ID_KEY);
        }
      }
      setSaved(true);
    } catch {
      setBlockOnOposicion(!next);
    }
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`vf-card !p-4 md:!p-5 relative overflow-hidden border-2 transition-colors duration-300 ${
        blockOnOposicion ? "border-error/30 bg-error/[0.02]" : "border-outline-variant/30"
      }`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.04] pointer-events-none">
        <FileWarning className="w-20 h-20" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
        {/* Icon + Label */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
          blockOnOposicion ? "bg-error/10 text-error" : "bg-surface-container-high text-on-surface-variant"
        }`}>
          <FileWarning className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Certificado IPI · Estatus</span>
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${
              blockOnOposicion
                ? "bg-error-container text-error border-error/10"
                : "bg-success-container text-success border-success/10"
            }`}>
              {blockOnOposicion ? "Bloqueante" : "Permisiva"}
            </span>
          </div>

          <h3 className="text-base font-display font-black text-secondary tracking-tight mb-1">
            Denegación de Publicación por Estatus IPI
          </h3>
          <p className="text-xs text-on-surface-variant font-medium leading-relaxed max-w-2xl">
            Cuando el certificado de IPI de un proyecto presenta el campo de <strong className="text-secondary">Estatus</strong> con valor{" "}
            <code className="text-[10px] font-mono text-primary bg-surface-container px-1.5 py-0.5 rounded">No Pagado</code>,
            el sistema {blockOnOposicion
              ? <><strong className="text-error">deniega automáticamente</strong> el publicamiento del proyecto</>
              : <><strong className="text-success">permite</strong> el publicamiento aunque el estatus sea &apos;No Pagado&apos;</>
            }.
          </p>

          {/* DSL preview */}
          <div className="mt-2 inline-flex items-center gap-2 bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1">
            <code className="text-[10px] font-mono font-bold text-primary">
              ipi.estatus == &apos;No Pagado&apos; → {blockOnOposicion ? "DENY_PUBLISH" : "ALLOW_PUBLISH"}
            </code>
          </div>
        </div>

        {/* Toggle control */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button
            type="button"
            id="ipi-oposicion-toggle"
            aria-label={blockOnOposicion
              ? "Desactivar bloqueo de publicación por oposición IPI"
              : "Activar bloqueo de publicación por oposición IPI"
            }
            onClick={handleToggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              blockOnOposicion ? "bg-error" : "bg-on-surface-variant/30"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                blockOnOposicion ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>

          <AnimatePresence mode="wait">
            {saved ? (
              <m.span
                key="saved"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-[9px] font-black text-success uppercase tracking-widest flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Guardado
              </m.span>
            ) : (
              <m.span
                key="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-[9px] font-black uppercase tracking-widest ${
                  blockOnOposicion ? "text-error" : "text-on-surface-variant"
                }`}
              >
                {blockOnOposicion ? "Activo" : "Inactivo"}
              </m.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </m.div>
  );
};
