import React, { useEffect, useState, useRef } from "react";
import { Terminal, Cpu, Database } from "lucide-react";

interface ValidationHUDProps {
  isScanning: boolean;
  onComplete: () => void;
}

export const ValidationHUD: React.FC<ValidationHUDProps> = ({ isScanning, onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scanSteps = [
    "Iniciando Módulo de Auditoría Digital v4.0...",
    "Conectando con Red de Catastro Nacional...",
    "Estableciendo handshake seguro con DGII (Puerto 5005)...",
    "Analizando metadatos de archivos adjuntos...",
    "Verificando firmas digitales en Títulos de Propiedad...",
    "Cruzando datos georreferenciados con satélite...",
    "Validando identidad de titulares en Renap...",
    "Buscando gravámenes pendientes en Registro de Títulos...",
    "Ejecutando motor de reglas de cumplimiento (VeriRule 2.1)...",
    "Agregando resultados y generando reporte final...",
  ];

  useEffect(() => {
    if (isScanning) {
      setLogs([]);
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < scanSteps.length) {
          setLogs(prev => [...prev, `> ${new Date().toLocaleTimeString()} :: ${scanSteps[currentStep]}`]);
          currentStep++;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isScanning) return null;

  return (
    <div className="vf-hud-scanner p-8 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="vf-hud-grid" />
      <div className="vf-scan-line" />
      
      {/* HUD Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#223382]/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center border border-primary/40">
            <Cpu className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-white font-display font-bold tracking-widest text-lg uppercase">VeriScan Protocol</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span className="text-[10px] text-green-500 font-mono">EJECUTANDO NIVEL 7</span>
            </div>
          </div>
        </div>
        <div className="text-right font-mono text-[10px] text-[#223382]">
          CORE_LATENCY: 12ms<br />
          NODE_STATUS: STABLE
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {/* Terminal Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#223382]">
            <Terminal className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">System Output</span>
          </div>
          <div 
            ref={scrollRef}
            className="flex-1 bg-black/40 border border-[#223382]/20 rounded p-4 overflow-y-auto max-h-[300px] vf-terminal-text text-primary"
          >
            {logs.map((log, i) => (
              <div key={i} className="mb-2 last:mb-0 animate-in slide-in-from-left duration-300">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Visual Indicators */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#223382]">
            <Database className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Data Synchronicity</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Catastro", status: logs.length > 2 ? "SYNC" : "WAIT" },
              { label: "DGII", status: logs.length > 4 ? "SYNC" : "WAIT" },
              { label: "Títulos", status: logs.length > 6 ? "SYNC" : "WAIT" },
              { label: "Files", status: logs.length > 8 ? "SYNC" : "WAIT" },
            ].map((s) => (
              <div key={s.label} className={`p-3 rounded border transition-colors ${s.status === 'SYNC' ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="text-[9px] text-[#223382] uppercase mb-1">{s.label}</div>
                <div className={`text-xs font-mono ${s.status === 'SYNC' ? 'text-green-500' : 'text-white/20'}`}>
                  {s.status}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-primary/70 uppercase">Carga de Análisis AI</span>
              <span className="text-[10px] text-primary font-mono">{Math.min(100, (logs.length / scanSteps.length) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${(logs.length / scanSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
