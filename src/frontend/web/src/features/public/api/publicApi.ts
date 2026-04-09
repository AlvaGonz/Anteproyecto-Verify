export interface DimensionResumenDto {
  dimension: string;
  resultado: string;
}

export interface PublicProjectStatusDto {
  codigoPublico: string;
  nombreProyecto: string;
  estadoValidacion: string;
  fechaEmision: string;
  resumenDimensiones: DimensionResumenDto[];
}

export const publicApi = {
  getProjectStatus: async (codigoPublico: string): Promise<PublicProjectStatusDto> => {
    const response = await fetch(`/api/public/projects/${codigoPublico}`);
    if (!response.ok) {
      throw new Error('Proyecto no encontrado o código inválido.');
    }
    return response.json();
  },
  getProjectStatusByQr: async (qrToken: string): Promise<PublicProjectStatusDto> => {
    const response = await fetch(`/api/public/projects/qr/${qrToken}`);
    if (!response.ok) {
      throw new Error('Proyecto no encontrado o token inválido.');
    }
    return response.json();
  }
};
