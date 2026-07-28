import React, { useState, useEffect, useRef } from "react";
import { Bell, Trash2 } from "lucide-react";
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
        className="p-2 rounded-lg text-text-primary opacity-60 hover:opacity-100 hover:bg-surface-raised/30 transition-all relative"
      >
        <span className="sr-only">Ver notificaciones</span>
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary" />
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-2xl bg-surface border border-border z-[60] overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
          <div className="py-3 px-4 border-b border-border/50 flex justify-between items-center bg-surface">
            <h3 className="text-sm font-bold text-text-primary">Notificaciones</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-primary opacity-50">
                {unreadCount} nuevas
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Limpiar todas
                </button>
              )}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-text-primary opacity-50 text-center">
                No hay notificaciones nuevas.
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 hover:bg-surface-raised/50 transition-colors relative group ${!notification.leida ? 'bg-primary/5' : ''}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 pr-6">
                        <p className={`text-xs font-semibold ${!notification.leida ? 'text-primary' : 'text-text-primary'}`}>
                          {notification.tipo}
                        </p>
                        <p className="text-sm text-text-primary mt-0.5">
                          {notification.mensaje}
                        </p>
                        <p className="text-xs text-text-primary opacity-40 mt-1">
                          {toUtcDate(notification.fechaUtc)?.toLocaleString() ?? ''}
                        </p>
                      </div>
                      {!notification.leida && (
                        <button type="button"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-primary hover:underline flex-shrink-0"
                        >
                          Leída
                        </button>
                      )}
                    </div>
                    {/* Botón de eliminar en la esquina inferior derecha */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="absolute bottom-2 right-2 p-1 text-text-primary opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
                      title="Eliminar notificación"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
