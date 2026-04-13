import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

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
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: React.FC<{ className?: string }> }> = {
  success: { bg: "bg-[#E6F3EF]", border: "border-emerald-500", text: "text-emerald-900", icon: CheckCircle2 },
  error: { bg: "bg-[#FDECEC]", border: "border-red-500", text: "text-red-900", icon: XCircle },
  warning: { bg: "bg-[#FEF6E7]", border: "border-amber-500", text: "text-amber-900", icon: AlertTriangle },
  info: { bg: "bg-[#EBF1FF]", border: "border-blue-500", text: "text-blue-900", icon: Info },
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

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-6 right-6 space-y-3 z-[100] pointer-events-none">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-4 px-5 py-4 min-w-[320px] max-w-sm rounded-2xl shadow-floating border-l-[6px] backdrop-blur-md ${style.bg} ${style.border} animate-in slide-in-from-right fade-in duration-300`}
              role="alert"
            >
              <div className={`p-2 rounded-full ${style.bg.replace("bg-", "text-").replace("[", "").replace("]", "")} bg-white/50`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${style.text}`} />
              </div>
              <p className={`text-[14px] font-bold ${style.text} flex-1`}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-2 rounded-xl hover:bg-black/5 transition-colors flex-shrink-0"
              >
                <X className={`w-4 h-4 ${style.text} opacity-40`} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
