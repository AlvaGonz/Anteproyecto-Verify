import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Calculator,
  RefreshCw,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import {
  useRule,
  useUpdateRule,
  useEvaluateRule,
  toleranceRuleSchema,
} from "../../../features/rules/api/useRules";

export const ToleranceRuleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: initialRule, isLoading, refetch } = useRule(id);
  const updateRule = useUpdateRule();
  const evaluateRule = useEvaluateRule();

  const [formData, setFormData] = useState<{
    nombre: string;
    codigo: string;
    descripcion: string;
    expresion: string;
    valorUmbral: number;
    minValor: number;
    maxValor: number;
    nivelAlerta: string;
    activa: boolean;
    rowVersion?: string;
  }>({
    nombre: "Tolerancia Superficie vs Mensura",
    codigo: "RULE-008-SUPERFICIE",
    descripcion: "Valida que la diferencia entre la superficie declarada y catastro no exceda la tolerancia configurada.",
    expresion: "|P.SuperficieM2 - C.Superficie| / C.Superficie <= @tolerancia",
    valorUmbral: 0.05,
    minValor: 0.01,
    maxValor: 0.20,
    nivelAlerta: "Advertencia",
    activa: true,
  });

  const [clientError, setClientError] = useState<string | null>(null);
  const [concurrencyError, setConcurrencyError] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Live calculator test state
  const [testSuperficieProyecto, setTestSuperficieProyecto] = useState<number>(1040);
  const [testSuperficieCatastro, setTestSuperficieCatastro] = useState<number>(1000);
  const [evalResult, setEvalResult] = useState<{
    cumple: boolean;
    mensaje: string;
    valorCalculado: number;
    diferenciaAbsoluta: number;
  } | null>(null);

  useEffect(() => {
    if (initialRule) {
      setFormData({
        nombre: initialRule.nombre,
        codigo: initialRule.codigo || "",
        descripcion: initialRule.descripcion,
        expresion: initialRule.expresion || "|P.SuperficieM2 - C.Superficie| / C.Superficie <= @tolerancia",
        valorUmbral: initialRule.valorUmbral ?? 0.05,
        minValor: initialRule.minValor ?? 0.01,
        maxValor: initialRule.maxValor ?? 0.20,
        nivelAlerta: initialRule.nivelAlerta === "Media" ? "Advertencia" : initialRule.nivelAlerta,
        activa: initialRule.activa,
        rowVersion: initialRule.rowVersion,
      });
      setConcurrencyError(false);
      setClientError(null);
    }
  }, [initialRule]);

  // Recalculate local evaluation whenever test numbers or tolerance changes
  useEffect(() => {
    if (testSuperficieCatastro > 0) {
      const diff = Math.abs(testSuperficieProyecto - testSuperficieCatastro);
      const applied = diff / testSuperficieCatastro;
      const pass = applied <= formData.valorUmbral;
      setEvalResult({
        cumple: pass,
        mensaje: pass
          ? `Superficie dentro de tolerancia (${(applied * 100).toFixed(2)}% ≤ ${(formData.valorUmbral * 100).toFixed(2)}%)`
          : `Superficie fuera de tolerancia (${(applied * 100).toFixed(2)}% > ${(formData.valorUmbral * 100).toFixed(2)}%)`,
        valorCalculado: applied,
        diferenciaAbsoluta: diff,
      });
    }
  }, [testSuperficieProyecto, testSuperficieCatastro, formData.valorUmbral]);

  const handleToleranceChange = (rawVal: number) => {
    setFormData((prev) => ({ ...prev, valorUmbral: rawVal }));
    setClientError(null);
  };

  const saveRule = async (dataToSave: typeof formData) => {
    setClientError(null);
    setConcurrencyError(false);

    // Validate with Zod
    const validation = toleranceRuleSchema.safeParse({
      valorUmbral: dataToSave.valorUmbral,
      nivelAlerta: dataToSave.nivelAlerta,
      activa: dataToSave.activa,
    });

    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message || "Valor de tolerancia inválido";
      setClientError(firstIssue);
      return;
    }

    try {
      const alertMap: Record<string, number> = {
        Informativa: 1,
        Baja: 1,
        Advertencia: 2,
        Media: 2,
      };

      await updateRule.mutateAsync({
        id: id || initialRule?.id || "00000000-0000-0000-0000-000000000008",
        codigo: dataToSave.codigo,
        nombre: dataToSave.nombre,
        descripcion: dataToSave.descripcion,
        condicionLogica: `Math.Abs(P.SuperficieM2 - C.Superficie) / C.Superficie <= ${dataToSave.valorUmbral}`,
        expresion: dataToSave.expresion,
        valorUmbral: dataToSave.valorUmbral,
        minValor: dataToSave.minValor,
        maxValor: dataToSave.maxValor,
        tipoDocumentoAplicable: 24, // PlanoMensuraCatastral
        nivelAlerta: alertMap[dataToSave.nivelAlerta] ?? 2,
        tipoProyecto: 99,
        activa: dataToSave.activa,
        rowVersion: dataToSave.rowVersion,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      if (err?.response?.status === 409 || err?.message?.includes("409")) {
        setConcurrencyError(true);
      } else {
        const errorMsg =
          err?.response?.data?.mensaje ||
          err?.response?.data?.errors?.ValorUmbral?.[0] ||
          err?.message ||
          "Error al actualizar la regla.";
        setClientError(errorMsg);
      }
    }
  };

  const isInitialMount = React.useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      if (initialRule) {
        isInitialMount.current = false;
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      saveRule(formData);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const handleRunBackendEval = async () => {
    if (!id) return;
    try {
      const result = await evaluateRule.mutateAsync({
        reglaId: id,
        proyectoId: "00000000-0000-0000-0000-000000000000",
        superficieProyecto: testSuperficieProyecto,
        superficieCatastro: testSuperficieCatastro,
      });
      setEvalResult({
        cumple: result.cumple,
        mensaje: result.mensaje,
        valorCalculado: result.valorCalculado,
        diferenciaAbsoluta: result.diferenciaAbsoluta,
      });
    } catch {
      // Local fallback calculation already handles feedback
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <span className="text-sm font-bold text-on-surface-variant">Cargando regla de validación...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Live Region for Screen Readers (WCAG 2.2) */}
      <div role="status" aria-live="polite" className="sr-only">
        Tolerancia actual: {(formData.valorUmbral * 100).toFixed(2)} por ciento.
        {clientError && ` Error: ${clientError}`}
        {concurrencyError && " Conflicto de concurrencia: La regla fue modificada por otro usuario."}
        {savedSuccess && " Regla actualizada exitosamente."}
        {updateRule.isPending && " Guardando cambios..."}
      </div>

      {/* Header & Back Link */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/rules"
            className="p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Volver a Parámetros de Validación"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                CONFIGURACIÓN DE REGLA
              </span>
              <span className="text-[10px] font-mono font-bold bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                {formData.codigo}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-secondary tracking-tight">
              {formData.nombre}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${formData.activa
              ? "bg-success-container text-success border-success/20"
              : "bg-surface-container text-on-surface-variant border-outline-variant/30"
              }`}
          >
            {formData.activa ? "Regla Activa" : "Regla Inactiva"}
          </span>
          <button
            id="save-rule-btn"
            type="button"
            onClick={() => saveRule(formData)}
            disabled={updateRule.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar Regla
          </button>
        </div>
      </div>

      {/* Concurrency Error Banner (409 Conflict) */}
      <AnimatePresence>
        {concurrencyError && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl border border-error/30 bg-error-container/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-error"
            role="alert"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-error" />
              <div>
                <strong className="block text-sm font-bold">La regla fue modificada por otro usuario</strong>
                <p className="text-xs text-error/90">
                  Por favor recarga la página para obtener la versión más reciente antes de guardar tus cambios.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-error text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Recargar Regla
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {/* Validation Error Banner */}
      <AnimatePresence>
        {clientError && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl border border-error/30 bg-error-container/20 flex items-center gap-3 text-error"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{clientError}</span>
          </m.div>
        )}
      </AnimatePresence>

      {/* Success Banner */}
      <AnimatePresence>
        {savedSuccess && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl border border-success/30 bg-success-container/20 flex items-center gap-3 text-success"
          >
            <Check className="w-5 h-5 shrink-0" />
            <span className="text-sm font-bold">Regla actualizada exitosamente. Los cambios están vigentes en el motor.</span>
          </m.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Edit Form */}
        <div className="lg:col-span-2">
          <div className="vf-card !p-6 flex flex-col gap-6 shadow-sm border border-outline-variant/30">
            {/* Tolerancia Slider + Number Input */}
            <div className="bg-surface-container/40 p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="tolerance-number-input"
                  className="text-sm font-display font-bold text-secondary flex items-center gap-2"
                >
                  <Sliders className="w-4 h-4 text-primary" />
                  Tolerancia Actual
                </label>
                <span className="text-lg font-mono font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
                  {(formData.valorUmbral * 100).toFixed(2)}%
                </span>
              </div>

              <p className="text-xs text-on-surface-variant">
                Porcentaje máximo de variación admisible entre el área declarada en el proyecto y el plano de mensura / Catastro Nacional.
              </p>

              {/* Range Slider */}
              <div className="mt-2">
                <input
                  id="tolerance-slider"
                  type="range"
                  min={formData.minValor}
                  max={formData.maxValor}
                  step={0.005}
                  value={formData.valorUmbral}
                  onChange={(e) => handleToleranceChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label="Ajustar porcentaje de tolerancia"
                />
                <div className="flex justify-between text-[10px] font-mono text-on-surface-variant mt-1 font-bold">
                  <span>Mín: {(formData.minValor * 100).toFixed(1)}%</span>
                  <span>Predeterminado: 5.0%</span>
                  <span>Máx: {(formData.maxValor * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Direct Decimal Input */}
              <div className="mt-2 flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    id="tolerance-number-input"
                    type="number"
                    step="0.0001"
                    min={formData.minValor}
                    max={formData.maxValor}
                    value={formData.valorUmbral}
                    onChange={(e) => handleToleranceChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/50 bg-surface text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                    aria-describedby="tolerance-range-hint"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-on-surface-variant font-mono">
                    = {(formData.valorUmbral * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
              <p id="tolerance-range-hint" className="text-[11px] text-on-surface-variant font-medium">
                Rango legal permitido: {(formData.minValor * 100).toFixed(1)}% a {(formData.maxValor * 100).toFixed(1)}% (0.01 a 0.20).
              </p>
            </div>

            {/* Alert Level & Active Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rule-alert-level" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  Nivel de Alerta
                </label>
                <select
                  id="rule-alert-level"
                  value={formData.nivelAlerta}
                  onChange={(e) => setFormData({ ...formData, nivelAlerta: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/50 bg-surface text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="Informativa">Informativa</option>
                  <option value="Advertencia">Advertencia (Recomendada)</option>
                </select>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  &quot;Advertencia&quot; genera un hallazgo visible en el reporte de debida diligencia.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  Estado de la Regla
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.activa}
                    id="rule-active-toggle"
                    onClick={() => setFormData({ ...formData, activa: !formData.activa })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${formData.activa ? "bg-primary" : "bg-on-surface-variant/30"
                      }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.activa ? "translate-x-6" : "translate-x-0"
                        }`}
                    />
                  </button>
                  <span className="text-sm font-bold text-secondary">
                    {formData.activa ? "Activa para validaciones" : "Inactiva (Omitida)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Formula Expression Readout */}
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                Fórmula de Evaluación DSL
              </label>
              <div className="bg-surface-container rounded-lg p-3 border border-outline-variant/30 font-mono text-xs text-primary font-bold">
                <code>|Proyecto.SuperficieM2 - Catastro.Superficie| / Catastro.Superficie &le; {formData.valorUmbral}</code>
              </div>
            </div>

          </div>
        </div>

        {/* Right 1 Col: Live Sandbox Simulator */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="vf-card !p-5 bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-secondary font-display font-bold text-sm">
              <Calculator className="w-4 h-4 text-primary" />
              Simulador de Evaluación en Vivo
            </div>
            <p className="text-xs text-on-surface-variant">
              Pruebe cómo evaluará el motor esta regla con los valores de tolerancia configurados:
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="sim-sup-declarada" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Superficie Proyecto (m²)
                </label>
                <input
                  id="sim-sup-declarada"
                  type="number"
                  value={testSuperficieProyecto}
                  onChange={(e) => setTestSuperficieProyecto(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-outline-variant/40 bg-surface font-mono"
                />
              </div>

              <div>
                <label htmlFor="sim-sup-catastro" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Superficie Catastro (m²)
                </label>
                <input
                  id="sim-sup-catastro"
                  type="number"
                  value={testSuperficieCatastro}
                  onChange={(e) => setTestSuperficieCatastro(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-outline-variant/40 bg-surface font-mono"
                />
              </div>
            </div>

            {/* Result Box */}
            {evalResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${evalResult.cumple
                  ? "bg-success-container/20 border-success/30 text-success"
                  : "bg-warning-container/20 border-warning/40 text-amber-800 dark:text-amber-300"
                  }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {evalResult.cumple ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{evalResult.cumple ? "Cumple la Regla" : "Fuera de Rango"}</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed">{evalResult.mensaje}</p>
                <div className="pt-2 border-t border-current/10 flex justify-between font-mono text-[10px]">
                  <span>Desviación: {((evalResult.valorCalculado) * 100).toFixed(2)}%</span>
                  <span>Diferencia: {evalResult.diferenciaAbsoluta.toFixed(2)} m²</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleRunBackendEval}
              disabled={evaluateRule.isPending}
              className="w-full py-2 px-3 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors text-center"
            >
              {evaluateRule.isPending ? "Evaluando API..." : "Validar con Endpoint Backend"}
            </button>
          </div>

          {/* Legal Reference Note */}
          <div className="p-4 rounded-xl bg-surface-container-high/50 border border-outline-variant/20 text-xs text-on-surface-variant flex flex-col gap-2">
            <span className="font-bold text-secondary">Fundamento Legal (República Dominicana):</span>
            <p className="text-[11px] leading-relaxed">
              Conforme a la <strong>Ley 108-05 de Registro Inmobiliario</strong> y la Resolución No. 628-2009 de la Dirección Nacional de Mensuras Catastrales, se admite un margen de tolerancia técnica en mediciones de terreno. Variaciones superiores al umbral configurado exigen trámite de deslinde o rectificación de área.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ToleranceRuleEdit;
