import { api } from '@/lib/api';
import { Notification } from '@/types';

export const notificationService = {
  async getMyNotifications() {
    const response = await api.get<{ data: Notification[] }>('/my-notification');
    return response.data.data;
  },

  async markAsRead(id: number) {
    await api.post('/mark-read', { id });
  },

  async markAllAsRead() {
    await api.post('/mark-all-read');
  },
};
