import { api } from '@/lib/api';
import { Sprint } from '@/types';

export const sprintService = {
  async getAll() {
    const response = await api.get<Sprint[] | { data: Sprint[] }>('/sprint');

    if (!response.data) {
      return [];
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data.data || [];
  },

  async getById(id: number) {
    const response = await api.get(`/sprint/${id}`);

    // L'API retourne directement l'objet sprint
    if (!response.data) {
      throw new Error('Sprint not found');
    }

    // Si c'est wrappé dans data, on l'extrait, sinon on retourne directement
    return response.data.data || response.data;
  },

  async create(data: Partial<Sprint>) {
    const response = await api.post('/sprint', data);

    console.log('Response from create sprint:', response.data);

    // L'API retourne directement l'objet sprint (pas dans un wrapper data)
    if (!response.data) {
      throw new Error('Failed to create sprint');
    }

    // Si c'est wrappé dans data, on l'extrait, sinon on retourne directement
    return response.data.data || response.data;
  },

  async update(id: number, data: Partial<Sprint>) {
    const response = await api.put(`/sprint/${id}`, data);

    if (!response.data) {
      throw new Error('Failed to update sprint');
    }

    // Si c'est wrappé dans data, on l'extrait, sinon on retourne directement
    return response.data.data || response.data;
  },

  async delete(id: number) {
    await api.delete(`/sprint/${id}`);
  },
};