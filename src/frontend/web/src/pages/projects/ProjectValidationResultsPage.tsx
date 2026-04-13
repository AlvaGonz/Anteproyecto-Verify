import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  InternalValidationSummaryDto,
  FindingDto,
} from "../../features/validations/types";
import { validationsApi } from "../../features/validations/api/validationsApi";
import { ValidationSummary } from "../../features/validations/components/ValidationSummary";
import { ValidationRulesTable } from "../../features/validations/components/ValidationRulesTable";
import { FindingsList } from "../../features/validations/components/FindingsList";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Play, 
  RefreshCw, 
  AlertCircle,
  FileSearch,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ProjectValidationResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<InternalValidationSummaryDto | null>(null);
  const [findings, setFindings] = useState<FindingDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const latestSummary = await validationsApi.getLatestInternalValidation(id);
      setSummary(latestSummary);
      if (latestSummary) {
        const projectFindings = await validationsApi.getProjectFindings(id);
        setFindings(projectFindings.filter((f) => f.validacionId === latestSummary.validacionId));
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los resultados de validación");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRunValidation = async () => {
    if (!id) return;
    setIsEvaluating(true);
    setError(null);
    try {
      const newSummary = await validationsApi.runInternalValidation(id);
      setSummary(newSummary);
      const projectFindings = await validationsApi.getProjectFindings(id);
      setFindings(projectFindings.filter((f) => f.validacionId === newSummary.validacionId));
    } catch (err: any) {
      setError(err.message || "Error al ejecutar la validación");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-8"></div>
        <p className="text-sm font-black text-secondary uppercase tracking-[0.4em]">Sincronizando Motor de Análisis...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <Link to={`/admin/projects/${id}`} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 group">
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
               <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Volver al Expediente</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">DIAGNÓSTICO TÉCNICO</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-black text-secondary tracking-tighter leading-none mb-4">
            Auditoría de <span className="text-primary italic">Cumplimiento</span>
          </h1>
          <p className="text-base text-on-surface-variant font-medium max-w-2xl">
            Ejecute y visualice los resultados del análisis automático de integridad sobre la base documental del proyecto.
          </p>
        </div>

        <button
          onClick={handleRunValidation}
          disabled={isEvaluating}
          className={`vf-btn-primary h-16 px-10 !rounded-2xl shadow-2xl shadow-primary/30 transition-all ${isEvaluating ? 'opacity-70 scale-95' : 'hover:scale-105 active:scale-95'}`}
        >
          {isEvaluating ? (
            <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
          ) : (
            <Play className="w-6 h-6 mr-3 fill-current" />
          )}
          <span className="text-lg font-black tracking-tight">
            {isEvaluating ? "Procesando..." : "Ejecutar Análisis"}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-10 p-6 bg-error-container border border-error/10 text-error rounded-3xl flex items-center gap-4"
          >
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p className="text-sm font-black uppercase tracking-wider">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!summary && !error ? (
        <section className="vf-card !p-20 text-center border-2 border-dashed border-outline-variant/30 bg-surface-container-low/30 rounded-[3rem]">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2rem] bg-surface-container-high flex items-center justify-center mb-8 text-on-surface-variant/40">
               <Cpu className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-display font-black text-secondary mb-4 tracking-tight">Sin Historial de Análisis</h3>
            <p className="text-base text-on-surface-variant font-medium mb-10 leading-relaxed">
              No se han encontrado ejecuciones previas de validación para este expediente. Inicie el motor para detectar posibles inconsistencias legales.
            </p>
            <button
              onClick={handleRunValidation}
              className="vf-btn-primary h-14 px-12 !rounded-xl"
            >
              Iniciar Primer Escaneo
            </button>
          </div>
        </section>
      ) : (
        <div className="space-y-12">
          {/* Summary View */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
            <ValidationSummary summary={summary!} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
             {/* Rules Table */}
             <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                   <div className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center shadow-lg">
                      <ShieldCheck className="w-4 h-4" />
                   </div>
                   <h3 className="text-xl font-display font-black text-secondary uppercase tracking-tight">Parámetros Evaluados</h3>
                </div>
                <div className="vf-card !p-0 overflow-hidden !rounded-[2rem] shadow-xl">
                   <ValidationRulesTable results={summary!.results} />
                </div>
             </div>

             {/* Findings */}
             <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                   <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                      <FileSearch className="w-4 h-4" />
                   </div>
                   <h3 className="text-xl font-display font-black text-secondary uppercase tracking-tight">Hallazgos y Observaciones</h3>
                </div>
                <div className="vf-card !p-0 overflow-hidden !rounded-[2rem] shadow-xl min-h-[400px] border-primary/20 bg-primary/[0.01]">
                   <FindingsList findings={findings} />
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
