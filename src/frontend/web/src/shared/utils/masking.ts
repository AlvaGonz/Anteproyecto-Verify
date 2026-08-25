export const maskCedula = (id: string | null | undefined): string => {
  if (!id) return "";
  const clean = id.replace(/-/g, '');
  if (clean.length === 11 && /^\d+$/.test(clean)) {
    return `${clean.substring(0, 3)}-***${clean.substring(6, 10)}-*`;
  }
  return id;
};
