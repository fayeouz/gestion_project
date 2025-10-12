import { api } from '@/lib/api';
import { Sprint } from '@/types';

export const sprintService = {
  async getAll() {
    const response = await api.get<{ data: Sprint[] }>('/sprint');
    return response.data.data;
  },

  async getById(id: number) {
    const response = await api.get<{ data: Sprint }>(`/sprint/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Sprint>) {
    const response = await api.post<{ data: Sprint }>('/sprint', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Sprint>) {
    const response = await api.put<{ data: Sprint }>(`/sprint/${id}`, data);
    return response.data.data;
  },

  async delete(id: number) {
    await api.delete(`/sprint/${id}`);
  },
};
