export interface DocumentoDto {
  id: string;
  proyectoId: string;
  tipoDocumento: number;
  nombreArchivoOriginal: string;
  contentType: string;
  extension: string;
  tamanoBytes: number;
  estadoDocumento: number;
  activo: boolean;
  version: number;
  fechaEmision?: string;
  institucionEmisora?: string;
  usuarioCargaId: string;
  observaciones?: string;
  fileUrl: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  resultadoOcrJson?: string;
}
