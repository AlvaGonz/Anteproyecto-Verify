import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { NotificationDto } from "../types";
import { notificationsApi } from "../api/notificationsApi";

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getMyNotifications(true);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

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
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-[var(--color-text-strong)] opacity-60 hover:opacity-100 hover:bg-[var(--color-surface-muted)]/30 transition-all relative"
      >
        <span className="sr-only">Ver notificaciones</span>
        <Bell className="h-5 w-5" aria-hidden="true" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-[var(--color-brand-accent)]" />
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-[var(--color-surface-alt)] border border-[var(--color-surface-muted)] z-50 overflow-hidden">
          <div className="py-3 px-4 border-b border-[var(--color-surface-muted)]/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--color-text-strong)]">Notificaciones</h3>
            <span className="text-xs text-[var(--color-text-strong)] opacity-50">
              {notifications.length} nuevas
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-[var(--color-text-strong)] opacity-50 text-center">
                No hay notificaciones nuevas.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-surface-muted)]/30">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 hover:bg-[var(--color-surface-base)]/50 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[var(--color-brand-primary)]">
                          {notification.tipo}
                        </p>
                        <p className="text-sm text-[var(--color-text-strong)] mt-0.5">
                          {notification.mensaje}
                        </p>
                        <p className="text-xs text-[var(--color-text-strong)] opacity-40 mt-1">
                          {new Date(notification.fechaUtc).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-[var(--color-brand-primary)] hover:underline flex-shrink-0"
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
