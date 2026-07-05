import React, { useState } from "react";
import { m, AnimatePresence  } from "framer-motion";
import { 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Info, 
  UploadCloud, 
  File, 
  X, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
} from "lucide-react";
import { ProfessionalLayout } from "../../shared/components/layout/ProfessionalLayout";
import { clsx } from "clsx";

interface FileUpload {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  type: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export const ProjectDocumentUploadPage: React.FC = () => {
  const [files, setFiles] = useState<FileUpload[]>([
    { id: "1", name: "ESCRITURA_PROPIEDAD.PDF", size: "2.5 MB", progress: 100, status: "completed", type: "pdf" },
    { id: "2", name: "CEDULA_PROPIETARIO.JPG", size: "1.2 MB", progress: 100, status: "completed", type: "jpg" },
    { id: "3", name: "IMPUESTO_PREDIAL_2024.PDF", size: "0.8 MB", progress: 45, status: "uploading", type: "pdf" },
  ]);

  const [isDragging, setIsDragging] = useState(false);

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <ProfessionalLayout>
      <m.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* WIZARD STEPS */}
        <div className="flex items-center justify-between max-w-3xl mx-auto mb-12 relative px-4">
          {/* Connector Lines */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-[#DAD1C8] -z-10" />
          <div className="absolute top-5 left-0 w-1/2 h-0.5 bg-[#223382] -z-10 transition-all duration-700" />
          
          {/* Step 1: Done */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#223382] flex items-center justify-center text-white shadow-lg ring-4 ring-white">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-[10px] font-black uppercase text-[#223382] tracking-widest">Información</span>
          </div>

          {/* Step 2: Active */}
          <div className="flex flex-col items-center gap-2">
            <m.div 
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-10 h-10 rounded-full bg-[#ffdbbe] flex items-center justify-center text-[#331600] shadow-lg ring-8 ring-white"
            >
              <FileText size={20} />
            </m.div>
            <span className="text-[10px] font-black uppercase text-[#F98513] tracking-widest">Documentos</span>
          </div>

          {/* Step 3: Pending */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#f5e5d7] flex items-center justify-center text-[#857361] opacity-60">
              <ShieldCheck size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-[#5C5C5C] opacity-40 tracking-widest">Validación</span>
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-black text-[#111144] tracking-tight">Carga de Documentos</h2>
          <p className="text-[#5C5C5C]">Paso 2 de 3: Adjunte la documentación legal requerida para el expediente.</p>
        </div>

        {/* PROJECT INFO CARD */}
        <div className="bg-white border-2 border-[#ffdbbe] rounded-[24px] p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ffdbbe] rounded-2xl flex items-center justify-center text-[#F98513]">
              <Info size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#F98513]">Proyecto Seleccionado</p>
              <h3 className="text-lg font-black text-[#111144]">EXP-2024-001 - Finca "La Esperanza"</h3>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#5C5C5C]">Creado</p>
            <p className="font-bold text-[#111144]">12 Mar 2024</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* UPLOAD SECTION (Left 2/3) */}
          <div className="md:col-span-2 space-y-6">
            {/* DROPZONE */}
            <m.div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={clsx(
                "relative h-80 rounded-[32px] border-4 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4",
                isDragging 
                  ? "border-[#F98513] bg-[#FEF0E0]" 
                  : "border-[#DAD1C8] bg-white hover:border-[#9BACD8]"
              )}
            >
              <m.div 
                animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                className="w-20 h-20 bg-[#F4F1EC] rounded-full flex items-center justify-center text-[#F98513]"
              >
                <UploadCloud size={40} />
              </m.div>
              <div className="text-center">
                <p className="text-xl font-black text-[#111144]">Arrastre sus archivos aquí</p>
                <p className="text-[#5C5C5C] mt-2">o haga clic para explorar (PDF, JPG, PNG)</p>
              </div>
              <button type="button" className="mt-4 px-8 py-3 bg-[#223382] text-white rounded-full font-bold text-sm hover:bg-[#111144] transition-colors shadow-lg">
                Seleccionar Archivos
              </button>
            </m.div>

            {/* TIPS / GUIDANCE */}
            <div className="flex gap-4 p-4 bg-[#F4F1EC] rounded-2xl border border-[#DAD1C8]/50">
               <Info className="text-[#9BACD8] shrink-0" size={20} />
               <p className="text-xs text-[#5C5C5C] leading-relaxed">
                 Asegúrese de que los documentos escaneados sean legibles y no superen los 10MB por archivo. Los formatos aceptados son <strong>PDF, JPEG y PNG</strong>.
               </p>
            </div>
          </div>

          {/* FILE LIST (Right 1/3) */}
          <div className="bg-white rounded-[32px] border border-[#DAD1C8] overflow-hidden flex flex-col shadow-premium-sm">
            <div className="p-6 bg-[#223382] text-white">
              <h4 className="font-black flex items-center justify-between">
                <span>Lista de Archivos</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{files.length}</span>
              </h4>
            </div>
            
            <div className="flex-1 p-6 space-y-4 max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {files.map((file) => (
                  <m.div
                    key={file.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 bg-[#FFF8F3] rounded-2xl border border-[#ffdbbe]/30 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#223382] shadow-sm">
                        <File size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-[#111144] truncate">{file.name}</p>
                        <p className="text-[10px] text-[#5C5C5C]">{file.size}</p>
                      </div>
                      <button type="button" 
                        onClick={() => removeFile(file.id)}
                        className="text-[#C62828] hover:bg-[#C62828]/10 p-2 rounded-full transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {file.status === "uploading" && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#F98513]">
                          <span>Subiendo...</span>
                          <span>{file.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#ffdbbe]/50 rounded-full overflow-hidden">
                          <m.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            className="h-full bg-[#F98513]" 
                          />
                        </div>
                      </div>
                    )}
                    
                    {file.status === "completed" && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-[#2E7D32]">
                        <CheckCircle2 size={12} />
                        <span>ARCHIVO CARGADO</span>
                      </div>
                    )}
                  </m.div>
                ))}
              </AnimatePresence>
              
              {files.length === 0 && (
                <div className="text-center py-12 text-[#DAD1C8]">
                   <File size={40} className="mx-auto mb-2 opacity-30" />
                   <p className="text-sm">No hay archivos seleccionados</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-[#F4F1EC] border-t border-[#DAD1C8]">
               <div className="flex items-center justify-between text-xs mb-4">
                  <span className="text-[#5C5C5C]">Peso total:</span>
                  <span className="font-bold text-[#111144]">4.5 MB / 100 MB</span>
               </div>
               <button type="button" 
                onClick={() => setFiles([])}
                className="w-full py-3 flex items-center justify-center gap-2 text-[#C62828] font-black text-[10px] uppercase tracking-widest hover:bg-[#C62828]/5 rounded-xl transition-all"
               >
                 <Trash2 size={16} />
                 Limpiar Todo
               </button>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between pt-8 border-t border-[#DAD1C8]">
          <button type="button" className="flex items-center gap-2 px-6 py-3 text-[#223382] font-black text-sm hover:underline">
            <ArrowLeft size={20} />
            Regresar
          </button>
          <div className="flex gap-4">
            <button type="button" className="px-8 py-4 bg-[#DAD1C8] text-[#5C5C5C] rounded-2xl font-black text-sm cursor-not-allowed">
              Guardar Borrador
            </button>
            <button type="button" className="flex items-center gap-3 px-10 py-4 bg-[#F98513] text-white rounded-2xl font-black text-sm shadow-premium-sm hover:bg-[#E07610] transition-all transform hover:scale-[1.02] active:scale-95 group">
              Siguiente Paso
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </m.div>
    </ProfessionalLayout>
  );
};
