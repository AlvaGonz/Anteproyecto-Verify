import React, { useState, useEffect, useRef } from "react";
import { Bell, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationDto } from "../types";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from "../api/useNotifications";
import { toUtcDate } from "../../../shared/utils/dates";

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: rawNotifications = [] } = useNotifications(false);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();

  // Mapping from API model to UI model
  const notifications = React.useMemo(() => {
    if (!Array.isArray(rawNotifications)) return [];
    return rawNotifications.map((n: any) => ({
      ...n,
      id: n.idNotificacion || n.id || n.Id || n.ID || "",
      usuarioId: n.idUsuario || n.usuarioId || n.UsuarioId || "",
      // ponytail: backend DTO field is FechaUtc → serialized as fechaUtc
      fechaUtc: n.fechaUtc || n.FechaUtc || new Date().toISOString(),
      tipo: n.tipoNotificacion || n.tipo || n.Tipo || "Info",
      leida: n.leida || n.Leida || false,
    })) as unknown as NotificationDto[];
  }, [rawNotifications]);

  const unreadCount = notifications.filter(n => !n.leida).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      setIsOpen(false);
    } catch (error) {
      console.error("Error marking all as read", error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-text-primary opacity-60 hover:opacity-100 hover:bg-surface-raised/50 transition-all relative outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className="sr-only">Ver notificaciones</span>
        <Bell className="h-5 w-5" aria-hidden="true" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-primary border-2 border-surface"
            />
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="origin-top-right absolute right-0 mt-2 w-80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-surface/95 backdrop-blur-xl border border-border/50 z-[60] overflow-hidden"
          >
            <div className="py-3 px-4 border-b border-border/50 flex justify-between items-center bg-surface/50 backdrop-blur-md">
              <h3 className="text-sm font-bold text-text-primary">Notificaciones</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-text-primary opacity-50 bg-surface-raised px-2 py-0.5 rounded-full">
                  {unreadCount} nuevas
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-xs text-primary hover:text-primary-hover hover:underline font-medium transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                  className="p-8 text-sm text-text-primary opacity-50 text-center flex flex-col items-center gap-2"
                >
                  <Bell className="w-8 h-8 opacity-20 mb-1" />
                  No hay notificaciones nuevas.
                </motion.div>
              ) : (
                <div className="divide-y divide-border/30">
                  <AnimatePresence initial={false}>
                    {notifications.map((notification) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, backgroundColor: 'rgb(var(--color-error) / 0.1)' }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        key={notification.id} 
                        className={`p-3 hover:bg-surface-raised/50 transition-colors relative group ${!notification.leida ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 pr-6">
                            <p className={`text-xs font-semibold ${!notification.leida ? 'text-primary' : 'text-text-primary opacity-70'}`}>
                              {notification.tipo}
                            </p>
                            <p className="text-sm text-text-primary mt-0.5 leading-snug">
                              {notification.mensaje}
                            </p>
                            <p className="text-[11px] text-text-primary opacity-40 mt-1.5 font-medium">
                              {toUtcDate(notification.fechaUtc)?.toLocaleString() ?? ''}
                            </p>
                          </div>
                          {!notification.leida && (
                            <button type="button"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-[11px] font-medium text-primary hover:text-primary-hover opacity-80 hover:opacity-100 transition-all flex-shrink-0 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md"
                            >
                              Marcar leída
                            </button>
                          )}
                        </div>
                        {/* Botón de eliminar en la esquina inferior derecha */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg text-text-primary opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:bg-error/10 hover:text-error transition-all"
                          title="Eliminar notificación"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
