import React, { useState } from "react";
import { AuditFilters } from "../types";

interface AuditFiltersProps {
  onFilterChange: (filters: AuditFilters) => void;
}

export const AuditFiltersComponent: React.FC<AuditFiltersProps> = ({
  onFilterChange,
}) => {
  const [tipoEvento, setTipoEvento] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleApply = () => {
    onFilterChange({
      tipoEvento: tipoEvento || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  };

  const handleClear = () => {
    setTipoEvento("");
    setFromDate("");
    setToDate("");
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-md shadow flex flex-wrap gap-4 items-end mb-6">
      <div>
        <label
          htmlFor="tipoEvento"
          className="block text-sm font-medium text-gray-700"
        >
          Tipo de Evento
        </label>
        <select
          id="tipoEvento"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={tipoEvento}
          onChange={(e) => setTipoEvento(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="Validacion">Validación</option>
          <option value="Documento">Documento</option>
          <option value="Proyecto">Proyecto</option>
          <option value="Certificacion">Certificación</option>
          <option value="General">General</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="fromDate"
          className="block text-sm font-medium text-gray-700"
        >
          Desde
        </label>
        <input
          type="date"
          id="fromDate"
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="toDate"
          className="block text-sm font-medium text-gray-700"
        >
          Hasta
        </label>
        <input
          type="date"
          id="toDate"
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleApply}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          Filtrar
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};
