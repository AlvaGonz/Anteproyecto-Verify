import { NotificationDto } from "../types";
import { mockNotifications } from "../../../infrastructure/mock/mockNotifications";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

let localMockNotifications = [...mockNotifications];

export const notificationsApi = {
  getMyNotifications: async (
    unreadOnly: boolean = false,
  ): Promise<NotificationDto[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let results = localMockNotifications;
          if (unreadOnly) {
            results = results.filter(n => !n.leida);
          }
          resolve(results.sort((a, b) => new Date(b.fechaUtc).getTime() - new Date(a.fechaUtc).getTime()));
        }, 300);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/notifications?unreadOnly=${unreadOnly}`,
      {
        headers: {
          "X-User-Id": "00000000-0000-0000-0000-000000000001", // Mock user ID
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return response.json();
  },

  markAsRead: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = localMockNotifications.findIndex(n => n.id === id);
          if (index !== -1) {
            localMockNotifications[index] = { ...localMockNotifications[index], leida: true };
            resolve();
          } else {
            reject(new Error("Notification not found"));
          }
        }, 300);
      });
    }
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "POST",
      headers: {
        "X-User-Id": "00000000-0000-0000-0000-000000000001", // Mock user ID
      },
    });
    if (!response.ok) throw new Error("Failed to mark notification as read");
  },
};
