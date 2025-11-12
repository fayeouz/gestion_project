import { api } from '@/lib/api';
import { Notification } from '@/types';

export const notificationService = {
  async getMyNotifications() {
    const response = await api.get<Notification[] | { data: Notification[] }>('/my-notification');

    // Handle different response formats
    if (!response.data) {
      return [];
    }

    // If response.data is already an array
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // If response has a data property
    return response.data.data || [];
  },

  async markAsRead(id: number) {
    await api.post('/mark-read', { id });
  },

  async markAllAsRead() {
    await api.post('/mark-all-read');
  },
};