import React from "react";
import {
  LayoutDashboard,
  Check,
  FileWarning,
  Sliders,
  Edit3,
  Maximize2,
  AlertTriangle,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  useCreateRule,
  useToggleRule,
  useRules,
  useUpdateRule,
} from "../../features/rules/api/useRules";

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

    {/* Rules Grid / List */}
    <div className="flex flex-col gap-6">
      {/* Rule 8: Tolerancia Superficie vs Mensura */}
      <ToleranceSurfaceCard />

      {/* Rule 1: IPI Oposición Rule Banner */}
      <IpiOposicionCard />
    </div>
  </div>
));

// ─── Rule 8: Tolerancia Superficie vs Mensura Card ─────────────────────────────

const RULE_8_ID = "00000000-0000-0000-0000-000000000008";

export const ToleranceSurfaceCard: React.FC = () => {
  const { data: rulesList } = useRules();
  const updateRule = useUpdateRule();

  const rule8FromApi = rulesList?.find(
    (r) => r.id === RULE_8_ID || r.codigo === "RULE-008-SUPERFICIE"
  );

  const [tolerance, setTolerance] = React.useState<number>(0.05);
  const [active, setActive] = React.useState<boolean>(true);
  const [saved, setSaved] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (rule8FromApi) {
      if (rule8FromApi.valorUmbral !== undefined && rule8FromApi.valorUmbral !== null) {
        setTolerance(rule8FromApi.valorUmbral);
      }
      setActive(rule8FromApi.activa);
    }
  }, [rule8FromApi]);

  let computedAlertLevel = 2;
  let alertBadgeText = "Advertencia";
  let alertBadgeClass = "bg-warning-container/30 text-amber-800 dark:text-amber-300 border-warning/30";

  if (rule8FromApi) {
    if (typeof rule8FromApi.nivelAlerta === "string") {
      const str = (rule8FromApi.nivelAlerta as string).toLowerCase();
      if (str.includes("info") || str.includes("baja")) computedAlertLevel = 1;
    } else if (typeof rule8FromApi.nivelAlerta === "number") {
      computedAlertLevel = rule8FromApi.nivelAlerta;
    }
    
    if (computedAlertLevel === 1) {
      alertBadgeText = "Informativa";
      alertBadgeClass = "bg-primary/10 text-primary border-primary/20";
    }
  }

  const handleSave = async (overrideTolerance?: number, overrideActive?: boolean) => {
    const finalTolerance = overrideTolerance ?? tolerance;
    const finalActive = overrideActive ?? active;

    setError(null);
    if (finalTolerance < 0.01 || finalTolerance > 0.20) {
      setError("La tolerancia debe estar entre 1% (0.01) y 20% (0.20)");
      return;
    }

    try {
      await updateRule.mutateAsync({
        id: rule8FromApi?.id || RULE_8_ID,
        codigo: "RULE-008-SUPERFICIE",
        nombre: "Tolerancia Superficie vs Mensura",
        descripcion: "Valida que la diferencia entre la superficie declarada y catastro no exceda la tolerancia configurada.",
        condicionLogica: `Math.Abs(P.SuperficieM2 - C.Superficie) / C.Superficie <= ${finalTolerance}`,
        expresion: "|P.SuperficieM2 - C.Superficie| / C.Superficie <= @tolerancia",
        valorUmbral: finalTolerance,
        minValor: 0.01,
        maxValor: 0.20,
        tipoDocumentoAplicable: 24,
        nivelAlerta: computedAlertLevel,
        tipoProyecto: 99,
        activa: finalActive,
        rowVersion: rule8FromApi?.rowVersion,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.mensaje || "Error al guardar la regla.");
    }
  };

  const currentRuleId = rule8FromApi?.id || RULE_8_ID;

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="vf-card !p-5 relative overflow-hidden border-2 border-primary/20 bg-surface shadow-sm"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Maximize2 className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                Plano de Mensura &middot; Catastro Nacional
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${alertBadgeClass}`}>
                {alertBadgeText}
              </span>
            </div>

            <h3 className="text-base font-display font-black text-secondary tracking-tight mb-1">
              Tolerancia Superficie vs Mensura
            </h3>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed max-w-2xl">
              Valida que la variación entre la superficie del proyecto y la mensura catastral no exceda la tolerancia permitida (
              <strong className="text-secondary">{(tolerance * 100).toFixed(1)}%</strong>).
            </p>

            {/* DSL Preview */}
            <div className="mt-2 inline-flex items-center gap-2 bg-surface-container border border-outline-variant/20 rounded-lg px-2.5 py-1">
              <code className="text-[10px] font-mono font-bold text-primary">
                |P.SuperficieM2 - C.Superficie| / C.Superficie &le; {(tolerance * 100).toFixed(1)}%
              </code>
            </div>

            {error && (
              <div className="mt-2 text-xs font-bold text-error flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 shrink-0 bg-surface-container/50 p-3.5 rounded-xl border border-outline-variant/20">
          {/* Active Toggle */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => {
                  const nextActive = !active;
                  setActive(nextActive);
                  handleSave(tolerance, nextActive);
                }}
                id="rule-active-toggle"
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active ? "bg-primary" : "bg-on-surface-variant/30"
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${active ? "translate-x-6" : "translate-x-0"
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
                    className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-primary" : "text-on-surface-variant"}`}
                  >
                    {active ? "Activa" : "Inactiva"}
                  </m.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-px h-12 bg-outline-variant/30 hidden sm:block"></div>

          {/* Slider / Range */}
          <div className="flex flex-col gap-1 w-full sm:w-44">
            <div className="flex items-center justify-between text-xs font-bold text-secondary">
              <span className="flex items-center gap-1 text-[11px]">
                <Sliders className="w-3.5 h-3.5 text-primary" /> Umbral:
              </span>
              <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {(tolerance * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.20}
              step={0.005}
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value))}
              onMouseUp={() => handleSave(tolerance, active)}
              onTouchEnd={() => handleSave(tolerance, active)}
              className="w-full h-1.5 bg-surface-container-highest rounded appearance-none cursor-pointer accent-primary"
              aria-label="Ajustar tolerancia de superficie"
            />
            <div className="flex justify-between text-[9px] font-mono text-on-surface-variant">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              to={`/admin/rules/${currentRuleId}/edit`}
              className="p-2 text-xs font-bold text-on-surface-variant hover:text-primary bg-surface hover:bg-surface-container-high rounded-lg border border-outline-variant/30 transition-colors flex items-center gap-1.5"
              aria-label="Editar regla de tolerancia completa"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Detalles</span>
            </Link>
          </div>
        </div>
      </div>
    </m.div>
  );
};

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
      className={`vf-card !p-4 md:!p-5 relative overflow-hidden border-2 transition-colors duration-300 ${blockOnOposicion ? "border-error/30 bg-error/[0.02]" : "border-outline-variant/30"
        }`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.04] pointer-events-none">
        <FileWarning className="w-20 h-20" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
        {/* Icon + Label */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${blockOnOposicion ? "bg-error/10 text-error" : "bg-surface-container-high text-on-surface-variant"
          }`}>
          <FileWarning className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Certificado IPI · Estatus</span>
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${blockOnOposicion
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
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${blockOnOposicion ? "bg-error" : "bg-on-surface-variant/30"
              }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${blockOnOposicion ? "translate-x-6" : "translate-x-0"
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
                className={`text-[9px] font-black uppercase tracking-widest ${blockOnOposicion ? "text-error" : "text-on-surface-variant"
                  }`}
              >
                {blockOnOposicion ? "Activa" : "Inactiva"}
              </m.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </m.div>
  );
};
