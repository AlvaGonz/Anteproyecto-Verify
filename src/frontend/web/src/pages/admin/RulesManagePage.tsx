import React, { useState, useEffect } from "react";
import { rulesApi, ReglaValidacionDto, CreateRuleCommand } from "../../features/rules/api/rulesApi";
import { Plus, Power, PowerOff, ShieldAlert, X } from "lucide-react";

export const RulesManagePage: React.FC = () => {
  const [rules, setRules] = useState<ReglaValidacionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<CreateRuleCommand>({
    nombre: "", descripcion: "", condicionLogica: "",
    tipoDocumentoAplicable: 1, nivelAlerta: 2, tipoProyecto: 1,
  });

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const data = await rulesApi.getRules(token);
      setRules(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleToggle = async (id: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      await rulesApi.toggleRule(id, token);
      await fetchRules();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || "";
      await rulesApi.createRule(formData, token);
      setShowForm(false);
      setFormData({ nombre: "", descripcion: "", condicionLogica: "", tipoDocumentoAplicable: 1, nivelAlerta: 2, tipoProyecto: 1 });
      await fetchRules();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-[var(--color-text-strong)] opacity-60">Cargando reglas...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-strong)] flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-[var(--color-brand-primary)]" />
            Motor de Reglas de Validacion
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-strong)] opacity-60">
            Gestione las reglas logicas que determinan el estado de validacion.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="vf-btn-primary mt-4 sm:mt-0">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Nueva Regla"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <div className="vf-card p-5 mb-6">
          <h3 className="text-base font-bold text-[var(--color-text-strong)] mb-4">Crear Nueva Regla</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1">Nombre</label>
                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="vf-input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1">Condicion Logica</label>
                <input type="text" required placeholder="documento.Estado == 'Aprobado'" value={formData.condicionLogica} onChange={(e) => setFormData({ ...formData, condicionLogica: e.target.value })} className="vf-input font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1">Descripcion</label>
              <textarea rows={2} value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="vf-input" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1">Tipo de Proyecto</label>
                <select value={formData.tipoProyecto} onChange={(e) => setFormData({ ...formData, tipoProyecto: Number(e.target.value) })} className="vf-input">
                  <option value={1}>Residencial</option>
                  <option value={2}>Comercial</option>
                  <option value={3}>Turistico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1">Documento</label>
                <select value={formData.tipoDocumentoAplicable} onChange={(e) => setFormData({ ...formData, tipoDocumentoAplicable: Number(e.target.value) })} className="vf-input">
                  <option value={1}>Certificado de Titulo</option>
                  <option value={3}>Planos Arquitectonicos</option>
                  <option value={5}>Permiso de Construccion</option>
                  <option value={12}>RNC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-strong)] mb-1">Nivel de Alerta</label>
                <select value={formData.nivelAlerta} onChange={(e) => setFormData({ ...formData, nivelAlerta: Number(e.target.value) })} className="vf-input">
                  <option value={1}>Baja</option>
                  <option value={2}>Media</option>
                  <option value={3}>Alta</option>
                  <option value={4}>Critica</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="vf-btn-secondary">Cancelar</button>
              <button type="submit" className="vf-btn-primary">Guardar Regla</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="vf-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[var(--color-surface-muted)]/50 bg-[var(--color-surface-base)]/50">
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--color-text-strong)] opacity-60 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--color-text-strong)] opacity-60 uppercase tracking-wider">Condicion</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--color-text-strong)] opacity-60 uppercase tracking-wider">Alerta</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--color-text-strong)] opacity-60 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[var(--color-text-strong)] opacity-60 uppercase tracking-wider">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-surface-muted)]/30">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[var(--color-surface-base)]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-[var(--color-text-strong)]">{rule.nombre}</div>
                    <div className="text-xs text-[var(--color-text-strong)] opacity-40">v{rule.version}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-strong)] opacity-60 font-mono">{rule.condicionLogica}</td>
                  <td className="px-4 py-3">
                    <span className={`vf-badge ${
                      rule.nivelAlerta === "Critica" ? "vf-badge-error" :
                      rule.nivelAlerta === "Alta" ? "vf-badge-warning" :
                      rule.nivelAlerta === "Media" ? "vf-badge-accent" : "vf-badge-success"
                    }`}>
                      {rule.nivelAlerta}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`vf-badge ${rule.activa ? "vf-badge-success" : "vf-badge-neutral"}`}>
                      {rule.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggle(rule.id)}
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        rule.activa ? "text-red-600 hover:text-red-800" : "text-emerald-600 hover:text-emerald-800"
                      }`}
                    >
                      {rule.activa ? <><PowerOff className="w-3.5 h-3.5" /> Desactivar</> : <><Power className="w-3.5 h-3.5" /> Activar</>}
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--color-text-strong)] opacity-50">
                    No hay reglas de validacion registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
