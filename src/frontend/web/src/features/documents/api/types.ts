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
  createdAtUtc: string;
  updatedAtUtc?: string;
  cedulaExtraction?: any; // Will be properly typed in frontend types
  certificadoTituloExtraction?: any;
  planoMensuraExtraction?: any;
  estadoJuridicoExtraction?: any;
  resultadoOcrJson?: string;
  fileUrl?: string;
}
