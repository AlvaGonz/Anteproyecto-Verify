const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export const isImageDocument = (nombre: string): boolean => {
  const ext = nombre.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.includes(ext);
};

export const getProjectCoverUrl = (
  imagenUrl: string | undefined,
  documents: { nombreArchivoOriginal: string; fileUrl?: string }[]
): string | null => {
  if (imagenUrl) return imagenUrl;
  const firstImage = documents.find(d => isImageDocument(d.nombreArchivoOriginal));
  return firstImage?.fileUrl ?? null;
};
