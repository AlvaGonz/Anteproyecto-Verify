import React, {
  createContext,
  use,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = use(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: React.FC<{ className?: string }> }> = {
  success: { bg: "bg-[#E6F3EF]/90", border: "border-emerald-500", text: "text-emerald-900", icon: CheckCircle2 },
  error: { bg: "bg-[#FDECEC]/90", border: "border-red-500", text: "text-red-900", icon: XCircle },
  warning: { bg: "bg-[#FEF6E7]/90", border: "border-amber-500", text: "text-amber-900", icon: AlertTriangle },
  info: { bg: "bg-[#EBF1FF]/90", border: "border-blue-500", text: "text-blue-900", icon: Info },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 right-6 flex flex-col items-end gap-3 z-[100] pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const style = toastStyles[toast.type];
            const Icon = style.icon;
            return (
              <motion.div
                layout
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`pointer-events-auto flex items-center gap-4 px-5 py-4 min-w-[320px] max-w-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-l-[6px] backdrop-blur-xl ${style.bg} ${style.border}`}
                role="alert"
              >
                <div className={`p-2 rounded-full ${style.bg.replace(/\/90/g, "").replace(/bg-/g, "text-").replace(/\[/g, "").replace(/\]/g, "")} bg-white/60 shadow-sm`}>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${style.text}`} />
                </div>
                <p className={`text-[14px] font-medium ${style.text} flex-1 leading-snug`}>{toast.message}</p>
                <button type="button"
                  onClick={() => removeToast(toast.id)}
                  className="p-2 -mr-2 rounded-xl hover:bg-black/5 transition-colors flex-shrink-0"
                >
                  <X className={`w-4 h-4 ${style.text} opacity-50`} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
