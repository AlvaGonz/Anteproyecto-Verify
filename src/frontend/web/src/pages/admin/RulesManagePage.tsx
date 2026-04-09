import React, { useState, useEffect } from 'react';
import { rulesApi, ReglaValidacionDto, CreateRuleCommand } from '../../features/rules/api/rulesApi';
import { Plus, Power, PowerOff, ShieldAlert } from 'lucide-react';

export const RulesManagePage: React.FC = () => {
  const [rules, setRules] = useState<ReglaValidacionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<CreateRuleCommand>({
    nombre: '',
    descripcion: '',
    condicionLogica: '',
    tipoDocumentoAplicable: 1,
    nivelAlerta: 2,
    tipoProyecto: 1
  });

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const data = await rulesApi.getRules(token);
      setRules(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      await rulesApi.toggleRule(id, token);
      await fetchRules();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      await rulesApi.createRule(formData, token);
      setShowForm(false);
      setFormData({
        nombre: '',
        descripcion: '',
        condicionLogica: '',
        tipoDocumentoAplicable: 1,
        nivelAlerta: 2,
        tipoProyecto: 1
      });
      await fetchRules();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8">Cargando reglas...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Motor de Reglas de Validación</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestione las reglas lógicas que determinan el estado de validación de los documentos y proyectos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Nueva Regla
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 border border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Crear Nueva Regla</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Condición Lógica (Expresión)</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    placeholder="Ej. documento.Estado == 'Aprobado'"
                    value={formData.condicionLogica}
                    onChange={(e) => setFormData({ ...formData, condicionLogica: e.target.value })}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <div className="mt-1">
                  <textarea
                    rows={2}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Tipo de Proyecto</label>
                <select
                  value={formData.tipoProyecto}
                  onChange={(e) => setFormData({ ...formData, tipoProyecto: Number(e.target.value) })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value={1}>Residencial</option>
                  <option value={2}>Comercial</option>
                  <option value={3}>Turístico</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Documento Aplicable</label>
                <select
                  value={formData.tipoDocumentoAplicable}
                  onChange={(e) => setFormData({ ...formData, tipoDocumentoAplicable: Number(e.target.value) })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value={1}>Certificado de Título</option>
                  <option value={2}>Certificación de Estado Jurídico</option>
                  <option value={3}>Planos Arquitectónicos</option>
                  <option value={4}>Plano de Mensura Catastral</option>
                  <option value={5}>Permiso de Construcción</option>
                  <option value={6}>Certificado de Uso de Suelo</option>
                  <option value={8}>Certificación IPI</option>
                  <option value={12}>RNC</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nivel de Alerta</label>
                <select
                  value={formData.nivelAlerta}
                  onChange={(e) => setFormData({ ...formData, nivelAlerta: Number(e.target.value) })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value={1}>Baja</option>
                  <option value={2}>Media</option>
                  <option value={3}>Alta</option>
                  <option value={4}>Crítica</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar Regla
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nombre</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Condición</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Proyecto</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Documento</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Alerta</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {rule.nombre}
                        <div className="text-xs text-gray-500 font-normal">v{rule.version}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono text-xs">
                        {rule.condicionLogica}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {rule.tipoProyecto}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {rule.tipoDocumentoAplicable}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.nivelAlerta === 'Critica' ? 'bg-red-100 text-red-800' :
                          rule.nivelAlerta === 'Alta' ? 'bg-orange-100 text-orange-800' :
                          rule.nivelAlerta === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          {rule.nivelAlerta}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleToggle(rule.id)}
                          className={`${rule.activa ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} inline-flex items-center`}
                        >
                          {rule.activa ? (
                            <><PowerOff className="w-4 h-4 mr-1" /> Desactivar</>
                          ) : (
                            <><Power className="w-4 h-4 mr-1" /> Activar</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rules.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-sm text-gray-500 text-center">
                        No hay reglas de validación registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
