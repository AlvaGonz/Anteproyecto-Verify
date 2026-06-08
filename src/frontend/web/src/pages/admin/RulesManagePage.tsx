import React, { useState } from "react";
import { useRules, useCreateRule, useToggleRule, CreateRuleCommand, ReglaValidacionDto } from "../../features/rules/api/useRules";
import { 
  Plus, 
  Power, 
  PowerOff, 
  ShieldAlert, 
  X, 
  Settings2, 
  Zap, 
  CheckCircle2, 
  AlertOctagon,
  Search,
  BookOpen,
  LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";

export const RulesManagePage: React.FC = () => {
  const { addToast } = useToast();
  const { data: rawRules = [], isLoading: loading } = useRules();
  const createRuleMutation = useCreateRule();
  const toggleRuleMutation = useToggleRule();

  const rules = React.useMemo(() => {
    return rawRules.map((r: any) => ({
      ...r,
      id: String(r.idRegla || r.id),
      activa: r.activa ?? r.isActive,
    })) as unknown as ReglaValidacionDto[];
  }, [rawRules]);

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<CreateRuleCommand>({
    nombre: "", 
    descripcion: "", 
    condicionLogica: "",
    tipoDocumentoAplicable: 1, 
    nivelAlerta: 2, 
    tipoProyecto: 1,
  });

  const handleToggle = async (id: string, currentName: string, isActivating: boolean) => {
    try {
      await toggleRuleMutation.mutateAsync(id);
      addToast(`Regla "${currentName}" ${isActivating ? 'activada' : 'desactivada'}`, isActivating ? "success" : "info");
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRuleMutation.mutateAsync(formData);
      addToast("Parámetro de validación creado correctamente", "success");
      setShowForm(false);
      setFormData({ 
        nombre: "", 
        descripcion: "", 
        condicionLogica: "", 
        tipoDocumentoAplicable: 1, 
        nivelAlerta: 2, 
        tipoProyecto: 1 
      });
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const filteredRules = rules.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-6"></div>
        <p className="text-sm font-black text-secondary uppercase tracking-[0.3em]">Cargando Motor de Reglas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Page Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <Link to="/admin/projects" className="text-on-surface-variant hover:text-primary transition-colors">
                <LayoutDashboard className="w-4 h-4" />
             </Link>
             <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">MOTOR DE INTELIGENCIA</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-black text-secondary tracking-tighter leading-none mb-4">
            Gestión de <span className="text-primary italic">Validaciones</span>
          </h1>
          <p className="text-base text-on-surface-variant font-medium max-w-2xl">
            Configure las reglas lógicas que orquestan el motor de cumplimiento. Las reglas determinan el estado de integridad jurídica de cada proyecto inmobiliario.
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`vf-btn-primary h-14 !rounded-2xl shadow-lg transition-all ${showForm ? '!bg-secondary' : ''}`}
        >
          {showForm ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
          {showForm ? "Cancelar Operación" : "Definir Nueva Regla"}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Reglas Activas', value: rules.filter(r => r.activa).length, icon: Zap, color: 'text-primary' },
          { label: 'Criticas', value: rules.filter(r => r.nivelAlerta === "Critica").length, icon: AlertOctagon, color: 'text-error' },
          { label: 'Consistencia', value: '98.4%', icon: CheckCircle2, color: 'text-success' },
          { label: 'Versión Motor', value: 'v2.4.0', icon: Settings2, color: 'text-secondary' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="vf-card relative overflow-hidden group hover:scale-[1.02] transition-transform"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700">
               <stat.icon className="w-20 h-20" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-2xl font-display font-black text-secondary tracking-tighter leading-none">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12"
          >
            <div className="vf-card !p-10 border-2 border-primary/20 bg-primary/[0.02]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-black text-secondary tracking-tight">Nueva Lógica de Validacion</h3>
                  <p className="text-sm font-medium text-on-surface-variant">Defina los parámetros técnicos que el motor debe evaluar automáticamente.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Nombre de la Regla</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.nombre} 
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                      className="vf-input h-14" 
                      placeholder="Ej: Validación de Título Vigente"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Condición Lógica (DSL)</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.condicionLogica} 
                      onChange={(e) => setFormData({ ...formData, condicionLogica: e.target.value })} 
                      className="vf-input h-14 font-mono text-primary" 
                      placeholder="documento.Estado == 'Certificado'"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Descripción Funcional</label>
                  <textarea 
                    rows={3} 
                    value={formData.descripcion} 
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
                    className="vf-input !py-4" 
                    placeholder="Detalle el impacto legal o técnico de esta regla..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Tipo de Proyecto</label>
                    <select value={formData.tipoProyecto} onChange={(e) => setFormData({ ...formData, tipoProyecto: Number(e.target.value) })} className="vf-input h-14">
                      <option value={1}>Residencial</option>
                      <option value={2}>Comercial</option>
                      <option value={3}>Turístico</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Entidad Aplicable</label>
                    <select value={formData.tipoDocumentoAplicable} onChange={(e) => setFormData({ ...formData, tipoDocumentoAplicable: Number(e.target.value) })} className="vf-input h-14">
                      <option value={1}>Certificado de Titulo</option>
                      <option value={3}>Planos Arquitectónicos</option>
                      <option value={5}>Permiso de Construcción</option>
                      <option value={12}>DGII / RNC</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Nivel de Gravedad</label>
                    <select value={formData.nivelAlerta} onChange={(e) => setFormData({ ...formData, nivelAlerta: Number(e.target.value) })} className="vf-input h-14">
                      <option value={1}>Informativo</option>
                      <option value={2}>Advertencia</option>
                      <option value={3}>Alta Severidad</option>
                      <option value={4}>Bloqueante (Crítica)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="vf-btn-secondary h-14 px-8">Cancelar</button>
                  <button type="submit" className="vf-btn-primary h-14 px-10 shadow-xl shadow-primary/20">Instanciar Parámetro</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-6">
        <div className="vf-card !p-3 flex flex-col sm:flex-row items-center gap-3">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Filtrar por nombre o lógica..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-bold text-secondary outline-none placeholder:text-on-surface-variant/40"
              />
           </div>
           <div className="h-10 w-[2px] bg-outline-variant/10 hidden sm:block"></div>
           <p className="px-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
              {filteredRules.length} Reglas en el sistema
           </p>
        </div>

        <div className="vf-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/30">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Identificador y Versión</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Criterio Lógico</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Severidad</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Estado</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-primary/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-secondary mb-1 group-hover:text-primary transition-colors">{rule.nombre}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase">Revision v{rule.version}</span>
                           <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                           <span className="text-[10px] font-bold text-primary">ID: {rule.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="bg-surface-container rounded-lg px-4 py-2 inline-block border border-outline-variant/20">
                        <code className="text-xs font-mono font-bold text-primary">{rule.condicionLogica}</code>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        rule.nivelAlerta === "Critica" ? "bg-error-container text-error border border-error/10" :
                        rule.nivelAlerta === "Alta" ? "bg-warning-container text-warning border border-warning/10" :
                        rule.nivelAlerta === "Media" ? "bg-secondary-container text-secondary border border-secondary/10" : "bg-success-container text-success border border-success/10"
                      }`}>
                        {rule.nivelAlerta}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${rule.activa ? "bg-success animate-pulse" : "bg-on-surface-variant/30"}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${rule.activa ? "text-success" : "text-on-surface-variant"}`}>
                          {rule.activa ? "Operativo" : "En Pausa"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleToggle(rule.id, rule.nombre, !rule.activa)}
                        className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          rule.activa 
                            ? "bg-error/5 text-error hover:bg-error hover:text-white" 
                            : "bg-success/5 text-success hover:bg-success hover:text-white"
                        }`}
                      >
                        {rule.activa ? <><PowerOff className="w-4 h-4 inline mr-1" /> Deshabilitar</> : <><Power className="w-4 h-4 inline mr-1" /> Activar</>}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <ShieldAlert className="w-16 h-16" />
                        <p className="text-sm font-black uppercase tracking-[0.2em]">Sin parámetros de validación activos</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
