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

const toastStyles: Record<ToastType, { bg: string; border: string; icon: React.FC<{ className?: string }> }> = {
  success: { bg: "bg-emerald-50", border: "border-emerald-400", icon: CheckCircle2 },
  error: { bg: "bg-red-50", border: "border-red-400", icon: XCircle },
  warning: { bg: "bg-amber-50", border: "border-amber-400", icon: AlertTriangle },
  info: { bg: "bg-blue-50", border: "border-blue-400", icon: Info },
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
      <div className="fixed bottom-4 right-4 space-y-3 z-50 pointer-events-none">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 max-w-sm rounded-xl shadow-lg border-l-4 ${style.bg} ${style.border} animate-fade-in-up`}
              role="alert"
            >
              <Icon className="w-5 h-5 flex-shrink-0 text-[var(--color-text-strong)] opacity-70" />
              <p className="text-sm font-medium text-[var(--color-text-strong)] flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-[var(--color-text-strong)] opacity-40" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
