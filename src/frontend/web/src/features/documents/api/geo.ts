export interface GeoMunicipality {
  id: string;
  nombre: string;
}

export async function fetchMunicipalities(provinciaId?: string): Promise<GeoMunicipality[]> {
  const url = provinciaId ? `/api/geo/municipios?provinciaId=${provinciaId}` : '/api/geo/municipios';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch municipalities');
  return response.json() as Promise<GeoMunicipality[]>;
}
