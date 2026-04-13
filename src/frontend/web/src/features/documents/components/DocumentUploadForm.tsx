import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentType, UploadDocumentDto } from "../types";
import { Upload, FileText, Calendar, Landmark, Info, X, CheckCircle2, ShieldCheck } from "lucide-react";

interface DocumentUploadFormProps {
  projectId: string;
  onUpload: (dto: UploadDocumentDto, file: File) => Promise<void>;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<DocumentType>(
    DocumentType.Other,
  );
  const [fechaEmision, setFechaEmision] = useState("");
  const [institucionEmisora, setInstitucionEmisora] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("El archivo excede el tamaño máximo de 10MB.");
      setFile(null);
    } else {
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor selecciona un archivo.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dto: UploadDocumentDto = {
        tipoDocumento: Number(tipoDocumento),
        fechaEmision: fechaEmision || undefined,
        institucionEmisora: institucionEmisora || undefined,
        observaciones: observaciones || undefined,
      };

      await onUpload(dto, file);

      // Reset form
      setFile(null);
      setTipoDocumento(DocumentType.Other);
      setFechaEmision("");
      setInstitucionEmisora("");
      setObservaciones("");

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setError(err.message || "Error al subir el documento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="animate-fade-in-up">
      <form
        onSubmit={handleSubmit}
        className="vf-card p-8 border-dashed border-2 bg-surface-container-lowest/50"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
             <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-secondary tracking-tight">
              Añadir <span className="text-primary italic">Evidencia</span>
            </h3>
            <p className="text-xs text-on-surface-variant font-medium">Sube los documentos legales para validación RI</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container/30 border border-error/20 text-error rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: File Dropzone */}
          <div className="lg:col-span-12">
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative group h-48 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                    isDragging 
                      ? "border-primary bg-primary/[0.05] scale-[0.99]" 
                      : "border-outline-variant/50 hover:border-primary/50 hover:bg-primary/[0.02] bg-surface-container-lowest/50"
                  }`}
                >
                  <label htmlFor="file-upload" className="absolute inset-0 z-10 cursor-pointer">
                    <span className="sr-only">Subir archivo</span>
                  </label>
                  <div className="w-16 h-16 bg-primary-container/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 mb-2">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-on-surface">
                      Seleccionar Certificado
                    </p>
                    <p className="text-xs font-medium text-on-surface-variant/60">
                       Formatos aceptados: PDF, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="selected"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-[2rem] bg-secondary/[0.03] border-2 border-secondary/10 flex items-center justify-between animate-fade-in relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <ShieldCheck className="w-24 h-24" />
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary relative overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-secondary tracking-tight max-w-[300px] truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="px-2 py-0.5 rounded bg-secondary/10 text-[9px] font-black text-secondary uppercase tracking-widest">
                           {(file.size / 1024 / 1024).toFixed(2)} MB
                         </span>
                         <span className="h-1 w-1 rounded-full bg-outline-variant"></span>
                         <span className="text-[10px] font-bold text-success flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Expediente Preparado
                         </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={removeFile}
                    className="w-12 h-12 rounded-full hover:bg-error/10 hover:text-error text-on-surface-variant transition-all hover:rotate-90 flex items-center justify-center relative z-10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Metadata */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.22em] ml-1">
                Clasificación del Acto Jurídico
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: DocumentType.CertificadoTitulo, label: 'Título', icon: Landmark },
                  { id: DocumentType.CertificacionEstadoJuridico, label: 'Estado J.', icon: ShieldCheck },
                  { id: DocumentType.PlanoMensuraCatastral, label: 'Mensura', icon: FileText },
                  { id: DocumentType.Other, label: 'Otros', icon: Info },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTipoDocumento(cat.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 ${
                      tipoDocumento === cat.id 
                        ? 'border-primary bg-primary/[0.08] text-primary shadow-md' 
                        : 'border-outline-variant/20 bg-surface-container-low text-secondary hover:border-primary/30'
                    }`}
                  >
                    <cat.icon className={`w-5 h-5 ${tipoDocumento === cat.id ? 'animate-bounce-subtle' : ''}`} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{cat.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="relative group mt-4">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(Number(e.target.value))}
                  className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value={DocumentType.CertificadoTitulo}>Certificado de Título</option>
                  <option value={DocumentType.CertificacionEstadoJuridico}>Certificación de Estado Jurídico</option>
                  <option value={DocumentType.CopiaCedulaIdentidad}>Copia Cédula / Pasaporte</option>
                  <option value={DocumentType.PlanosArquitectonicos}>Planos Arquitectónicos</option>
                  <option value={DocumentType.PlanoMensuraCatastral}>Plano de Mensura Catastral</option>
                  <option value={DocumentType.ActodeVenta}>Acto de Venta</option>
                  <option value={DocumentType.Other}>Otro Documento / Evidencia</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                Institución Emisora
              </label>
              <div className="relative group">
                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Ej: Registro de Títulos"
                  value={institucionEmisora}
                  onChange={(e) => setInstitucionEmisora(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fecha-emision" className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                Fecha de Emisión
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input
                  id="fecha-emision"
                  type="date"
                  value={fechaEmision}
                  onChange={(e) => setFechaEmision(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                Observaciones Clave
              </label>
              <div className="relative group">
                <Info className="absolute left-4 top-4 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <textarea
                  placeholder="Detalles adicionales..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={1}
                  className="w-full py-4 pl-12 pr-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none min-h-[48px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || !file}
            className="vf-btn-primary min-w-[240px] shadow-lg shadow-primary/20 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            {isSubmitting ? (
              <>
                 <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                 <span className="font-black uppercase tracking-widest text-[11px]">Procesando...</span>
              </>
            ) : (
              <>
                 <ShieldCheck className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                 <span className="font-black uppercase tracking-widest text-[11px]">Sellar con VeriFinca</span>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </motion.button>
        </div>
      </form>
    </div>
  );
};
