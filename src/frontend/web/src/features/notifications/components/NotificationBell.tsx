import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { NotificationDto } from "../types";
import { notificationsApi } from "../api/notificationsApi";
import { useToast } from "../../../shared/components/ui/Toast/ToastContext";

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

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
    // Simple polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
        className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none relative"
      >
        <span className="sr-only">Ver notificaciones</span>
        <Bell className="h-6 w-6" aria-hidden="true" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-2 px-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">
              Notificaciones
            </h3>
            <span className="text-xs text-gray-500">
              {notifications.length} nuevas
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">
                No tienes notificaciones nuevas.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.tipo}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.mensaje}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.fechaUtc).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Marcar leída
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
