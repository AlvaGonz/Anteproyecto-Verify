// react-doctor-disable no-giant-component
import React, { useState, useEffect } from "react";
import { useRules, useCreateRule, useToggleRule, CreateRuleCommand, ReglaValidacionDto } from "../../features/rules/api/useRules";
import { useToast } from "../../shared/components/ui/Toast/ToastContext";
import { RulesManagePageLayout } from "./RulesManagePageLayout";

export const RulesManagePage: React.FC = () => {
  const { addToast } = useToast();
  const { data: rawRules = [], isLoading: loading } = useRules(1, 50);
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
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    r.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    r.descripcion.toLowerCase().includes(debouncedSearch.toLowerCase())
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
    <RulesManagePageLayout
      showForm={showForm}
      setShowForm={setShowForm}
      handleSubmit={handleSubmit}
      formData={formData}
      setFormData={setFormData}
      rules={rules}
      filteredRules={filteredRules}
      handleToggle={handleToggle}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
};
