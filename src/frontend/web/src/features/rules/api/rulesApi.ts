export interface ReglaValidacionDto {
  id: string;
  nombre: string;
  descripcion: string;
  condicionLogica: string;
  tipoDocumentoAplicable: string;
  nivelAlerta: string;
  tipoProyecto: string;
  activa: boolean;
  version: number;
  fechaCreacionUtc: string;
}

export interface CreateRuleCommand {
  nombre: string;
  descripcion: string;
  condicionLogica: string;
  tipoDocumentoAplicable: number;
  nivelAlerta: number;
  tipoProyecto: number;
}

export const rulesApi = {
  getRules: async (): Promise<ReglaValidacionDto[]> => {
    const response = await fetch('/api/admin/rules', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error al obtener las reglas.');
    return response.json();
  },

  createRule: async (command: CreateRuleCommand): Promise<{ id: string }> => {
    const response = await fetch('/api/admin/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(command)
    });
    if (!response.ok) throw new Error('Error al crear la regla.');
    return response.json();
  },

  toggleRule: async (id: string): Promise<void> => {
    const response = await fetch(`/api/admin/rules/${id}/toggle`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Error al cambiar el estado de la regla.');
  }
};
