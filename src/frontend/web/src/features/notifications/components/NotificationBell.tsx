import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { NotificationDto } from "../types";
import { useNotifications, useMarkAsRead } from "../api/useNotifications";

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: rawNotifications = [] } = useNotifications(true);
  const markAsReadMutation = useMarkAsRead();

  // Mapping from API model to UI model
  const notifications = React.useMemo(() => {
    if (!Array.isArray(rawNotifications)) return [];
    return rawNotifications.map((n: any) => ({
      ...n,
      id: String(n.idNotificacion || n.id),
      usuarioId: String(n.idUsuario || n.usuarioId),
      fechaUtc: n.fechaCreacionUtc || n.fechaUtc,
      tipo: n.tipoNotificacion || n.tipo,
    })) as unknown as NotificationDto[];
  }, [rawNotifications]);

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
      await markAsReadMutation.mutateAsync(Number(id));
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-text-primary opacity-60 hover:opacity-100 hover:bg-surface-raised/30 transition-all relative"
      >
        <span className="sr-only">Ver notificaciones</span>
        <Bell className="h-5 w-5" aria-hidden="true" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary" />
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-2xl bg-surface border border-border z-[100] overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
          <div className="py-3 px-4 border-b border-border/50 flex justify-between items-center bg-surface">
            <h3 className="text-sm font-bold text-text-primary">Notificaciones</h3>
            <span className="text-xs text-text-primary opacity-50">
              {notifications.length} nuevas
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-text-primary opacity-50 text-center">
                No hay notificaciones nuevas.
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 hover:bg-surface-raised/50 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-primary">
                          {notification.tipo}
                        </p>
                        <p className="text-sm text-text-primary mt-0.5">
                          {notification.mensaje}
                        </p>
                        <p className="text-xs text-text-primary opacity-40 mt-1">
                          {new Date(notification.fechaUtc).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-primary hover:underline flex-shrink-0"
                      >
                        Leida
                      </button>
                    </div>
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
